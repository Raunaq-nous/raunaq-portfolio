export interface Curiosity {
  id: string;
  title: string;
  role: string;
  year: string;
  status: 'ACTIVE' | 'ONGOING';
  calm: string;
  nerd: string;
  tags: string[];
  /** One line that holds the idea, lifted from the text below. */
  thesis: string;
  /** Builds that came out of it (project slugs). */
  builds: string[];
  /** Research thread id this curiosity feeds, if any. */
  thread?: string;
  /** Visual motif for the plate. */
  plate: 'plant' | 'layers' | 'radar' | 'branches' | 'pitch' | 'die';
}

export const curiosities: Curiosity[] = [
  {
    id: 'agentic-ai-industries',
    title: 'Agentic AI in Large, Capital Heavy Industries',
    role: 'BUILDER + PRACTITIONER',
    year: '2025',
    status: 'ACTIVE',
    calm: `The thing that gets me about large, capital heavy industries (energy, infrastructure, mining) is that the analytical work is enormous and most of it is still done by hand. Spreadsheets that should not exist. Documents that cannot be searched. Financial models rebuilt from scratch every engagement.

I have been building AI systems to fix this. Not as a research exercise, but as working tools. A multi-agent financial modeling engine. A RAG system for contracts and regulatory libraries. A workplan generator that automates schedule logic. A scheduling platform. An allocation trigger system that surfaces where money should move before anyone thinks to ask.

Each one started as a frustration. None of them started as a product idea.`,
    nerd: `Multi-agent systems applied to the analytical bottlenecks in energy, infrastructure, and mining. The stack: Python, LangChain, Streamlit on the agent side. FastAPI and React where real-time interaction matters.

Current production tools: a financial modeling engine (parallel agent comparison across scenarios), a RAG pipeline with semantic chunking and hybrid retrieval for contracts and regs, a multi-objective schedule optimizer (genetic algorithm plus Monte Carlo on task durations), and a continuous portfolio monitoring system with drift detection and reallocation triggers.

Each one started as a frustration. None of them started as a product idea.`,
    tags: ['AI', 'agentic', 'RAG', 'python', 'energy', 'infrastructure'],
    thesis: 'The analytical work is enormous and most of it is still done by hand.',
    builds: ['abacus', 'needle', 'blueprint', 'digital-twin', 'watchtower'],
    thread: 'multi-agent-finance',
    plate: 'plant',
  },
  {
    id: 'ai-strategy-platform',
    title: 'AI-First Strategy Consulting Platform',
    role: 'BUILDER',
    year: '2024',
    status: 'ACTIVE',
    calm: `I have been thinking for a while about what consulting looks like when the analytical parts are automated. Not the judgment. The grunt work. The research. The framework selection. The first draft of the financial model.

I built a platform that tries to answer that question seriously. It has a natural language console where you describe a business problem and get structured guidance. It has a marketplace of purpose-built AI tools (twelve and growing) spanning strategy, operations, finance, research, and innovation. It has a library of proven consulting frameworks enhanced with AI analysis.

It is not a chatbot bolted onto a database. That distinction matters.`,
    nerd: `Three-layer architecture in TypeScript and Next.js with Tailwind CSS.

Layer 1: natural language console that classifies problem types, suggests frameworks, and routes to the right tool. Layer 2: marketplace of 12+ purpose-built AI workflows across strategy, operations, finance, research, and innovation, each with structured inputs and multi-step reasoning. Layer 3: framework library (BCG Matrix, McKinsey 7S, Blue Ocean, etc.) enhanced with AI so you apply them to your context, not just read about them.

It is not a chatbot bolted onto a database. That distinction matters.`,
    tags: ['AI', 'strategy', 'consulting', 'TypeScript', 'NextJS', 'agents'],
    thesis: 'What does consulting look like when the analytical parts are automated?',
    builds: ['haus-nous'],
    plate: 'layers',
  },
  {
    id: 'portfolio-tracker',
    title: 'Portfolio Opportunity Tracker',
    role: 'BUILDER',
    year: '2025',
    status: 'ACTIVE',
    calm: `One of the underrated problems in large organizations is that nobody has a real-time picture of their entire project portfolio. The data exists (budgets, schedules, milestones, risk registers) but it is fragmented across systems, formats, and teams.

I built a tracker that monitors the whole portfolio continuously. It finds where projects are slipping, where dependencies are breaking, where cost overruns are forming. More importantly, it triggers opportunities: where a failure is likely to show up before the quarterly review catches it, and where reallocation would improve outcomes. Portfolio intelligence that runs all the time, not once a year.`,
    nerd: `Continuous monitoring layer that ingests project portfolio data (budget vs. actuals, milestone rates, schedule variance, external signals) and runs drift detection against original investment theses.

LangChain agents evaluate composable trigger conditions ("if project X is >15% over budget AND milestone completion is <60% at midpoint, flag for review"). When reallocation is flagged, an opportunity mapper ranks alternatives by strategic fit, expected return, and execution readiness. Dashboard with traffic-light indicators and weekly digest. Python, LangChain.`,
    tags: ['AI', 'finance', 'portfolio', 'python', 'monitoring'],
    thesis: 'Nobody has a real-time picture of their entire project portfolio.',
    builds: ['watchtower'],
    thread: 'portfolio-intelligence',
    plate: 'radar',
  },
  {
    id: 'career-os',
    title: 'Experience Should Not Be Measured in Years',
    role: 'BUILDER',
    year: '2025',
    status: 'ACTIVE',
    calm: `We measure careers in years, which is a strange unit when you think about it. Years measure how long you showed up, not how much you actually worked out. Two people can both have "five years of experience" and have learned wildly different amounts. The real unit is volume: how many real problems you have actually pushed through.

So I am building a career operating system. You tell it the roles and skills you are aiming for, and it drops you into simulated, real world style scenarios where you make decisions, see what happens, and learn from the result. The goal is to compress years of just showing up into a much shorter stretch of actually doing.`,
    nerd: `A simulation engine on top of a personalized skill graph. You define target roles and skills; it decomposes them into competencies, generates scenario-based decision tasks, and runs an iterative feedback loop that scores your choices and adapts the next scenario. Gamified progression, and a digital avatar of your own profile so the path stays personal to you rather than generic.`,
    tags: ['AI', 'simulation', 'careers', 'personalization'],
    thesis: 'Years measure how long you showed up, not how much you actually worked out.',
    builds: ['career-os'],
    thread: 'career-simulation',
    plate: 'branches',
  },
  {
    id: 'ai-sports',
    title: 'AI That Actually Understands Sport',
    role: 'BUILDER',
    year: '2025',
    status: 'ACTIVE',
    calm: `I watch a lot of cricket, and I kept thinking the commentary and analysis around it could be so much smarter. So I started building an AI that actually follows what is happening in a game, ball by ball, and can talk about it like someone who knows the sport. Right now it is focused on cricket. Eventually it should work for any sport.`,
    nerd: `Ball-by-ball event modeling feeding two things: a real-time analytics layer and a natural-language commentary generator. Built on a sport-agnostic event schema so the same core extends from cricket to other sports without a rewrite. Prediction sits on top of the same event stream.`,
    tags: ['AI', 'sports', 'cricket', 'commentary', 'analytics'],
    thesis: 'The commentary and analysis around cricket could be so much smarter.',
    builds: ['hitman'],
    plate: 'pitch',
  },
  {
    id: 'hyper-personal-compute',
    title: 'Hyper-Personalized Compute and Digital Ecosystems',
    role: 'THINKING ABOUT',
    year: '2026',
    status: 'ONGOING',
    calm: `Most of what we work with is built for an average person who does not exist. The laptop, the apps on it, the chip inside it and the cloud behind it are all sized for everyone, so they fit no one in particular.

The idea I keep coming back to is a digital ecosystem built around one person: products, applications, processors and computing power tailored to the person who is actually doing the work, and to the way they work.`,
    nerd: `Inverting the default: instead of one general stack per market, a stack per person. Products, applications, processors and compute, each tailored to the individual doing the work.

Open questions: which layer should personalize first, the application, the model, or the silicon; and what it takes for the whole ecosystem to adapt to one person rather than one person adapting to it.`,
    tags: ['compute', 'personalization', 'hardware', 'ecosystems'],
    thesis: 'Most of what we work with is built for an average person who does not exist.',
    builds: [],
    plate: 'die',
  },
];
