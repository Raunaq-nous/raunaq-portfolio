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
  description: string;
  keyProjects?: KeyProject[];
  links?: BattleLink[];
  tools?: BattleLink[];
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
    role: 'Project Leader \u2014 Capital Projects & Infrastructure',
    period: 'Jun 2025 \u2013 Present',
    location: 'Mumbai / Gurgaon',
    status: 'CURRENT',
    section: 'NOW',
    tags: ['strategy', 'energy', 'AI', 'capitalprojects', 'consulting'],
    description: `Leading cross-functional teams on capital project advisory engagements across oil & gas, solar, nuclear, and mining \u2014 working directly with C-suites and boards on high-stakes investment decisions. Simultaneously building an AI toolkit that makes the analytical work faster and more rigorous.`,
    keyProjects: [
      { industry: 'Oil & Gas', description: 'Designed an AI-augmented evaluation framework for a South American energy company that revived a shelved upstream extraction project \u2014 C-suite approved the investment decision.' },
      { industry: 'Nuclear', description: 'Built the decision model for a North American utility\u2019s multi-billion-dollar, multi-plant new-build program \u2014 covering sequencing, governance, operating model, and contractor selection.' },
      { industry: 'Solar', description: 'Led performance analysis on an underperforming utility-scale solar project \u2014 identified CapEx/OpEx optimization levers and built the investment-committee-ready case.' },
    ],
    tools: [
      { label: 'Financial Modeling Engine', url: 'https://github.com/Raunaq-nous/FInancial-Modelling' },
      { label: 'EPC Scheduling Platform', url: 'https://github.com/Raunaq-nous/Solar-Cost-Modelling' },
      { label: 'Document Intelligence (RAG)', url: 'https://github.com/Raunaq-nous/Universal-RAG' },
      { label: 'Capital Allocation Tracker', url: 'https://github.com/Raunaq-nous/Capital-Projects-Watcher' },
      { label: 'Solar Benchmarking', url: 'https://github.com/Raunaq-nous/Solar-Project-Benchmarking' },
    ],
  },
  {
    id: 'aranca',
    company: 'Aranca',
    role: 'Engagement Lead \u2014 Growth Advisory',
    period: 'Mar 2022 \u2013 Jun 2025',
    location: 'Mumbai',
    status: 'WORKED',
    section: 'ADVISORY',
    tags: ['strategy', 'GTM', 'financialmodeling', 'MA', 'advisory', 'EMEA', 'consumer', 'logistics'],
    description: `Three years leading growth advisory mandates across EMEA, North America, and APAC for Fortune 500 and PE-backed clients. Wide scope by design \u2014 strategy, financial modeling, M&A, GTM, pricing. Published on AI\u2019s impact on green manufacturing (Economic Times) and digital governance (Dataquest).`,
    keyProjects: [
      { industry: 'B2B Commerce', description: 'Built financial model and business plan for a marketplace\u2019s Series A \u2014 including adjacent market sizing. The raise happened.' },
      { industry: 'Beverages (FMCG)', description: 'Developed full GTM and product launch strategy for a global drinks company entering ready-to-drink \u2014 positioning, pricing, channel mix, market sequencing.' },
      { industry: 'Consumer Electronics', description: 'Led strategic and commercial redesign for an EMEA brand \u2014 repositioning, channel restructuring, product architecture, efficiency framework.' },
      { industry: 'Climate Tech', description: 'Built pricing strategy for carbon credits exchange software with no clean comparables \u2014 replacement-cost methodology with tiered architecture.' },
      { industry: 'Financial Services', description: 'Designed solution portfolio architecture for a stock trading firm \u2014 product bundling, tier-based pricing, C-suite commercial framework.' },
      { industry: 'Ports & Logistics', description: 'Led financial return modeling and bid strategy for a global port operator expanding across three continents with varying regulatory environments.' },
      { industry: 'IT Services (PE)', description: 'Formulated M&A roadmap that enabled PE investment in a global IT services firm \u2014 acquisition sequence to improve multiple.' },
      { industry: 'Logistics', description: 'Built strategic growth framework integrating demand forecasting, competitive supply assessment, and business model viability analysis.' },
      { industry: 'E-commerce', description: 'Built market sizing, competitive dynamics, and operational feasibility analysis across multiple expansion directions for leadership decision-making.' },
    ],
    tools: [
      { label: 'AI Proposal Builder', url: 'https://github.com/Raunaq-nous/Proposal-Builder' },
      { label: 'Survey Intelligence Platform', url: 'https://github.com/Raunaq-nous/Survey-Tool' },
      { label: 'Haus Nous (Strategy Platform)', url: 'https://github.com/Raunaq-nous/Haus-Nous' },
    ],
  },
  {
    id: 'evalueserve',
    company: 'Evalueserve',
    role: 'Business Analyst \u2014 Insights & Intelligence',
    period: 'Oct 2020 \u2013 Nov 2021',
    location: 'Gurgaon',
    status: 'WORKED',
    section: 'ADVISORY',
    tags: ['intelligence', 'cloud', 'technology', 'GTM', 'research'],
    description: `Competitive intelligence and market analysis for Fortune 1000 technology clients. Dense, deadline-driven work translating complex multi-source data into executive-actionable insights.`,
    keyProjects: [
      { industry: 'Cloud (India Entry)', description: 'Built digital readiness evaluation framework for a global cloud provider\u2019s India entry \u2014 assessed 10+ GSI partners, delivered tiered engagement model and GTM strategy.' },
      { industry: 'Telecoms (CPaaS/CCaaS)', description: 'Designed competitive intelligence-driven GTM strategy for a major Indian telecoms company launching into CPaaS and CCaaS.' },
      { industry: 'Cloud Compliance', description: 'Led competitive analysis on compliance assurance programs for a top hyperscale cloud provider \u2014 directly shaped product roadmap and M&A screening.' },
      { industry: 'Public Sector IT', description: 'Mapped IT solution spending across Canadian public sector \u2014 structured taxonomy of spending patterns and enterprise engagement opportunities.' },
      { industry: 'EV Infrastructure', description: 'Ran strategic landscape analysis for EV charging infrastructure \u2014 key technologies, deployment models, and investment opportunities in an emerging market.' },
    ],
  },
  {
    id: 'tecnova',
    company: 'Tecnova India',
    role: 'Strategy Analyst',
    period: 'Jul 2019 \u2013 Oct 2020',
    location: 'Gurgaon',
    status: 'WORKED',
    section: 'ADVISORY',
    tags: ['marketentry', 'India', 'automotive', 'pharma', 'consumer', 'strategy'],
    description: `India market entry strategy for global clients. Understanding India\u2019s competitive structures, regulatory environments, and the gap between how global companies think about the market and what it actually is.`,
    keyProjects: [
      { industry: 'Industrial Conglomerate', description: 'Led full market entry for a $10B French conglomerate across automotive, pharma, and consumer electronics simultaneously \u2014 M&A/JV targets, partner origination, competitive intelligence.' },
      { industry: 'Metals & Energy Storage', description: 'Built market sizing framework for Indian metals market using import-export and demand-supply modeling for a US industry association.' },
      { industry: 'Automotive (Turnaround)', description: 'Developed turnaround strategy for a German auto parts manufacturer in India \u2014 Voice of Customer analysis and operational diagnostic.' },
      { industry: 'Battery Manufacturing', description: 'Led partner identification and negotiation for a European primary cell manufacturer\u2019s contract manufacturing arrangement in India.' },
      { industry: 'Cosmetics (Startup)', description: 'Built full business plan from zero \u2014 positioning, pricing, financial model, digital marketing \u2014 investor-ready and operationally executable.' },
    ],
  },
  {
    id: 'madcue',
    company: 'Madcue',
    role: 'Co-founder',
    period: 'Jun 2015 \u2013 Jan 2018',
    location: 'Bangalore',
    status: 'BUILT',
    section: 'BUILT FROM ZERO',
    tags: ['startup', 'creator', 'content', 'design', 'community', 'media'],
    description: `Built a creator economy and digital media platform before the phrase existed. Defined brand identity, visual design language, and editorial voice from the ground up. 150+ independent creators, 70,000 monthly viewers, audience tripled in 8 months through structured PPC experiments. Exclusive interviews with globally recognized creators \u2014 Gavin Aung Than, Abhilash Tomy, Tashi Malik. Ran product, operations, content strategy, creator acquisition, and distribution end-to-end.`,
    links: [
      { label: 'Madcue on Facebook', url: 'https://www.facebook.com/madcue/' },
      { label: 'Madcue on Instagram', url: 'https://www.instagram.com/madcue/' },
    ],
  },
  {
    id: 'parikshit',
    company: 'Manipal Institute of Technology \u2014 Parikshit Student Satellite Team',
    role: 'ADCS Subsystem Head',
    period: 'Jul 2013 \u2013 Jul 2016',
    location: 'Manipal',
    status: 'BUILT',
    section: 'LEVELLING UP',
    tags: ['engineering', 'ISRO', 'nanosatellite', 'controls', 'research', 'IEEE'],
    description: `Head of attitude determination and control subsystem for Parikshit \u2014 a student nano-satellite developed under ISRO guidance. Designed the control mechanism for a satellite traveling at 28,800 km/hr, maintaining angular velocities within 1\u00b0/s for payload specs. Five IEEE and journal publications (2014\u20132016), including papers at the IEEE Aerospace Conference in Big Sky, Montana.`,
    links: [
      { label: 'Tether Deployment \u2014 Dynamics & Control of Tethered Satellite Systems (IEEE Aerospace 2015)', url: 'https://ieeexplore.ieee.org/document/7119191' },
      { label: 'Satellite ADCS \u2014 Attitude Determination & Control System Design (IEEE Aerospace 2016)', url: 'https://ieeexplore.ieee.org/document/7500tried' },
      { label: 'Software-in-Loop \u2014 SIL Testing for Nano-Satellite Subsystems (IEEE Aerospace 2016)', url: 'https://ieeexplore.ieee.org/document/7500756' },
      { label: 'Structural Dynamics \u2014 Earthquake Stabilization Using Active Control (IJERT 2014)', url: 'https://www.ijert.org' },
    ],
  },
];

export const education: Education = {
  institution: 'Manipal Institute of Technology',
  degree: 'B.Tech \u2014 Mechanical Engineering',
  period: '2012 \u2013 2016',
  cgpa: '8.0 / 10.0',
  note: 'Where I learned to design control systems for satellites and realized I wanted to solve business problems.',
};
