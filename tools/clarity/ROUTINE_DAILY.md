# Daily refresh of every Code explorer

You are running unattended as a Claude Code routine. Nobody can answer questions, so never ask any.
If something blocks you, note it in code-notes/LAST_REFRESH.md and carry on with the next repository.
Work from the root of the raunaq-portfolio checkout.

Limits for this run
- Code is explained only by the `explainer` subagent (Haiku). Do not write notes for code yourself.
- At most 8 explainer packets in total. refresh.py enforces this: exit code 4 means stop explaining.
- Change only files under public/code/ and code-notes/ in raunaq-portfolio. Never push to any other repository.

Steps
1. If `graphify` is not installed, install the version named in tools/clarity/publish.config.json
   (`graphify_version`) with pip. If that fails, carry on without code maps.
2. Run `python3 tools/clarity/refresh.py plan` and read the order it prints. If it lists attached
   repositories as "not checked out", find where this session cloned them and pass that folder as
   `--repos-root <folder>` (before the command name) on every refresh.py call.
3. For each repository in that order:
   a. `python3 tools/clarity/refresh.py prepare <repo>`
   b. Repeat `python3 tools/clarity/refresh.py next <repo>`:
      - exit code 5: nothing left in this repository; go to step c.
      - exit code 4: the budget is used up. Go to step c for this repository, then for every remaining
        repository run only steps a and c, so its map and explorer still refresh.
      - exit code 0: ask the explainer subagent to read the PACKET file and write its answer to the
        ANSWER file, then run `python3 tools/clarity/refresh.py apply <repo> <ANSWER file>`. If apply
        reports problems, re-run that packet once, never more than once.
   c. `python3 tools/clarity/refresh.py finish <repo>`
4. If the plan flagged "overall summary may be out of date" for any repository, follow
   tools/clarity/REPO_NOTES.md for at most two of them, then run `finish` for each again.
5. Run `python3 tools/clarity/refresh.py summary`.
6. `git add public/code code-notes`, commit with the message "Refresh code explorers YYYY-MM-DD", and
   push to main. If there is nothing to commit, stop.
