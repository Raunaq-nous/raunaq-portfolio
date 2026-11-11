from content_a import P, PAGES
# ---------- H: money and the graveyard ----------
P(id='H1', sec='H', title='Chegg: selling answers', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['What happened to Chegg?', 'Why so fast?', 'What is the lesson?'],
  body=[{'t':'p','x':'Chegg\u2019s market value fell from $14.7 B to $115 M in five years as free AI answers undercut paid homework help [@W:chegg]. In May 2025 it cut around 22% of its workforce after revenue fell 30% [@W:chegg2].'}],
  stickies=[{'c':'pink','x':'Anything that sells answers is now free. Sell the capability to find them.'}],
  summary='Answers became free overnight; guided capability did not.', links=['D4','K2'])
P(id='H2', sec='H', title='Byju\u2019s: selling growth', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['How did the most valuable edtech fall?', 'What did investors conclude?', 'What is the lesson?'],
  body=[{'t':'p','x':'Byju\u2019s, once valued at $22 billion, fell into insolvency after BlackRock cut its valuation by roughly 95% and its founder called it worth zero [@W:byjus].'}],
  stickies=[{'c':'pink','x':'Growth bought with debt and sales pressure is not learning.'}],
  summary='Learning businesses fail when growth outruns outcomes.', links=['G6'])
P(id='H3', sec='H', title='Sonara and the bulk-senders', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['What happened to the first auto-apply bots?', 'What did users lose?', 'What is the lesson?'],
  body=[{'t':'p','x':'Sonara shut down on February 1, 2024 after failing to raise funding, locking users out of their data mid-search [@W:sonara]. Wonsulting dropped bulk-send after one interview per fifty applications [@W:wonsulting].'}],
  stickies=[{'c':'green','x':'DECISION: local-first. Your data lives on your own server, with nightly backups.'}],
  summary='Own your data, and don\u2019t confuse sending with getting hired.', links=['J3','F2'])
P(id='H4', sec='H', title='Hardware: narrow jobs win', stage='seedling', stamp='VERIFIED', date='2026-11-11',
  cues=['What should a physical Career OS learn from AI hardware?', 'Who failed?', 'Who succeeded?'],
  body=[{'t':'ul','items':['Humane sold fewer than 10,000 units of its AI Pin [@W:humane] and sold its assets to HP for $116 million [@W:humane2].','Rabbit R1 sold 100,000 units amid criticism; OpenAI\u2019s companion device will not ship before 2027 [@W:aihw], after a $6.5 billion acquisition of Jony Ive\u2019s io [@W:openaiio].','Plaud, which only records and summarises conversations, reached about $250M annualized revenue [@W:plaud].']}],
  stickies=[{'c':'yellow','x':'Do one daily job far better than a phone. Never depend on a service that can disappear.'}],
  summary='Single-purpose devices with a clear daily job survive; phone replacements did not.', links=['K7'])
P(id='H5', sec='H', title='Lessons from the graveyard', stage='evergreen', stamp='DECISION', date='2026-11-11',
  kind='figure',
  body=[{'t':'table','rows':[['Failure','Cause','Career OS response'],['Chegg','sold answers AI made free','sell guided capability and proof [[K2]]'],['Byju\u2019s','growth funded by debt','outcomes first, no paid acquisition at launch'],['Sonara','users locked out of their data','local-first, user-owned data [[J3]]'],['Bulk-send tools','volume without fit','approval-gated, evidence-first applying [[G5]]'],['Humane','no clear daily job','one narrow job for the device [[K7]]']]}],
  links=['H1','H2','H3','H4'])

# ---------- I: the engine room ----------
P(id='I1', sec='I', title='How to build a real-world case', stage='budding', stamp='VERIFIED', date='2026-11-11',
  cues=['How do the labs test AI on professional work?', 'How are deliverables graded?', 'What can a human simulator borrow?'],
  body=[{'t':'p','x':'GDPval covers 44 occupations [@W:gdpval] with 1,320 tasks [@W:gdpvalarxiv], each based on real work products and created by professionals averaging 14 years of experience [@W:gdpdecoder]. Experts grade blind against a professional\u2019s own solution; OpenAI\u2019s automated grader is not yet reliable enough to replace expert graders [@W:gdpsnorkel].'},
        {'t':'p','x':'Mercor\u2019s APEX-Agents uses 240 tasks across 31 scenario worlds in investment banking, consulting and corporate law [@W:apex].'}],
  stickies=[{'c':'yellow','x':'AI benchmarks of professional work are career simulators for machines. Borrow the method for people.'},{'c':'green','x':'DECISION: cases are expert-authored, built on a real deliverable, graded blind against a reference solution.'}],
  summary='The method for building credible cases already exists; it was built to test models.', links=['K2','I3','E3'])
P(id='I2', sec='I', title='Tracking mastery', stage='seedling', stamp='VERIFIED', date='2026-11-11',
  cues=['How should the system know what you have mastered?', 'Do LLMs do this better?', 'What is the hybrid?'],
  body=[{'t':'p','x':'Knowledge tracing estimates a learner\u2019s knowledge state from their sequence of attempts [@W:ktllm]. Deep Knowledge Tracing introduced recurrent neural networks to the task and outperformed earlier methods [@W:ktsurvey].'},
        {'t':'p','x':'Fine-tuned LLMs perform on par with standard Bayesian Knowledge Tracing, not better [@W:ktparity]. Hybrid designs such as SPAR-GNN use graph models for tracing and call LLMs selectively, only in high-impact learning scenarios [@W:spargnn].'}],
  stickies=[{'c':'green','x':'DECISION: the problems-solved ledger is an interpretable mastery model per skill; LLMs write the cases, hints and feedback.'}],
  summary='Trace mastery with explainable models; use language models where language helps.', links=['C4','I3'])
P(id='I3', sec='I', title='AI can grade, with controls', stage='budding', stamp='VERIFIED', date='2026-11-11',
  cues=['Can an AI fairly grade open-ended work?', 'What biases does it have?', 'What makes it reliable?'],
  body=[{'t':'p','x':'GPT-4 as a judge reached over 80% agreement with human preferences in one benchmark, comparable to agreement between people, but judges show position, verbosity and self-preference biases [@W:judge80]. LLM essay graders score below humans and penalise minor errors humans discount [@W:judgeessay]. Simple permutation-based calibration substantially improves rubric-based judging [@W:judgepos].'}],
  stickies=[{'c':'green','x':'DECISION: rubric-based grading by a model from a different family, calibrated against human expert samples; humans review anything credential-grade.'}],
  summary='AI grading is usable as a calibrated instrument, never as an unchecked verdict.', links=['I1','J1','L4'])
P(id='I4', sec='I', title='Skills need a shared language', stage='seedling', stamp='VERIFIED', date='2026-11-11',
  cues=['How should skills be pulled from job descriptions?', 'Which taxonomy?', 'How do the giants rank jobs?'],
  body=[{'t':'p','x':'ESCO lists over 13,000 individual skills; zero-shot LLM pipelines can map job posts to it, and LLM re-ranking improved matching by over 22 points [@W:esco]. A 2026 shared task describes skills as the unit of account of the modern labour market [@W:talentclef].'},
        {'t':'p','x':'LinkedIn\u2019s 360Brew is a decoder-only foundation model for personalized ranking and recommendation [@W:brew360], a 150B-parameter model serving job suggestions and skill inference [@W:brew150].'}],
  stickies=[{'c':'green','x':'DECISION: normalise every extracted skill to ESCO, so demand, gaps and proof line up.'}],
  summary='A shared taxonomy makes market demand, personal gaps and proof comparable.', links=['K5','F6'])
P(id='I5', sec='I', title='The digital avatar', stage='seedling', stamp='VERIFIED', date='2026-11-11',
  cues=['Can an AI model a specific person?', 'How accurate is it?', 'What are the risks?'],
  body=[{'t':'p','x':'Park and colleagues built generative agent simulations of 1,000 people from two-hour interviews [@W:park24]; the agents replicated survey answers 85% as accurately as the individuals replicated their own answers two weeks later [@W:park24hai].'}],
  stickies=[{'c':'pink','x':'Privacy and consent are the whole product here. The avatar must be yours, stored with you.'},{'c':'blue','x':'OPEN: can an interview-grounded avatar of your profile pick the next case better than a rule?'}],
  summary='A personal avatar built from your own interview is feasible; it must stay under your control.', links=['K1','J3'])
P(id='I6', sec='I', title='Harness, evaluator and playbook', stage='budding', stamp='VERIFIED', date='2026-11-11',
  cues=['Does Career OS need an agent harness?', 'How is quality checked?', 'How does it learn your judgment?'],
  body=[{'t':'p','x':'A harness needs an agent loop, a tool interface, context management and control mechanisms [@W:harness]. Career OS deliberately runs a fixed workflow for predictable steps, with tools exposed to an external harness for open-ended work.'},
        {'t':'p','x':'Quality follows Anthropic\u2019s long-running-agent primitives: a fresh-context evaluator with a default-FAIL contract [@W:anthprim]. Self-improvement follows two lines of research: GEPA refines prompts by reflecting on traces [@W:gepa], used by Nubank [@W:gepanubank]; Agentic Context Engineering grows an evolving playbook and warns against context collapse [@W:ace].'}],
  stickies=[{'c':'green','x':'DECISION: the playbook changes one rule at a time, and only with my approval.'}],
  summary='Workflow for the predictable, harness for the open-ended, an independent evaluator for everything.', links=['L4','I3'])
P(id='I7', sec='I', title='Models and keys', stage='budding', stamp='FIELD NOTE', date='2026-11-11',
  cues=['Which model does which job?', 'What does it cost?', 'What broke?'],
  body=[{'t':'p','x':'Together AI is prepaid and suspends access at zero balance [@W:together]. OpenRouter passes provider prices through with a fee on credits and automatic fallback [@W:openrouter]. Open-weight leaders in October 2026 included GLM-5.3 [@W:openmodels]; one review flagged weak honesty scores for DeepSeek V4 Pro [@W:honesty], a risk for anything that writes about a person.'},
        {'t':'p','x':'{{Field note:}} structured tasks run on a small, fast model; writing gets a stronger one; every call logs which model served it [[L3]].'}],
  stickies=[{'c':'pink','x':'A model can vanish from a provider overnight. Failover is not optional.'}],
  summary='Route by task, log everything, and never depend on one model.', links=['L3'])

# ---------- J: law and trust ----------
P(id='J1', sec='J', title='Grading people is high-risk in Europe', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['When does assessing people with AI become regulated?', 'When do the rules apply?', 'What does it mean for the simulator?'],
  body=[{'t':'p','x':'The EU AI Act was amended by Regulation (EU) 2026/1744, the Digital Omnibus [@W:euomnibus]. High-risk obligations for AI used in employment decisions now apply from December 2, 2027 [@W:ogletree].'}],
  stickies=[{'c':'green','x':'DECISION: judge jobs for the user, not users for employers. Any employer-facing score is a regulated product.'}],
  summary='The simulator stays on the individual\u2019s side and explains every assessment.', links=['I3','J2'])
P(id='J2', sec='J', title='Who is liable when hiring AI goes wrong', stage='budding', stamp='VERIFIED', date='2026-11-11',
  cues=['What are the landmark cases?', 'What do they allege?', 'What follows for Career OS?'],
  body=[{'t':'p','x':'Two landmark US cases are testing vendor liability: Mobley v Workday and Kistler et al v Eightfold, the latter alleging candidate data was compiled without the disclosures the Fair Credit Reporting Act requires; both companies contest the claims [@W:lawsuits].'}],
  stickies=[{'c':'pink','x':'Collecting public data about people to judge them carries legal duties.'}],
  summary='User-owned, user-side tools are the safer design.', links=['J1','J3'])
P(id='J3', sec='J', title='Confidentiality and data ownership', stage='evergreen', stamp='FIELD NOTE', date='2026-11-11',
  cues=['Whose data is it?', 'How are client details protected?', 'What is scraped text allowed to do?'],
  body=[{'t':'ul','items':['**Local-first**: the database, profile and history live on the user\u2019s own server with nightly backups, after Sonara locked its users out [@W:sonara].','**A confidentiality gate** runs on every generated artifact and again on the exported PDF text, with a list of specific forbidden names and approved substitutes.','**Scraped job text and emails are data, never instructions**, because recruiters now find prompt injections inside documents [@W:herohunt].']}],
  stickies=[{'c':'pink','x':'Field note: an internal tool name once leaked into a generated resume because the rule named a category, not the actual names. Categories block nothing.'}],
  summary='Own the data, name every forbidden term, and treat outside text as inert.', links=['H3','L2'])

# ---------- K: design notebook ----------
P(id='K1', sec='K', title='The modules', stage='budding', stamp='DECISION', date='2026-11-11',
  cues=['What are the parts?', 'Which exist?', 'How do they connect?'],
  body=[{'t':'fig','id':'os'},
        {'t':'p','x':'Choose a direction, read the market, see the gap, simulate, prove, credential, apply with approval, learn your judgment, and later a physical form. The job layer and the gap analysis exist; the simulator, the proof and the Approf link are next.'}],
  stickies=[{'c':'yellow','x':'Every module produces evidence the next one can use.'}],
  summary='Nine modules, one loop, one ledger of problems solved.', links=['A2','K2','K3','K4'])
P(id='K2', sec='K', title='The career simulator', stage='seedling', stamp='DECISION', date='2026-11-11',
  cues=['What exactly is a case?', 'What are the design rules?', 'How is success measured?'],
  body=[{'t':'p','x':'A case is a real-world problem drawn from roles the market is hiring for: a deliverable, a brief, messy inputs, a reference solution and a rubric [[I1]]. Rules from the research:'},
        {'t':'ul','items':['**Scaffold, never answer**: unguarded AI harms learning [@W:bastani].','**Adapt support**: examples for newcomers, reflection for experienced pivoters [@W:chern].','**Feedback that informs**: task and next-step feedback, not praise [@W:fbpraise].','**Teach the frontier**: include cases where the AI is wrong [[E2]].','**Crews**: competition combined with collaboration [@W:gamif].','**Measure transfer**: a fresh case, without help.']}],
  stickies=[{'c':'blue','x':'OPEN: who authors and validates cases at scale? Employers, practitioners, or both [[M2]].'}],
  summary='Real deliverables, scaffolded coaching, informative feedback and a transfer test.', links=['I1','I2','I3','M2'])
P(id='K3', sec='K', title='The portfolio of proof', stage='seedling', stamp='DECISION', date='2026-11-11',
  cues=['What goes in the portfolio?', 'How is it hard to fake?', 'Who trusts it?'],
  body=[{'t':'p','x':'Every case and tool build becomes an artifact: the work itself, the reasoning, what was tried and what failed, a timestamped history and an independent grade. Because AI can produce polished output, the process record is the proof [@W:cui].'}],
  stickies=[{'c':'blue','x':'OPEN: is third-party verification, such as employer-reviewed cases, needed for proof to carry weight?'}],
  summary='Proof means process, not just polish.', links=['F1','I3'])
P(id='K4', sec='K', title='Credentials, through Approf', stage='seedling', stamp='DECISION', date='2026-11-11',
  cues=['Why keep credentials?', 'What does Approf do?', 'How do they connect?'],
  body=[{'t':'p','x':'Employers still screen on credentials, with skills-based hiring borne out in fewer than 1 in 700 hires [@W:bgi]. Where a target role needs a certification, an exam or further study, Career OS hands that leg of the journey to Approf, the personalised exam-preparation platform, and records the result in the same ledger.'}],
  stickies=[{'c':'green','x':'DECISION: proof and credentials together, until proof alone is enough.'}],
  summary='Earn what employers still ask for while building what should replace it.', links=['F5','A4'])
P(id='K5', sec='K', title='Career tracks', stage='budding', stamp='VERIFIED', date='2026-11-11',
  cues=['Which tracks exist today?', 'What do they demand now?', 'Where is the honest fit?'],
  body=[{'t':'ul','items':['**Strategy consulting**: firms are piloting AI in interviews, including McKinsey\u2019s Lilli in some final rounds [@W:mbbai] and BCG\u2019s AI-assisted cases [@W:casecoach].','**AI deployment strategy**: the Deployment Strategist owns scope, stakeholders and value while forward deployed engineers build [@W:fdevsds].','**Forward deployed engineering**: production code plus evaluation; Anthropic committed $100 million to training engineers for this kind of work [@W:fde100m].','**Venture capital**: firms hire few consultants and inspect craft such as memos [@W:vcmbb] [@W:vcskills].']}],
  stickies=[{'c':'yellow','x':'Skill demand per track is counted live from every job description ingested.'}],
  summary='Four tracks to start, each with live demand, gaps and pathways.', links=['I4','F6'])
P(id='K6', sec='K', title='Sourcing design', stage='budding', stamp='VERIFIED', date='2026-11-11',
  cues=['Where do the jobs come from?', 'How does it stay within the rules?', 'How are ghost jobs handled?'],
  body=[{'t':'ul','items':['Company-direct postings from public applicant-tracking endpoints such as Greenhouse and Workday [@W:atsapi]; one feed built on them covers 25,900 employers [@W:careersite].','Google Jobs through SerpApi\u2019s free 250 searches per month [@W:serpapi]; job pages read through r.jina.ai [@W:jina]; Exa kept for manual use after its free tier changed [@W:exafree].','Indian portals such as iimjobs through alert emails, never scraped [@W:indiaboards].','A ghost-job filter, since about 14% of active postings show no hiring intent [@W:ghostjobs].']}],
  stickies=[{'c':'green','x':'DECISION: about 180 seed companies across consulting, AI deployment, venture capital and the AI 50, each verified live.'}],
  summary='Direct, aggregated and emailed sources, filtered for real openings and measured for conversion.', links=['F4','G1'])
P(id='K7', sec='K', title='The physical form', stage='seedling', stamp='OPEN', date='2026-11-11',
  cues=['Why a device at all?', 'What one job should it do?', 'What must it never do?'],
  body=[{'t':'p','x':'Daily interaction is where habits form, and a device could make the next case, the next review and the next decision as easy as glancing at a desk. The graveyard is clear: phone replacements failed and single-purpose devices survived [[H4]].'},
        {'t':'p','x':'{{Candidate jobs:}} a daily case prompt, a voice debrief after a real meeting, a progress ledger at a glance. Whatever it is, it must work offline-first and must not brick if a service disappears [@W:humane2].'}],
  summary='One daily job, done better than a phone, owned by the user.', links=['H4','H5'])

# ---------- L: build log ----------
P(id='L1', sec='L', title='June\u2013July 2026: audit, rebuild, hosting', stage='evergreen', stamp='FIELD NOTE', date='2026-07-06',
  cues=['Where did it start?', 'What was evaluated and set aside?', 'Where does it run?'],
  body=[{'t':'ul','items':['1 June: a full audit of the original job-search app, then a phased rebuild plan.','June: an autonomous agent runtime was evaluated as an \u201cactuator\u201d layer; it was set aside in favour of an approval-gated pipeline that external agents can drive.','July: deployed to a small server in Mumbai behind a reverse proxy, with a self-installing setup script and nightly backups. ~~A European host was the first plan~~; its identity checks were flagged as a likely delay.']}],
  summary='Start by auditing, keep the human gate, host it yourself.', links=['L2','J3'])
P(id='L2', sec='L', title='August\u2013October: the resume engine', stage='evergreen', stamp='FIELD NOTE', date='2026-10-11',
  cues=['Why does the model never write bullets?', 'What broke?', 'What fixed it?'],
  body=[{'t':'ul','items':['~~The model rewrote bullets~~: it truncated them, invented phrasing and leaked confidential terms. Fix: **selection, not writing**. The model returns bullet IDs; text comes only from the verified profile.','Page two came out 5% full. Fix: render the real PDF, measure it, and fill from the next-ranked evidence.','Every resume looked the same: ranking sorted by impact before job relevance. Fix: quality as a filter, relevance as the ranking.','The same achievement appeared three times. Fix: no separate projects section; every build sits under its employer.']}],
  stickies=[{'c':'yellow','x':'Each failure became a structural rule, not a prompt tweak.'}],
  summary='The resume is selected from evidence and checked by gates, because writing is no longer proof [[F1]].', links=['F1','J3'])
P(id='L3', sec='L', title='21 October: the day the keys broke', stage='evergreen', stamp='FIELD NOTE', date='2026-10-21',
  cues=['What failed?', 'What was the wrong first diagnosis?', 'What changed?'],
  body=[{'t':'p','x':'Every writing feature failed at once. ~~First diagnosis: credit ran out.~~ The balance was fine. The real error said the provider had moved the drafting model off pay-per-use to dedicated endpoints only, and the code had no failover at all.'},
        {'t':'p','x':'Fix: failover on model-not-available as well as rate limits and outages, no defaults that need a dedicated endpoint, and per-task model chains through one gateway [@W:openrouter].'}],
  stickies=[{'c':'pink','x':'Lesson: read the actual error before diagnosing.'}],
  summary='Providers change underneath you; design for it.', links=['I7'])
P(id='L4', sec='L', title='Late October: building in autonomous runs', stage='evergreen', stamp='FIELD NOTE', date='2026-10-27',
  cues=['How was the big build done?', 'What did it produce?', 'What went wrong?'],
  body=[{'t':'ul','items':['One-shot runs with a self-maintained backlog and a verification contract: six items done, 1,186 tests passing.','Built: an independent evaluator gate, a model gateway, ten applicant-tracking collectors, an alert inbox, a ghost-job filter, career tracks with skill demand, and a feedback playbook.','Parallel sub-agents exhausted the usage limit; the work was finished sequentially. Collector test data was reconstructed from documentation and needs live capture.']}],
  stickies=[{'c':'yellow','x':'An agent that builds needs the same discipline as a team: backlog, tests, and no silent shortcuts.'}],
  summary='Autonomous building works when the contract is explicit and checked.', links=['I6','K6'])
P(id='L5', sec='L', title='November: research in public', stage='budding', stamp='FIELD NOTE', date='2026-11-11',
  cues=['Why publish the research?', 'How is it built without a laptop install?', 'What comes next?'],
  body=[{'t':'p','x':'This notebook is generated from source files, every receipt is screenshotted on GitHub with its words highlighted, and the layers view shows all of it at once. Building happens in cloud tools only: Claude Code on the web always uses subscription credentials [@W:ccauth], and GitHub Codespaces offers a free monthly allowance for heavier work [@W:codespaces].'}],
  summary='Research that can be checked, built with tools that run anywhere.', links=['M3'])

# ---------- M: viewpoints and open questions ----------
P(id='M1', sec='M', title='The case against', stage='budding', stamp='VERIFIED', date='2026-11-11',
  cues=['Where could the thesis be wrong?', 'What evidence cuts the other way?', 'What would change my mind?'],
  body=[{'t':'ul','items':['Experience does help early: its predictive power was strongest in the first months of a new job [@W:hbr19].','The entry-level decline may not be AI: a Danish study found no real effect [@W:register].','AI can make people worse: unguarded tutoring cut unaided exam scores 17% [@W:bastani].','Employers may not change: skills-first hiring has barely moved actual hiring [@W:bgi].','Simulations can be gamed, and the best AI grader of professional work still isn\u2019t reliable enough to replace experts [@W:gdpsnorkel].','Several market figures here are vendor claims, rated accordingly.']}],
  stickies=[{'c':'pink','x':'I would change my mind if simulated experience failed to transfer to fresh problems.'}],
  summary='The thesis survives the counter-evidence, but only with guardrails, honest grading and a transfer test.', links=['C1','E4','D4','F5'])
P(id='M2', sec='M', title='Open questions', stage='seedling', stamp='OPEN', date='2026-11-11',
  cues=['What is still unknown?', 'What will be tested first?', 'Who should help?'],
  body=[{'t':'ul','items':['Who authors and validates cases at scale, and how difficulty is calibrated.','Whether a problems-solved ledger can compare people fairly across backgrounds.','Whether employers will trust simulated outcomes, and what verification they need.','Which certifications in each track actually move hiring outcomes.','Real conversion data by source for India and the Middle East.','Whether an interview-grounded avatar picks better next cases than rules.','The one daily job for the physical form.']}],
  summary='Seven questions, each with a test the product can run.', links=['K2','K3','K7'])
P(id='M3', sec='M', title='How this notebook stays alive', stage='evergreen', stamp='METHOD', date='2026-11-11',
  cues=['How often is it updated?', 'When does a claim settle?', 'How is a new source added?'],
  body=[{'t':'p','x':'It runs as a living review: continually updated as new evidence appears, and retired from living mode once the evidence is conclusive [@W:lsr]. Receipts are graded on GRADE\u2019s four levels [@W:gradebmj].'},
        {'t':'p','x':'To add a source: add it to the register with the exact words to highlight, cite it on a page, rebuild, and the capture workflow screenshots it. Old conclusions stay visible, struck through, with the reason.'}],
  summary='Dated, graded, captured and never quietly rewritten.', links=['M0'])
