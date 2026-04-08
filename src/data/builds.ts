export interface Build {
  id: string;
  name: string;
  status: 'LIVE';
  type: 'TOOL' | 'PLATFORM';
  tags: string[];
  description: string;
  calmDescription: string;
  punchline: string;
  process?: string;
  github?: string;
}

export const builds: Build[] = [
  {
    id: 'financial-modelling',
    name: 'Agentic Financial Modeling Platform',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['Python', 'LangChain', 'Streamlit', 'Multi-agent'],
    calmDescription: 'Drop in your assumptions, get a full financial comparison across multiple project concepts. CapEx, OpEx, IRR, sensitivity \u2014 all at once.',
    description: `A production-grade financial modeling engine built on agentic architecture. It doesn't just run a model \u2014 it reasons across inputs, compares scenarios dynamically, and presents structured output. CapEx, OpEx, IRR, sensitivity \u2014 all computed across multiple project concepts simultaneously. Built because I was tired of rebuilding the same model from scratch every time the assumptions changed.`,
    process: `How it works under the hood:

1. INPUT \u2014 You feed it a project brief: extraction method, location, equipment, financing terms. Can handle multiple project concepts in a single run.

2. AGENT DECOMPOSITION \u2014 A planner agent breaks the brief into sub-tasks: CapEx estimation, OpEx profiling, revenue modeling, sensitivity parameters. Each gets assigned to a specialist agent.

3. PARALLEL MODELING \u2014 Specialist agents run simultaneously. The CapEx agent pulls cost benchmarks and adjusts for site-specific factors. The OpEx agent models operating expenses with escalation curves. The revenue agent builds production profiles and pricing scenarios.

4. CROSS-VALIDATION \u2014 A reviewer agent checks outputs against each other. Does the CapEx-to-revenue ratio make sense? Are the IRR assumptions consistent with the discount rate? Flags contradictions before you see them.

5. STRUCTURED OUTPUT \u2014 Comparison table across all project concepts. Sensitivity analysis on key variables. Formatted for investment committee review, not just a spreadsheet dump.

The whole cycle runs in minutes. The same analysis used to take a weekend of manual Excel work.`,
    punchline: 'Multi-scenario financial comparison at the speed of a conversation, not a weekend.',
    github: 'https://github.com/Raunaq-nous/FInancial-Modelling',
  },
  {
    id: 'solar-cost',
    name: 'Solar & Capital Project Cost Modeling System',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['Python', 'Multi-agent', 'Interactive UI'],
    calmDescription: 'Change an assumption, the cost model updates in real time. Built for conversations with clients, not just reports after them.',
    description: `A multi-agent cost modeling system for capital-intensive projects, with a particular focus on solar and energy infrastructure. Takes project-specific variables \u2014 site conditions, equipment specs, financing assumptions \u2014 and generates detailed cost profiles across configurations. The UI is built to be interactive, not just a report generator. You change an assumption, the model responds in real time.`,
    process: `The workflow:

1. PROJECT SETUP \u2014 Define site parameters: location, terrain, grid connection distance, solar irradiance data. Select equipment configuration: module type, inverter specs, tracker vs. fixed-tilt.

2. COST ENGINE \u2014 Multi-agent system pulls from cost databases and applies adjustment factors. Hard costs (modules, racking, electrical BOS), soft costs (permitting, interconnection, EPC margin), and financing costs (debt terms, tax equity structures) are modeled independently.

3. CONFIGURATION SWEEP \u2014 Runs across multiple configurations simultaneously. Want to compare bifacial vs. monofacial modules with single-axis trackers? It generates cost profiles for each permutation.

4. INTERACTIVE UI \u2014 Sliders and inputs for every major assumption. Move a slider, the waterfall chart updates instantly. This is the key design decision: it's built for live client conversations where someone says "what if we change the module supplier?"

5. OUTPUT \u2014 Detailed cost breakdown by category, LCOE calculation, comparison across configurations, exportable to PDF/Excel.`,
    punchline: 'Makes cost estimation for complex projects fast enough to use during a client conversation, not just after one.',
    github: 'https://github.com/Raunaq-nous/Solar-Cost-Modelling',
  },
  {
    id: 'scheduling',
    name: 'AI-Powered Scheduling Platform for EPC Projects',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['React', 'FastAPI', 'D3.js', 'Multi-objective optimization'],
    calmDescription: 'Feed it your project constraints, get an optimized schedule with visual timelines. Handles the dependency chaos that breaks most scheduling tools.',
    description: `Engineering, Procurement, and Construction projects are scheduling nightmares. Dependencies compound. Delays cascade. Most scheduling tools are either too simple or require a full-time specialist. This is a multi-objective scheduling platform that ingests project constraints \u2014 resources, dependencies, milestones, risk buffers \u2014 and optimizes sequencing automatically. The D3.js visualizations make the output usable, not just technically correct.`,
    process: `Architecture:

FRONTEND (React + D3.js) \u2014 Interactive Gantt chart with drag-to-adjust, dependency visualization, critical path highlighting. Resource histogram overlay shows where you're over-allocated.

BACKEND (FastAPI) \u2014 Constraint solver using multi-objective optimization. Balances three competing objectives: minimize total duration, level resource usage, maximize float on non-critical paths.

THE SOLVE PROCESS:
1. Parse task list with dependencies (FS, SS, FF, SF relationships)
2. Build constraint graph and identify critical path
3. Run optimization: genetic algorithm exploring schedule permutations within constraint bounds
4. Apply resource leveling without violating hard dependencies
5. Generate risk-adjusted schedule with Monte Carlo simulation on task durations

The D3.js layer isn't decoration \u2014 it's the interface for project managers to override and adjust. Click a task, see its dependency chain. Drag to reschedule, watch cascading impacts in real time.`,
    punchline: 'Turns a week of schedule analysis into something that runs while you\'re in the kickoff meeting.',
  },
  {
    id: 'capital-allocation',
    name: 'Capital Projects Opportunity Tracker',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['Python', 'LangChain', 'Portfolio analysis'],
    calmDescription: 'Tracks your entire capital project portfolio — finds schedule issues, flags where failures are likely, and triggers reallocation opportunities before quarterly reviews.',
    description: `Tracks all capital projects across an entire portfolio continuously. Finds issues in terms of schedule — where projects are slipping, where dependencies are breaking, where cost overruns are forming. Triggers opportunities where a failure is likely to occur before it shows up in a quarterly review. Surfaces where reallocation would improve outcomes. It's portfolio intelligence that runs continuously, not on a quarterly review cycle.`,
    process: `How the tracker works:

1. DATA INGESTION \u2014 Connects to project portfolio data: budget vs. actuals, milestone completion rates, schedule variance, external market signals. Handles messy data \u2014 different formats across business units, missing fields, lagging updates.

2. DRIFT DETECTION \u2014 For each project, compares current performance trajectory against the original investment thesis. Is the IRR tracking? Are costs escalating faster than the contingency buffer? Is the strategic rationale still valid given market changes?

3. TRIGGER LOGIC \u2014 LangChain agents evaluate conditions against configurable thresholds. "If project X is >15% over budget AND milestone completion is <60% at midpoint, flag for reallocation review." Triggers are composable and stack.

4. OPPORTUNITY MAPPING \u2014 When capital is flagged for potential reallocation, the system identifies where it could go instead. Ranks alternative projects by strategic fit, expected return, and execution readiness.

5. CONTINUOUS OUTPUT \u2014 Dashboard with traffic-light indicators per project. Weekly digest of new triggers. Designed to replace the quarterly review cycle with always-on portfolio intelligence.`,
    punchline: 'Portfolio intelligence that runs continuously, not on a quarterly review cycle.',
    github: 'https://github.com/Raunaq-nous/Capital-Projects-Watcher',
  },
  {
    id: 'rag-engine',
    name: 'RAG Document Intelligence Engine',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['Python', 'LangChain', 'Vector databases', 'RAG'],
    calmDescription: 'Ask a question about any document in your library \u2014 contracts, regulations, specs \u2014 and get the answer with the exact source passage.',
    description: `Built to solve a specific problem: large organizations have enormous libraries of contracts, regulatory documents, and technical specifications that are effectively unsearchable. This RAG-based engine makes them queryable in natural language. Ask it about a liability clause, a regulatory threshold, a contractual obligation \u2014 it retrieves the relevant passage and its context, not just a keyword match.`,
    process: `The RAG pipeline:

1. DOCUMENT INGESTION \u2014 Handles PDFs, Word docs, scanned images (OCR), structured data. Chunking strategy matters: uses semantic chunking with overlap, not fixed-size splits. Preserves document structure (headings, tables, clause numbers).

2. EMBEDDING \u2014 Each chunk gets embedded using a fine-tuned model. Metadata tags attached: document type, date, section, source file. This metadata enables filtered retrieval later.

3. VECTOR STORE \u2014 Chunks indexed in a vector database with HNSW indexing for fast approximate nearest-neighbor search. Supports hybrid retrieval: vector similarity + BM25 keyword matching.

4. QUERY PROCESSING \u2014 User query gets decomposed if complex. "What are the liability caps across all vendor contracts?" becomes multiple sub-queries, one per contract, with results aggregated.

5. RETRIEVAL + GENERATION \u2014 Retrieved chunks are ranked by relevance, de-duplicated, and passed to the LLM with the original query. Every claim in the output links back to the specific chunk and page number. No hallucination without a source.

Built for environments where "I think the contract says..." isn't good enough. You need to know exactly what it says and where.`,
    punchline: 'Turns a document library into a knowledge base you can have a conversation with.',
    github: 'https://github.com/Raunaq-nous/Universal-RAG',
  },
  {
    id: 'workplan',
    name: 'Multi-Agent Workplan Generator',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['Python', 'LangChain', 'Multi-agent LLMs', 'Streamlit'],
    calmDescription: 'Describe your project, get a structured workplan with tasks, dependencies, and timeline. Not a template \u2014 it actually thinks about your project.',
    description: `Project workplans are one of those things everyone knows needs to exist but nobody wants to build from scratch. This multi-agent system takes a project brief and generates a structured workplan \u2014 tasks, owners, dependencies, milestones, timeline \u2014 using LLM reasoning chains that check each output against the others for consistency. It's not a template filler. It actually thinks about the project.`,
    process: `Agent chain:

1. SCOPE AGENT \u2014 Reads the project brief and extracts: objectives, constraints, deliverables, team composition, timeline bounds. Asks clarifying questions if the brief is ambiguous.

2. DECOMPOSITION AGENT \u2014 Breaks deliverables into work packages, then into tasks. Each task gets: description, estimated duration, skill requirements, dependencies on other tasks.

3. SEQUENCING AGENT \u2014 Builds the dependency graph. Identifies the critical path. Flags tasks that can run in parallel. Applies resource constraints to avoid over-allocation.

4. CONSISTENCY CHECKER \u2014 Cross-validates: Do all deliverables have tasks? Do task durations add up to less than the timeline? Are there circular dependencies? This is the agent that catches the mistakes the other agents make.

5. OUTPUT \u2014 Structured workplan in Gantt format via Streamlit. Exportable to Excel/PDF. Includes a risk register based on the assumptions the agents made during decomposition.

The key insight: four specialized agents checking each other produce better workplans than one general agent trying to do everything.`,
    punchline: 'Gets you from blank page to structured workplan in the time it takes to write the brief.',
  },
  {
    id: 'haus-nous',
    name: 'AI-First Strategy Consulting Platform',
    status: 'LIVE',
    type: 'PLATFORM',
    tags: ['TypeScript', 'Next.js', 'Tailwind CSS', 'AI agents'],
    calmDescription: 'Describe a business problem, get structured strategic guidance. Like working with a very fast, very well-read thinking partner.',
    description: `The big one. An AI-native platform for strategic problem-solving, built on the premise that the most valuable parts of consulting \u2014 the frameworks, the judgment, the structured thinking \u2014 can be made more accessible through well-designed AI interfaces.

It has three layers:
\u2022 A natural language AI console: describe a business problem, get structured guidance and tool recommendations
\u2022 A marketplace of 12+ purpose-built AI consulting tools across Strategy, Operations, Finance, Research, and Innovation
\u2022 A library of 12+ established consulting frameworks enhanced with AI analysis

It is designed to feel like working with a very well-read, very fast thinking partner. Not a chatbot. A workspace.`,
    process: `Platform architecture:

LAYER 1: AI CONSOLE
Natural language interface. You describe a business problem: "We're a mid-market SaaS company losing enterprise deals to a competitor with deeper integrations." The console classifies the problem type (competitive strategy), suggests relevant frameworks (Porter's Five Forces, Value Chain Analysis), and recommends which tools from the marketplace to run.

LAYER 2: TOOL MARKETPLACE (12+ tools)
Each tool is a purpose-built AI workflow:
\u2022 Strategy: Competitive analysis, market sizing, scenario planning
\u2022 Operations: Process optimization, cost structure analysis
\u2022 Finance: Financial modeling, valuation, unit economics
\u2022 Research: Market research synthesis, expert interview analysis
\u2022 Innovation: Opportunity assessment, build-vs-buy analysis

Each tool has structured inputs, runs multi-step reasoning, and outputs in consulting-grade format.

LAYER 3: FRAMEWORK LIBRARY
12+ proven consulting frameworks (BCG Matrix, McKinsey 7S, Blue Ocean, etc.) enhanced with AI. You don't just read about the framework \u2014 you apply it to your specific context with AI-assisted analysis.

Built in TypeScript/Next.js with Tailwind CSS. The design principle: it should feel like a workspace, not a chatbot.`,
    punchline: 'What consulting looks like when the analytical parts are automated and the judgment stays human.',
    github: 'https://github.com/Raunaq-nous/Haus-Nous',
  },
  {
    id: 'survey',
    name: 'AI Survey Intelligence Platform',
    status: 'LIVE',
    type: 'PLATFORM',
    tags: ['Python', 'AI agents', 'Research automation'],
    calmDescription: 'Give it a research brief, get back a designed survey, collected responses, and a structured insight report. The whole cycle.',
    description: `Survey research is full of manual steps that don't need to be manual. Questionnaire design. Distribution. Response analysis. Insight synthesis. This platform automates the entire lifecycle \u2014 from designing the survey instrument based on a research brief, through to generating structured insight reports from the responses. Built for consulting and research contexts where speed and rigor both matter.`,
    process: `End-to-end pipeline:

1. BRIEF \u2192 QUESTIONNAIRE \u2014 Feed it a research brief ("Understand why enterprise customers are churning in EMEA"). AI designs the survey: question types, skip logic, scale calibration, bias checks. You review and edit before it goes out.

2. DISTRIBUTION \u2014 Configurable distribution channels. Tracks response rates and sends reminders. Handles quota management if you need specific demographic splits.

3. RESPONSE ANALYSIS \u2014 As responses come in, the system runs: quantitative analysis (cross-tabs, statistical significance), qualitative coding (theme extraction from open-text responses), and sentiment analysis.

4. INSIGHT SYNTHESIS \u2014 Aggregates findings into a structured report: executive summary, key findings with supporting data, segment-level breakdowns, and recommended actions. Every insight links back to the underlying data.

5. EXPORT \u2014 Report in your format. Charts that are actually readable. Data tables that don't need reformatting.

Compresses what used to be a 3-4 week survey cycle into hours. The rigor doesn't decrease \u2014 the manual labor does.`,
    punchline: 'Compresses a multi-week survey research cycle into something that runs in hours.',
    github: 'https://github.com/Raunaq-nous/Survey-Tool',
  },
  {
    id: 'solar-benchmark',
    name: 'Solar Project Benchmarking Tool',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['Python', 'Data analysis', 'Energy'],
    calmDescription: 'Compare your solar project against similar ones and find exactly where value is leaking.',
    description: `A structured benchmarking system for solar project performance. Takes project-specific data \u2014 generation output, cost structure, equipment degradation, O&M spend \u2014 and benchmarks it against comparable projects to identify where performance gaps exist and what's driving them. Built from real engagement work in solar project improvement.`,
    punchline: 'Tells you how your project actually compares and where the value is leaking.',
    github: 'https://github.com/Raunaq-nous/Solar-Project-Benchmarking',
  },
  {
    id: 'universal-rag',
    name: 'Universal RAG System',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['Python', 'RAG', 'Vector databases', 'LangChain'],
    calmDescription: 'RAG infrastructure that works across document types and domains without rebuilding the pipeline each time.',
    description: `A flexible retrieval-augmented generation system designed to work across different document types and domains without rebuilding the pipeline each time. Handles PDFs, Word documents, structured data, web pages \u2014 chunks, embeds, indexes, and retrieves with configurable retrieval strategies. The "universal" is intentional: it was built to be reused, not redone.`,
    punchline: 'RAG infrastructure you don\'t have to rebuild from scratch for every project.',
    github: 'https://github.com/Raunaq-nous/Universal-RAG',
  },
  {
    id: 'proposal',
    name: 'AI Proposal Builder',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['Python', 'LangChain', 'Document generation'],
    calmDescription: 'Describe the client and scope, get a first draft of a commercial proposal. Not fill-in-the-blank \u2014 it adapts to context.',
    description: `Generates structured commercial proposals from a brief. Takes the client context, scope description, and pricing inputs \u2014 outputs a formatted proposal with executive summary, scope of work, methodology, timeline, and commercial terms. Not a template with fill-in-the-blank fields. An actual reasoning system that adapts the content to the context.`,
    punchline: 'First draft of a client proposal in the time it takes to write the brief.',
    github: 'https://github.com/Raunaq-nous/Proposal-Builder',
  },
  {
    id: 'capital-watcher',
    name: 'Capital Projects Watcher',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['Python', 'Monitoring', 'Capital projects'],
    calmDescription: 'Tracks project signals between quarterly reviews \u2014 where most problems actually start \u2014 and flags early warnings before they escalate.',
    description: `A monitoring system that tracks capital project progress signals \u2014 budget consumption, milestone completion, schedule drift, external risk factors \u2014 and surfaces early warning flags before they become escalation issues. Built for the gap between quarterly reviews, where most project problems actually start.`,
    punchline: 'Moves project oversight from reactive to proactive.',
    github: 'https://github.com/Raunaq-nous/Capital-Projects-Watcher',
  },
];
