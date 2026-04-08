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
    id: 'capital-projects-tracker',
    title: 'Capital Projects Opportunity Tracker',
    role: 'BUILDER',
    year: '2025',
    status: 'ACTIVE',
    description: `One of the underrated problems in large organizations is that no one has a real-time picture of their entire capital project portfolio. The data exists — budgets, schedules, milestones, risk registers — but it's fragmented across systems, formats, and teams.

I built a tracker that monitors the entire portfolio continuously. It finds issues in terms of schedule — where projects are slipping, where dependencies are breaking, where cost overruns are forming. More importantly, it triggers opportunities: where a failure is likely to occur before it shows up in a quarterly review, and where reallocation would improve outcomes. It's portfolio intelligence that runs continuously, not annually.`,
    tags: ['AI', 'capitalprojects', 'finance', 'portfolio', 'python'],
  },
];
