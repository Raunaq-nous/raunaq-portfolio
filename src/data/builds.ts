export interface Build {
  id: string;
  name: string;
  status: 'LIVE' | 'SPECIFIED' | 'MOCKUP';
  type: 'TOOL' | 'PLATFORM';
  tags: string[];
  calm: string;
  nerd: string;
  punchline: string;
  process?: string;
  github?: string;
  /** Public demo deployment, when one exists. */
  live?: string;
  /** Where the build came from: built during a role, or independently. */
  origin: 'bain' | 'aranca' | 'independent';
}

export const builds: Build[] = [
  {
    id: 'financial-modelling',
    origin: 'bain',
    name: 'Abacus',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['Python', 'LangChain', 'Streamlit', 'Multi-agent'],
    calm: 'A financial model that argues with itself until the numbers make sense. You hand it your assumptions, it builds and compares every scenario, and the comparison that used to eat a weekend is done before the coffee is cold.',
    nerd: '`multi-agent modeling engine`. Agents build, challenge, and reconcile competing models in parallel. CapEx, OpEx, IRR, sensitivity. Python, LangChain, Streamlit.',
    process: `How it works under the hood:

1. INPUT: You feed it a project brief with extraction method, location, equipment, financing terms. Handles multiple project concepts in a single run.

2. AGENT DECOMPOSITION: A planner agent breaks the brief into sub-tasks: CapEx estimation, OpEx profiling, revenue modeling, sensitivity parameters. Each gets assigned to a specialist agent.

3. PARALLEL MODELING: Specialist agents run simultaneously. The CapEx agent pulls cost benchmarks and adjusts for site-specific factors. The OpEx agent models operating expenses with escalation curves. The revenue agent builds production profiles and pricing scenarios.

4. CROSS-VALIDATION: A reviewer agent checks outputs against each other. Does the CapEx-to-revenue ratio make sense? Are the IRR assumptions consistent with the discount rate? Flags contradictions before you see them.

5. STRUCTURED OUTPUT: Comparison table across all project concepts. Sensitivity analysis on key variables. Formatted for investment committee review, not just a spreadsheet dump.

The whole cycle runs in minutes. The same analysis used to take a weekend of manual Excel work.`,
    punchline: 'Multi-scenario financial comparison at the speed of a conversation, not a weekend.',
    github: 'https://github.com/Raunaq-nous/FInancial-Modelling',
  },
  {
    id: 'solar-cost',
    origin: 'bain',
    name: 'Groundwork',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['Python', 'Multi-agent', 'Interactive UI'],
    calm: 'The money math for very big builds, live. Change one assumption and the whole picture moves, so you can answer the awkward "but what if" while you are still in the room.',
    nerd: '`real-time investment model`. Multi-agent backend, interactive UI, full recompute on every input. Python.',
    process: `The workflow:

1. PROJECT SETUP: Define site parameters (location, terrain, grid connection, irradiance data). Select equipment configuration (module type, inverter specs, tracker vs. fixed-tilt).

2. COST ENGINE: Multi-agent system pulls from cost databases and applies adjustment factors. Hard costs (modules, racking, electrical BOS), soft costs (permitting, interconnection, margin), and financing costs (debt terms, tax equity structures) modeled independently.

3. CONFIGURATION SWEEP: Runs across multiple configurations simultaneously. Compare bifacial vs. monofacial modules with single-axis trackers? It generates cost profiles for each permutation.

4. INTERACTIVE UI: Sliders and inputs for every major assumption. Move a slider, the waterfall chart updates instantly. Built for live conversations where someone says "what if we change the supplier?"

5. OUTPUT: Detailed cost breakdown by category, LCOE calculation, comparison across configurations, exportable to PDF/Excel.`,
    punchline: 'Makes cost estimation fast enough to use during a conversation, not just after one.',
    github: 'https://github.com/Raunaq-nous/Solar-Cost-Modelling',
  },
  {
    id: 'scheduling',
    origin: 'bain',
    name: 'Digital Twin in Action',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['React', 'FastAPI', 'D3.js', 'Multi-objective optimization'],
    calm: 'Hands you a workable schedule for a huge project and untangles the dependency mess that breaks normal planning tools. Fast enough to use during the kickoff.',
    nerd: '`multi-objective scheduler`. Dependency resolution plus visual timelines. React, FastAPI, D3.js.',
    process: `Architecture:

FRONTEND (React + D3.js): Interactive Gantt chart with drag-to-adjust, dependency visualization, critical path highlighting. Resource histogram overlay shows where you are over-allocated.

BACKEND (FastAPI): Constraint solver using multi-objective optimization. Balances three competing objectives: minimize total duration, level resource usage, maximize float on non-critical paths.

THE SOLVE PROCESS:
1. Parse task list with dependencies (FS, SS, FF, SF relationships)
2. Build constraint graph and identify critical path
3. Run optimization: genetic algorithm exploring schedule permutations within constraint bounds
4. Apply resource leveling without violating hard dependencies
5. Generate risk-adjusted schedule with Monte Carlo simulation on task durations

The D3.js layer is not decoration. It is the interface for project managers to override and adjust. Click a task, see its dependency chain. Drag to reschedule, watch cascading impacts in real time.`,
    punchline: 'Turns a week of schedule analysis into something that runs while you are in the kickoff meeting.',
  },
  {
    id: 'capital-allocation',
    origin: 'bain',
    name: 'Watchtower',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['Python', 'LangChain', 'Portfolio analysis', 'Monitoring'],
    calm: 'Watches every project all the time, not just at review season. It spots the slip, the thing about to break, and where to move money before anyone has thought to ask.',
    nerd: '`continuous portfolio monitor`. Risk and anomaly detection across schedule and cost signals, reallocation flags. Python, LangChain.',
    process: `How the tracker works:

1. DATA INGESTION: Connects to project portfolio data: budget vs. actuals, milestone completion rates, schedule variance, external market signals. Handles messy data across business units, missing fields, lagging updates.

2. DRIFT DETECTION: For each project, compares current performance trajectory against the original investment thesis. Is the IRR tracking? Are costs escalating faster than the contingency buffer? Is the strategic rationale still valid given market changes?

3. TRIGGER LOGIC: LangChain agents evaluate conditions against configurable thresholds. "If project X is >15% over budget AND milestone completion is <60% at midpoint, flag for reallocation review." Triggers are composable and stack.

4. OPPORTUNITY MAPPING: When funds are flagged for potential reallocation, the system identifies where they could go instead. Ranks alternative projects by strategic fit, expected return, and execution readiness.

5. CONTINUOUS OUTPUT: Dashboard with traffic-light indicators per project. Weekly digest of new triggers. Replaces the quarterly review cycle with always-on portfolio intelligence.`,
    punchline: 'Portfolio intelligence that runs continuously, not on a quarterly review cycle.',
    github: 'https://github.com/Raunaq-nous/Capital-Projects-Watcher',
  },
  {
    id: 'rag-engine',
    origin: 'bain',
    name: 'Needle',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['Python', 'LangChain', 'Vector databases', 'RAG'],
    calm: 'Finds the one line that matters in a mountain of documents. Ask a plain question about a contract, a regulation, a spec, and it answers with the exact passage it came from.',
    nerd: '`source-grounded RAG`. Vector retrieval with citation to the source span, generalizes across document types without rebuilding the pipeline. Python, LangChain.',
    process: `The RAG pipeline:

1. DOCUMENT INGESTION: Handles PDFs, Word docs, scanned images (OCR), structured data. Uses semantic chunking with overlap, not fixed-size splits. Preserves document structure (headings, tables, clause numbers).

2. EMBEDDING: Each chunk gets embedded using a fine-tuned model. Metadata tags attached: document type, date, section, source file. Enables filtered retrieval later.

3. VECTOR STORE: Chunks indexed in a vector database with HNSW indexing for fast approximate nearest-neighbor search. Supports hybrid retrieval: vector similarity + BM25 keyword matching.

4. QUERY PROCESSING: User query gets decomposed if complex. "What are the liability caps across all vendor contracts?" becomes multiple sub-queries, one per contract, with results aggregated.

5. RETRIEVAL + GENERATION: Retrieved chunks ranked by relevance, de-duplicated, and passed to the LLM with the original query. Every claim in the output links back to the specific chunk and page number.

Built for environments where "I think the contract says..." is not good enough. You need to know exactly what it says and where.`,
    punchline: 'Turns a document library into a knowledge base you can have a conversation with.',
    github: 'https://github.com/Raunaq-nous/Universal-RAG',
  },
  {
    id: 'workplan',
    origin: 'bain',
    name: 'Blueprint',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['Python', 'LangChain', 'Multi-agent LLMs', 'Streamlit'],
    calm: 'Turns a one paragraph brief into a real plan with tasks, dependencies, and a timeline. Not a template, it actually thinks about your project.',
    nerd: '`multi-agent planner`. Decomposes a brief into a structured workplan via cooperating agents. Python, LangChain, Streamlit.',
    process: `Agent chain:

1. SCOPE AGENT: Reads the project brief and extracts objectives, constraints, deliverables, team composition, timeline bounds. Asks clarifying questions if the brief is ambiguous.

2. DECOMPOSITION AGENT: Breaks deliverables into work packages, then into tasks. Each task gets: description, estimated duration, skill requirements, dependencies on other tasks.

3. SEQUENCING AGENT: Builds the dependency graph. Identifies the critical path. Flags tasks that can run in parallel. Applies resource constraints to avoid over-allocation.

4. CONSISTENCY CHECKER: Cross-validates. Do all deliverables have tasks? Do task durations add up to less than the timeline? Are there circular dependencies? This is the agent that catches the mistakes the other agents make.

5. OUTPUT: Structured workplan in Gantt format via Streamlit. Exportable to Excel/PDF. Includes a risk register based on the assumptions the agents made during decomposition.

The key insight: four specialized agents checking each other produce better workplans than one general agent trying to do everything.`,
    punchline: 'Gets you from blank page to structured workplan in the time it takes to write the brief.',
  },
  {
    id: 'haus-nous',
    origin: 'aranca',
    name: 'Haus Nous',
    status: 'LIVE',
    type: 'PLATFORM',
    tags: ['TypeScript', 'Next.js', 'Tailwind CSS', 'AI agents'],
    calm: 'A thinking partner that has read every strategy framework so you do not have to. Describe a business problem, get structured guidance back, fast.',
    nerd: '`agent platform`. Natural-language console, a marketplace of purpose-built tools, AI-enhanced framework library. TypeScript, Next.js, Tailwind. Not a chatbot on a database.',
    process: `Platform architecture:

LAYER 1: AI CONSOLE
Natural language interface. You describe a business problem and the console classifies the problem type, suggests relevant frameworks, and recommends which tools from the marketplace to run.

LAYER 2: TOOL MARKETPLACE (12+ tools)
Each tool is a purpose-built AI workflow:
- Strategy: Competitive analysis, market sizing, scenario planning
- Operations: Process optimization, cost structure analysis
- Finance: Financial modeling, valuation, unit economics
- Research: Market research synthesis, expert interview analysis
- Innovation: Opportunity assessment, build-vs-buy analysis

Each tool has structured inputs, runs multi-step reasoning, and outputs in consulting-grade format.

LAYER 3: FRAMEWORK LIBRARY
12+ proven consulting frameworks (BCG Matrix, McKinsey 7S, Blue Ocean, etc.) enhanced with AI. You apply them to your specific context with AI-assisted analysis, not just read about them.

Built in TypeScript/Next.js with Tailwind CSS. The design principle: it should feel like a workspace, not a chatbot.`,
    punchline: 'What consulting looks like when the analytical parts are automated and the judgment stays human.',
    github: 'https://github.com/Raunaq-nous/Haus-Nous',
  },
  {
    id: 'survey',
    origin: 'aranca',
    name: 'Pulse',
    status: 'LIVE',
    type: 'PLATFORM',
    tags: ['Python', 'AI agents', 'Research automation'],
    calm: 'The whole survey, minus the weeks. Give it a question and it designs the survey, gathers responses, and writes up what it found.',
    nerd: '`survey pipeline`. End-to-end design, collection, automated insight reporting via agents. Python.',
    process: `End-to-end pipeline:

1. BRIEF to QUESTIONNAIRE: Feed it a research brief. AI designs the survey: question types, skip logic, scale calibration, bias checks. You review and edit before it goes out.

2. DISTRIBUTION: Configurable distribution channels. Tracks response rates and sends reminders. Handles quota management for specific demographic splits.

3. RESPONSE ANALYSIS: As responses come in, the system runs quantitative analysis (cross-tabs, statistical significance), qualitative coding (theme extraction from open-text responses), and sentiment analysis.

4. INSIGHT SYNTHESIS: Aggregates findings into a structured report: executive summary, key findings with supporting data, segment-level breakdowns, and recommended actions. Every insight links back to the underlying data.

5. EXPORT: Report in your format. Charts that are actually readable. Data tables that do not need reformatting.

Compresses what used to be a 3-4 week survey cycle into hours.`,
    punchline: 'Compresses a multi-week survey research cycle into something that runs in hours.',
    github: 'https://github.com/Raunaq-nous/Survey-Tool',
  },
  {
    id: 'solar-benchmark',
    origin: 'bain',
    name: 'Yardstick',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['Python', 'Data analysis', 'Benchmarking'],
    calm: 'Shows exactly where value is leaking out of a project by holding it against its peers. How you actually compare, not how you would like to think you do.',
    nerd: '`benchmarking engine`. Scores a project against a peer set, surfaces value-leakage points. Python, data analysis.',
    punchline: 'Tells you how your project actually compares and where the value is leaking.',
    github: 'https://github.com/Raunaq-nous/Solar-Project-Benchmarking',
  },
  {
    id: 'proposal',
    origin: 'aranca',
    name: 'First Draft',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['Python', 'LangChain', 'Document generation'],
    calm: 'A real first draft of a client proposal before the coffee kicks in. It adapts to the client and scope instead of making you fill in blanks.',
    nerd: '`proposal generator`. Context-aware drafting with document assembly. Python, LangChain.',
    punchline: 'First draft of a client proposal in the time it takes to write the brief.',
    github: 'https://github.com/Raunaq-nous/Proposal-Builder',
  },
  {
    id: 'parents-health',
    origin: 'independent',
    name: 'Maate',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['Next.js', 'NestJS', 'OCR', 'AI summaries', 'Preventive care'],
    calm: "One calm place to look after your parents' health before something goes wrong. It holds their history, medications, diet, and routine, and nudges them and you at the right moments. I built it because caring for aging parents from a distance is hard and there was no single calm place to do it.",
    nerd: '`preventive elder-care app`. Medical-history store, medication and diet tracking, scheduled adherence and notification engine, preventive-health flags, shared parent and caregiver access.',
    punchline: 'Proactive elder care, not reactive record keeping.',
    github: 'https://github.com/Raunaq-nous/Maate',
  },
  {
    id: 'hitman',
    origin: 'independent',
    name: 'Hitman',
    status: 'LIVE',
    type: 'PLATFORM',
    tags: ['proprietary algorithm', 'prediction', 'analytics', 'cricket'],
    calm: 'Cricket, scored on skill alone. No luck, no pay to win. You read the game ball by ball, and a scoring engine rewards you purely on how well you called it.',
    nerd: '`skill-based scoring engine`. Proprietary algorithm over a ball-by-ball prediction model, with matchmaking, competitions, and skill analytics. Outcomes track skill, not chance.',
    punchline: 'Cricket predictions scored on skill, not luck.',
    github: 'https://github.com/Raunaq-nous/Hitman',
  },
  {
    id: 'career-os',
    origin: 'independent',
    name: 'Career OS',
    status: 'LIVE',
    type: 'PLATFORM',
    tags: ['AI agents', 'simulation', 'personalization', 'careers'],
    calm: 'An idea I cannot let go of, that you can learn a career faster by simulating it. It builds a plan around the roles and skills you are aiming for, then drops you into real-world scenarios so you build the reps without burning the years.',
    nerd: '`career simulation engine`. Hyper-personalized skill graph, target-role decomposition, scenario generation, iterative feedback loop, and a digital avatar of the user profile.',
    punchline: 'Compress years of showing up into a shorter stretch of actually doing.',
    github: 'https://github.com/Raunaq-nous/TheWhiteKnight',
    live: 'https://raunaq-nous.github.io/TheWhiteKnight',
  },
  {
    id: 'bhoomi-setu',
    origin: 'independent',
    name: 'Bhoomi Setu',
    status: 'LIVE',
    type: 'PLATFORM',
    tags: ['Next.js', 'TypeScript', 'Deterministic verification', 'MapLibre', 'Gemini / OpenAI'],
    calm: 'Land records rarely agree with each other. Old documents say one thing, the survey says another, the map says a third. Bhoomi Setu lays them side by side for one family, shows where they match and where they do not, and suggests the one sensible thing to prepare next. It never pretends to be a government portal or hands out a legal verdict.',
    nerd: '`evidence-first verification`. AI suggests structured facts from documents, then deterministic code, not an LLM, compares them and returns PASS, POTENTIAL_ISSUE or INSUFFICIENT_EVIDENCE with the evidence span attached. Three-way parcel area reconciliation across historical record, survey and mapped geometry (Turf), MapLibre parcel views, English and Hindi. Next.js, TypeScript, Zod, Postgres.',
    process: `The evidence pipeline:

1. CASE: A synthetic family case is reconstructed around documents, family context, parcels and a survey record.

2. STRUCTURED EXTRACTION: Gemini or OpenAI suggests candidate facts from document text. Every candidate must pass schema, evidence-span and semantic-grounding checks before it is kept.

3. DETERMINISTIC VERIFICATION: Code compares identifiers and numbers, keeps the evidence references, and returns PASS, POTENTIAL_ISSUE or INSUFFICIENT_EVIDENCE. Missing facts stay uncertain.

4. PARCEL INTELLIGENCE: Validates GeoJSON, calculates area with Turf and compares exactly three perspectives: historical, survey and mapped geometry.

5. CONTEXT: Official-style records and two-date Earth Observation imagery sit behind provider boundaries. They add context and never change the verification result.

6. NEXT ACTION: A review packet and one practical next step. Nothing is ever submitted anywhere.`,
    punchline: 'Turns a pile of disagreeing land records into one traceable picture.',
    github: 'https://github.com/Raunaq-nous/Bhoomi-Setu',
    live: 'https://bhoomi-setu-xi.vercel.app',
  },
  {
    id: 'momentum-os',
    origin: 'independent',
    name: 'Momentum OS',
    status: 'LIVE',
    type: 'PLATFORM',
    tags: ['Next.js', 'TypeScript', 'Zustand', 'IndexedDB', 'Recharts'],
    calm: 'A personal operating system for getting things done. Tasks, habits, goals, focus sessions and reviews live in one place, and it keeps score so you can see whether the system is actually working. The tagline says it: build systems, not motivation.',
    nerd: '`personal productivity OS`. Mission control with a computed life score, a habit engine with a 365-day heatmap, tasks in six views (list, kanban, Gantt, calendar, board, table), six goal horizons, Recharts analytics and an XP and achievements layer. Local-first on IndexedDB via Dexie with optional Supabase sync. Next.js 15, Zustand, Framer Motion, Web Audio soundscapes.',
    punchline: 'Build systems, not motivation.',
    github: 'https://github.com/Raunaq-nous/Momentum_OS',
  },
  {
    id: 'pit',
    origin: 'bain',
    name: 'Project Intelligence Toolkit',
    status: 'LIVE',
    type: 'PLATFORM',
    tags: ['TypeScript', 'React', 'Express', 'PostgreSQL', 'Drizzle'],
    calm: 'A research workspace for large capital projects. A project database, the Yard, sits alongside analysis tools such as Reality Scan, Lessons Learnt and the Opportunity Map, with benchmark charts and a cited source behind every datapoint.',
    nerd: '`capital projects research workspace`. pnpm monorepo: Express API built with esbuild, React and Vite web app, Drizzle schema on PostgreSQL, a shared API contract with Zod and a generated React client. Analysis tools over a project database, with source-cited evidence per datapoint.',
    punchline: 'Every capital project datapoint, with the source that backs it.',
    github: 'https://github.com/Raunaq-nous/Project-Intelligence-Toolkit',
  },
  {
    id: 'cartograph',
    origin: 'independent',
    name: 'Cartograph',
    status: 'LIVE',
    type: 'PLATFORM',
    tags: ['Python', 'Multi-agent', 'Anthropic API', 'Deterministic value model', 'Evals'],
    calm: 'Maps how work actually gets done inside a business, then prices what it would cost to do it differently. Every figure traces back to the evidence behind it, so whoever presents a page can say where the number came from and how much of it is evidenced versus assumed.',
    nerd: '`evidence-backed transformation engine`. Specialist agents map current and future state across a process taxonomy, score each process on nine dimensions, and a reconciler nets overlapping savings at portfolio level instead of double counting them. Models estimate, code computes: the value arithmetic is deterministic Python. Every claim carries evidence IDs, confidence is computed rather than self-reported, and each run pins its models, prompts and inputs in a manifest. Golden-set evals gate every change. React run viewer.',
    process: `Design principles:

1. MODELS ESTIMATE, CODE COMPUTES: Language models supply parameters and judgement. Arithmetic happens in Python, where it is testable and cannot hallucinate.

2. CLAIMS CARRY EVIDENCE: Every generated claim references the evidence that supports it, or is explicitly marked unsupported. Confidence is derived from evidence.

3. THE PORTFOLIO RECONCILES: Per-process results roll up to a portfolio view that adds up. Overlapping savings are netted, not double counted.

4. RUNS ARE REPRODUCIBLE: Every run pins its models, prompts, schema version and inputs in a manifest, so any figure can be re-derived.`,
    punchline: 'Where did this number come from? Cartograph always knows.',
  },
  {
    id: 'opportunity-map',
    origin: 'independent',
    name: 'Opportunity Map',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['TypeScript', 'React', 'Express', 'Research agents', 'Codebook classification'],
    calm: 'Pursuit teams find projects late, from tenders, after the best positions are taken. See the projects forming in your markets before they reach a tender, ranked by how well they fit.',
    nerd: '`project signal tracker`. Signal ingestion from plans, queues, permits and filings, with entity resolution across sources. Fit scoring against the customer’s criteria, with the evidence behind each score. Build Advisor: a deliverability model across turbine slots, transformer lead times, contractor backlog, craft labor, interconnection and gas supply, each verdict linked to its source.',
    process: `What it does:

1. OPPORTUNITY SIGNALS: Resource plans, queues, permits, financing and offtake, tracked across markets

2. FIT RANKING: Each opportunity scored against your criteria, with the evidence behind the score

3. DELIVERY AND CONTRACTOR INTELLIGENCE: Contractor backlog, workforce and lead times for major equipment

4. ALERTS AND NEXT ACTIONS: What changed, and who should act on it

5. BUILD ADVISOR: Six delivery constraints, each with a verdict, a date effect and its source: turbine slots, transformers, contractor backlog, craft labor, interconnection, gas supply

6. PURSUIT CASE: A pursuit case and delivery plan generated for each shortlisted project`,
    punchline: 'See the projects forming in your markets before they reach a tender, ranked by how well they fit.',
    github: 'https://github.com/Raunaq-nous/Project-Intelligence-Toolkit',
  },
  {
    id: 'generative-concepts',
    origin: 'independent',
    name: 'Generative Concepts',
    status: 'SPECIFIED',
    type: 'TOOL',
    tags: ['Layout generation', 'Constraint screening', 'Costing'],
    calm: 'Concepts are compared on inconsistent bases, so the first idea studied is often the one built. Generates and costs every viable concept for the site and the brief, so the best one is chosen on evidence rather than habit.',
    nerd: '`concept generator`. Constraint-based enumeration of layouts, screened against hard engineering checks, with Pareto comparison of the survivors. Large option spaces explored, not three hand-drawn concepts. Each option costed by Costline and valued by Investment Case on one basis.',
    process: `What it does:

1. LAYOUTS FROM A BRIEF: Arrangements, equipment lists and quantities generated for engineers to refine

2. CONCEPT COSTING: Capital and operating cost for each concept from the cost model

3. LIFETIME ECONOMICS: Levelized cost and returns for every option, updated live

4. TRADE-OFF COMPARISON: Concepts ranked on cost, schedule, risk and returns

5. ALTERNATIVES LIBRARY: Design and contracting alternatives, each priced against the project’s own packages

6. OUTSIDE-IN CHECK: The concept’s cost per unit of capacity against comparable plants, before it is chosen

7. LAYOUT GENERATOR: Every arrangement enumerated from the site boundary, anchors and equipment envelopes, and screened against hard engineering checks

8. REJECTION LEDGER: Every rejected option, with the check it failed`,
    punchline: 'Generates and costs every viable concept for the site and the brief, so the best one is chosen on evidence rather than habit.',
  },
  {
    id: 'costline',
    origin: 'independent',
    name: 'Costline',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['TypeScript', 'React', 'Express', 'PostgreSQL', 'Drizzle', 'Excel'],
    calm: 'Estimates are rebuilt in spreadsheets at every stage and cannot be traced or tested. Every cost of the project on one traceable line: capital, contingency, escalation, operating, lifecycle and end-of-life.',
    nerd: '`bottom-up cost engine`. Parametric cost-estimating relationships fitted to the cost database. Escalation and currency by published cost indices. Contingency drawn from the quantified risk distribution, not a percentage. Estimate classification by design maturity, against AACE International 18R-97.',
    process: `What it does:

1. CAPITAL COST: Direct, indirect and owner’s costs by package, from quantities and unit rates

2. CONTINGENCY AND ESCALATION: Contingency from quantified risk; escalation and currency by cost index

3. OPERATING AND LIFECYCLE COST: Fixed and variable O&M, fuel, major maintenance and replacements

4. SHOULD-COST: What every package ought to cost, before the market prices it

5. BID EVALUATION: Bids compared line by line against should-cost

6. COST DATABASE: Rates, quantities and cost per unit of capacity from completed projects

7. END-OF-LIFE COST: Decommissioning cost from the as-built quantities

8. IMPORT PREVIEW: Every change to the estimate diffed and checked before it applies

9. PACKAGE SPLIT CHECK: Each package’s share tested against public references

10. RATE TRACE: Every rate traced to its quote, quantity and escalation

11. MARKET RE-PRICING: The estimate re-priced as equipment markets move, scenario by scenario

12. BENCHMARK POSITION: Cost per kilowatt against comparable plants`,
    punchline: 'Every cost of the project on one traceable line: capital, contingency, escalation, operating, lifecycle and end-of-life.',
    github: 'https://github.com/Raunaq-nous/Costline',
  },
  {
    id: 'generative-scheduler',
    origin: 'independent',
    name: 'Generative Scheduling',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['Python', 'Constraint solving', '3D viewer', 'Cost-time trade-off'],
    calm: 'Schedules are built by hand from linear templates, assume people are fully available to one project, and miss the third-party dependencies that cascade through engineering into construction. A resource-loaded, logic-linked schedule generated from the scope, with durations and crews computed rather than guessed.',
    nerd: '`schedule generator`. Streaming schedule parsing, with every activity classified by phase and discipline. Critical path method on generated precedence logic. Parametric durations and resources from quantities, productivity and crews. Schedule-network Monte Carlo for P50 and P80 dates. Multi-objective genetic algorithm over non-linear, resource-constrained sequences, each option tested by Monte Carlo simulation.',
    process: `What it does:

1. GENERATED FROM SCOPE: Activities and logic from the work breakdown and comparable schedules

2. PARAMETRIC DURATIONS: Computed from quantities, productivity rates and conditions

3. PARAMETRIC RESOURCES: Crews, equipment and people across projects, without 100% utilization assumptions

4. LINKED TO THE 3D MODEL: Each activity tied to model elements for the 4D build

5. THIRD-PARTY DEPENDENCIES: Permits, land, utilities and owner deliverables modelled as logic

6. MULTI-OBJECTIVE OPTIMIZER: A genetic algorithm searches non-linear, resource-constrained sequences; Monte Carlo simulation tests each option as faster, cheaper or safer

7. SCHEDULE RISK: Monte Carlo P50 and P80 dates

8. EXPORT: Primavera P6 and Microsoft Project

9. PLANNER COMPANION: Reads each activity as the planner writes it, and flags logic gaps early

10. SCHEDULE QUALITY: Logic and quality checked before optimization`,
    punchline: 'A resource-loaded, logic-linked schedule generated from the scope, with durations and crews computed rather than guessed.',
    github: 'https://github.com/Raunaq-nous/Generative-Scheduler',
  },
  {
    id: 'risk-analysis',
    origin: 'independent',
    name: 'Risk Analysis',
    status: 'SPECIFIED',
    type: 'TOOL',
    tags: ['Monte Carlo', 'Risk quantification', 'Reference classes'],
    calm: 'Risk registers list risks without pricing them, so contingency is a guess. Risks identified, quantified and owned in days, not months.',
    nerd: '`risk quantifier`. Critical path method on the loaded schedule, with DCMA schedule-health checks first. Schedule-network and risk-register Monte Carlo, run independently and compared. Analytic PERT and AACE estimate-class comparison as a cross-check. Earned value and momentum forecasts once the project is live. Integrated cost and schedule risk analysis to AACE International 57R-09.',
    process: `What it does:

1. SCHEDULE HEALTH: DCMA quality checks before any risk is run on the schedule

2. THREE-POINT RISKS: Low, likely and high impact in dollars and days for every risk

3. P50 AND P80: Risk-adjusted cost and finish date at P50 and P80

4. DUAL SIMULATION: Schedule-network and risk-register Monte Carlo compared

5. DESIGN MATURITY: AACE maturity inputs tied to the estimate class

6. LIVE FORECASTING: Earned value and momentum forecasts in execution

7. RISK ALLOCATION: Contract strategy tested: risk held by the party able to control it

8. DRAFTED REGISTER: Risks and mitigation options drafted from project documents and comparable histories, for people to approve`,
    punchline: 'Risks identified, quantified and owned in days, not months.',
  },
  {
    id: 'precedent',
    origin: 'independent',
    name: 'Precedent',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['TypeScript', 'React', 'Express', 'PostgreSQL', 'Reference-class forecasting'],
    calm: 'Nobody knows quickly whether a number is credible against what similar projects achieved. How comparable projects really performed, and where yours stands, in 24 to 48 hours.',
    nerd: '`comparable-project benchmark`. Similarity matching on project attributes to assemble comparables. Percentile benchmarking of cost, schedule and performance. Root-cause classification across the reference class.',
    process: `What it does:

1. REFERENCE PERFORMANCE: Cost, schedule and root causes across comparable projects

2. BENCHMARKING: The estimate and schedule placed against the reference class

3. PEER BENCHMARKING: Operating performance and value leakage against peers

4. WHAT THE BEST DID: Practices that separated the best outcomes

5. OUTSIDE-IN CHECK: The estimate per kW against comparable plants by approval year

6. PACKAGE SPLIT CHECK: Each package’s share of the estimate against public references

7. SCOPE-GAP CHECK: What comparable plants included that this estimate leaves out`,
    punchline: 'How comparable projects really performed, and where yours stands, in 24 to 48 hours.',
    github: 'https://github.com/Raunaq-nous/Project-Intelligence-Toolkit',
  },
  {
    id: 'outturn-forecast',
    origin: 'independent',
    name: 'Outturn Forecast',
    status: 'SPECIFIED',
    type: 'TOOL',
    tags: ['Reference-class forecasting', 'Percentile ranges', 'Contingency'],
    calm: 'Projects are approved on the inside view, and the outside view arrives as overruns. The outside view on cost, schedule and readiness, before capital is committed.',
    nerd: '`outside-view forecaster`. Reference class forecasting from the empirical distribution of comparable outcomes. Adjustment only for structural traits supported by evidence. Calibration: forecasts scored against actual outcomes over time.',
    process: `What it does:

1. REFERENCE CLASS FORECAST: P5 to P95 cost and schedule, with contingency at P30, P50 and P80

2. STRUCTURAL POSITIONING: Whether the project is really different, with evidenced traits only

3. ESTIMATE ASSURANCE: Whether the estimate class matches the design maturity

4. CALIBRATION: Every forecast scored against what happened, so confidence is earned`,
    punchline: 'The outside view on cost, schedule and readiness, before capital is committed.',
  },
  {
    id: 'forensic',
    origin: 'independent',
    name: 'Forensic',
    status: 'SPECIFIED',
    type: 'TOOL',
    tags: ['Root-cause analysis', 'Delay analysis', 'Claims'],
    calm: 'When projects fail, the causes and the cost are argued rather than established. When a project is in trouble: what happened, why, what it is worth, and how to reset it.',
    nerd: '`project forensics`. Windows analysis of delay to AACE International 29R-03 and the Society of Construction Law Delay and Disruption Protocol. Earned value and disruption quantification. Business-case tests on the risk arithmetic.',
    process: `What it does:

1. BUSINESS CASE TEST: Eight checks on the risk arithmetic, in hours

2. ROOT CAUSE ANALYSIS: Honest error, optimism or incentives, tested

3. CLAIMS AND DISPUTES: Delay and disruption quantified against comparables

4. PROJECT RESET: An independent baseline generated at a declared confidence, with decision rights that hold it`,
    punchline: 'When a project is in trouble: what happened, why, what it is worth, and how to reset it.',
  },
  {
    id: 'hindsight',
    origin: 'independent',
    name: 'Hindsight',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['TypeScript', 'React', 'Express', 'PostgreSQL', 'Source-cited lessons'],
    calm: 'Lessons are written at close-out and filed, then the same mistakes recur on the next project. Lessons from your own projects and from the industry’s, cited to the page and surfaced at the stage where they apply.',
    nerd: '`lessons-learned engine`. Hybrid vector and keyword retrieval with page-level citations. Language models that read and extract; numbers are never generated by them. Statistical test of which practices predicted outcomes.',
    process: `What it does:

1. INTERNAL LESSONS: From the owner’s own close-out reports, change logs and claims

2. EXTERNAL LESSONS: From public audits, inquiries, regulator reports and published reviews

3. CITED SEARCH: Any project document searched and questioned, each answer linked to its page

4. LESSONS DIAGNOSTIC: Which practices predicted outcomes in the owner’s record

5. LESSONS THAT BIND: A lesson closes only when an artefact has changed

6. AT THE RIGHT MOMENT: Lessons surfaced at the matching stage and gate of the next project

7. LESSON BRIEF: A brief of the lessons that apply, generated for each stage and gate`,
    punchline: 'Lessons from your own projects and from the industry’s, cited to the page and surfaced at the stage where they apply.',
    github: 'https://github.com/Raunaq-nous/Project-Intelligence-Toolkit',
  },
  {
    id: 't-minus',
    origin: 'independent',
    name: 'T-MINUS',
    status: 'MOCKUP',
    type: 'TOOL',
    tags: ['Next.js', 'React', 'TypeScript', 'Deterministic engines', 'Synthetic data'],
    calm: 'Every few years a plant stops on purpose for about two weeks, and most of those stops run late or over. T-MINUS plans the stop backwards from the day the plant shuts: what goes in, what it costs, whether it fits the window, and whether the site is ready. It is a working mockup on invented data, built to show how the planning should feel.',
    nerd: '`turnaround planning mockup`. Next.js and React over deterministic engines in TypeScript: scope decisions, outage economics, a resource-constrained schedule check, readiness meters and stage gates. Every number comes from a selector or an engine, and the data is synthetic by rule.',
    process: `How it works:

1. DATA INTEGRATION: Messy source records are matched into one clean list of assets, with duplicates and exceptions marked.

2. SCOPE DECISIONS: Work requests are sorted into mandatory, include, defer and review, each with a written reason.

3. OUTAGE ECONOMICS: Four ways to run the outage are priced on one number, so the cheapest balanced plan is visible.

4. SCHEDULE CHECK: The chosen scope is placed hour by hour against the crews that exist, to test whether it fits the window.

5. READINESS AND STAGE GATES: Readiness meters per discipline, and six gates from strategy to close-out that open only when the evidence is in.`,
    punchline: 'A turnaround planned backwards from the day the plant stops.',
    github: 'https://github.com/Raunaq-nous/Rundown',
  },
];
