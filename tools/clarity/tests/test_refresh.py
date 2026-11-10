"""Self-test for refresh.py. Run: python3 tools/clarity/tests/test_refresh.py

Builds a throwaway portfolio and two throwaway repositories in a temporary folder, runs a full
refresh, changes the code, and checks that only the changed section needs a new note even when
the repository is cloned fresh, that budgets stop the run, and that nothing private is published.
"""

import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

TOOLS = Path(__file__).resolve().parent.parent
ENV = dict(os.environ, GIT_AUTHOR_NAME="t", GIT_AUTHOR_EMAIL="t@e.com", GIT_COMMITTER_NAME="t", GIT_COMMITTER_EMAIL="t@e.com")

ALPHA = '''"""Alpha module."""


def add(a, b):
    """Add two numbers."""
    return a + b


def double(x):
    """Double a number."""
    return x * 2
'''


def git(cwd, *args):
    subprocess.run(["git", *args], cwd=cwd, check=True, capture_output=True, env=ENV)


class Refresh(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.base = Path(self.tmp.name)
        self.site = self.base / "raunaq-portfolio"
        (self.site / "public").mkdir(parents=True)
        shutil.copytree(TOOLS, self.site / "tools" / "clarity", ignore=shutil.ignore_patterns("tests", "__pycache__"))
        cfg = json.loads((TOOLS / "publish.config.json").read_text(encoding="utf-8"))
        cfg.update({"owner": "Raunaq-nous", "visibility": {"Alpha": "public", "Beta": "private"},
                    "projects": {"Alpha": "alpha-page"}, "exclude": ["raunaq-portfolio"]})
        (self.site / "tools" / "clarity" / "publish.config.json").write_text(json.dumps(cfg), encoding="utf-8")
        self.make_repo(self.site, "raunaq-portfolio", {"README.md": "site\n"})
        self.alpha = self.make_repo(self.base / "Alpha", "Alpha", {"alpha.py": ALPHA})
        self.beta = self.make_repo(self.base / "Beta", "Beta", {"beta.js": "export function hi() {\n  return 'hi';\n}\n"})

    def tearDown(self):
        self.tmp.cleanup()

    def make_repo(self, path, name, files):
        path.mkdir(parents=True, exist_ok=True)
        for rel, text in files.items():
            (path / rel).write_text(text, encoding="utf-8")
        git(path, "init", "-q")
        git(path, "remote", "add", "origin", f"https://github.com/Raunaq-nous/{name}.git")
        git(path, "add", "-A")
        git(path, "commit", "-qm", "init")
        return path

    def refresh(self, *args):
        done = subprocess.run([sys.executable, "tools/clarity/refresh.py", "--repos-root", str(self.base), *args],
                              cwd=self.site, capture_output=True, text=True, env=ENV)
        return done.returncode, done.stdout + done.stderr

    def explain(self, repo):
        while True:
            code, out = self.refresh("next", repo)
            if code == 5:
                return
            self.assertEqual(code, 0, out)
            packet = json.loads(Path(out.split("PACKET ")[1].split("\n")[0]).read_text(encoding="utf-8"))
            answer = Path(out.split("ANSWER ")[1].split("\n")[0])
            files = []
            for item in packet["items"]:
                entry = {"path": item["path"], "sections": [{"id": s["id"], "title": "T", "what": f"Does {s['name']}."} for s in item["sections"]]}
                if item["need_file_fields"]:
                    entry["file"] = {"summary": f"About {item['path']}.", "readiness": {"status": "unknown"}}
                files.append(entry)
            answer.write_text(json.dumps({"files": files}), encoding="utf-8")
            code, out = self.refresh("apply", repo, str(answer))
            self.assertEqual(code, 0, out)

    def full_run(self, budget="50"):
        self.assertEqual(self.refresh("plan", "--budget", budget)[0], 0)
        for repo in ("Alpha", "Beta"):
            self.assertEqual(self.refresh("prepare", repo)[0], 0)
            self.explain(repo)
            code, out = self.refresh("finish", repo)
            self.assertEqual(code, 0, out)
        return self.refresh("summary")

    def manifest(self):
        return {e["slug"]: e for e in json.loads((self.site / "public/code/manifest.json").read_text(encoding="utf-8"))["entries"]}

    def test_first_run_publishes_every_repository_by_its_own_name(self):
        code, out = self.full_run()
        self.assertEqual(code, 0, out)
        entries = self.manifest()
        self.assertEqual(sorted(entries), ["alpha", "beta"])
        self.assertEqual(entries["alpha"]["name"], "Alpha")
        self.assertEqual(entries["alpha"]["project"], "alpha-page")
        self.assertEqual(entries["alpha"]["mode"], "full")
        self.assertEqual(entries["beta"]["mode"], "notes", "private code must not be published")
        self.assertNotIn("return 'hi'", (self.site / "public/code/beta/index.html").read_text(encoding="utf-8"))
        self.assertTrue((self.site / "code-notes/alpha/files/alpha.py.json").exists())
        self.assertTrue((self.site / "code-notes/LAST_REFRESH.md").exists())

    def test_a_change_needs_only_its_own_new_note_even_from_a_fresh_clone(self):
        self.full_run()
        (self.alpha / "alpha.py").write_text(ALPHA.replace("return x * 2", "return x + x"), encoding="utf-8")
        git(self.alpha, "commit", "-qam", "change double")
        shutil.rmtree(self.alpha / "docs")  # a routine starts from a fresh clone, with no local notes
        code, out = self.refresh("plan")
        self.assertIn("changed", out)
        self.refresh("prepare", "Alpha")
        state = json.loads((self.site / "code-notes/alpha/files/alpha.py.json").read_text(encoding="utf-8"))
        self.assertTrue(state["sections"])
        local = json.loads((self.alpha / "docs/clarity/files/alpha.py.json").read_text(encoding="utf-8"))
        pending = [s["name"] for s in local["sections"] if not s.get("what")]
        self.assertEqual(pending, ["double"])

    def test_budget_stops_the_run_and_the_rest_waits(self):
        self.assertEqual(self.refresh("plan", "--budget", "1")[0], 0)
        self.refresh("prepare", "Alpha")
        self.assertEqual(self.refresh("next", "Alpha")[0], 0)
        code, out = self.refresh("next", "Alpha")
        self.assertEqual(code, 4, out)

    def test_secret_in_public_code_falls_back_to_notes_only(self):
        (self.alpha / "keys.py").write_text('TOKEN = "ghp_' + "b" * 36 + '"\n', encoding="utf-8")
        git(self.alpha, "add", "-A")
        git(self.alpha, "commit", "-qm", "oops")
        self.full_run()
        entry = self.manifest()["alpha"]
        self.assertEqual(entry["mode"], "notes")
        state = json.loads((self.site / "code-notes/state.json").read_text(encoding="utf-8"))
        self.assertIn("secret", state["repos"]["Alpha"]["held_back"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
