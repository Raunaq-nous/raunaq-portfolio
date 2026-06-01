export interface Paper {
  id: string;
  title: string;
  problem: string;
  venue: string;
  year: string;
  url: string;
  abstract?: string;
}

export interface ResearchThread {
  id: string;
  title: string;
  calm: string;
  nerd: string;
  tags: string[];
}

export const papers: Paper[] = [
  {
    id: 'satellite-adcs',
    title: 'Keeping a satellite pointed the right way',
    problem: 'Attitude determination and control system design for the Parikshit nanosatellite. The hard part was holding orientation within spec while the whole thing moved at orbital speed.',
    venue: 'IEEE Aerospace Conference',
    year: '2016',
    url: 'https://ieeexplore.ieee.org/document/7500699',
    // TODO: paste the real abstract from the published paper here
  },
  {
    id: 'tether-deployment',
    title: 'Unspooling a tether in space without it tangling or snapping',
    problem: 'Dynamics and control of tethered satellite systems during deployment.',
    venue: 'IEEE Aerospace Conference',
    year: '2015',
    url: 'https://ieeexplore.ieee.org/document/7119191',
    // TODO: paste the real abstract from the published paper here
  },
  {
    id: 'sil-testing',
    title: 'Testing satellite software when you cannot exactly launch it to check',
    problem: 'Software-in-the-loop testing for nanosatellite subsystems.',
    venue: 'IEEE Aerospace Conference',
    year: '2016',
    url: 'https://ieeexplore.ieee.org/document/7500756',
    // TODO: paste the real abstract from the published paper here
  },
  {
    id: 'earthquake-stabilization',
    title: 'Keeping a building steady during an earthquake',
    problem: 'Structural stabilization using active control.',
    venue: 'IJERT',
    year: '2014',
    url: 'https://www.ijert.org',
    // TODO: paste the real abstract from the published paper here
  },
];

export const researchThreads: ResearchThread[] = [
  {
    id: 'multi-agent-finance',
    title: 'Multi-agent systems for financial reasoning',
    calm: 'Can a team of agents build, argue about, and stress test a financial model the way a real deal team does, instead of one model spitting out one answer.',
    nerd: 'Exploring multi-agent architectures where specialist agents (CapEx, OpEx, revenue, risk) build competing model variants and a reviewer agent reconciles contradictions before output. The question is whether adversarial agent interaction produces more robust financial reasoning than single-pass generation.',
    tags: ['multi-agent', 'finance', 'LangChain'],
  },
  {
    id: 'document-intelligence',
    title: 'Document intelligence for messy, high-stakes corpora',
    calm: 'Contracts, regulations, and specs are where the real risk hides. How do you get grounded, source-cited answers you would actually bet a decision on.',
    nerd: 'Semantic chunking with structure preservation (headings, tables, clause numbers), hybrid retrieval (vector similarity plus BM25), and source-grounded generation where every claim links to a specific chunk and page number. The open problem is handling cross-document reasoning over contradictory or superseding clauses.',
    tags: ['RAG', 'NLP', 'vector databases'],
  },
  {
    id: 'portfolio-intelligence',
    title: 'Continuous portfolio intelligence',
    calm: 'Most oversight is annual. What changes when a system watches the whole portfolio all the time and surfaces the problem before anyone thinks to ask.',
    nerd: 'Continuous ingestion of schedule, cost, and milestone signals across a project portfolio. Drift detection against investment theses with composable trigger logic. The research question is whether early anomaly detection materially changes reallocation decisions compared to periodic review cycles.',
    tags: ['monitoring', 'portfolio', 'anomaly detection'],
  },
  {
    id: 'career-simulation',
    title: 'Compressing experience through simulation',
    calm: 'Can you learn a role faster by simulating its decisions than by spending years in the seat.',
    nerd: 'Scenario simulation engine on top of a personalized skill graph. Target roles decompose into competencies, which generate decision tasks. An iterative feedback loop scores choices and adapts the next scenario. The hypothesis is that deliberate practice via simulation compresses skill acquisition timelines.',
    tags: ['AI', 'simulation', 'careers'],
  },
];
