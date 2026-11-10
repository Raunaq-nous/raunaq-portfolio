# Weekly deep refresh

You are running unattended as a Claude Code routine. Never ask questions; note blockers in
code-notes/LAST_REFRESH.md and carry on. Work from the root of the raunaq-portfolio checkout.
Change only public/code/ and code-notes/ in raunaq-portfolio; push nowhere else.

1. Run the daily steps 1 to 3 from tools/clarity/ROUTINE_DAILY.md, but start with
   `python3 tools/clarity/refresh.py plan --budget 24`.
2. For every repository whose commit changed in the last seven days (see code-notes/state.json),
   at most five:
   - Refresh its repo-level notes with tools/clarity/REPO_NOTES.md (this regroups areas when the
     code has grown new parts).
   - If tools/graph/ has the group-naming script, run it for that repository with its input closed
     (`< /dev/null`), so the map's group names match the new code.
   - Spot-check: in its checkout run `python3 tools/clarity/clarity.py spotcheck --fraction 0.02
     --minimum 5`, compare each sampled note with its code yourself, correct wrong notes in the card
     files, and record the share that were wrong.
3. For at most two of those repositories (the ones with the most changed sections), run the
   production-check skill in their checkout so the readiness scorecard stays honest.
4. Run `finish` for every repository you touched, then `summary`. Add the spot-check error rates
   and any new repositories you can see in the account but not in this routine to
   code-notes/LAST_REFRESH.md.
5. `git add public/code code-notes`, commit "Weekly code explorer refresh YYYY-MM-DD", push to main.
