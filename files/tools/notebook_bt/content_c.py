# Before the Tender research notebook: content part C (The library, The engine room)
from content_a import P

# ---------- F: the library ----------
P(id='F1', sec='F', title='Base rates and fat tails', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['What do base rates say?', 'Why are averages dangerous?', 'What does that change in a forecast?'],
  body=[{'t':'ul','items':['Flyvbjerg and Gardner draw on a database of more than 16,000 projects [@D3]; average cost overruns run from about 1% for solar to about 120% for nuclear, with fossil thermal plants near 16% [@D4].','Only about one project in two hundred delivers on budget, on time and with its promised benefits [@D1].','Across 5,392 IT projects, Flyvbjerg and colleagues found overruns follow a power law: many small overruns and a fat tail of extreme ones [@W:fattailrepec]. Managers who assume a normal distribution grossly underestimate the extremes [@W:fattail].']},
        {'t':'p','x':'For the engine this means two things. Forecasts come from empirical quantiles of the reference class, never from a bell curve. And a lesson from the tail, Snowy or Hinkley, is worth more than ten from the middle.'}],
  stickies=[{'c':'green','x':'DECISION: quantiles, not means. P80 and P95 are always shown.'}],
  summary='The tail decides the outcome, so the tail decides the method.', links=['C1','C3','K2'])
P(id='F2', sec='F', title='Definition before decision', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['Does front-end definition predict outcomes?', 'What does PDRI measure?', 'What does FEED maturity add?'],
  body=[{'t':'ul','items':['CII research shows industrial projects with a PDRI score under 200 consistently beat those above 200 on cost, schedule and change orders [@W:pdri]. The industrial PDRI is a checklist of 70 scope-definition elements [@W:pdrind].','The same 200 threshold separated more and less successful infrastructure projects in a sample of 22 [@W:pdrinfra].','CII’s FEED maturity and accuracy work found high-maturity, high-accuracy projects outperformed by 24% on cost changes and 12% on change orders [@W:matrs].','IPA links weak front-end definition to lost returns [@D5].']}],
  stickies=[{'c':'yellow','x':'Every spur should ask: what was the definition score at the decision? It is usually missing, and the gap is itself a lesson.'}],
  summary='Definition at the decision predicts the outcome. Record it wherever it can be found.', links=['C8','G5','D3'])
P(id='F3', sec='F', title='One project, many names', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['What is entity resolution?', 'What is Fellegi–Sunter?', 'Where do language models help?'],
  body=[{'t':'ul','items':['The UK Ministry of Justice built Splink to link records that share no identifier, using the Fellegi–Sunter model with parameters estimated by expectation maximisation [@W:splinkgov] [@W:splinkijpds]. It explains each match in words, and links about a million records on a laptop in around a minute [@W:splinkpypi].','Peeters, Steiner and Bizer found the best LLMs need few or no labelled examples to match entities as well as fine-tuned models, and cope better with unseen entities [@W:emllm].','Fine-tuning helped smaller models but hurt transfer across domains [@W:emft].']},
        {'t':'p','x':'{{The plan:}} probabilistic matching for the easy majority, a language model to adjudicate the uncertain middle with a written reason, and a person for anything that would merge two existing Yard projects.'}],
  stickies=[{'c':'pink','x':'A false merge corrupts history. Never merge without a recorded reason.'}],
  summary='Statistics for the many, language models for the hard few, people for the irreversible.', links=['G2','G9','K2'])
P(id='F4', sec='F', title='Retrieval for project portfolios: vector or graph?', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['Which retrieval works better on portfolio data?', 'What did the 2026 study hold fixed?', 'What does it mean for the Yard?'],
  body=[{'t':'ul','items':['A 2026 ITcon study compared two retrieval pipelines on UK major-projects data, holding the model, prompt and settings fixed: a vector hybrid (metadata filters, dense retrieval, BM25 re-ranking) and a graph pipeline [@W:itcon].','The graph pipeline scored higher on faithfulness (0.81 vs 0.78), context recall (0.87 vs 0.83) and answer relevancy (0.74 vs 0.69); the vector pipeline was faster and cheaper, with marginally better context precision [@W:itcon].']}],
  stickies=[{'c':'green','x':'DECISION: the Yard is already a graph of projects, companies, parties and sources. Use graph retrieval for “why” questions and the vector hybrid for “find” questions.'}],
  summary='Choose retrieval by question type and by how much provenance matters. For decisions, provenance wins.', links=['G9','I3','C7'])
P(id='F5', sec='F', title='Language models on construction documents', stage='budding', stamp='VERIFIED', date='2026-11-11',
  cues=['What does the research find?', 'Where do models fail?', 'What helps most?'],
  body=[{'t':'ul','items':['A 2025 study in the Journal of Construction Engineering and Management found model-assisted risk identification prone to errors of omission, with quality depending more on the project scope data than on prompting skill [@W:jcem].','A 2025 benchmark compared LLMs with traditional NLP pipelines for classifying construction risks into categories [@W:mdpi].','A 2025 review counted 76 potential generative AI applications across construction phases and 18 challenges, with a case study where retrieval improved answers over contract documents [@W:westminster].','A 2026 preprint compares closed-book, retrieval and full-document approaches for inspection questions, isolating the effect of retrieval itself [@W:engrxiv].']}],
  stickies=[{'c':'yellow','x':'The common finding: grounding beats cleverness. Give the model the document and make it cite.'}],
  summary='Retrieval and good inputs matter more than prompts. Omission is the failure to design against.', links=['G3','G9','K2'])
P(id='F6', sec='F', title='Forecasting with machines', stage='budding', stamp='VERIFIED', date='2026-11-11',
  cues=['How good are LLM forecasters?', 'What makes them better?', 'What should the engine forecast?'],
  body=[{'t':'ul','items':['ForecastBench found expert forecasters outperforming the best language model in its original evaluation [@W:fb].','By late 2025 superforecasters scored a Brier Index of 70.6% against 67.9% for the best models, a gap of roughly one year of model progress [@W:fbindex].','Work since 2024 shows models approach human-level forecasting when given web search, and agentic methods now come close to the superforecaster median on ForecastBench backtests [@W:blf].']},
        {'t':'p','x':'The engine forecasts narrow, checkable things: will this project reach FID by its stated date, will its next estimate move, will its start year slip. Each forecast is stored and scored when the date passes.'}],
  stickies=[{'c':'green','x':'DECISION: every forecast is logged with its date and scored with a Brier score. Confidence is earned, not asserted.'}],
  summary='Machines are close to good forecasters when they read widely and calibrate. Score everything.', links=['K2','G6','F7'])
P(id='F7', sec='F', title='Browsing agents are confident, not always right', stage='budding', stamp='VERIFIED', date='2026-11-11',
  cues=['How well do agents browse?', 'What happens to calibration?', 'What does that mean for research operations?'],
  body=[{'t':'ul','items':['OpenAI’s BrowseComp set 1,266 hard-to-find questions; its Deep Research agent reached 51.5% at launch, far above models without browsing training, and accuracy rose smoothly with more browsing effort [@W:browsecomp].','Browsing made models more confident in wrong answers: a 2026 summary of the paper lists calibration error of 82% for GPT-4o with browsing against 69% without, and 91% for Deep Research [@W:browseparallel].']}],
  stickies=[{'c':'pink','x':'Never let an agent grade its own find. Receipts and independent checks do the grading.'},{'c':'green','x':'DECISION: spend research effort where a project’s exposure is high; cap it elsewhere.'}],
  summary='Agents find more when they search longer, and believe themselves too much. Budget the search; verify the result.', links=['G3','G8','J3'])
P(id='F8', sec='F', title='Why lessons-learned systems fail', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['What did GAO find at NASA?', 'Why were lessons not used?', 'Which design fixes follow?'],
  body=[{'t':'ul','items':['GAO found NASA’s lessons were not routinely identified, collected or shared, even though managers were required to review its Lessons Learned Information System [@W:gao].','Only 23% of surveyed managers had ever entered a lesson; they found the system hard to search and short of useful lessons [@W:gaogov].','NASA later added automatic dissemination of relevant lessons [@W:gao].']},
        {'t':'p','x':'The fixes are design choices: push a lesson at the gate where it applies, keep it short and specific, and close it only when an artefact (an estimate template, a gate criterion, a contract clause) has changed.'}],
  stickies=[{'c':'yellow','x':'A lesson that changes nothing is a story, not a lesson.'}],
  summary='Lessons die in the filing cabinet. Deliver them at the decision and make them bind.', links=['G5','I4','C8'])

# ---------- G: the engine room ----------
P(id='G1', sec='G', title='Collect: one intake for every signal', stage='evergreen', stamp='DECISION', date='2026-11-11',
  cues=['What gets collected?', 'How is it stored?', 'How often?'],
  body=[{'t':'table','rows':[['Stage','Sources','Cadence'],
     ['Forming','resource plans, interconnection queues, permits, pipeline open seasons, OEM slot news, land and tax filings','daily to monthly'],
     ['Decision','FID and sanction announcements, financing closes, board approvals, EPC awards','daily'],
     ['Change','cost revisions, schedule slips, contractor changes, stop-work orders, disputes, impairments','daily'],
     ['Outcome','commercial operation, first cargo, audits, closeout and inquiry reports','weekly to yearly']]},
        {'t':'p','x':'Every fetched document is stored raw with its URL, fetch time and content hash, then parsed. Nothing is overwritten: a changed page becomes a new version. The existing research queue and search providers stay; the open feeds (queue files, trackers, filings, audits) are added as scheduled jobs.'}],
  stickies=[{'c':'blue','x':'Store the raw document first. Nothing can be re-extracted from a summary.'}],
  summary='One intake, typed by lifecycle stage, versioned forever.', links=['G2','H1','J3'])
P(id='G2', sec='G', title='Resolve: deciding what is the same project', stage='evergreen', stamp='DECISION', date='2026-11-11',
  cues=['How are duplicates found?', 'What gets compared?', 'When does a person decide?'],
  body=[{'t':'p','x':'**Blocking** comes first: only compare candidates that share a country, a technology family and a capacity band. **Comparisons** come next: name similarity, owner, distance between locations, capacity difference, dates. A Fellegi–Sunter model turns each agreement or disagreement into a weight [@W:splinkgov].'},
        {'t':'code','x':'w = Σ_k  log2(m_k / u_k)              if field k agrees\n       log2((1 - m_k) / (1 - u_k))  if it disagrees\n# m_k = P(field k agrees | same project)\n# u_k = P(field k agrees | different projects)\n# w above upper → link; between → model adjudicates; merges → a person'},
        {'t':'ul','items':['Above the upper threshold: link automatically and record the weight.','In the middle band: a language model adjudicates and writes its reason [@W:emllm].','Any merge of two existing Yard projects: a person approves.']}],
  stickies=[{'c':'pink','x':'Two projects with the same name in the same state are common. Capacity and coordinates break the tie.'}],
  summary='Statistics for the many, a reasoned model for the few, a person for anything irreversible.', links=['F3','I3','K2'])
P(id='G3', sec='G', title='Detect and extract: from a page to an event', stage='evergreen', stamp='DECISION', date='2026-11-11',
  cues=['What is an event?', 'How are numbers extracted?', 'How is the result checked?'],
  body=[{'t':'ul','items':['**Classify** each new document into a stage (forming, decision, change, outcome) and a type: cost revision, contractor exit, stop-work order, FID, first power and so on.','**Extract** against a fixed schema: project mention, event type, date, old and new amounts with currency and price base, the verbatim sentence and its page.','**Check** in code: units, currency, price base (Hinkley’s 2015 money is not 2026 money), and the arithmetic between old and new values.','**Grade** the event from its sources; one source keeps it provisional (see [[G8]]).']},
        {'t':'p','x':'Research on construction documents points the same way: ground the model in the document and make it cite, because omission is the common failure [@W:jcem] [@W:engrxiv].'}],
  stickies=[{'c':'green','x':'DECISION: the model classifies and extracts; code computes every difference and percentage.'}],
  summary='An event is a dated change with a number, a sentence and a page. Anything less stays in the queue.', links=['G9','G8','F5'])
P(id='G4', sec='G', title='Deliverability: the earliest credible date', stage='evergreen', stamp='DECISION', date='2026-11-11',
  cues=['What is the earliest credible date?', 'Which constraints count?', 'How is it computed?'],
  body=[{'t':'p','x':'For each forming project the engine asks, constraint by constraint, when the thing that sets the date can arrive: turbines or engines, step-up transformers and breakers, the interconnection agreement and network upgrades, EPC capacity, craft labour and gas supply. Each has a lead-time distribution with a source and an as-of date.'},
        {'t':'code','x':'ready[k]   = order_date[k] + lead_time[k] at P50 and P80\nenergise   = max over k of ready[k] + install_and_test\nearliest   = energise at P80\nbinding    = the k with the latest ready date\n# unknown order date → assume the decision date'},
        {'t':'ul','items':['Lead times are data, not code: today the step-up transformer row reads above 160 weeks [@W:wmreuters].','With no known order or slot, the order date defaults to the decision date. That is how a plan discovers it is already late.','The output is a date, the binding constraint, and the cheapest action that moves it, such as an at-risk order.']}],
  stickies=[{'c':'yellow','x':'This is the rude question made computable: can anyone build it by the date it needs?'}],
  summary='The latest-arriving constraint sets the date. Show which one, and what would move it.', links=['B2','B1','I4'])
P(id='G5', sec='G', title='From event to spur', stage='evergreen', stamp='METHOD', date='2026-11-11',
  cues=['What is inside a spur?', 'How is a lesson written?', 'When is it published?'],
  body=[{'t':'kv','rows':[['PROJECT','the Yard record, its class and region'],['EVENT','what changed, when, by how much'],['DRIVERS','one primary, up to two secondary (see [[C8]])'],['EVIDENCE','verbatim sentence, page, screenshot, grade'],['LESSON','one sentence, written for a named gate'],['ARTEFACT','what should change: a template, a criterion, a clause'],['TOOL','the decision tool that answers it'],['EXPOSURE','forming projects that share its traits']]},
        {'t':'p','x':'Rules: two independent sources before publication; every lesson names a gate and an artefact; numbers come from extraction, never from the writer.'}],
  stickies=[{'c':'green','x':'DECISION: every published spur has had a human read. Drafts can be machine-written; publication cannot.'}],
  summary='A spur is a lesson with a gate, an artefact and a receipt. Without all three it is a news item.', links=['C0','G6','F8'])
P(id='G6', sec='G', title='Exposure: who should read this lesson now', stage='budding', stamp='DECISION', date='2026-11-11',
  cues=['How is exposure measured?', 'Why not a black box?', 'How does it learn?'],
  body=[{'t':'p','x':'Each spur carries traits: technology, size band, region, contract type, OEM, EPC and the stage the event hit. Each forming project carries the same traits. Exposure is a weighted overlap, shown feature by feature, so a reader can see why a lesson matched.'},
        {'t':'code','x':'exposure = Σ_f weight[f] × match[f]\n# starting weights (judgement, later learned):\n#   technology 0.30 · contract type 0.20 · EPC 0.20\n#   region 0.15 · size within 2x 0.15'},
        {'t':'p','x':'The weights start as judgement and are later learned from feedback: which matches people opened, kept or dismissed.'}],
  stickies=[{'c':'pink','x':'A match that cannot explain itself will not be trusted, however accurate it is.'}],
  summary='Explainable overlap first. Learn the weights once there is feedback to learn from.', links=['G7','I4','K2'])
P(id='G7', sec='G', title='Where a tool can help: the fit queue', stage='budding', stamp='DECISION', date='2026-11-11',
  cues=['What makes a fit?', 'How is it scored?', 'What does a lead look like?'],
  body=[{'t':'code','x':'fit = proximity × exposure × pain × tool_match\nproximity  : decision within 18 months 1.0 … no date known 0.2\nexposure   : size × spread of outcomes for the class\npain       : recent event on this or a sister project, 0 to 1\ntool_match : the decision is one a catalogued tool answers'},
        {'t':'ul','items':['A lead is one line: account, decision, date, tool, and the spur that opens the conversation.','A utility pricing a new combined-cycle plant off old references gets a benchmark scan, opened with [[B5]].','An owner on a second mid-execution re-estimate gets an outturn forecast and a reset, opened with [[C2]].']},
        {'t':'p','x':'The score orders a queue; it does not make a claim. Every factor is shown with its evidence.'}],
  stickies=[{'c':'green','x':'DECISION: the existing “solution × trigger” view becomes this queue, driven by data instead of keywords.'}],
  summary='A fit is a decision coming, on a project like one that failed, that a tool can change.', links=['A4','I2','C0'])
P(id='G8', sec='G', title='Confidence on two axes', stage='evergreen', stamp='METHOD', date='2026-11-11',
  cues=['How are sources graded?', 'Why two axes?', 'What lowers a grade?'],
  body=[{'t':'fig','id':'confidence'},
        {'t':'ul','items':['The Admiralty code grades how reliable a source is (A to F) separately from how credible a piece of information is (1 to 6) [@W:admiralty]; the NATO standard keeps six grades on each axis [@W:leiden].','A common mistake is to treat a source category, such as a regulatory filing, as a reliability grade [@W:altss].','This notebook keeps its GRADE-style outline (high, moderate, low, very low) [@W:gradebmj] and adds the two-part code to every receipt, rated down when the capture cannot find the supporting words.']}],
  stickies=[{'c':'yellow','x':'A reliable source can carry a weak claim. Grade both, separately.'}],
  summary='Reliability belongs to the source; credibility belongs to the claim. Keep them apart.', links=['M0','K4','H3'])
P(id='G9', sec='G', title='Models estimate, code computes', stage='evergreen', stamp='DECISION', date='2026-11-11',
  cues=['What does the model do?', 'What must code do?', 'How is it tested?'],
  body=[{'t':'ul','items':['Language models classify documents, extract fields against a schema, adjudicate uncertain matches and draft lessons for review.','Code does all arithmetic, currency and price-base conversion, lead-time maths, scores and thresholds.','Model settings live in one configuration file, as they already do in the toolkit; every run records the model, the prompt version and its inputs.','A golden set of labelled documents gates every change: extraction precision and recall, match accuracy and lesson quality.']}],
  stickies=[{'c':'pink','x':'Without keys, today’s tool says “not configured” instead of guessing. Keep that honesty.'}],
  summary='Language for language, code for numbers, evaluations for trust.', links=['G3','K2','J3'])
