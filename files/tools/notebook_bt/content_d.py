# Before the Tender research notebook: content part D (Data and rights, Design notebook, Build log, Research methods, Open questions)
from content_a import P

# ---------- H: data and rights ----------
P(id='H1', sec='H', title='Open feeds first', stage='evergreen', stamp='DECISION', date='2026-11-11',
  cues=['Which feeds are open?', 'Which terms apply?', 'How often do they change?'],
  body=[{'t':'table','rows':[['Feed','What it gives','Terms'],
     ['Berkeley Lab queue file','US projects seeking connection, status and dates','CC BY 4.0 [@W:lbldata]'],
     ['GEM trackers','plant-level power, gas, steel and more, worldwide','CC BY 4.0 unless noted [@W:gemlic]'],
     ['UK major projects data','ratings, whole-life costs, schedule narratives','published CSV [@W:nistacsv]'],
     ['SEC EDGAR filings','estimates, sanctions, impairments, OEM backlogs','public filings [@W:bhp6k] [@W:gev3q]'],
     ['Audit offices','independent reviews with baselines and spend to date','public reports [@W:anao] [@W:gao]']]},
        {'t':'p','x':'Each feed gets a parser, a schedule and a test fixture. Terms are recorded per dataset, and attribution travels with every record that uses it.'}],
  stickies=[{'c':'green','x':'DECISION: no paywalled scraping. When a source needs a login, find the open record of the same fact.'}],
  summary='The open record is deep enough to start. Terms are stored next to the data.', links=['H2','G1','C7'])
P(id='H2', sec='H', title='Paid feeds, later', stage='budding', stamp='DECISION', date='2026-11-11',
  cues=['What do paid feeds add?', 'When is it worth buying?', 'What would be bought first?'],
  body=[{'t':'ul','items':['Verified project databases: phone-verified industrial coverage with an AI connector [@W:iirmcp]; construction pipelines backed by a human network [@W:dodge].','Regulatory-document platforms with trackers [@W:halcyonti].','Disclosed-cost datasets for power plants [@W:enverus].']},
        {'t':'p','x':'Buy when a decision needs coverage the open record cannot give (industrial plants outside power, the Gulf, Asia), and only behind the same evidence rules.'}],
  stickies=[{'c':'yellow','x':'A licensed feed is still a source. It gets graded like everything else.'}],
  summary='Open data proves the engine; paid data extends its reach.', links=['D1','E1','H1'])
P(id='H3', sec='H', title='Screenshots, quotes and fair use', stage='evergreen', stamp='METHOD', date='2026-11-11',
  cues=['What gets captured?', 'How much is quoted?', 'What about paywalls?'],
  body=[{'t':'ul','items':['A capture is a screenshot of the public page, scrolled to the highlighted words and stamped with the receipt number and date.','Each source contributes at most one short verbatim phrase; everything else is paraphrased and linked.','Primary and openly licensed sources come first: filings, government data, audit reports, open datasets.','Robots rules and rate limits are respected; nothing behind a login is captured.']}],
  stickies=[{'c':'pink','x':'If a page cannot be captured, the grade drops to very low and the receipt says why.'}],
  summary='Capture enough to prove the claim, quote little, link always.', links=['G8','K4','M0'])

# ---------- I: design notebook ----------
P(id='I1', sec='I', title='What exists today', stage='evergreen', stamp='FIELD NOTE', date='2026-11-11',
  cues=['What does the current map do?', 'What does it depend on?', 'What breaks?'],
  body=[{'t':'ul','items':['Signals for a list of tracked accounts plus the general market, with account tiles, an “ask AI” box, and filters by industry, signal type and capex.','A signals list ranked by default weights, with views for new project announcements and megaprojects above $1 billion.','Analysis tabs: geography, regional views, solution by tier, solution by trigger, categories, industry by theme, signal types and companies.','Research operations (queued and running jobs) and a codebook that classifies signals; unsourced signals are hidden, and the footer reminds the reader that evidence is not a confirmed client need.','Search runs through Tavily, SearchAPI or SerpAPI with RSS always on; models are set in one configuration file; without keys the map is empty by design.','A fresh database misses the map’s default settings row, which only one migration inserts; without it the state and settings endpoints fail and the background worker never picks up queued jobs.','Unlike the other two tools, map jobs keep no stage records, and the schema snapshot has drifted behind the migrations.']}],
  stickies=[{'c':'yellow','x':'The bones are right: queue, codebook, geography, receipts. The question it answers is too narrow.'}],
  summary='Today’s map watches accounts. The rebuild watches projects, decisions and lessons, and keeps accounts as a lens.', links=['I2','J3','A4'])
P(id='I2', sec='I', title='What changes', stage='evergreen', stamp='DECISION', date='2026-11-11',
  cues=['Which views are new?', 'What is kept?', 'What moves to the Yard?'],
  body=[{'t':'table','rows':[['Today','Rebuild'],
     ['Signals for tracked accounts','Forming projects with buildability and an earliest credible date'],
     ['Project news','Events on each Yard project, typed and graded'],
     ['Project profiles','The Yard record, with deliverability, lessons and fit panels'],
     ['Solution × trigger','The fit queue, scored and explained'],
     ['Codebook','Event types and the driver taxonomy, versioned'],
     ['Research operations','Kept, plus scheduled open-data feeds and a review queue']]},
        {'t':'p','x':'Accounts stay: a watchlist becomes a filter over projects and decisions instead of the unit of analysis.'}],
  stickies=[{'c':'green','x':'DECISION: one record. The Opportunity Map writes to the Yard; it keeps no project table of its own.'}],
  summary='Same skeleton, new question: not “what is this account doing?” but “which decision should change, and why?”', links=['I3','I4','G7'])
P(id='I3', sec='I', title='The data model', stage='budding', stamp='DECISION', date='2026-11-11',
  cues=['What are the entities?', 'How do they link?', 'What already exists?'],
  body=[{'t':'fig','id':'datamodel'},
        {'t':'ul','items':['**Project** (Yard, existing) gains buildability, an earliest credible date and a binding constraint.','**Source and document** (Yard sources, extended): URL, fetch time, hash, licence, grade.','**Signal**: a forming-stage observation, linked to a project or waiting for resolution.','**Event**: a dated change with amounts, price base and evidence.','**Evidence**: the verbatim sentence, page, screenshot path and confidence.','**Spur**: drivers, gate, artefact, tool and status.','**Lead time**: a distribution per equipment class, with a source and an as-of date.','**Exposure and fit**: scored pairs with their feature breakdowns.']}],
  stickies=[{'c':'blue','x':'Map the spec onto existing tables before adding any. Extend first, then add.'}],
  summary='Eight entities, most of them extensions of what the Yard already holds.', links=['G5','G6','J2'])
P(id='I4', sec='I', title='Screens', stage='budding', stamp='DECISION', date='2026-11-11',
  cues=['What does a user see first?', 'What is in a project drawer?', 'What does a spur card show?'],
  body=[{'t':'ul','items':['**Forming**: a map and list of forming projects, filtered by buildability, binding constraint and decision date.','**Project drawer**: the event timeline, a deliverability card (date, binding constraint, cheapest action), the spurs that apply and the fit.','**Spurs**: lesson cards by driver and industry, each with receipts inside confidence outlines, and a publish button for reviewed cards.','**Fit queue**: ranked decisions with the opening spur and the evidence behind every factor.','**Research operations**: feeds, jobs, and the review queue for merges, events and spurs.']}],
  stickies=[{'c':'yellow','x':'Every card wears its confidence outline, in the same visual language as this notebook.'}],
  summary='Four working views and one operations view. Every number opens its receipt.', links=['I5','G4','G5'])
P(id='I5', sec='I', title='Guardrails in the interface', stage='evergreen', stamp='DECISION', date='2026-11-11',
  cues=['What must never appear?', 'What is hidden by default?', 'What is always visible?'],
  body=[{'t':'ul','items':['No number without a receipt; unsourced items stay hidden, as they are today.','Provisional items (one source, or not yet captured) are labelled and outlined dashed.','Scores always show their factors; leads always carry “evidence is not a confirmed need”.','Every merge and every publication records who approved it.']}],
  stickies=[{'c':'pink','x':'The fastest way to lose a buyer is one confident wrong number.'}],
  summary='Make uncertainty visible and approvals traceable.', links=['G8','A4','K4'])

# ---------- J: build log ----------
P(id='J1', sec='J', title='Building with Replit Agent', stage='evergreen', stamp='METHOD', date='2026-11-11',
  cues=['Plan or build first?', 'How are mistakes undone?', 'Which settings matter?'],
  body=[{'t':'ul','items':['Plan mode lets the Agent read the project and draft a task list without changing code; approving the plan with “Build here” starts the work [@W:replitplan].','Each completed task creates a checkpoint, so changes can be reviewed and rolled back [@W:replitpvb].','The Agent reads replit.md on every request, and Replit advises keeping it focused and concise [@W:replitmd].','Modes are now Lite, Economy and Power, with App Testing for in-browser self-testing; Max mode has gone [@W:replitmodes].','Pricing is effort-based, Plan mode included, with usage alerts and hard budget limits [@W:replitbill].','Scheduled Deployments run a command on a schedule written in plain language, which suits nightly feeds [@W:replitsched].']}],
  stickies=[{'c':'green','x':'For the heavy phases: Power mode, App Testing on, and a budget cap set before the first prompt.'}],
  summary='Plan in Plan mode, build in checkpoints, schedule the feeds, cap the spend.', links=['J2','J3','K2'])
P(id='J2', sec='J', title='One prompt that keeps every detail', stage='evergreen', stamp='DECISION', date='2026-11-11',
  cues=['Why do long prompts lose detail?', 'Where does the detail live?', 'What does the prompt actually say?'],
  body=[{'t':'p','x':'Replit’s own guidance is to plan first, build incrementally and be specific, rather than ask for a whole platform in one message [@W:replitprompt] [@W:replitbp]. So the one prompt is short, and the detail lives in files the Agent must read: a specification, a data-sources list, a taxonomy, seed data, acceptance criteria and a progress log.'},
        {'t':'ul','items':['**Plan mode**: read every file in the spec folder, map it onto the existing code, and produce a task list that covers every acceptance criterion.','**Build mode**: work task by task; after each one, run the tests, tick the criteria in the progress log, and carry on.','**Resume**: one line, “continue from the progress log”.']}],
  stickies=[{'c':'yellow','x':'Details survive in files, not in chat history.'}],
  summary='Short prompt, long spec, and a checklist the Agent has to tick.', links=['J3','I3','K2'])
P(id='J3', sec='J', title='Phases', stage='budding', stamp='DECISION', date='2026-11-11',
  cues=['What is built first?', 'What proves each phase?', 'What comes last?'],
  body=[{'t':'fig','id':'phases'},
        {'t':'ul','items':['**0 Discover**: map the existing code and schema, changing nothing.','**1 Foundations**: fix the missing settings row; add tables and seed data.','**2 Feeds**: queue file, trackers, filings, UK projects data, audits; scheduled jobs.','**3 Events**: classification, extraction, checks and the review queue.','**4 Resolution**: matching to Yard projects with the three-band rule.','**5 Deliverability and spurs**: earliest credible date, spur cards, exposure.','**6 Fit queue and screens**.','**7 Evaluation**: golden set, backtest, calibration.']}],
  stickies=[{'c':'green','x':'Every phase ends with a demonstration on real data, not on fixtures alone.'}],
  summary='Eight phases, each closed by a test that real data has to pass.', links=['J2','K2','I4'])
P(id='J4', sec='J', title='Decisions so far', stage='evergreen', stamp='DECISION', date='2026-11-11',
  cues=['What has been decided?', 'Why?', 'What would reverse it?'],
  body=[{'t':'table','rows':[['Decision','Reason'],
     ['Build on the Yard and the existing map','one record; the queue and codebook already exist'],
     ['Open data first','proves the engine with no licence risk'],
     ['Precision over recall','a wrong lead costs more than a missed one'],
     ['A person approves merges and publications','irreversible actions need a name'],
     ['Models estimate, code computes','numbers must be testable'],
     ['Quantiles, not means','fat tails [[F1]]']]}],
  stickies=[{'c':'blue','x':'Reversal test: if backtests show recall too low to matter, revisit precision first.'}],
  summary='Six decisions, each with its reason written down.', links=['G9','F1','K2'])

# ---------- K: research methods ----------
P(id='K1', sec='K', title='A living review', stage='evergreen', stamp='METHOD', date='2026-11-11',
  cues=['How does this research stay current?', 'On what cadence?', 'What gets re-graded?'],
  body=[{'t':'p','x':'The notebook follows the living systematic review: a review that is continually updated as new evidence appears [@W:lsr]. Living reviews exist because conventional reviews go stale; Cochrane training cites typical update gaps of 2.5 to 6.5 years [@W:lsrcochrane].'},
        {'t':'kv','rows':[['WEEKLY','new filings, earnings and audits; spurs drafted'],['MONTHLY','spurs reviewed and published; lead-time tables refreshed'],['QUARTERLY','sources re-captured and re-graded; taxonomy reviewed'],['YEARLY','queue report, UK projects data, base rates re-run']]}],
  stickies=[{'c':'green','x':'Old conclusions stay on the page, struck through, with the reason.'}],
  summary='Dated, versioned and re-graded on a calendar.', links=['K2','K4','M0'])
P(id='K2', sec='K', title='Backtesting the engine', stage='budding', stamp='METHOD', date='2026-11-11',
  cues=['How do we know it works?', 'What is the test?', 'What gets measured?'],
  body=[{'t':'ul','items':['**Freeze** the record at a past date, say mid-2024, and run the engine on what was knowable then.','**Score** what it flagged against what happened later: did Jansen’s next estimate move, did Snowy’s target hold, did the start year slip?','**Measure** precision at the top of the queue, lead time (how early a flag came) and the calibration of every probability with a Brier score [@W:fb].','**Golden set**: 200 labelled documents for extraction and matching, re-run on every change.']}],
  stickies=[{'c':'pink','x':'Guard against hindsight: a backtest may only read documents dated before the freeze.'}],
  summary='Freeze, flag, wait, score. Repeat every quarter.', links=['F6','G9','K3'])
P(id='K3', sec='K', title='What to research next', stage='seedling', stamp='OPEN', date='2026-11-11',
  cues=['Which questions are open?', 'Which data would answer them?', 'Who has studied them?'],
  body=[{'t':'ul','items':['Which forming-stage signals best predict reaching FID on time: queue status, OEM slot, land, permit or offtake?','How often does a first mid-execution re-estimate hold, by sector, across listed miners, utilities and LNG sponsors?','Do lessons transfer across sectors, or only within a technology? Exposure feedback will tell.','How early do public signals reveal a contractor in trouble: court records, earnings, liens?','What share of public outcome data records a definition score at the decision ([[F2]])?']}],
  stickies=[{'c':'yellow','x':'Each question becomes a dated page when its first evidence arrives.'}],
  summary='Five questions, each with a data plan.', links=['K2','L1','F2'])
P(id='K4', sec='K', title='How sources get graded', stage='evergreen', stamp='METHOD', date='2026-11-11',
  cues=['What is the starting grade?', 'What moves it?', 'How is it shown?'],
  body=[{'t':'kv','rows':[['HIGH','primary records, official data, peer-reviewed work'],['MODERATE','reputable reporting, institutes, official blogs'],['LOW','blogs, aggregators, newsletters, mirrors'],['VERY LOW','could not be captured'],['RATED DOWN','one level when the capture cannot find the words']]},
        {'t':'p','x':'This follows GRADE’s idea of starting from the type of evidence and rating down for problems [@W:gradepmc], and adds the Admiralty two-part code to every receipt [@W:admiralty]. Overrides are written down with a reason, for example the official blog of a benchmark’s maintainers.'}],
  stickies=[{'c':'blue','x':'The outline around every screenshot is this grade.'}],
  summary='Start from the source type, rate down for what the capture cannot confirm, and write down every override.', links=['G8','H3','M0'])
P(id='K5', sec='K', title='A case protocol for spurs', stage='budding', stamp='METHOD', date='2026-11-11',
  cues=['How is a spur researched?', 'Why compare pairs?', 'What is the counterfactual?'],
  body=[{'t':'ul','items':['**Chronology**: every number with its date and its price base.','**Drivers**: coded with the taxonomy, primary and secondary.','**Counterfactual**: which gate and which tool would have changed the decision, using only what was knowable at the time.','**Pairs**: compare like with like, Hinkley Unit 1 against Unit 2, Jansen Stage 1 against Stage 2. Pairs isolate what changed.','**Two sources** before publication; a one-source spur stays a draft.']}],
  stickies=[{'c':'yellow','x':'The counterfactual may only use what was knowable then.'}],
  summary='Chronology, drivers, counterfactual, pairs and two sources.', links=['C2','C3','G5'])

# ---------- L: open questions ----------
P(id='L1', sec='L', title='Open questions', stage='seedling', stamp='OPEN', date='2026-11-11',
  cues=['What is unresolved?', 'What would settle it?'],
  body=[{'t':'ul','items':['Can public outcome data alone support credible reference classes outside US power and UK public projects?','Should a lesson be valued by the overrun it explains, or by the decisions it changes?','What review load can one person carry each week, and where must automation stop?','When does a lead engine become a market-intelligence product that customers would buy directly?','Which buyer moves first: owners, lenders, insurers or governments?']}],
  stickies=[{'c':'pink','x':'The biggest risk: a beautiful feed that nobody acts on.'}],
  summary='The engine is a hypothesis about judgement at scale. These are its tests.', links=['K3','L2','A4'])
P(id='L2', sec='L', title='What would change my mind', stage='seedling', stamp='OPEN', date='2026-11-11',
  cues=['What would make this a bad idea?', 'Who could do it better?', 'What is the honest bear case?'],
  body=[{'t':'ul','items':['If incumbents with verified data ship deliverability and lessons first, the edge moves to depth in one sector [@W:iirmcp] [@W:dodge].','If regulatory-document platforms add outcome data, the signal layer becomes a commodity [@W:halcyonbw].','If backtests show public signals lead outcomes by too few months to matter, the forming view becomes a nice map rather than a decision tool.']},
        {'t':'p','x':'{{The bet:}} judgement with receipts, at the moment of decision, is worth more than coverage.'}],
  stickies=[{'c':'yellow','x':'Write the bear case early, so the evidence can argue with it.'}],
  summary='Three ways this fails, each testable within a year.', links=['L1','D4','E1'])
