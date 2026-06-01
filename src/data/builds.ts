export interface Build {
  id: string;
  name: string;
  status: 'LIVE';
  type: 'TOOL' | 'PLATFORM';
  tags: string[];
  calm: string;
  nerd: string;
  punchline: string;
  process?: string;
  github?: string;
}

export const builds: Build[] = [
  {
    id: 'financial-modelling',
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
    name: 'Critical Path',
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
    name: 'Kavach',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['health', 'notifications', 'preventive care', 'Python'],
    calm: "One calm place to look after your parents' health before something goes wrong. It holds their history, medications, diet, and routine, and nudges them and you at the right moments. I built it because caring for aging parents from a distance is hard and there was no single calm place to do it.",
    nerd: '`preventive elder-care app`. Medical-history store, medication and diet tracking, scheduled adherence and notification engine, preventive-health flags, shared parent and caregiver access.',
    punchline: 'Proactive elder care, not reactive record keeping.',
  },
  {
    id: 'hitman',
    name: 'Hitman',
    status: 'LIVE',
    type: 'PLATFORM',
    tags: ['proprietary algorithm', 'prediction', 'analytics', 'cricket'],
    calm: 'Cricket, scored on skill alone. No luck, no pay to win. You read the game ball by ball, and a scoring engine rewards you purely on how well you called it.',
    nerd: '`skill-based scoring engine`. Proprietary algorithm over a ball-by-ball prediction model, with matchmaking, competitions, and skill analytics. Outcomes track skill, not chance.',
    punchline: 'Cricket predictions scored on skill, not luck.',
  },
  {
    id: 'career-os',
    name: 'Career OS',
    status: 'LIVE',
    type: 'PLATFORM',
    tags: ['AI agents', 'simulation', 'personalization', 'careers'],
    calm: 'An idea I cannot let go of, that you can learn a career faster by simulating it. It builds a plan around the roles and skills you are aiming for, then drops you into real-world scenarios so you build the reps without burning the years.',
    nerd: '`career simulation engine`. Hyper-personalized skill graph, target-role decomposition, scenario generation, iterative feedback loop, and a digital avatar of the user profile.',
    punchline: 'Compress years of showing up into a shorter stretch of actually doing.',
  },
];
