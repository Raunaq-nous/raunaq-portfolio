# Refresh one repository's overall notes

Use when refresh.py says a repository's overall summary may be out of date. Read summaries, not
code, so this stays cheap.

1. In the repository's checkout, read `docs/clarity/repo.json` and the `summary` field of each card
   in `docs/clarity/files/` (for a large repository, read the summaries of its `start_here` files and
   of one file per folder).
2. Update in `docs/clarity/repo.json`, in plain English for a non-programmer: `summary`,
   `who_its_for`, `how_it_runs`, `start_here` (3 to 7 files in reading order) and `areas` (5 to 12,
   each with `match` folder patterns, a `summary`, a `why` and `debug_tips`). Keep `decisions`,
   `debug_playbook`, `glossary` and `readiness`; add to them only what the summaries show.
3. Run `python3 <portfolio>/tools/clarity/clarity.py sync` in the checkout so files move into the
   new areas, then `python3 tools/clarity/refresh.py mark-repo-notes <repo>` from the portfolio root.
