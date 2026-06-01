export interface BattleLink {
  label: string;
  url: string;
}

export interface KeyProject {
  industry: string;
  description: string;
}

export interface Battle {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  status: 'CURRENT' | 'WORKED' | 'BUILT';
  section: string;
  tags: string[];
  industries: string[];
  description: string;
  keyProjects?: KeyProject[];
  links?: BattleLink[];
  tools?: BattleLink[];
  problemStatements?: string[];
  frameworks?: string[];
}

export interface Education {
  institution: string;
  degree: string;
  period: string;
  cgpa: string;
  note: string;
}

export const battles: Battle[] = [
  {
    id: 'bain',
    company: 'Bain & Company',
    role: 'Project Leader',
    period: 'Jun 2025 – Present',
    location: 'Mumbai / Gurgaon',
    status: 'CURRENT',
    section: 'NOW',
    tags: ['strategy', 'energy', 'AI', 'consulting'],
    industries: ['Energy', 'Infrastructure', 'Mining'],
    description: `Leading cross-functional teams on advisory engagements across energy, infrastructure, and mining, working directly with C-suites and boards on high-stakes investment decisions. Simultaneously building an AI toolkit that makes the analytical work faster and more rigorous.`,
    problemStatements: ['Investment decision modeling', 'Portfolio performance tracking', 'Schedule and cost overrun prevention'],
    frameworks: ['Financial modeling', 'Multi-agent AI', 'Decision analysis', 'Performance benchmarking'],
    tools: [
      { label: 'Financial Modeling Engine', url: 'https://github.com/Raunaq-nous/FInancial-Modelling' },
      { label: 'Scheduling Platform', url: 'https://github.com/Raunaq-nous/Solar-Cost-Modelling' },
      { label: 'Document Intelligence (RAG)', url: 'https://github.com/Raunaq-nous/Universal-RAG' },
      { label: 'Portfolio Tracker', url: 'https://github.com/Raunaq-nous/Capital-Projects-Watcher' },
      { label: 'Project Benchmarking', url: 'https://github.com/Raunaq-nous/Solar-Project-Benchmarking' },
    ],
  },
  {
    id: 'aranca',
    company: 'Aranca',
    role: 'Engagement Lead, Growth Advisory',
    period: 'Mar 2022 – Jun 2025',
    location: 'Mumbai',
    status: 'WORKED',
    section: 'ADVISORY',
    tags: ['strategy', 'GTM', 'financialmodeling', 'MA', 'advisory', 'EMEA', 'consumer', 'logistics'],
    industries: ['FMCG', 'Consumer Electronics', 'Climate Tech', 'Financial Services', 'Logistics', 'IT Services', 'E-commerce'],
    description: `Three years leading growth advisory mandates across EMEA, North America, and APAC for Fortune 500 and PE-backed clients. Wide scope by design: strategy, financial modeling, M&A, GTM, pricing. Published on AI's impact on green manufacturing (Economic Times) and digital governance (Dataquest).`,
    keyProjects: [
      { industry: 'B2B Commerce', description: 'Built financial model and business plan for a marketplace Series A, including adjacent market sizing. The raise happened.' },
      { industry: 'Beverages (FMCG)', description: 'Developed full GTM and product launch strategy for a global drinks company entering ready-to-drink: positioning, pricing, channel mix, market sequencing.' },
      { industry: 'Consumer Electronics', description: 'Led strategic and commercial redesign for an EMEA brand: repositioning, channel restructuring, product architecture, efficiency framework.' },
      { industry: 'Climate Tech', description: 'Built pricing strategy for carbon credits exchange software with no clean comparables. Replacement-cost methodology with tiered architecture.' },
      { industry: 'Financial Services', description: 'Designed solution portfolio architecture for a stock trading firm: product bundling, tier-based pricing, C-suite commercial framework.' },
      { industry: 'Ports & Logistics', description: 'Led financial return modeling and bid strategy for a global port operator expanding across three continents with varying regulatory environments.' },
      { industry: 'IT Services (PE)', description: 'Formulated M&A roadmap that enabled PE investment in a global IT services firm. Acquisition sequence to improve multiple.' },
      { industry: 'Logistics', description: 'Built strategic growth framework integrating demand forecasting, competitive supply assessment, and business model viability analysis.' },
      { industry: 'E-commerce', description: 'Built market sizing, competitive dynamics, and operational feasibility analysis across multiple expansion directions for leadership decision-making.' },
    ],
    problemStatements: ['Market entry strategy', 'GTM and pricing', 'M&A roadmapping', 'Financial modeling for fundraising', 'Competitive repositioning'],
    frameworks: ['Go-to-market strategy', 'Financial modeling', 'Competitive intelligence', 'Market sizing', 'Pricing strategy'],
    tools: [
      { label: 'AI Proposal Builder', url: 'https://github.com/Raunaq-nous/Proposal-Builder' },
      { label: 'Survey Intelligence Platform', url: 'https://github.com/Raunaq-nous/Survey-Tool' },
      { label: 'Haus Nous (Strategy Platform)', url: 'https://github.com/Raunaq-nous/Haus-Nous' },
    ],
  },
  {
    id: 'evalueserve',
    company: 'Evalueserve',
    role: 'Business Analyst, Insights & Intelligence',
    period: 'Oct 2020 – Nov 2021',
    location: 'Gurgaon',
    status: 'WORKED',
    section: 'ADVISORY',
    tags: ['intelligence', 'cloud', 'technology', 'GTM', 'research'],
    industries: ['Cloud', 'Telecoms', 'Public Sector', 'EV & Clean Tech'],
    description: `Competitive intelligence and market analysis for Fortune 1000 technology clients. Dense, deadline-driven work translating complex multi-source data into executive-actionable insights.`,
    keyProjects: [
      { industry: 'Cloud (India Entry)', description: 'Built digital readiness evaluation framework for a global cloud provider entering India. Assessed 10+ GSI partners, delivered tiered engagement model and GTM strategy.' },
      { industry: 'Telecoms (CPaaS/CCaaS)', description: 'Designed competitive intelligence-driven GTM strategy for a major Indian telecoms company launching into CPaaS and CCaaS.' },
      { industry: 'Cloud Compliance', description: 'Led competitive analysis on compliance assurance programs for a top hyperscale cloud provider. Directly shaped product roadmap and M&A screening.' },
      { industry: 'Public Sector IT', description: 'Mapped IT solution spending across Canadian public sector. Structured taxonomy of spending patterns and enterprise engagement opportunities.' },
      { industry: 'EV Infrastructure', description: 'Ran strategic landscape analysis for EV charging infrastructure: key technologies, deployment models, and investment opportunities in an emerging market.' },
    ],
    problemStatements: ['Competitive intelligence', 'Market entry assessment', 'Product roadmap shaping', 'Public sector opportunity mapping'],
    frameworks: ['Competitive intelligence', 'GTM strategy', 'Technology landscape analysis'],
  },
  {
    id: 'tecnova',
    company: 'Tecnova India',
    role: 'Strategy Analyst',
    period: 'Jul 2019 – Oct 2020',
    location: 'Gurgaon',
    status: 'WORKED',
    section: 'ADVISORY',
    tags: ['marketentry', 'India', 'automotive', 'pharma', 'consumer', 'strategy'],
    industries: ['Automotive', 'Pharma', 'Manufacturing', 'Consumer'],
    description: `India market entry strategy for global clients. Understanding India's competitive structures, regulatory environments, and the gap between how global companies think about the market and what it actually is.`,
    keyProjects: [
      { industry: 'Industrial Conglomerate', description: 'Led full market entry for a $10B French conglomerate across automotive, pharma, and consumer electronics simultaneously. M&A/JV targets, partner origination, competitive intelligence.' },
      { industry: 'Metals & Energy Storage', description: 'Built market sizing framework for Indian metals market using import-export and demand-supply modeling for a US industry association.' },
      { industry: 'Automotive (Turnaround)', description: 'Developed turnaround strategy for a German auto parts manufacturer in India. Voice of Customer analysis and operational diagnostic.' },
      { industry: 'Battery Manufacturing', description: 'Led partner identification and negotiation for a European primary cell manufacturer\'s contract manufacturing arrangement in India.' },
      { industry: 'Cosmetics (Startup)', description: 'Built full business plan from zero: positioning, pricing, financial model, digital marketing. Investor-ready and operationally executable.' },
    ],
    problemStatements: ['India market entry', 'Partner identification', 'Turnaround strategy', 'Business model design'],
    frameworks: ['Market entry strategy', 'M&A / JV screening', 'Voice of Customer', 'Financial modeling'],
  },
  {
    id: 'madcue',
    company: 'Madcue',
    role: 'Co-founder',
    period: 'Jun 2015 – Jan 2018',
    location: 'Bangalore',
    status: 'BUILT',
    section: 'BUILT FROM ZERO',
    tags: ['startup', 'creator', 'content', 'design', 'community', 'media'],
    industries: ['Media', 'Creator Economy'],
    description: `Built a creator economy and digital media platform before the phrase existed. Defined brand identity, visual design language, and editorial voice from the ground up. 150+ independent creators, 70,000 monthly viewers, audience tripled in 8 months through structured PPC experiments. Exclusive interviews with globally recognized creators: Gavin Aung Than, Abhilash Tomy, Tashi Malik. Ran product, operations, content strategy, creator acquisition, and distribution end-to-end.`,
    links: [
      { label: 'Madcue on Facebook', url: 'https://www.facebook.com/madcue/' },
      { label: 'Madcue on Instagram', url: 'https://www.instagram.com/madcue/' },
    ],
    problemStatements: ['Creator platform building', 'Audience growth', 'Brand identity design', 'Content strategy'],
    frameworks: ['Growth hacking', 'PPC optimization', 'Community building', 'Editorial strategy'],
  },
  {
    id: 'parikshit',
    company: 'Manipal Institute of Technology, Parikshit Student Satellite Team',
    role: 'ADCS Subsystem Head',
    period: 'Jul 2013 – Jul 2016',
    location: 'Manipal',
    status: 'BUILT',
    section: 'LEVELLING UP',
    tags: ['engineering', 'ISRO', 'nanosatellite', 'controls', 'research', 'IEEE'],
    industries: ['Aerospace'],
    description: `Head of attitude determination and control subsystem for Parikshit, a student nano-satellite developed under ISRO guidance. Designed the control mechanism for a satellite traveling at 28,800 km/hr, maintaining angular velocities within 1°/s for payload specs. Five IEEE and journal publications (2014–2016), including papers at the IEEE Aerospace Conference in Big Sky, Montana.`,
    links: [
      { label: 'See all publications', url: '/research' },
    ],
    problemStatements: ['Satellite attitude control', 'Tether deployment dynamics', 'Hardware-in-loop testing'],
    frameworks: ['Control systems engineering', 'Simulation & testing (SIL)', 'IEEE research methodology'],
  },
];

export const education: Education = {
  institution: 'Manipal Institute of Technology',
  degree: 'B.Tech, Mechanical Engineering',
  period: '2012 – 2016',
  cgpa: '8.0 / 10.0',
  note: 'Where I learned to design control systems for satellites and realized I wanted to solve business problems.',
};
