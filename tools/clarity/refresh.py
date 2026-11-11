#!/usr/bin/env python3
"""refresh.py: keeps every repository's Code explorer current. Makes no model calls.

Plain English
-------------
Your repositories change all the time. This script is the bookkeeping half of the daily
routine: it works out which repositories changed, carries the existing notes over to the new
code (notes are matched to code by its exact text, so unchanged code keeps its notes), rebuilds
each code map and explorer, and publishes them on the portfolio. Only sections whose code
changed need new notes. Those are written by the explainer subagent (Haiku) between `next` and
`apply`, within a fixed budget per run, so a busy week can never run up a surprise bill.

Run from the root of the raunaq-portfolio checkout:

  python3 tools/clarity/refresh.py plan [--budget N]       what changed since the last refresh
  python3 tools/clarity/refresh.py prepare <repo>          bring notes in, sync, rebuild the map
  python3 tools/clarity/refresh.py next <repo>             next packet to explain, within budget
  python3 tools/clarity/refresh.py apply <repo> <answer>   save the explainer's answer
  python3 tools/clarity/refresh.py finish <repo>           store the notes, publish the explorer
  python3 tools/clarity/refresh.py mark-repo-notes <repo>  record that repo-level notes were refreshed
  python3 tools/clarity/refresh.py summary                 write code-notes/LAST_REFRESH.md

Exit codes for `next`: 0 a packet was written, 4 the run's budget is used up, 5 nothing is left.

Where things live (in the portfolio repository)
  tools/clarity/publish.config.json   settings: owner, site, project pages, budgets, overrides
  code-notes/<slug>/                  the notes for each repository (plain English, never code)
  code-notes/state.json               what was refreshed, when, at which commit
  code-notes/LAST_REFRESH.md          the latest run, in plain English
  public/code/<slug>/                 the published explorers, plus public/code/manifest.json
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
CLARITY = HERE / "clarity.py"
sys.path.insert(0, str(HERE))
import clarity  # noqa: E402  (shared helpers; imported after adjusting the path on purpose)

NOTES = Path("code-notes")
STATE = NOTES / "state.json"
RUN = NOTES / ".run.json"
CONFIG = HERE / "publish.config.json"
EXIT_BUDGET, EXIT_NOTHING = 4, 5


def now_iso() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()


def slug_for(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") or "repo"


def site_root() -> Path:
    root = Path.cwd()
    if not (root / "public").is_dir():
        sys.exit("Run this from the root of the portfolio checkout (the folder that has public/).")
    return root


def load_config() -> dict:
    cfg = clarity.load_json(CONFIG, {})
    cfg.setdefault("owner", "Raunaq-nous")
    cfg.setdefault("owner_name", "Raunaq Rakesh")
    cfg.setdefault("site_url", "https://raunaq-nous.github.io/raunaq-portfolio/")
    cfg.setdefault("private_repositories", "notes")
    cfg.setdefault("budget", {})
    cfg["budget"].setdefault("packets_per_run", 8)
    cfg["budget"].setdefault("repo_notes_threshold", 0.2)
    for key in ("projects", "visibility", "overrides", "ignore"):
        cfg[key] = {k.lower(): v for k, v in (cfg.get(key) or {}).items()}
    cfg["exclude"] = {name.lower() for name in cfg.get("exclude", [])}
    return cfg


def load_state(root: Path) -> dict:
    state = clarity.load_json(root / STATE, {"repos": {}})
    state.setdefault("repos", {})
    return state


def save_state(root: Path, state: dict) -> None:
    clarity.save_json(root / STATE, state)


def run_cmd(args, cwd, timeout=900):
    try:
        done = subprocess.run(args, cwd=cwd, capture_output=True, text=True, timeout=timeout)
        return done.returncode, done.stdout + done.stderr
    except (OSError, subprocess.TimeoutExpired) as error:
        return 99, str(error)


def run_clarity(checkout: Path, *args):
    return run_cmd([sys.executable, str(CLARITY), *args], cwd=checkout)


def remote_name(path: Path, owner: str):
    code, out = run_cmd(["git", "remote", "get-url", "origin"], cwd=path, timeout=30)
    if code != 0:
        return None
    match = re.search(r"github\.com[:/]([^/]+)/([^/\s]+?)(?:\.git)?\s*$", out.strip())
    if match and match.group(1).lower() == owner.lower():
        return match.group(2)
    return None


def repos_root(root: Path, args) -> Path:
    return Path(args.repos_root).resolve() if getattr(args, "repos_root", None) else root.resolve().parent


def find_checkout(root: Path, args, cfg, name: str, clone: bool):
    base = repos_root(root, args)
    candidates = [root.resolve()] + ([p for p in sorted(base.iterdir()) if p.is_dir()] if base.is_dir() else [])
    for path in candidates:
        if (path / ".git").exists() and (remote_name(path, cfg["owner"]) or "").lower() == name.lower():
            return path
    if not clone:
        return None
    target = base / name
    code, out = run_cmd(["git", "clone", "--depth", "200", f"https://github.com/{cfg['owner']}/{name}.git", str(target)],
                        cwd=base, timeout=900)
    return target if code == 0 else None


def head_commit(path: Path):
    code, out = run_cmd(["git", "rev-parse", "--short", "HEAD"], cwd=path, timeout=30)
    return out.strip() if code == 0 else None


def discover(root: Path, args, cfg, state) -> dict:
    """Every repository to keep fresh: from GitHub (if gh works), local checkouts and past runs."""
    found = {}
    if shutil.which("gh"):
        code, out = run_cmd(["gh", "repo", "list", cfg["owner"], "--limit", "400", "--json",
                             "name,visibility,isArchived,isFork"], cwd=root, timeout=120)
        if code == 0:
            try:
                for repo in json.loads(out[out.index("["):]):
                    if not repo.get("isArchived") and not repo.get("isFork"):
                        found[repo["name"]] = {"visibility": str(repo.get("visibility", "")).lower() or None}
            except (ValueError, KeyError):
                pass
    base = repos_root(root, args)
    for path in [root.resolve()] + ([p for p in base.iterdir() if p.is_dir()] if base.is_dir() else []):
        if (path / ".git").exists():
            name = remote_name(path, cfg["owner"])
            if name:
                found.setdefault(name, {"visibility": None})
    for name, info in state["repos"].items():
        found.setdefault(name, {"visibility": info.get("visibility")})
    for name, info in found.items():
        info["visibility"] = cfg["visibility"].get(name.lower()) or info.get("visibility") \
            or state["repos"].get(name, {}).get("visibility")
    return {n: i for n, i in sorted(found.items(), key=lambda kv: kv[0].lower()) if n.lower() not in cfg["exclude"]}


# ---------------------------------------------------------------------------
# Notes travel by content: merge the central copy with any notes inside the repo
# ---------------------------------------------------------------------------
def _notes_by_hash(card) -> dict:
    found = dict(card.get("note_archive") or {})
    for section in card.get("sections", []):
        if section.get("what"):
            found[section.get("hash")] = {f: section.get(f, "") for f in clarity.SECTION_TEXT_FIELDS}
    return found


def merge_cards(local, central, current_hash):
    """Keep the card that matches today's code, and every note either copy has for it."""
    if local is None:
        return central
    if central is None:
        return local
    base, other = (central, local) if central.get("hash") == current_hash and local.get("hash") != current_hash else (local, central)
    notes = _notes_by_hash(other)
    notes.update(_notes_by_hash(base))
    base["note_archive"] = notes
    for section in base.get("sections", []):
        if not section.get("what") and section.get("hash") in notes:
            for field in clarity.SECTION_TEXT_FIELDS:
                section[field] = notes[section["hash"]].get(field, "")
    if not base.get("summary") and other.get("summary"):
        for field in clarity.FILE_TEXT_FIELDS + ("readiness", "terms", "depends_on", "used_by", "summary_hash"):
            if field in other:
                base[field] = other[field]
    base["status"] = clarity.card_status(base)
    return base


def merge_repo_notes(local, central):
    """Central repo-level notes are the main copy; the repo's own copy can add newer findings."""
    if central is None:
        return local
    if local is None:
        return central
    merged = dict(central)
    for key in ("summary", "who_its_for", "how_it_runs", "start_here", "areas"):
        if not merged.get(key) and local.get(key):
            merged[key] = local[key]
    lr, cr = local.get("readiness") or {}, central.get("readiness") or {}
    if (lr.get("checked_at") or "") > (cr.get("checked_at") or ""):
        merged["readiness"] = lr
    for key, ident in (("decisions", "title"), ("debug_playbook", "symptom"), ("glossary", "term")):
        seen = {str(item.get(ident, "")).lower() for item in merged.get(key, []) or []}
        extra = [item for item in local.get(key, []) or [] if str(item.get(ident, "")).lower() not in seen]
        merged[key] = list(merged.get(key, []) or []) + extra
    return merged


def bring_notes_in(root: Path, checkout: Path, slug: str) -> int:
    central = root / NOTES / slug
    local_dir = checkout / clarity.CLARITY_DIR
    if not central.exists():
        return 0
    repo_json = merge_repo_notes(clarity.load_json(local_dir / "repo.json", None), clarity.load_json(central / "repo.json", None))
    if repo_json:
        clarity.save_json(local_dir / "repo.json", repo_json)
    merged = 0
    for path in (p for p in (central / "files").rglob("*.json") if p.is_file()):
        card = clarity.load_json(path, None)
        if not card or not card.get("path"):
            continue
        target = clarity.card_path(checkout, card["path"])
        source = clarity.read_source(checkout / card["path"])
        current = clarity.sha256_text(source) if source is not None else None
        clarity.save_json(target, merge_cards(clarity.load_json(target, None), card, current))
        merged += 1
    return merged


def take_notes_out(root: Path, checkout: Path, slug: str) -> None:
    central = root / NOTES / slug
    local_dir = checkout / clarity.CLARITY_DIR
    repo_json = clarity.load_json(local_dir / "repo.json", None)
    if repo_json:
        clarity.save_json(central / "repo.json", repo_json)
    keep = set()
    for path in (p for p in (local_dir / "files").rglob("*.json") if p.is_file()) if (local_dir / "files").exists() else []:
        card = clarity.load_json(path, None)
        if not card or not card.get("path"):
            continue
        target = central / "files" / (card["path"] + ".json")
        clarity.save_json(target, card)
        keep.add(target.resolve())
    for path in (p for p in (central / "files").rglob("*.json") if p.is_file()) if (central / "files").exists() else []:
        if path.resolve() not in keep:
            path.unlink()


# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------
def cmd_plan(args) -> int:
    root = site_root()
    cfg, state = load_config(), load_state(root)
    run = {"started_at": now_iso(), "budget": args.budget or cfg["budget"]["packets_per_run"], "used": 0, "repos": {}}
    clarity.save_json(root / RUN, run)
    gitignore = root / NOTES / ".gitignore"
    if not gitignore.exists():
        gitignore.write_text(".run.json\n", encoding="utf-8")
    rows = []
    for name, info in discover(root, args, cfg, state).items():
        known = state["repos"].get(name)
        checkout = find_checkout(root, args, cfg, name, clone=False)
        commit = head_commit(checkout) if checkout else None
        if known is None:
            status = "new"
        elif checkout is None:
            status = "not checked out"
        elif commit != known.get("last_commit"):
            status = "changed"
        elif known.get("pending_sections", 0) > 0:
            status = "notes pending"
        else:
            status = "unchanged"
        needs_repo_notes = bool(known) and known.get("since_repo_notes", 0) > max(
            100, cfg["budget"]["repo_notes_threshold"] * max(1, known.get("sections", 0)))
        rows.append((name, info.get("visibility") or "unknown", status, needs_repo_notes))
    run["visibility"] = {name: vis for name, vis, _, _ in rows if vis != "unknown"}
    clarity.save_json(root / RUN, run)
    order = {"new": 0, "changed": 1, "notes pending": 2, "not checked out": 3, "unchanged": 4}
    rows.sort(key=lambda r: (order[r[2]], r[0].lower()))
    print(f"Refresh plan, {run['started_at'][:10]}. Budget for this run: {run['budget']} explainer packets.")
    for name, visibility, status, repo_notes in rows:
        flag = "  (overall summary may be out of date)" if repo_notes else ""
        print(f"  {status:16} {name}  [{visibility}]{flag}")
    todo = [r[0] for r in rows if r[2] in ("new", "changed", "notes pending", "not checked out")]
    print("To refresh, in this order: " + (", ".join(todo) if todo else "nothing; every repository is current."))
    return 0


def _repo_args(name, cfg, info_visibility):
    visibility = cfg["visibility"].get(name.lower()) or info_visibility or "unknown"
    override = cfg["overrides"].get(name.lower(), {})
    if override.get("mode") in ("full", "notes"):
        mode = override["mode"]
    elif visibility == "public":
        mode = "full"
    elif visibility == "private":
        mode = cfg["private_repositories"] if cfg["private_repositories"] in ("full", "notes") else "notes"
    else:
        mode = "notes"  # unknown visibility: never risk publishing code
    return visibility, mode


MANAGED_START = "# >>> managed by tools/clarity/publish.config.json (rewritten before each sync) >>>"
MANAGED_END = "# <<< managed <<<"


def write_clarityignore(root: Path, checkout: Path, cfg: dict, name: str) -> int:
    """Write this repository's ignore patterns into the checkout's .clarityignore (never committed).

    Patterns live in publish.config.json under "ignore", so they work without changing the repository.
    Anything the repository already has in its own .clarityignore is kept; only the managed block is rewritten.
    The portfolio's own checkout is left alone because its .clarityignore is a tracked file.
    """
    patterns = cfg.get("ignore", {}).get(name.lower(), [])
    path = checkout / ".clarityignore"
    if checkout.resolve() == root.resolve():
        return 0
    text = path.read_text(encoding="utf-8") if path.exists() else ""
    if MANAGED_START in text:
        head, _, rest = text.partition(MANAGED_START)
        text = head + (rest.split(MANAGED_END, 1)[1].lstrip("\n") if MANAGED_END in rest else "")
    text = text.rstrip("\n")
    if patterns:
        block = "\n".join([MANAGED_START, ".clarityignore", *patterns, MANAGED_END])
        text = (text + "\n" if text else "") + block
    if text.strip():
        path.write_text(text + "\n", encoding="utf-8")
    elif path.exists():
        path.unlink()
    return len(patterns)


def cmd_prepare(args) -> int:
    root = site_root()
    cfg = load_config()
    checkout = find_checkout(root, args, cfg, args.repo, clone=True)
    if checkout is None:
        print(f"Could not find or clone {args.repo}. Attach it to the routine, or check the name.")
        return 1
    slug = slug_for(args.repo)
    ignored = write_clarityignore(root, checkout, cfg, args.repo)
    if ignored:
        print(f"  Ignore list: {ignored} patterns written to the checkout's .clarityignore.")
    merged = bring_notes_in(root, checkout, slug)
    code, out = run_clarity(checkout, "sync")
    print(out.strip())
    if code:
        return code
    if shutil.which("graphify"):
        gcode, gout = run_cmd(["graphify", "update", "."], cwd=checkout, timeout=900)
        print("  Code map rebuilt." if gcode == 0 else f"  Code map not rebuilt: {gout.strip()[-300:]}")
    else:
        print("  Graphify is not installed here, so the code map was not rebuilt.")
    print(f"  Notes carried over from the central copy: {merged} files.")
    return 0


def cmd_next(args) -> int:
    root = site_root()
    cfg = load_config()
    run = clarity.load_json(root / RUN, None)
    if run is None:
        print("Run `plan` first: it starts the run and sets its budget.")
        return 1
    if run["used"] >= run["budget"]:
        print(f"This run's explaining budget is used up ({run['budget']} packets). The rest waits for the next run.")
        return EXIT_BUDGET
    checkout = find_checkout(root, args, cfg, args.repo, clone=False)
    if checkout is None:
        print(f"{args.repo} is not checked out. Run `prepare {args.repo}` first.")
        return 1
    packet = checkout / clarity.WORK_DIR / "packet.json"
    code, out = run_clarity(checkout, "next", "--max-tokens", str(cfg["budget"].get("packet_tokens", 60000)), "--out", str(packet))
    print(out.strip())
    if "Nothing left to explain" in out:
        return EXIT_NOTHING
    if code:
        return code
    run["used"] += 1
    run["repos"].setdefault(args.repo, {"packets": 0, "sections": 0})
    run["repos"][args.repo]["packets"] += 1
    clarity.save_json(root / RUN, run)
    print(f"PACKET {packet}")
    print(f"ANSWER {checkout / clarity.WORK_DIR / 'answer.json'}")
    return 0


def cmd_apply(args) -> int:
    root = site_root()
    cfg = load_config()
    checkout = find_checkout(root, args, cfg, args.repo, clone=False)
    if checkout is None:
        print(f"{args.repo} is not checked out.")
        return 1
    code, out = run_clarity(checkout, "apply", str(Path(args.answer).resolve()), "--model", "haiku")
    print(out.strip())
    match = re.search(r"and (\d+) sections", out)
    run = clarity.load_json(root / RUN, None)
    if run is not None and match:
        run["repos"].setdefault(args.repo, {"packets": 0, "sections": 0})
        run["repos"][args.repo]["sections"] += int(match.group(1))
        clarity.save_json(root / RUN, run)
    return code


def cmd_finish(args) -> int:
    root = site_root()
    cfg, state = load_config(), load_state(root)
    checkout = find_checkout(root, args, cfg, args.repo, clone=False)
    if checkout is None:
        print(f"{args.repo} is not checked out.")
        return 1
    slug = slug_for(args.repo)
    take_notes_out(root, checkout, slug)
    known = state["repos"].get(args.repo, {})
    hint = known.get("visibility") or ((clarity.load_json(root / RUN, None) or {}).get("visibility") or {}).get(args.repo)
    visibility, mode = _repo_args(args.repo, cfg, hint)
    project = cfg["projects"].get(args.repo.lower())
    base_args = ["publish", "--portfolio", str(root), "--slug", slug, "--repo", f"{cfg['owner']}/{args.repo}",
                 "--project-name", args.repo, "--site-url", cfg["site_url"], "--owner", cfg["owner_name"],
                 "--repo-url", f"https://github.com/{cfg['owner']}/{args.repo}"]
    if project:
        base_args += ["--project", project]
    if visibility != "public":
        base_args += ["--private"]
    graph = checkout / "graphify-out" / "graph.html"
    held_back = None
    code, out = run_clarity(checkout, *base_args, "--mode", mode, *(["--graph", str(graph)] if mode == "full" and graph.exists() else []))
    if code == 3 and mode == "full":
        findings = len(re.findall(r"^\s{2}\S+:\d+\s", out, re.M))
        held_back = f"code held back: the secret scan found {findings} possible secret(s); published notes only"
        print(out.strip())
        code, out = run_clarity(checkout, *base_args, "--mode", "notes")
        mode = "notes"
    print(out.strip())
    if code:
        return code
    cards = clarity.load_cards(checkout)
    run = clarity.load_json(root / RUN, None) or {"repos": {}}
    explained_now = run.get("repos", {}).get(args.repo, {}).get("sections", 0)
    state["repos"][args.repo] = {
        "slug": slug,
        "visibility": visibility,
        "mode": mode,
        "project": project,
        "last_commit": head_commit(checkout),
        "refreshed_at": now_iso(),
        "files": len(cards),
        "sections": sum(len(c.get("sections", [])) for c in cards.values()),
        "pending_sections": sum(1 for c in cards.values() for s in c.get("sections", []) if not s.get("what")),
        "since_repo_notes": known.get("since_repo_notes", 0) + explained_now,
        "repo_notes_at": known.get("repo_notes_at"),
        "held_back": held_back,
    }
    save_state(root, state)
    return 0


def cmd_mark_repo_notes(args) -> int:
    root = site_root()
    state = load_state(root)
    entry = state["repos"].setdefault(args.repo, {})
    entry["since_repo_notes"] = 0
    entry["repo_notes_at"] = now_iso()
    save_state(root, state)
    print(f"Recorded fresh repo-level notes for {args.repo}.")
    return 0


def cmd_summary(args) -> int:
    root = site_root()
    state = load_state(root)
    run = clarity.load_json(root / RUN, None) or {"repos": {}, "used": 0, "budget": 0, "started_at": now_iso()}
    lines = [f"# Code explorer refresh, {run['started_at'][:10]}", "",
             f"Explainer packets used: {run['used']} of {run['budget']}.", "",
             "| Repository | Commit | Sections explained this run | Still to explain | Published as | Note |",
             "|---|---|---|---|---|---|"]
    touched = sorted(set(run.get("repos", {})) | {n for n, s in state["repos"].items()
                                                   if (s.get("refreshed_at") or "") >= run["started_at"]}, key=str.lower)
    for name in touched:
        s = state["repos"].get(name, {})
        r = run.get("repos", {}).get(name, {})
        lines.append(f"| {name} | {s.get('last_commit') or ''} | {r.get('sections', 0)} | {s.get('pending_sections', '')} | "
                     f"{s.get('mode', '')} | {s.get('held_back') or ''} |")
    if not touched:
        lines.append("| Nothing changed | | | | | |")
    waiting = [n for n, s in state["repos"].items() if s.get("pending_sections")]
    lines += ["", "Repositories with notes still waiting for a later run: " + (", ".join(sorted(waiting, key=str.lower)) or "none") + "."]
    (root / NOTES).mkdir(exist_ok=True)
    (root / NOTES / "LAST_REFRESH.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    if (root / RUN).exists():
        (root / RUN).unlink()
    print("\n".join(lines))
    return 0


def build_parser():
    parser = argparse.ArgumentParser(prog="refresh.py", description="Keep every Code explorer current. No model calls.")
    parser.add_argument("--repos-root", help="folder holding the repository checkouts (default: next to the portfolio)")
    sub = parser.add_subparsers(dest="command", required=True)
    p = sub.add_parser("plan", help="what changed since the last refresh; starts a run")
    p.add_argument("--budget", type=int, help="explainer packets allowed in this run")
    for name in ("prepare", "next", "finish", "mark-repo-notes"):
        sub.add_parser(name).add_argument("repo")
    p = sub.add_parser("apply")
    p.add_argument("repo")
    p.add_argument("answer")
    sub.add_parser("summary")
    return parser


def main(argv=None) -> int:
    args = build_parser().parse_args(argv)
    handlers = {"plan": cmd_plan, "prepare": cmd_prepare, "next": cmd_next, "apply": cmd_apply, "finish": cmd_finish,
                "mark-repo-notes": cmd_mark_repo_notes, "summary": cmd_summary}
    return handlers[args.command](args)


if __name__ == "__main__":
    try:
        sys.exit(main())
    except BrokenPipeError:
        sys.exit(0)
