# Before the Tender research notebook: content part B (Lessons from live projects, The giants, The startups)
from content_a import P

# ---------- C: lessons from live projects (the spurs) ----------
P(id='C0', sec='C', kind='figure', title='Ten spurs, one table', stamp='VERIFIED', date='2026-11-11',
  body=[{'t':'table','rows':[['Case','What happened','Lesson','Tool'],
     ['Snowy 2.0','A$5.9B at FID, now a A$22.2B target [@W:snowyesd]','test design maturity before any target cost','Stage Gate, Outturn, Forensic'],
     ['Jansen Stage 1','US$5.7B, then 7.0–7.4B, then 8.4B [@W:bhp6k]','put a P80 on every re-estimate','Outturn, Risk Analysis'],
     ['Hinkley Point C','about £18B at the start, £35B now in 2015 money [@W:hpciir]','replicate teams, not drawings','Outturn, Lessons Learnt'],
     ['Golden Pass LNG','lead EPC filed Chapter 11 [@W:gprig]','test the contractor’s balance sheet','Build Advisor, Risk Analysis'],
     ['US offshore wind','five projects halted after FID [@W:owmondaq]','price the day of delay early','Investment Case, Forensic'],
     ['Step-up transformers','lead times above 160 weeks [@W:wmreuters]','order before FID','Build Advisor, Stage Gate'],
     ['Turbine slots','reservations fell for the first time [@W:gevfw]','track conversions, not backlog','Build Advisor'],
     ['AI campuses','one developer’s slip cut a guidance [@W:fierce]','model third-party chains','Scheduling, Cockpit'],
     ['Gas plant costs','public datasets lag the market [@W:gridlabpr]','anchor to recent awards','Reality Scan, Costline'],
     ['UK major projects','34 of 189 rated red [@W:nista]','ingest official confidence data','Cockpit, Stage Gate']]},
        {'t':'p','x':'Each row is a spur: a dated event, a cause, a one-line lesson for a named gate, and the tool that answers it. The pages that follow hold the full receipts.'}],
  links=['C1','C2','C3','C4','C5','C6','C7','C8'])
P(id='C1', sec='C', title='Snowy 2.0: a reset is only as good as the design under it', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['What happened to the number?', 'Why did the 2023 reset not hold?', 'Which tool would have caught it?'],
  body=[{'t':'fig','id':'snowy'},
        {'t':'ul','items':['Announced at about A$2 billion in 2017 [@W:snowyesd]; approved at A$5.9 billion at the 2018 final investment decision [@W:anao].','Reset in 2023 to A$12 billion, moving from an EPC contract to a hybrid incentivised target cost contract [@W:anao].','In October 2025 the A$12 billion target was declared no longer achievable [@W:snowyfoi]; in October 2026 it became A$22.2 billion, with a A$25 billion scenario and completion in late 2029 [@W:snowyesd].','The audit recorded A$11.1 billion spent and the project 73% complete at 31 March 2026 [@W:anao]. Ministers blamed the original design immaturity [@W:snowyqldr]; the update cited underestimated scope and missed productivity targets [@W:snowypv].','Snowy Hydro modelled replacing the scheme with batteries at about A$80 billion, which is why stopping is so hard [@W:snowybatt].']}],
  stickies=[{'c':'pink','x':'Lesson: a target cost set on an immature design is a forecast of the next reset.'},{'c':'green','x':'Tools: Stage Gate holds analysis until the design is mature; Outturn uses the hydro tail, not the average; Forensic resets at a declared confidence.'}],
  summary='The 2023 reset changed the contract, not the design maturity. The number followed the design.', links=['C8','F1','G5'])
P(id='C2', sec='C', title='Jansen: a range is not a number', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['How did the estimate move?', 'What drove it?', 'What did BHP change for Stage 2?'],
  body=[{'t':'fig','id':'jansen'},
        {'t':'ul','items':['Stage 1 was approved in August 2021 at US$5.7 billion; in July 2025 BHP guided US$7.0–7.4 billion; in January 2026 it confirmed US$8.4 billion, with first production in mid-2027 [@W:bhp6k].','BHP named inflation and real cost escalation, design development and scope changes, and lower productivity as the drivers; the updated Stage 1 return is 7.9–9.1% with an 11–15 year payback [@W:bhp6k].','Stage 2 rose from US$4.9 billion to US$6.9 billion in June 2026, with first production in late FY2031, and BHP booked a US$2.3 billion impairment [@W:bhp20f].','The Stage 2 estimate was redone with engineering about 83% complete, to de-risk it [@W:bhpctv], alongside more modular construction [@W:bhpmining].']}],
  stickies=[{'c':'pink','x':'Lesson: the first mid-execution range moved again within six months. Put a P80 on every re-estimate.'},{'c':'green','x':'Tools: Outturn re-run at every re-baseline; Risk Analysis prices productivity; Reality Scan checks scope.'}],
  summary='A revised range is a statement of hope with error bars. The outside view sets the bars.', links=['C8','G5','K2'])
P(id='C3', sec='C', title='Hinkley Point C: learning is real, and local', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['Where is the number now?', 'What improved on Unit 2?', 'What carries over to Sizewell C?'],
  body=[{'t':'ul','items':['EDF raised the construction estimate to £35 billion in February 2026 [@W:hpcbss]. In 2015 money that is almost double the roughly £18 billion the project started at, and Unit 1’s start-up moved to 2030 [@W:hpciir].','Unit 2 is being built 20–30% faster than Unit 1, with prefabrication near 60% by January 2026 [@W:hpcen].','Sizewell C, a near-replica, is expected to cost £38 billion [@W:hpcajb], and lessons from Hinkley are being shared with it [@W:hpciir].']},
        {'t':'p','x':'Nuclear carries the fattest tail in the base rates, about 120% average overrun [@D4]. Hinkley shows both faces: a first unit that overran, and a second unit that learned.'}],
  stickies=[{'c':'yellow','x':'Learning shows up on the second unit, with the same team. A replication case must carry the team, not just the drawings.'},{'c':'green','x':'Tools: Outturn on the nuclear class; Lessons Learnt that bind; Reality Scan unit-to-unit benchmarks.'}],
  summary='Replication cures nuclear overruns only if the people and the supply chain replicate too.', links=['F1','G5','K5'])
P(id='C4', sec='C', title='Golden Pass: risk moves only as far as a balance sheet', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['What happened to the contractor?', 'What did it cost in time?', 'What should an owner test?'],
  body=[{'t':'ul','items':['Sanctioned in 2019 with an initial budget of over $10 billion and a 2024 start [@W:gprig].','Lead contractor Zachry filed for Chapter 11 in May 2024, saying the project had gone beyond schedule and budget [@W:gprig], after overruns reported above $2.4 billion [@W:gpbio]. The owners then had to rehire and remobilise over 4,000 workers [@W:gplng].','First LNG came on 30 March 2026 [@W:gpstart]; the second and third trains continue under amended EPC terms with Chiyoda and McDermott [@W:gprig].']}],
  stickies=[{'c':'pink','x':'Lesson: a lump-sum contract transfers risk only as far as the contractor can carry it.'},{'c':'green','x':'Tools: Build Advisor checks contractor backlog and health; Risk Analysis tests allocation; Alignment Room watches owner and contractor divergence.'}],
  summary='When the contractor breaks, the owner gets the risk back with interest.', links=['C8','G4','D2'])
P(id='C5', sec='C', title='US offshore wind: policy risk after FID has a day-rate', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['What happened in 2025–26?', 'How did the courts rule?', 'What did a day cost?'],
  body=[{'t':'ul','items':['A December 2025 order suspended all five offshore wind projects then under construction in US federal waters [@W:owmondaq].','All five won preliminary injunctions and were back at work by February 2026 [@W:owmondaq]; the government later missed the deadline to appeal [@W:owelectrek].','Revolution Wind was nearly 90% built when it was halted [@W:rw90], at a cost of about $2 million a day [@W:rwmarine]; Empire Wind faced up to $50 million a week [@W:gcaptain].']}],
  stickies=[{'c':'pink','x':'Lesson: policy risk after FID is real, measurable and litigable. The evidence record wins the case.'},{'c':'green','x':'Tools: Investment Case runs the late-date test; Cockpit prices the day of delay; Forensic keeps the record.'}],
  summary='Price the day before you have to argue about it.', links=['B7','C8','G7'])
P(id='C6', sec='C', title='AI campuses: the dependency map is the schedule', stage='budding', stamp='VERIFIED', date='2026-11-11',
  cues=['What delayed the capacity?', 'What does late delivery cost?', 'What should a schedule model?'],
  body=[{'t':'ul','items':['CoreWeave cut its 2025 guidance in November 2025 because one third-party data-center developer fell behind [@W:fierce].','Tenants were reported to be seeking more than $5 million a day for late capacity in 2026 [@W:tikr].','Analysts separate real delays from noise by checking power, permits and equipment rather than press releases [@W:semi].']}],
  stickies=[{'c':'pink','x':'Lesson: on AI campuses the critical path runs through other people’s balance sheets.'},{'c':'green','x':'Tools: Generative Scheduling models third parties as logic; Cockpit watches portfolio drift; Opportunity Map dates energisation.'}],
  summary='For a data center the date is a chain of dependencies. Model the chain.', links=['B7','G4','C8'])
P(id='C7', sec='C', title='Governments now publish their own early warnings', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['What does the UK portfolio show?', 'What is new in 2026?', 'Why is this a free feed?'],
  body=[{'t':'ul','items':['The UK’s 2025–26 Government Major Projects Portfolio covered 189 projects with a whole-life cost of £924.2 billion [@W:nistahae]: 29 rated green, 109 amber, 34 red and 17 exempt [@W:nista].','Red-rated projects carry about £244 billion of that cost [@W:nistahwy]; 72% of the infrastructure and construction projects faced significant or major delivery risks [@W:nistabcis].','NISTA created a mega-project class, starting with Sizewell C, HS2 and Dreadnought, and is building an AI-powered early warning system [@W:nistatu]; it cut the portfolio to 81 projects from April 2026 [@W:nistageo].','Ratings, costs and schedule narratives are published as a CSV [@W:nistacsv], and a 2026 study used these datasets to benchmark retrieval designs [@W:itcon].']}],
  stickies=[{'c':'blue','x':'Feed: the NISTA CSV yearly; national audit offices as published.'},{'c':'yellow','x':'Governments are both a source and a buyer for early warning.'}],
  summary='An official, structured, yearly delivery-confidence dataset exists. Ingest it before buying anything.', links=['H1','F4','D4'])
P(id='C8', sec='C', title='Twelve ways a number breaks', stage='budding', stamp='METHOD', date='2026-11-11',
  cues=['What are the drivers?', 'Which early signal reveals each?', 'Which tool answers it?'],
  body=[{'t':'table','rows':[['Driver','Early signal','Tool'],
     ['Design immature at sanction','estimate looser than the design stage; scope changes after FID','Stage Gate, Outturn'],
     ['Estimate anchored to stale references','cost per kW below recent awards','Reality Scan, Costline'],
     ['Re-estimate not converged','second revision inside a year','Outturn, Risk Analysis'],
     ['First of a kind','new technology, team or site','Outturn, Lessons Learnt'],
     ['Long-lead equipment','no slot or order before FID','Build Advisor, Stage Gate'],
     ['Contractor capacity or health','backlog, losses, disputes, exits','Build Advisor, Risk Analysis'],
     ['Labour productivity','owner and EPC assumptions differ','Alignment Room, Scheduling'],
     ['Ground and site conditions','tunnelling, marine works, geotechnical surprises','Risk Analysis, Outturn'],
     ['Grid and interconnection','no signed agreement; network upgrade costs','Build Advisor, Scheduling'],
     ['Policy and permits after FID','stop-work orders, litigation, tariff changes','Investment Case, Forensic'],
     ['Third-party dependencies','developer, utility or OEM on the critical path','Scheduling, Cockpit'],
     ['Market and demand','offtake slips, reservations cancelled','Investment Case']]},
        {'t':'p','x':'Each spur is tagged with one primary driver and up to two secondary drivers, so lessons can be counted as well as read.'}],
  stickies=[{'c':'green','x':'DECISION: the taxonomy is a versioned table in the database, not a list in a prompt.'}],
  summary='Twelve drivers cover every case so far. Each new spur either fits one or earns a thirteenth.', links=['G5','C0','I3'])

# ---------- D: the giants ----------
P(id='D1', sec='D', title='The verified-data houses', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['Who already tracks projects at scale?', 'What is their moat?', 'What are they adding?'],
  body=[{'t':'ul','items':['Industrial Info Resources reports more than 350,000 plants, 120,000+ capital projects and 500,000+ process units across 180+ countries, verified quarterly by phone with plant managers [@W:iir] [@W:iirllms]. It now offers an MCP connector so AI systems can query that data [@W:iirmcp].','Dodge tracks more than 700,000 construction projects a year [@W:dodgems] and describes two pipelines: technology that finds the signal and a human network that confirms it [@W:dodge]. It markets human verification against AI-only lead tools [@W:dodgevs].','Global Energy Monitor publishes 25 open trackers, mostly under CC BY 4.0 [@W:gemlic], including an integrated power tracker with unit capacity, status, owner and location [@W:gemgipt].']}],
  stickies=[{'c':'yellow','x':'Their moat is verification. Ours has to be receipts anyone can audit, plus judgement they do not sell.'},{'c':'blue','x':'Build or buy: start on open data; license verified feeds where coverage runs out.'}],
  summary='The giants sell coverage and verification. Nobody sells the judgement of whether a project can be built on time.', links=['D4','H2','E1'])
P(id='D2', sec='D', title='Consultancies and engineers', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['What are the big firms building?', 'How do they sell it?', 'Rivals or channels?'],
  body=[{'t':'ul','items':['Accenture agreed to buy a majority stake in DLB, a data-center engineering firm [@D33] [@D34], and bought Verum Partners, a Brazilian megaproject manager [@D35].','McKinsey formalised an alliance with ALICE for generative scheduling in April 2026 [@D36] [@D47]; its Capital Projects 5.0 framework centres delivery on a control centre [@D37].','Deloitte, PwC, AECOM and Jacobs each run capital-projects practices or tools, from a capital projects studio to a data-center digital twin [@D38] [@D39] [@D40] [@D41].','KPMG’s 2026 report frames the owner’s question as proof of control [@D9].']}],
  stickies=[{'c':'yellow','x':'Pattern: integrated control centres, delivered by people with partner tools. Channels more than rivals.'}],
  summary='The big firms are converging on one idea and selling it as services. A tool that feeds them is a partnership, not a fight.', links=['D3','E3','J4'])
P(id='D3', sec='D', title='The outside-view incumbents', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['Who owns the benchmark data?', 'How do they deliver it?', 'Where is the gap?'],
  body=[{'t':'ul','items':['Independent Project Analysis has benchmarked more than 25,000 projects and sells software such as TrueCost for upstream oil and gas [@D42].','Oxford Global Projects runs reference-class benchmarking for governments and regulators, including a Heathrow benchmark for the UK aviation regulator [@D43].','IPA finds only 13% of projects reach Good or Best Practical front-end definition, and each level below Good costs about two points of return on site and sustaining projects [@D5] [@D6].','CII’s Alignment Thermometer, a 1997 survey later turned into a spreadsheet, is still the structured alignment tool [@D8].']}],
  stickies=[{'c':'yellow','x':'They deliver the outside view as studies, once per gate. The engine turns it into a feed.'}],
  summary='The method is proven and the data is private. Public outcome data is the opening.', links=['F1','F2','D1'])
P(id='D4', sec='D', title='Platforms adding agents', stage='budding', stamp='VENDOR CLAIM', date='2026-11-11',
  cues=['What did the platforms ship in 2026?', 'What do they ground their AI in?', 'What is left open?'],
  body=[{'t':'ul','items':['Procore launched a connected common data environment with agentic AI in June 2026, grounded in verified project data [@W:procore].','IIR’s connector and Dodge’s pipelines put AI on top of verified datasets [@W:iirmcp] [@W:dodge].','The UK government is building its own AI early warning system for major projects [@W:nistatu].']}],
  stickies=[{'c':'pink','x':'Risk: incumbents add “ask AI” to the data they own. Search alone will not differentiate.'},{'c':'green','x':'DECISION: differentiate on deliverability, lessons that bind and tool fit, all with receipts.'}],
  summary='Everyone is adding agents to data they already hold. The open lane is judgement with evidence.', links=['E1','G9','L2'])

# ---------- E: the startups ----------
P(id='E1', sec='E', title='Regulatory filings as a product: Halcyon', stage='evergreen', stamp='VENDOR CLAIM', date='2026-11-11',
  cues=['What does Halcyon do?', 'How is it funded?', 'Where does the Opportunity Map differ?'],
  body=[{'t':'ul','items':['Halcyon raised a $21 million Series A in March 2026 for an AI platform built on regulatory data from all 50 US state utility commissions, every ISO and RTO, and FERC [@W:halcyonbw].','It sells natural-language search with agentic alerts, plus data subscriptions tracking large-load tariffs, gas plants, batteries, rate cases and substation development [@W:halcyonti].','Founded in 2023 in San Francisco, it targets data-center siting, infrastructure investment and energy development [@W:halcyoncov].']},
        {'t':'p','x':'Halcyon also co-authored the gas-cost analysis in [[B5]] [@W:gridlab]. It sits closest to the signal layer of this engine.'}],
  stickies=[{'c':'yellow','x':'Halcyon answers “what does the filing say?”. The engine asks: can it be built by its date, what did similar projects teach, and which decision changes?'}],
  summary='Document search is becoming a category. Deliverability, lessons and fit are still open.', links=['D4','G1','L2'])
P(id='E2', sec='E', title='Site, queue and campus intelligence', stage='budding', stamp='VERIFIED', date='2026-11-11',
  cues=['Who screens sites?', 'Who cleans the queue data?', 'Who tracks data-center delays?'],
  body=[{'t':'ul','items':['Paces, backed by Y Combinator, screens land for renewables and data centers and raised an $11 million Series A [@D53].','Berkeley Lab compiles its queue data with Interconnection.fyi across the seven organised US markets and about 50 other balancing areas [@W:lblnews].','SemiAnalysis runs a data-center industry model and publishes which delays it believes are real [@W:semi].']}],
  stickies=[{'c':'blue','x':'Feeds to evaluate: queue APIs for monthly refresh; permit and satellite signals for campuses.'}],
  summary='Specialists own slices of the signal. None joins signals, outcomes and decisions on one record.', links=['B3','B8','E4'])
P(id='E3', sec='E', title='Schedule, progress and document AI', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['Who serves delivery?', 'How much have they raised?', 'Why does that matter here?'],
  body=[{'t':'table','rows':[['Company','What it does','Money or status'],
     ['nPlan','schedule risk from past schedules','$16M Series B, 2025 [@D44]'],
     ['Foresight','schedule risk analytics','Series A [@D45]'],
     ['Nodes & Links','AI-powered scheduling','funding round [@D46]'],
     ['ALICE','generative scheduling','McKinsey alliance [@D47]'],
     ['Buildots','progress from site imagery','$130M, September 2026 [@D48]'],
     ['Doxel','progress tracking','company profile [@D49]'],
     ['Trunk Tools','document answers for contractors','Series B [@D56]'],
     ['Avathon','asset performance','company profile [@D59]']]},
        {'t':'p','x':'Most of the money sits after the investment decision and on the contractor’s side. The engine works before the decision, for owners and funders.'}],
  stickies=[{'c':'yellow','x':'They are downstream users of the same evidence: a spur about productivity matters to a scheduler too.'}],
  summary='Delivery AI is crowded and funded. Pre-decision judgement is not.', links=['E4','D2','L2'])
P(id='E4', sec='E', title='The accelerator’s infrastructure classes', stage='budding', stamp='VERIFIED', date='2026-11-11',
  cues=['What is YC funding in 2026?', 'Who is nearest?', 'Where is the white space?'],
  body=[{'t':'ul','items':['PLAN0 AI (Spring 2026) estimates building costs from architectural plans [@D61]; Squid (Winter 2026) builds AI agents for grid planning [@D62].','YC’s 2026 construction and proptech picks concentrated on back-office, estimating and maintenance workflows [@D63], and its Fall 2026 batch leaned into physical infrastructure [@D64].']}],
  stickies=[{'c':'yellow','x':'White space: owner-side, before the tender, with outcomes attached.'}],
  summary='Accelerator money follows workflows. The decision itself is still unclaimed.', links=['E3','L2','A4'])
