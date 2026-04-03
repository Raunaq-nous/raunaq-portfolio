export interface Curiosity {
  id: string;
  title: string;
  role: string;
  year: string;
  status: 'ACTIVE' | 'ONGOING';
  description: string;
  tags: string[];
}

export const curiosities: Curiosity[] = [
  {
    id: 'agentic-ai-capital',
    title: 'Agentic AI in Capital Projects',
    role: 'BUILDER + PRACTITIONER',
    year: '2025',
    status: 'ACTIVE',
    description: `The thing that gets me about capital-intensive industries \u2014 energy, infrastructure, mining \u2014 is that the analytical work is enormous and most of it is still done manually. Spreadsheets that shouldn't exist. Documents that can't be searched. Financial models rebuilt from scratch every engagement.

I've been building AI systems to address this \u2014 not as a research exercise but as working tools. A multi-agent financial modeling engine. A RAG-based document intelligence system for contracts and regulatory libraries. A workplan generator that automates project schedule logic. A schedule optimization platform for EPC environments. A capital allocation trigger system that surfaces where money should move before anyone thinks to ask.

Each one started as a frustration. None of them started as a product idea.`,
    tags: ['AI', 'capitalprojects', 'agentic', 'RAG', 'python', 'energy'],
  },
  {
    id: 'ai-strategy-platform',
    title: 'AI-First Strategy Consulting Platform',
    role: 'BUILDER',
    year: '2024',
    status: 'ACTIVE',
    description: `I've been thinking for a while about what consulting looks like when the analytical parts are automated. Not the judgment \u2014 the grunt work. The research. The framework selection. The first draft of the financial model.

I built a platform that tries to answer that question seriously. It has a natural language console where you describe a business problem and get structured guidance. It has a marketplace of purpose-built AI tools \u2014 twelve of them and growing \u2014 spanning strategy, operations, finance, research, and innovation. It has a library of proven consulting frameworks enhanced with AI analysis. It's built in TypeScript and Next.js.

It is not a chatbot on top of a database. That distinction matters.`,
    tags: ['AI', 'strategy', 'consulting', 'TypeScript', 'NextJS', 'agents'],
  },
  {
    id: 'capital-allocation',
    title: 'Capital Allocation Intelligence',
    role: 'BUILDER',
    year: '2025',
    status: 'ACTIVE',
    description: `One of the underrated problems in large organizations is that no one has a real-time picture of where capital is actually going versus where it should go. The data exists. It's just fragmented, in the wrong formats, and never analyzed together.

I built a capital allocation opportunity trigger mapping system that ingests portfolio-level investment data and surfaces signals \u2014 where budgets are misaligned, where projects are drifting from thesis, where reallocation would improve returns. It's the kind of analysis that used to take weeks of manual data work. Now it runs continuously.`,
    tags: ['AI', 'capitalallocation', 'finance', 'portfolio', 'python'],
  },
  {
    id: 'agentic-ai-changes',
    title: 'What Agentic AI Actually Changes',
    role: 'THINKER',
    year: '2025',
    status: 'ONGOING',
    description: `I have a specific view on this that I find most conversations miss. The question isn't what tasks AI can automate. It's which human behaviors change when certain cognitive costs drop to near zero.

In consulting and capital-intensive industries, a lot of decisions don't get made \u2014 not because the answer is unknown, but because assembling the analysis costs too much time and attention. When that cost drops, the decision landscape changes. Organizations that understand this first will move differently.

I'm still working out the full shape of this. Writing about it helps.`,
    tags: ['AI', 'strategy', 'future', 'thinking'],
  },
];
