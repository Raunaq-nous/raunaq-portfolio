from content_a import P, PAGES
# ---------- D: how people learn ----------
P(id='D1', sec='D', title='Simulations build complex skills', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['Does simulated work build real capability?', 'How big is the effect?', 'Who needs what support?'],
  body=[{'t':'p','x':'A meta-analysis of 145 studies found simulation-based learning has a large positive effect, g = 0.85, robust across medical, teacher and management education [@W:chern]. Scaffolding and technology improved learning further. Learners with high prior knowledge gained most from reflection phases; learners with low prior knowledge learned better from worked examples [@W:chern].'},
        {'t':'kv','rows':[['Certainty','High: meta-analysis of 145 studies'],['Design rule','Examples for newcomers to a field, reflection for experienced pivoters']]}],
  stickies=[{'c':'green','x':'DECISION: the simulator adapts its scaffolding to the learner\u2019s prior knowledge in that track.'}],
  summary='Simulation is among the most effective ways to learn complex skills, if the scaffolding fits the learner.', links=['K2','C2'])
P(id='D2', sec='D', title='Feedback is the engine', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['How much does feedback help?', 'Which feedback works?', 'Which feedback fails?'],
  body=[{'t':'p','x':'A meta-analysis of 435 studies with more than 61,000 learners found a medium effect of feedback on learning, d = 0.48, with large variation between forms [@W:fb20]. Feedback with more information content worked better, and it had more impact on cognitive and motor skills than on motivation and behaviour [@W:fb20].'},
        {'t':'p','x':'Most classroom feedback is task feedback; learners use \u201cwhere to next\u201d most, and the least effective is self or praise feedback [@W:fbpraise].'}],
  stickies=[{'c':'yellow','x':'Grade the reasoning and say what to do next. Never just \u201cwell done\u201d.'}],
  summary='Feedback works when it carries information about the task and the next step; praise alone does little.', links=['I3','K2'])
P(id='D3', sec='D', title='Gamification: small effects, real ones', stage='budding', stamp='VERIFIED', date='2026-11-11',
  cues=['Does gamification help learning?', 'Which elements matter?', 'Where is the evidence weak?'],
  body=[{'t':'p','x':'Sailer and Homner\u2019s meta-analysis found small but significant effects of gamification on cognitive, motivational and behavioural learning outcomes; the cognitive effect held up in rigorous studies, while the others were less stable [@W:gamif]. Game fiction and combining competition with collaboration were particularly effective for behavioural outcomes [@W:gamif]. A second meta-analysis of 3,083 participants found a small to medium effect in favour of gamification [@W:gamif2].'}],
  stickies=[{'c':'pink','x':'Risk: points and streaks for their own sake. Progress must track problems solved, not time spent.'},{'c':'green','x':'DECISION: crews of learners competing and collaborating on the same case.'}],
  summary='Use game mechanics to carry real problems, not to replace them.', links=['K2','A3'])
P(id='D4', sec='D', title='AI tutors: crutch or coach', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['Can AI harm learning?', 'Can AI tutoring beat good teaching?', 'What separates the two?'],
  body=[{'t':'p','x':'In a trial with about 1,000 students, an unguarded chatbot raised practice grades 48%, but when it was taken away those students scored 17% worse than students who never had it; a tutor with safeguards raised practice 127% and largely removed the harm [@W:bastani].'},
        {'t':'p','x':'A purpose-built tutor at Harvard more than doubled learning against an active-learning class, in a median of 49 minutes against 75 [@W:kestin]. A supervised six-week programme in Nigeria gained 0.31 standard deviations [@W:scrimba] and outperformed around 80% of comparable interventions [@W:nigeria]. A general tutor compared with search and paper showed no statistically significant differences among the three groups [@W:khanmigo].'}],
  stickies=[{'c':'pink','x':'Same model, opposite outcomes. Design decides.'},{'c':'green','x':'DECISION: the simulator questions and hints; it never hands over the answer.'}],
  summary='AI helps learning when it forces reasoning and hurts it when it does the thinking.', links=['A3','K2','D5'])
P(id='D5', sec='D', title='Personalisation that teaches', stage='budding', stamp='VERIFIED', date='2026-11-11',
  cues=['Does personalising the material help?', 'What did the labs ship?', 'What is left for Career OS?'],
  body=[{'t':'p','x':'In a randomised study of 60 students, Google\u2019s Learn Your Way scored 9% higher on the immediate assessment than a PDF textbook [@W:lyw] and 11% higher on a memory assessment three to five days later [@W:lywgig].'},
        {'t':'p','x':'Claude Learning Mode, ChatGPT Study Mode and Gemini Guided Learning all now use guided questioning instead of answers [@W:studymodes]. Khanmigo reached 700,000 users across 380 school districts [@W:deepview].'}],
  stickies=[{'c':'yellow','x':'Tutoring is becoming a free feature of every assistant. The career goal, the live market and the proof are not.'}],
  summary='Personalised tutoring is commoditising; personalised careers are not.', links=['G2','K2'])
P(id='D6', sec='D', title='Pathways that change earnings', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['Is there proof that guided routes into work pay off?', 'What do they cost?', 'What can AI change?'],
  body=[{'t':'p','x':'Year Up\u2019s randomised trial found earning gains of 30 to 40%, $7,000 to $8,000 a year, persisting at least five years [@W:yearupabt]. A review of four randomised evaluations of sector programmes found gains of 14 to 38% after training [@W:katz].'},
        {'t':'p','x':'The catch is cost: about $28,200 per Year Up participant, against approximately $5,800 per participant for Per Scholas [@W:stoe]. Year Up reports $2.46 in societal benefits for every dollar invested [@W:yearupsite].'}],
  stickies=[{'c':'yellow','x':'The recipe already works. AI\u2019s job is to make it cheap: employer-linked, work-based, coached.'}],
  summary='Structured, employer-linked pathways are proven; Career OS tries to deliver them at near-zero marginal cost.', links=['K1','K4'])

# ---------- E: AI, the curve and the ladder ----------
P(id='E1', sec='E', title='AI compresses the curve', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['How much faster do novices learn with AI?', 'Who gains least?', 'Is the learning durable?'],
  body=[{'t':'fig','id':'curve'},
        {'t':'p','x':'Across 5,179 support agents, an AI assistant raised productivity 14% on average, with a 34% improvement for novice and low-skilled workers [@W:bryn23]. Treated agents with two months of tenure performed just as well as untreated agents with more than six months [@W:bryn23]. Without AI, reaching that level took eight to ten months [@W:sccomp].'},
        {'t':'p','x':'The most experienced workers gained least, because the AI captures the knowledge embodied in their own behaviour [@W:hai23].'}],
  stickies=[{'c':'yellow','x':'This is the thesis in one chart: AI moves people down the experience curve.'}],
  summary='The time it takes to perform like someone experienced is compressible, and AI already compresses it.', links=['A1','E2','K2'])
P(id='E2', sec='E', title='The jagged frontier', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['Does AI always help?', 'Can one person with AI do a team\u2019s work?', 'What must learners practise?'],
  body=[{'t':'p','x':'In an experiment with BCG consultants, those using AI on a task chosen to sit outside the model\u2019s strengths were 19 per cent less likely to produce a correct answer [@W:sccomp].'},
        {'t':'p','x':'In a study with 776 professionals at Procter & Gamble, individuals working with AI performed at a level matching the quality of traditional two-person human teams [@W:pgteam].'}],
  stickies=[{'c':'green','x':'DECISION: every simulator track includes cases where the AI is wrong, so judgment about when to trust it is practised.'}],
  summary='AI raises the floor and can lower the ceiling; judgment about its limits is a skill to train.', links=['K2','I1'])
P(id='E3', sec='E', title='AI is nearing expert quality', stage='budding', stamp='VERIFIED', date='2026-11-11',
  cues=['How close is AI to professional work?', 'How was that measured?', 'What should humans learn instead?'],
  body=[{'t':'p','x':'On OpenAI\u2019s GDPval, GPT-5 matched or beat expert deliverables 40.6% of the time and Claude Opus 4.1 49% [@W:gdpscores]. The tasks were created by professionals averaging 14 years of experience [@W:gdpdecoder].'}],
  stickies=[{'c':'pink','x':'Benchmark run by a model developer. Read it as a direction, not a verdict.'},{'c':'yellow','x':'The work worth learning shifts toward judgment, integration and oversight.'}],
  summary='As AI handles more of the deliverable, simulator cases should train what it cannot: judgment and integration.', links=['I1','E2'])
P(id='E4', sec='E', title='The broken ladder', stage='budding', stamp='VERIFIED', date='2026-11-11',
  cues=['What is happening to entry-level jobs?', 'Why the young, and not the experienced?', 'Is the evidence settled?'],
  body=[{'t':'fig','id':'ladder'},
        {'t':'p','x':'Since generative AI spread, workers aged 22 to 25 in the most AI-exposed occupations have seen a 13 percent relative decline in employment [@W:canaries]. Young software developers\u2019 employment declined by nearly 20% from its peak in 2022 [@W:constel]. One interpretation: young workers mainly offer codified knowledge, which AI can replicate, while experienced workers rely on tacit knowledge [@W:leaddev].'},
        {'t':'p','x':'A Harvard study using data on 62 million US workers across 285,000 firms found junior employment fell sharply at firms adopting generative AI [@W:schvjunior]. A study of Danish workers found no real effect [@W:register].'}],
  stickies=[{'c':'pink','x':'If the first rung disappears, where do the next generation\u2019s first hundred problems come from?'}],
  summary='The rung where experience used to be earned is shrinking. A simulator of real problems is a replacement rung.', links=['A1','K2','M1'])
P(id='E5', sec='E', title='Tacit knowledge is the scarce asset', stage='seedling', stamp='FIELD NOTE', date='2026-11-11',
  cues=['What does experience give that AI does not?', 'Can tacit knowledge be simulated?', 'How would we know?'],
  body=[{'t':'p','x':'Two findings point the same way. AI spreads the best workers\u2019 tacit practices to novices [@W:hai23], and AI substitutes most for the codified knowledge young workers bring [@W:leaddev]. The scarce thing is judgment built from many messy cases.'},
        {'t':'p','x':'{{Hypothesis:}} a well-designed run of real cases, with expert-grade feedback, can build some of that judgment faster than years of waiting for the cases to arrive. The test is transfer to a fresh case [[K2]].'}],
  stickies=[{'c':'blue','x':'OPEN: measure transfer, not completion.'}],
  summary='Experience is tacit judgment; the simulator is a bet that judgment can be grown deliberately.', links=['K2','M2'])

# ---------- F: signals and hiring ----------
P(id='F1', sec='F', title='Cheap writing, dead signals', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['What happens when AI writes applications?', 'Who wins and who loses?', 'What still signals?'],
  body=[{'t':'p','x':'Galdin and Silbert studied generative AI and labor market signaling on Freelancer.com [@W:galdin]. In their counterfactual, workers in the top quintile are hired 19% less often and the bottom quintile 14% more often [@W:galdinideas].'},
        {'t':'p','x':'After Freelancer launched an AI cover-letter writer, the link between how well a letter fitted the job and callbacks fell by 51% [@W:cui].'}],
  stickies=[{'c':'yellow','x':'If text is cheap, proof has to be expensive to fake.'},{'c':'green','x':'DECISION: resumes are selected from verified bullets, never written by the model [[L2]].'}],
  summary='When writing is free, it stops being proof. Verified work and process records still signal.', links=['K3','L2'])
P(id='F2', sec='F', title='The application flood', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['How much has volume grown?', 'Does mass applying work?', 'What did the tools that tried it learn?'],
  body=[{'t':'p','x':'Applications per job reached 244 in 2025, against about 115 in 2022 [@W:greenhouse]. LinkedIn reported 11,000 job applications submitted every minute [@W:linkedin11k]. Mass auto-apply converts at an estimated 1 to 3% [@W:herohunt].'},
        {'t':'p','x':'Wonsulting dropped its bulk-send feature after clients averaged one interview per fifty applications [@W:wonsulting].'}],
  stickies=[{'c':'pink','x':'Volume dilutes the applications that matter.'}],
  summary='The flood is a reason to apply less and prove more.', links=['F3','H3'])
P(id='F3', sec='F', title='How machines read you', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['What do modern ATS check?', 'Can they detect AI writing?', 'What do hiring managers do?'],
  body=[{'t':'ul','items':['Modern ATS build a candidate graph and check whether listed skills appear in work history [@W:candgraph].','No major ATS detects AI-written resumes [@W:jobscan].','22% of recruiters report finding hidden prompt injections inside resumes [@W:herohunt].','49% of US hiring managers say they automatically dismiss resumes they suspect are AI-written [@W:jobglance].']}],
  stickies=[{'c':'green','x':'DECISION: every listed skill must be backed by a selected bullet; scraped job text is treated as data, never instructions.'}],
  summary='Machines now cross-check claims against evidence; build for the cross-check.', links=['I4','J3'])
P(id='F4', sec='F', title='Where applications convert', stage='budding', stamp='VERIFIED', date='2026-11-11',
  cues=['Which channel converts best?', 'How strong are referrals?', 'What about India?'],
  body=[{'t':'p','x':'Huntr\u2019s tracked applications show company career pages converting to interviews at 6.87%, well ahead of LinkedIn [@W:lumy]. Huntr\u2019s 2025 data put Google Jobs response rates at 11.3% [@W:huntr].'},
        {'t':'p','x':'There is no rigorous public conversion data for India, so Career OS measures its own response and interview rates by source.'}],
  stickies=[{'c':'green','x':'DECISION: company-direct sourcing is the backbone; referrals are the lever [[K6]].'}],
  summary='Go direct, get referred, and measure your own conversion.', links=['K6'])
P(id='F5', sec='F', title='Skills-first is mostly announced', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['Aren\u2019t employers dropping years and degrees?', 'What actually changed?', 'Do skills-hired workers do well?'],
  body=[{'t':'p','x':'For all its fanfare, skills-based hiring was borne out in not even 1 in 700 hires last year, in a study of 11,300 roles at large firms [@W:bgi], about 97,000 workers out of 77 million yearly hires [@W:hrdive]. Workers hired without degrees had a retention rate 10 percentage points higher [@W:bestcol].'}],
  stickies=[{'c':'pink','x':'Employers still buy proxies. Proof must arrive with the credentials they still screen for.'}],
  summary='The market says skills and still buys proxies; Career OS has to speak both languages.', links=['K4','C4'])
P(id='F6', sec='F', title='Skills are churning', stage='budding', stamp='VENDOR CLAIM', date='2026-11-11',
  cues=['How fast do required skills change?', 'Who says so?', 'What follows for planning?'],
  body=[{'t':'p','x':'Employers in the World Economic Forum\u2019s survey expect 39% of key job skills will change by 2030 [@W:wefpin].'}],
  stickies=[{'c':'blue','x':'Survey projection, relayed second-hand. Treat as direction.'}],
  summary='Fixed skill lists go stale; Career OS reads demand live from real job descriptions.', links=['I4','K5'])

# ---------- G: giants and startups ----------
P(id='G1', sec='G', title='Suites are swallowing learning and hiring', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['What are the incumbents buying?', 'Why does it matter for a personal tool?', 'What is the risk?'],
  body=[{'t':'ul','items':['Workday agreed to buy Paradox; analysts tied it to high-volume hiring, roughly 70 percent of global jobs [@W:paradox].','Workday agreed to buy Sana, whose platform combines learning management with personalized tutoring through specialized learning agents, for about US$1.1 billion [@W:sana] [@W:sanapr].','SAP acquired SmartRecruiters, with 4,000+ customers [@W:sapsr].','Coursera\u2019s combination with Udemy closed on May 11, 2026 [@W:courudemy], targeting $115 million of annual run-rate cost synergies [@W:coursyn].']}],
  stickies=[{'c':'yellow','x':'Incumbents fuse learning and hiring for employers. Nobody owns the individual\u2019s side of the same journey.'},{'c':'pink','x':'Risk: Career OS reads SmartRecruiters\u2019 public feed; SAP ownership could change it.'}],
  summary='The employer side is consolidating fast; the individual side is still open.', links=['G2','K6'])
P(id='G2', sec='G', title='The labs teach, not tell', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['What did OpenAI, Google and Anthropic ship for learning?', 'How widely is AI tutoring used?', 'What can\u2019t a general assistant do?'],
  body=[{'t':'p','x':'All three major labs shipped a dedicated study mode within about a year, each using guided questioning instead of direct answers; Claude Learning Mode came first [@W:studymodes]. Khanmigo reached 700,000 users across 380 school districts [@W:deepview].'}],
  stickies=[{'c':'yellow','x':'A general assistant doesn\u2019t know your target role, the live market or what you have already proven.'}],
  summary='Teaching is becoming a feature of every assistant; the career layer around it is not.', links=['D5','K1'])
P(id='G3', sec='G', title='Employers pay for simulations', stage='budding', stamp='VENDOR CLAIM', date='2026-11-11',
  cues=['Will employers fund simulated work?', 'How big did it get?', 'What about AI role-play?'],
  body=[{'t':'p','x':'Forage passed 10 million student engagements in August 2025, nearly double a year earlier [@W:forageeab], with 300+ simulations and 10m+ enrollments [@W:forageabout]. It claims employers are 4 times more likely to extend an offer to those who complete a simulation [@W:forageoffer].'},
        {'t':'p','x':'Yoodli raised a $40 Million Series B [@W:yoodli] after 900% year-over-year revenue growth [@W:yoodligrow]; Hyperbound and Second Nature focus on sales role-play [@W:roleplay].'}],
  stickies=[{'c':'yellow','x':'Simulations already surface talent. None personalises the path or turns results into a living portfolio.'}],
  summary='Simulated work has paying employers and growing revenue; the personal, portfolio-building version is missing.', links=['K2','K3'])
P(id='G4', sec='G', title='Paying for proven ability', stage='budding', stamp='VERIFIED', date='2026-11-11',
  cues=['Is anyone pricing ability, not tenure?', 'How fast is it growing?', 'What does it mean for the thesis?'],
  body=[{'t':'p','x':'Mercor started in 2023 as an AI hiring tool, with an AI interviewer that still screens applicants [@W:mercorhist]. It raised $750 million at a $20 billion valuation on 10 November 2026 [@W:mercor].'}],
  stickies=[{'c':'blue','x':'Our interpretation, not theirs: the fastest-growing company near this space prices people on assessed ability.'}],
  summary='The market is already paying for demonstrated expertise directly.', links=['A1','I1'])
P(id='G5', sec='G', title='Job-search agents and the draft-only choice', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['Who automates the job search?', 'What did open source choose?', 'Where does Career OS sit?'],
  body=[{'t':'ul','items':['Jack & Jill raised a Series A for paired AI agents for job seekers and employers [@W:jackjill].','Tsenta, in Y Combinator, applies automatically on the user\u2019s behalf [@W:tsenta].','JobRight runs an agent that finds, tailors and submits applications [@W:jobright].','career-ops, the most-starred open-source peer, drafts and never submits [@W:careerops].']}],
  stickies=[{'c':'green','x':'DECISION: approval-gated, evidence-first applying. The same choice as the strongest open-source peer.'}],
  summary='The market splits between agents that act for you and tools that keep you in control; Career OS is the second.', links=['L2','J3'])
P(id='G6', sec='G', title='The funding winter and India', stage='evergreen', stamp='VERIFIED', date='2026-11-11',
  cues=['Is money flowing into learning startups?', 'How hard was India hit?', 'What still raised?'],
  body=[{'t':'p','x':'Global edtech venture funding hit $2.4 billion, decade low, in 2024, and edtech unicorns fell from 32 at the end of 2021 to 14 in 2026 [@W:edtechvc]. Speak, a language-learning app, is one of the few learning companies on the Forbes AI 50 for 2026 [@W:forbes50].'}],
  stickies=[{'c':'pink','x':'Undifferentiated edtech no longer raises. Tie learning to concrete career outcomes.'}],
  summary='Capital has turned against generic learning products; outcome-linked ones are the exception.', links=['H2','K4'])
