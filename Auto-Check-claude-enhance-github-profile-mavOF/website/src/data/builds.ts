export interface Build {
  id: string;
  name: string;
  status: 'LIVE';
  type: 'TOOL' | 'PLATFORM';
  tags: string[];
  description: string;
  punchline: string;
  github?: string;
}

export const builds: Build[] = [
  {
    id: 'financial-modelling',
    name: 'Agentic Financial Modeling Platform',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['Python', 'LangChain', 'Streamlit', 'Multi-agent'],
    description: `A production-grade financial modeling engine built on agentic architecture. It doesn't just run a model \u2014 it reasons across inputs, compares scenarios dynamically, and presents structured output. CapEx, OpEx, IRR, sensitivity \u2014 all computed across multiple project concepts simultaneously. Built because I was tired of rebuilding the same model from scratch every time the assumptions changed.`,
    punchline: 'Multi-scenario financial comparison at the speed of a conversation, not a weekend.',
    github: 'https://github.com/Raunaq-nous/FInancial-Modelling',
  },
  {
    id: 'solar-cost',
    name: 'Solar & Capital Project Cost Modeling System',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['Python', 'Multi-agent', 'Interactive UI'],
    description: `A multi-agent cost modeling system for capital-intensive projects, with a particular focus on solar and energy infrastructure. Takes project-specific variables \u2014 site conditions, equipment specs, financing assumptions \u2014 and generates detailed cost profiles across configurations. The UI is built to be interactive, not just a report generator. You change an assumption, the model responds in real time.`,
    punchline: 'Makes cost estimation for complex projects fast enough to use during a client conversation, not just after one.',
    github: 'https://github.com/Raunaq-nous/Solar-Cost-Modelling',
  },
  {
    id: 'scheduling',
    name: 'AI-Powered Scheduling Platform for EPC Projects',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['React', 'FastAPI', 'D3.js', 'Multi-objective optimization'],
    description: `Engineering, Procurement, and Construction projects are scheduling nightmares. Dependencies compound. Delays cascade. Most scheduling tools are either too simple or require a full-time specialist. This is a multi-objective scheduling platform that ingests project constraints \u2014 resources, dependencies, milestones, risk buffers \u2014 and optimizes sequencing automatically. The D3.js visualizations make the output usable, not just technically correct.`,
    punchline: 'Turns a week of schedule analysis into something that runs while you\'re in the kickoff meeting.',
  },
  {
    id: 'capital-allocation',
    name: 'Capital Allocation Opportunity Trigger System',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['Python', 'LangChain', 'Portfolio analysis'],
    description: `Most organizations don't have a real-time view of whether their capital is allocated to the right things. This system analyzes portfolio-level investment data \u2014 budget versus actuals, project performance, strategic alignment \u2014 and surfaces opportunity triggers: where to reallocate, where to double down, where something is drifting from its investment thesis. It runs continuously rather than on a quarterly review cycle.`,
    punchline: 'Makes capital allocation an ongoing intelligence function instead of an annual planning exercise.',
    github: 'https://github.com/Raunaq-nous/Capital-Projects-Watcher',
  },
  {
    id: 'rag-engine',
    name: 'RAG Document Intelligence Engine',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['Python', 'LangChain', 'Vector databases', 'RAG'],
    description: `Built to solve a specific problem: large organizations have enormous libraries of contracts, regulatory documents, and technical specifications that are effectively unsearchable. This RAG-based engine makes them queryable in natural language. Ask it about a liability clause, a regulatory threshold, a contractual obligation \u2014 it retrieves the relevant passage and its context, not just a keyword match.`,
    punchline: 'Turns a document library into a knowledge base you can have a conversation with.',
    github: 'https://github.com/Raunaq-nous/Universal-RAG',
  },
  {
    id: 'workplan',
    name: 'Multi-Agent Workplan Generator',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['Python', 'LangChain', 'Multi-agent LLMs', 'Streamlit'],
    description: `Project workplans are one of those things everyone knows needs to exist but nobody wants to build from scratch. This multi-agent system takes a project brief and generates a structured workplan \u2014 tasks, owners, dependencies, milestones, timeline \u2014 using LLM reasoning chains that check each output against the others for consistency. It's not a template filler. It actually thinks about the project.`,
    punchline: 'Gets you from blank page to structured workplan in the time it takes to write the brief.',
  },
  {
    id: 'haus-nous',
    name: 'AI-First Strategy Consulting Platform',
    status: 'LIVE',
    type: 'PLATFORM',
    tags: ['TypeScript', 'Next.js', 'Tailwind CSS', 'AI agents'],
    description: `The big one. An AI-native platform for strategic problem-solving, built on the premise that the most valuable parts of consulting \u2014 the frameworks, the judgment, the structured thinking \u2014 can be made more accessible through well-designed AI interfaces.

It has three layers:
\u2022 A natural language AI console: describe a business problem, get structured guidance and tool recommendations
\u2022 A marketplace of 12+ purpose-built AI consulting tools across Strategy, Operations, Finance, Research, and Innovation
\u2022 A library of 12+ established consulting frameworks enhanced with AI analysis

It is designed to feel like working with a very well-read, very fast thinking partner. Not a chatbot. A workspace.`,
    punchline: 'What consulting looks like when the analytical parts are automated and the judgment stays human.',
    github: 'https://github.com/Raunaq-nous/Haus-Nous',
  },
  {
    id: 'survey',
    name: 'AI Survey Intelligence Platform',
    status: 'LIVE',
    type: 'PLATFORM',
    tags: ['Python', 'AI agents', 'Research automation'],
    description: `Survey research is full of manual steps that don't need to be manual. Questionnaire design. Distribution. Response analysis. Insight synthesis. This platform automates the entire lifecycle \u2014 from designing the survey instrument based on a research brief, through to generating structured insight reports from the responses. Built for consulting and research contexts where speed and rigor both matter.`,
    punchline: 'Compresses a multi-week survey research cycle into something that runs in hours.',
    github: 'https://github.com/Raunaq-nous/Survey-Tool',
  },
  {
    id: 'solar-benchmark',
    name: 'Solar Project Benchmarking Tool',
    status: 'LIVE',
    type: 'TOOL',
    tags: ['Python', 'Data analysis', 'Energy'],
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
    description: `A monitoring system that tracks capital project progress signals \u2014 budget consumption, milestone completion, schedule drift, external risk factors \u2014 and surfaces early warning flags before they become escalation issues. Built for the gap between quarterly reviews, where most project problems actually start.`,
    punchline: 'Moves project oversight from reactive to proactive.',
    github: 'https://github.com/Raunaq-nous/Capital-Projects-Watcher',
  },
];
