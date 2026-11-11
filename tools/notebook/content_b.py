from content_a import P, PAGES
# ---------- E: money and the graveyard ----------
P(id='E1', sec='E', title='Follow the money', stage='evergreen', stamp='VERIFIED', date='2026-10-16',
  cues=['How big is sports tech M&A?', 'What distorts the headline?', 'Who got the biggest cheques?'],
  body=[{'t':'p','x':'Drake Star counted about $200 billion of announced deal value across more than 1,000 transactions in 2025 [@D9]. Q1 2026 looked spectacular, at $130.6 billion across 239 deals, but one merger was about 84% of it. Strip it out and the quarter was nearer $20 billion [@D11].'},
        {'t':'fig','id':'rounds'},
        {'t':'p','x':'Private financing told the more useful story: about $2.9 billion across 117 rounds, led by prediction markets, wearables and creator-led formats [@D11].'}],
  stickies=[{'c':'pink','x':'Prediction markets attract the money. They also attract the regulators. See E3.'}],
  summary='Capital is chasing engagement and event contracts. A free judgement game sits outside both, which is a moat and a risk.', links=['E3','I1'])
P(id='E2', sec='E', title='The startup map', stage='budding', stamp='VERIFIED', date='2026-10-16',
  cues=['Who automates highlights?', 'Who is closest to the identity idea?', 'What do the winners actually sell?'],
  body=[{'t':'ul','items':['**WSC Sports**: a $100M Series D in 2022, and more than 3.4 million automated highlights created in 2021 [@D70]. Dream Sports\u2019 FanCode became a client [@D84].','**Pixellot**: a $161M Series D in June 2022, for automated capture and production [@D72].','**SkillCorner**: tracking data built from broadcast video, with a $60M growth investment in December 2025 [@D76].','**PUNTR**: one fan profile that follows you across sports, $500K led by Accretion Capital [@D77]. {{Closest to the Alter Ego pillar.}}','**Kings League**: rules designed as content, including secret cards each team can play once [@D67]; a $63M round [@D11].','**Consolidation**: Genius bought Legend for $1.2 billion, and Teamworks took Pro Football Focus\u2019s enterprise business [@D11].']}],
  stickies=[{'c':'yellow','x':'WSC, Pixellot and SkillCorner are not, in the end, selling \u201cAI\u201d. They sell a job done.'}],
  summary='The crowded layers are capture and highlights. Identity and judgement are thin, seed-stage territory.', links=['D3','L2'])
P(id='E3', sec='E', title='The graveyard, and near misses', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['What killed fan-controlled football?', 'Why did AI sports writing backfire?', 'What does a court split mean?'],
  body=[{'t':'ul','items':['**Fan Controlled Football** let fans call plays live. It debuted in February 2021 and raised a $40M Series A in January 2022 from crypto-focused investors. When that funding dried up it postponed its 2023 season and pivoted to licensing [@D68] [@D69]. {{Lesson: don\u2019t buy a stadium.}}','**Sports Illustrated** (2023): AI articles under fake, AI-generated authors [@D82]. **Gannett** paused AI recaps after readers mocked prose like \u201ca close encounter of the athletic kind\u201d [@D132]. {{Lesson: never fake a byline.}}','**Wimbledon 2025**: the electronic line-calling system was switched off by mistake; three calls were missed and a point was replayed [@W:wimb2]. {{Lesson: automation fails at the human seams.}}','**Kalshi**: won 2\u20131 at the Third Circuit in April 2026, then lost at the Ninth on 28 August and unanimously at the Sixth on 25 September [@D62] [@D63].']}],
  summary='Neither AI failure was about bad models. Both were about honesty. Format costs and regulation killed the rest.', links=['I2','L1'])

# ---------- F: library ----------
P(id='F1', sec='F', title='Value models: putting a price on a moment', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['What is EPV?', 'xG, xT, VAEP: what does each price?', 'What did Mishra find?'],
  body=[{'t':'ul','items':['**EPV** (2014/2016): the points a possession is expected to yield, re-estimated continuously from tracking data [@W:pointwise] [@W:epvjasa].','**xG** (2012): the probability a shot becomes a goal [@W:xg]. **xT** (2018): the value of moving the ball into a more dangerous area [@W:xt]. **Pitch control** (2018) and **VAEP** (2019) value space and every on-ball action [@W:nutmeg].','**Point importance** (2001): P(win match | win point) \u2212 P(win match | lose point); Wimbledon points are not quite independent, but a Markov chain is a good approximation [@D86].','**Calibration\u2013leverage tradeoff** (2026): an exact IPL chase model built from 1,162 chases and 130,029 legal deliveries is attributable but over-confident at both ends [@D31].','**T20 simulation**: optimising batting orders and bowling plans by simulation [@D85].']}],
  summary='The field prices moments. ALTER EGO uses those prices to grade a fan\u2019s choice between options.', links=['G1','G3','G6','G7'])
P(id='F2', sec='F', title='Seeing the game: vision and tactics', stage='budding', stamp='VERIFIED', date='2026-10-16',
  cues=['Why track low-confidence boxes?', 'What is game state reconstruction?', 'How did TacticAI learn from few corners?'],
  body=[{'t':'ul','items':['**ByteTrack** (2021): also associate low-confidence detections, because a blurry, half-hidden box is often a real player briefly occluded [@D96].','**SportsMOT** (2023): sports need more than generic trackers, because players look alike and move fast [@D97].','**SoccerNet Game State Reconstruction** (2024): turn broadcast video into a tactical minimap of who is where [@D98] [@D99].','**TacticAI** (2024): a graph model over players that exploits pitch symmetry to learn from limited corner kicks, then proposes adjustments a human can judge [@D57] [@D87].']}],
  stickies=[{'c':'blue','x':'We do not need video for the MVP. Event data plus receipts is enough to grade a decision.'}],
  summary='Vision research is maturing fast, but the product\u2019s first moat is judgement, not pixels.', links=['H1','M1'])
P(id='F3', sec='F', title='Talking about the game: language', stage='budding', stamp='VERIFIED', date='2026-10-16',
  cues=['What flaw did MatchTime find?', 'How should questions be routed?', 'What does SportR test?'],
  body=[{'t':'ul','items':['**MatchTime** (EMNLP 2024): in existing datasets commentary and video were misaligned, so models learned to talk about the wrong thing at the wrong time. The authors re-timed 49 matches by hand and trained MatchVoice [@D92] [@D93].','**SoccerAgent** introduced a multimodal soccer knowledge base, a benchmark and a multi-agent system [@D94]; **TreeSoc** reported 85.2% on its text questions [@D95].','**SoccerRAG**: route the question before you retrieve, using an extractor\u2013validator chain into SQL [@D100] [@D101].','**SportR** (ICLR 2026): 4,789 images, 2,052 videos and 6,841 human-written reasoning chains across 50 foul types and 12 tactics [@D104].']}],
  stickies=[{'c':'pink','x':'Misaligned timing is the silent killer of sports language models. Timestamps are evidence.'}],
  summary='Language models can describe sport once the facts are aligned and routed. That is exactly the pipeline order in A3.', links=['A3','G8'])
P(id='F4', sec='F', title='Judging decisions, and building with agents', stage='budding', stamp='VERIFIED', date='2026-11-11',
  cues=['How do you grade a road not taken?', 'What is harness engineering?', 'What keeps an agent working?'],
  body=[{'t':'ul','items':['**Doubly robust off-policy evaluation** (Jiang and Li, ICML 2016): combine a model of outcomes with what history actually did, so either can rescue the other [@D102] [@D105].','**Harness engineering** (2026): of eleven coding-agent harnesses studied, nine used reusable skills and eight used MCP tool connections [@D37].','**Long-running agents**: an init script, a progress log and a feature list of end-to-end features, each starting as \u201cpasses\u201d: false [@D38]. This notebook\u2019s build used exactly that pattern.','**/goal**: a separate small model checks a stated completion condition after every turn and keeps the agent going until it is met [@W:goal].']}],
  summary='Counterfactual maths grades the fan. Harness engineering built the product. Both demand explicit evidence.', links=['G2','K2'])

# ---------- G: engine room ----------
P(id='G1', sec='G', title='Legal balls and the exact chase', stage='evergreen', stamp='VERIFIED', date='2026-10-16',
  cues=['Why legal balls?', 'What is the state?', 'Why is the result a martingale?'],
  body=[{'t':'p','x':'A chase is a small state space: balls left, wickets in hand, runs needed. From any state, the next legal ball produces one of a few outcomes. Learn their probabilities from Cricsheet, weighting recent seasons more, then solve backward from the end [@D31].'},
        {'t':'code','x':'def wp(balls, wkts, need):\n    if need <= 0: return 1.0\n    if balls == 0 or wkts == 10: return 0.0\n    return sum(p * wp(balls - 1, wkts + w, need - r)\n               for (r, w), p in outcome_dist(balls, wkts, need))'},
        {'t':'p','x':'The result is an exact **martingale**: on average, the next ball\u2019s win probability equals the current one. Every swing is attributable to a specific ball.'}],
  stickies=[{'c':'pink','x':'Wides and no-balls are not legal balls. Count them and every rate is quietly wrong.'}],
  summary='Exact, explainable, fast. Its one flaw is calibration, see G3.', links=['G2','G3','B1'])
P(id='G2', sec='G', title='Leverage, the call card and read points', stage='evergreen', stamp='DECISION', date='2026-10-17',
  cues=['When does a call open?', 'How is a pick graded?', 'What is the coin-flip band?'],
  body=[{'t':'ul','items':['**Leverage** is how far the next decision can swing win probability. A call card opens only at high-leverage moments: strike bowler now, or save him?','An **option-conditioned simulator** estimates win probability under each option, using only data observed before the lock.','**Read points** = WP(your pick) \u2212 WP(best alternative). A great read can still lose. That is the point.','**Coin-flip band**: when options are within the model\u2019s noise, there is no grade. Saying \u201cwe cannot tell\u201d is part of honesty.']},
        {'t':'p','x':'Every graded call is stored as a decision record: moment, options, the model\u2019s read, your pick, read points, lock time and source.'}],
  stickies=[{'c':'green','x':'DECISION: grade the decision at lock time, never the outcome.'}],
  summary='Leverage decides when to ask. Read points decide how good the answer was.', links=['G3','G5','D3'])
P(id='G3', sec='G', title='Calibration: the 18% that won 29%', stage='evergreen', stamp='VERIFIED', date='2026-10-16',
  cues=['Over-confident how?', 'How do you fix it without losing attribution?', 'Why two models?'],
  body=[{'t':'fig','id':'calib'},
        {'t':'p','x':'The exact model is too confident at both ends: a band rated at 18% wins 29% of the time, and the shape persists out of sample [@D31]. Easy chases look safer than they are; hard-but-live chases look more doomed.'},
        {'t':'p','x':'The fix is **isotonic recalibration**, a monotone map from raw probability to observed win rate. We keep **two models**: the exact one for leverage and attribution, the calibrated one for grades [@D31].'}],
  stickies=[{'c':'yellow','x':'Attribution and calibration want different things. Don\u2019t force one model to do both.'}],
  summary='Calibrate the number you grade with. Keep the exact number for explaining why.', links=['G4','G1'])
P(id='G4', sec='G', title='Lab entry: the calibration-gate saga', stage='evergreen', stamp='FIELD NOTE', date='2026-11-02',
  cues=['Why did the first test fail?', 'What did the simulation prove?', 'What finally worked?'],
  body=[{'t':'ul','items':['~~Gate 1~~: every probability bucket within 5 points on held-out seasons. With only about 70 matches per season, a **perfectly** calibrated model passes about 2.4% of the time. The test could not tell good from bad.','~~Gate 2~~: match-level bootstrap intervals, merged buckets, error under 5 points and two baselines. Simulation: a perfect model passes only 65\u201372.5%, and an 8-point error is caught only 57\u201365%. Meanwhile 2026 chasers won **64.3%**, against 45\u201351% in 2023\u201325.','**Gate 3** (passed): walk-forward recalibration that updates after every completed match and uses only earlier matches; 2025 and 2026 pooled; one joint intercept-and-slope test; proven fair by simulation; the smallest detectable error reported honestly.']}],
  stickies=[{'c':'yellow','x':'Test the test before you trust it.'},{'c':'pink','x':'Real drift: the 2023 rule change made chasing easier. Models must learn during a season, legitimately.'}],
  summary='Two honest failures, one fair test. The agent refused to fudge a pass, and that refusal was the feature.', links=['G3','K3','M1'])
P(id='G5', sec='G', title='Brier score, Read Rating and the Alter Ego', stage='budding', stamp='DECISION', date='2026-10-17',
  cues=['How is confidence scored?', 'Why weight hard calls?', 'What is an Alter Ego?'],
  body=[{'t':'ul','items':['**Brier score**: the mean squared error of your stated probabilities; lower is better. Proper scoring rewards honest confidence instead of shouting 100% at everything.','**Calibration chart**: after 20 resolved forecasts, the Notebook shows whether your 80% calls come true about 80% of the time.','**Read Rating**: an Elo-style rating where a hard call (most of the crowd missed it) moves you more, and an easy miss costs more.','**Alter Ego**: after enough graded calls, your calling style becomes an identity, with the calls that shaped it on show.','**Season File**: your best calls, boldest correct read and rating curve, closed at the end of each competition.']}],
  summary='The fan gets three mirrors: how right, how calibrated, and what kind of reader they are.', links=['A4','J2'])
P(id='G6', sec='G', title='Tennis: Markov chains and the Pressure Index', stage='budding', stamp='VERIFIED', date='2026-10-26',
  cues=['How does a point become a match?', 'Which points matter most?', 'What decision do we grade?'],
  body=[{'t':'fig','id':'markov'},
        {'t':'p','x':'A point win probability rolls up into games (first to 4, win by 2), sets (tiebreak at 6\u20136) and matches. A point\u2019s **importance** is the change in match win probability between winning and losing it [@D86]. The Pressure Index shows it live.'},
        {'t':'p','x':'Demo decision: on a big point, **serve wide, body or T?** It is graded on the server\u2019s direction-specific win rates from charted matches before this one, shrunk toward tour averages [@W:mcp].'}],
  stickies=[{'c':'blue','x':'Break points and tiebreak points are where judgement is tested.'}],
  summary='Tennis is the cleanest decision sport: discrete, scored and, thanks to its structure, solvable.', links=['C2','H1'])
P(id='G7', sec='G', title='Football, F1 and basketball engines', stage='seedling', stamp='OPEN', date='2026-10-26',
  cues=['What is graded in football?', 'How does the F1 simulator stay honest?', 'Which basketball calls?'],
  body=[{'t':'ul','items':['**Football** (StatsBomb open data, Euro 2024 with 360 frames [@W:sbeuro]): shoot, pass or carry? Graded with an open xG model (distance, angle, body part, defenders in the shooting cone) plus an expected-threat grid, fitted on other competitions.','**F1** (OpenF1, 2023 onward [@W:openf1]): pit now or stay out? A simulator fits tyre degradation only from laps before the decision, takes pit loss from observed stops, and reports a range, not a certainty.','**Basketball** (NBA play-by-play [@W:nbadata]): down 2 late, go for 3 or tie with 2? Foul when up 3? A win-probability model on time, margin, possession and home court, fitted 2016\u20132023 and tested on 2024\u201325.']}],
  stickies=[{'c':'green','x':'Same loop in every sport: moment, call, lock, replay, three-column review.'}],
  summary='Five sports, one grading contract. Each model must pass a held-out quality report before it grades anyone.', links=['H1','K4'])
P(id='G8', sec='G', title='Truth plumbing', stage='evergreen', stamp='FIELD NOTE', date='2026-10-24',
  cues=['How do we prove there was no hindsight?', 'How is generated text checked?', 'How did data get past a blocked network?'],
  body=[{'t':'ul','items':['**Bitemporal store**: every fact has two clocks, when it happened and when we knew it. A grade may only use facts known before the lock, and leakage tests prove it.','**Generation contract and claim verifier**: generated text may only contain numbers and names present in the evidence. One test caught an instruction-only prompt injection, so a deny-list for money, betting and prompt-control language was added.','**Data courier**: the cloud sandbox blocked cricsheet.org, so a GitHub Actions workflow fetches official data on open runners and commits only compact, checksummed outputs with attribution. Tags were blocked too, so a tagger workflow creates them.']}],
  summary='Honesty is an engineering property: clocks, contracts and checksums.', links=['A3','K3'])

# ---------- H: data and rights ----------
P(id='H1', sec='H', title='Open data, sport by sport', stage='evergreen', stamp='VERIFIED', date='2026-10-26',
  cues=['What can a free MVP use?', 'Which licences are non-commercial?', 'What must change before launch?'],
  body=[{'t':'table','rows':[['Sport','Source','Licence note'],['Cricket','Cricsheet ball-by-ball, 21,000+ matches [@D32] [@D33]','Third-party descriptions differ [@D106]'],['Football','StatsBomb open data, Euro 2024 all 51 matches with 360 [@W:sbeuro]','Non-commercial, credit StatsBomb [@W:sbnc]'],['F1','OpenF1, every session since 2023 [@W:openf1]','Unofficial project [@D109]'],['Tennis','Grand Slam point-by-point 2011\u20132024 [@W:sackmann]; Match Charting [@W:mcp]','CC BY-NC-SA 4.0'],['Basketball','NBA play-by-play 1996/97\u20132024/25 [@W:nbadata]','Not stated: prototype only']]}],
  stickies=[{'c':'pink','x':'Every non-commercial source must be replaced or licensed before any commercial launch.'}],
  summary='An MVP no longer needs a seven-figure data licence to prove its model. A business still does.', links=['H2','M1'])
P(id='H2', sec='H', title='Rights are a stack, not a switch', stage='evergreen', stamp='DECISION', date='2026-10-17',
  cues=['What are the five layers?', 'Who sells official data?', 'What travels where video can\u2019t?'],
  body=[{'t':'quote','x':'software licence \u2260 data licence \u2260 media rights \u2260 trademark rights \u2260 athlete likeness rights','by':'Opening line of the repo\u2019s rights registry [@D1]'},
        {'t':'ul','items':['Official feeds come from Sportradar [@D124], Stats Perform\u2019s Opta [@D125] and Genius Sports [@D126].','Derived, animated content can travel where video rights cannot, as Tennis Australia showed [@D60].','A rights control plane checks a source\u2019s policy in code before anything is stored, displayed or embedded.']}],
  summary='Each layer is licensed separately. Code must check the layer before it acts.', links=['I1','D2'])

# ---------- I: law and trust ----------
P(id='I1', sec='I', title='The rules of the road', stage='evergreen', stamp='VERIFIED', date='2026-10-17',
  cues=['What does India\u2019s 2025 law ban?', 'What are personality rights?', 'Why are HITMAN and Mamba codenames only?'],
  body=[{'t':'ul','items':['**Online money games** are banned in India: up to three years in prison, a fine of up to \u20b91 crore, or both. Games without stakes are not banned [@D15] [@D65].','**Personality rights**: on 29 July 2026 the Delhi High Court protected Yuvraj Singh\u2019s name, nickname, image, voice and likeness, including against AI deepfakes [@D133] [@D172].','**Trademarks**: HITMAN is a registered US trademark (no. 2997558) [@D173], and Kobe Bryant\u2019s estate has filed around \u201cMamba\u201d, including for virtual goods [@D174] [@D175] [@D176].','**Prediction markets** are split across US appeals courts and heading toward the Supreme Court [@D63] [@D64].']}],
  summary='Stay free-to-play, keep real athletes out of the characters, and keep codenames in the codebase.', links=['A2','I2'])
P(id='I2', sec='I', title='Trust principles we adopted', stage='evergreen', stamp='DECISION', date='2026-10-17',
  cues=['Which lessons became rules?', 'What does honesty look like on screen?'],
  body=[{'t':'ul','items':['No money, entry fees, prizes or rewards of value. Ever.','Every number has a receipt; every generated claim passes the verifier.','AI-labelled analysts; no fake bylines, no cloned voices of real people.','Honest states: historical replay, prototype-only data, source unavailable, stream-delay badge.','Grade the decision at lock time; show \u201cno grade\u201d inside the coin-flip band.','18+ beta, data export and account deletion from day one.']}],
  stickies=[{'c':'green','x':'Every rule here traces to a failure on E3 or a law on I1.'}],
  summary='Trust is the product. Rules are what make it repeatable.', links=['E3','G8'])

# ---------- J: design ----------
P(id='J1', sec='J', title='Dossier \u00d7 Munich \u201972', stage='budding', stamp='VERIFIED', date='2026-10-16',
  cues=['Why Munich 1972?', 'What does motion borrow?', 'Why game UI?'],
  body=[{'t':'ul','items':['Otl Aicher\u2019s Munich palette steered clear of Berlin 1936\u2019s red and black, built on light blue and white [@D138]; his pictograms, in the Smithsonian\u2019s phrase, changed urban design forever [@D139] [@D142].','Lando Norris\u2019s site by OFF+BRAND: speed-led transitions and cinematic scroll [@D135] [@D136].','Persona 5: menus as character, not chrome [@D150].','A dossier feel: stamps, receipts, case files. The analyst is a detective of decisions.']}],
  summary='Calm systematic graphics, with a little theatre where a reveal earns it.', links=['J2'])
P(id='J2', sec='J', title='Twelve screens, and this notebook', stage='budding', stamp='FIELD NOTE', date='2026-11-11',
  cues=['Which screens carry the idea?', 'How was this notebook designed?'],
  body=[{'t':'table','rows':[['Screens','',''],['Ticket Call','Swing Seismograph','Receipt Drawer'],['Timing-Tower League','Dossier Reveal','Pictogram Onboarding'],['Counterfactual Ghost','Leverage Meter','Persona Switchboard'],['\u201cCalled it\u201d card','Split-flap language toggle','Stream-delay honesty badge']]},
        {'t':'p','x':'This notebook combines Cornell pages, Zettelkasten IDs and digital-garden growth stages, with real page turns from the open-source StPageFlip library [@W:pageflip].'}],
  summary='Each screen makes one invisible idea visible: leverage, receipts, calibration, identity.', links=['M0','J1'])
