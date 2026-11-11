from content_a import P, PAGES
# ---------- K: build log ----------
P(id='K1', sec='K', title='Weeks 1\u20132: audit, Phase 0 and the dossier', stage='evergreen', stamp='FIELD NOTE', date='2026-10-17',
  cues=['What did the audit find?', 'What did Phase 0 fix?', 'How was the research checked?'],
  body=[{'t':'ul','items':['Audit: a destructive seed endpoint callable without authentication; a live score that invented numbers when the feed failed; run rates on all deliveries; state kept in serverless memory; a cron job the host never runs.','Phase 0, eight commits: stop tracking local data, gate admin routes, versioned and idempotent scoring, one set of team rules on server and client, honest live states, remove fees and simulated matches, a new landing page.','Research: a 162-page dossier with 176 cited sources, fact-checked line by line, with a ledger of what was verified, corrected or removed.']}],
  stickies=[{'c':'yellow','x':'Fix the truth before adding intelligence.'}],
  summary='Clean the old house, write down everything known, then build.', links=['A2','K2'])
P(id='K2', sec='K', title='Weeks 3\u20134: the harness and the tool hunt', stage='evergreen', stamp='FIELD NOTE', date='2026-10-24',
  cues=['What is a harness?', 'Which agents were tried?', 'What decided the choice?'],
  body=[{'t':'ul','items':['Harness: an agent map, always-on rules, step-by-step skills, an 85-feature list (each starting \u201cpasses\u201d: false), verification gates and a progress log, the long-running-agent pattern [@D38].','Tools tried: a cloud agent whose model choices were too limited; a strong desktop agent that ran commands on the local machine (dropped for security); then cloud sandboxes.','A real gain from the audit step: the agent caught an earlier pass that had silenced lint errors instead of fixing them.']}],
  stickies=[{'c':'green','x':'Choose the sandbox first, the model second.'}],
  summary='The agent is only as good as its harness: rules, tests, and a list that cannot be faked.', links=['F4','K3'])
P(id='K3', sec='K', title='Weeks 5\u20136: blocked, unblocked, shipped', stage='evergreen', stamp='FIELD NOTE', date='2026-11-03',
  cues=['What blocked the cloud build?', 'How was it unblocked?', 'What shipped?'],
  body=[{'t':'ul','items':['Blocked: pushes refused (app permissions), data hosts outside the network allowlist, tag pushes refused.','Unblocked: permissions fixed; the data courier and tagger workflows; walk-forward calibration (see [[G4]]).','Shipped: 85 of 85 features passing, CI green, gates 0\u20137 and v0.1.0-beta tagged, merged with merge commits so every commit counts.','Then the honest review: tests passed, but a person could not see the five-sport product. Demo v1 was specified next.']}],
  stickies=[{'c':'pink','x':'85/85 tests \u2260 a product someone can see.'}],
  summary='Every blocker had a workaround that kept the rules intact. The real miss was the definition of done.', links=['G8','K4'])
P(id='K4', sec='K', title='What I learned', stage='evergreen', stamp='FIELD NOTE', date='2026-11-11',
  cues=['Which lessons generalise?', 'What would I do first next time?'],
  body=[{'t':'ul','items':['Measure what a person can see, not only what a test can see.','Make \u201cdone\u201d provable from inside the run, or the agent loops.','Test the test, especially statistical gates on small samples.','Data first, interface second: prove each sport\u2019s data before paying for UI.','Short stages with fresh sessions beat one heroic run.','Humans stay in the loop at the seams, as Wimbledon learned.','Facts, then models, then language. Never the reverse.','Write the spec at the depth you want the product.']}],
  summary='The process lessons transfer to any AI build. Sport just made the feedback brutally clear.', links=['K3','M1'])

# ---------- L: viewpoints ----------
P(id='L1', sec='L', title='Voices from the stands', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['Who warns about black boxes?', 'Who insists humans still decide?', 'Who called xG useless?'],
  body=[{'t':'quote','x':'Black-box models are very dangerous in sports.','by':'Daryl Morey [@W:mitnews13]'},
        {'t':'quote','x':'I know that someone called it \u2018robot offside\u2019; it\u2019s not. The referees and the assistant referees are still responsible for the decision.','by':'Pierluigi Collina [@W:collina]'},
        {'t':'quote','x':'It is not AI. There are some humans involved. And in this instance, it was a human error.','by':'Sally Bolton, All England Club, 2025 [@W:wimb]'},
        {'t':'quote','x':'The most useless stat in the history of football.','by':'Jeff Stelling on xG, 2017 [@W:stelling]'}],
  summary='The sceptics are usually right about trust and wrong about direction. Design for both.', links=['C1','E3'])
P(id='L2', sec='L', title='Bull, bear, builder', stage='budding', stamp='OPEN', date='2026-11-11',
  cues=['Why could this win?', 'Why could it fail?', 'What does a builder do about it?'],
  body=[{'t':'table','rows':[['Bull','Bear','Builder\u2019s move'],['Open data and cheap models make grading feasible','Dream11 has distribution at 300M users [@D20]','Win on honesty and identity, not reach'],['Fans already argue about decisions','Giants can add a \u201cgrade my call\u201d button','Own calibration and the decision record'],['A no-money game fits the 2025 law','Licences are non-commercial','License before launch; partner with rights holders'],['Five sports widen the audience','Models drift (2026 chases)','Walk-forward recalibration and public quality reports']]}],
  stickies=[{'c':'yellow','x':'JioStar and Apple are distribution prizes, not just competitors.'}],
  summary='The moat is not the model. It is the record of honest grades a fan builds over a season.', links=['D3','E2','H1'])

# ---------- M: open questions ----------
P(id='M1', sec='M', title='Still researching', stage='seedling', stamp='OPEN', date='2026-11-11',
  cues=['What would change the plan?', 'What is the next experiment?'],
  body=[{'t':'ul','items':['Can fans tell decision quality from luck after one review? Test graded against ungraded reviews on Review-to-Next-Read.','What is the smallest miscalibration we can honestly detect at around 70 matches a season, and how should the UI show that uncertainty?','Does an Alter Ego reveal raise retention, or only shares?','Which sport goes deep second, football or F1, judged on data rights and demand?','Can grounded language keep up at live latency? Track the claim-verifier pass rate.','Which licences convert first: Cricsheet, StatsBomb, OpenF1 or the tennis data?','Hindi-first: does the depth switch (Quick, Tactical, Analyst) work as well in Hindi?']}],
  stickies=[{'c':'blue','x':'Next: Demo v1, five playable sports, 33-feature coverage matrix, five gated stages.'}],
  summary='The notebook stays open. New evidence goes in dated, and old conclusions stay visible.', links=['K4','G7'])
