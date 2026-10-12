export interface BattleLink {
  label: string;
  url: string;
}

export interface KeyProject {
  industry: string;
  description: string;
  /** Type of problem, e.g. market entry or pricing. */
  problem?: string;
  /** Keys into places in src/data/geo.ts: where the client or the work was. */
  geos?: string[];
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
  /** Short facts shown as their own boxes. Drawn from the CV and existing copy only. */
  highlights?: { label: string; value: string }[];
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
    highlights: [{ label: 'Sectors', value: 'Oil & gas, solar, nuclear, mining and infrastructure' }, { label: 'Stakeholders', value: 'C-suite and board-level decisions' }, { label: 'Built alongside', value: 'An AI toolkit for the analytical work: financial modeling, scheduling, document intelligence, portfolio monitoring, benchmarking' }],
    company: 'Bain & Company',
    role: 'Project Leader',
    period: 'Jun 2025 – Present',
    location: 'Mumbai / Gurugram',
    status: 'CURRENT',
    section: 'NOW',
    tags: ['strategy', 'energy', 'AI', 'consulting'],
    industries: ['Oil & Gas', 'Solar', 'Nuclear', 'Mining', 'Infrastructure'],
    description: `Leading cross-functional teams on advisory engagements across energy, infrastructure, and mining, working directly with C-suites and boards on high-stakes investment decisions. Simultaneously building an AI toolkit that makes the analytical work faster and more rigorous.`,
    keyProjects: [
      { industry: 'Oil & Gas', description: 'Advisory work for an oil and gas business in South America, at C-suite and board level.', problem: 'Investment decisions', geos: ['south-america'] },
      { industry: 'Nuclear', description: 'Advisory work on nuclear energy in the United Kingdom.', problem: 'Capital projects', geos: ['uk'] },
      { industry: 'Nuclear', description: 'Advisory work on nuclear energy in the United States.', problem: 'Capital projects', geos: ['usa'] },
      { industry: 'Solar & Renewables', description: 'Advisory work on solar and renewable energy in the United States.', problem: 'Investment decisions', geos: ['usa'] },
    ],
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
    highlights: [{ label: 'Mandates', value: '12+ for Fortune 500 and PE-backed clients' }, { label: 'Regions', value: 'EMEA, North America and APAC' }, { label: 'Published', value: 'AI and green manufacturing (Economic Times), digital governance (Dataquest)' }],
    company: 'Aranca',
    role: 'Engagement Lead, Growth Advisory',
    period: 'Mar 2022 – Jun 2025',
    location: 'Mumbai',
    status: 'WORKED',
    section: 'ADVISORY',
    tags: ['strategy', 'GTM', 'financialmodeling', 'MA', 'advisory', 'EMEA', 'consumer', 'logistics'],
    industries: ['FMCG', 'Consumer Electronics', 'Climate Tech', 'Financial Services', 'Logistics', 'IT Services', 'E-commerce', 'Waste Management'],
    description: `Three years leading growth advisory mandates across EMEA, North America, and APAC for Fortune 500 and PE-backed clients. Wide scope by design: strategy, financial modeling, M&A, GTM, pricing. Published on AI's impact on green manufacturing (Economic Times) and digital governance (Dataquest).`,
    keyProjects: [
      { industry: 'B2B Commerce', description: 'Built financial model and business plan for a marketplace Series A, including adjacent market sizing. The raise happened.', problem: 'Fundraise and business plan', geos: ['saudi'] },
      { industry: 'Beverages (FMCG)', description: 'Developed full GTM and product launch strategy for a global drinks company entering ready-to-drink: positioning, pricing, channel mix, market sequencing.', problem: 'Go-to-market', geos: ['japan'] },
      { industry: 'Consumer Electronics', description: 'Led strategic and commercial redesign for an EMEA brand: repositioning, channel restructuring, product architecture, efficiency framework.', problem: 'Commercial redesign', geos: ['emea'] },
      { industry: 'Climate Tech', description: 'Built pricing strategy for carbon credits exchange software with no clean comparables. Replacement-cost methodology with tiered architecture.', problem: 'Pricing', geos: ['usa'] },
      { industry: 'Financial Services', description: 'Designed solution portfolio architecture for a stock trading firm: product bundling, tier-based pricing, C-suite commercial framework.', problem: 'Portfolio and pricing architecture' },
      { industry: 'Waste Management', description: 'Built a multi-year business plan covering infrastructure capex, supply chain transformation, operating cost structure and return profile.', problem: 'Business plan', geos: ['saudi'] },
      { industry: 'Ports & Logistics', description: 'Led financial return modeling and bid strategy for a global port operator expanding across three continents with varying regulatory environments.', problem: 'Bid strategy and returns' },
      { industry: 'IT Services (PE)', description: 'Formulated M&A roadmap that enabled PE investment in a global IT services firm. Acquisition sequence to improve multiple.', problem: 'M&A roadmap', geos: ['india', 'usa'] },
      { industry: 'Logistics', description: 'Built strategic growth framework integrating demand forecasting, competitive supply assessment, and business model viability analysis.', problem: 'Growth strategy' },
      { industry: 'E-commerce', description: 'Built market sizing, competitive dynamics, and operational feasibility analysis across multiple expansion directions for leadership decision-making.', problem: 'Market expansion' },
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
    highlights: [{ label: 'Clients', value: 'Fortune 1000 technology firms' }, { label: 'Scope', value: 'Competitive intelligence, GTM strategy, market entry' }, { label: 'Partners assessed', value: '10+ system integrators for a hyperscale cloud provider entering India' }],
    company: 'Evalueserve',
    role: 'Business Analyst, Insights & Intelligence',
    period: 'Oct 2020 – Nov 2021',
    location: 'Gurugram',
    status: 'WORKED',
    section: 'ADVISORY',
    tags: ['intelligence', 'cloud', 'technology', 'GTM', 'research'],
    industries: ['Cloud', 'Telecoms', 'Public Sector', 'EV & Clean Tech'],
    description: `Competitive intelligence and market analysis for Fortune 1000 technology clients. Dense, deadline-driven work translating complex multi-source data into executive-actionable insights.`,
    keyProjects: [
      { industry: 'Cloud (India Entry)', description: 'Built digital readiness evaluation framework for a global cloud provider entering India. Assessed 10+ GSI partners, delivered tiered engagement model and GTM strategy.', problem: 'Market entry', geos: ['india'] },
      { industry: 'Telecoms (CPaaS/CCaaS)', description: 'Designed competitive intelligence-driven GTM strategy for a major Indian telecoms company launching into CPaaS and CCaaS.', problem: 'Go-to-market', geos: ['philippines'] },
      { industry: 'Cloud Compliance', description: 'Led competitive analysis on compliance assurance programs for a top hyperscale cloud provider. Directly shaped product roadmap and M&A screening.', problem: 'Competitive intelligence', geos: ['canada', 'usa'] },
      { industry: 'Public Sector IT', description: 'Mapped IT solution spending across Canadian public sector. Structured taxonomy of spending patterns and enterprise engagement opportunities.', problem: 'Spend mapping', geos: ['canada'] },
      { industry: 'EV Infrastructure', description: 'Ran strategic landscape analysis for EV charging infrastructure: key technologies, deployment models, and investment opportunities in an emerging market.', problem: 'Landscape analysis', geos: ['india'] },
    ],
    problemStatements: ['Competitive intelligence', 'Market entry assessment', 'Product roadmap shaping', 'Public sector opportunity mapping'],
    frameworks: ['Competitive intelligence', 'GTM strategy', 'Technology landscape analysis'],
  },
  {
    id: 'tecnova',
    highlights: [{ label: 'Largest mandate', value: 'India entry for a $10B French conglomerate across three sectors at once' }, { label: 'Scope', value: 'Market entry, partner identification, turnaround, business plans' }],
    company: 'Tecnova India',
    role: 'Strategy Analyst',
    period: 'Jul 2019 – Oct 2020',
    location: 'Gurugram',
    status: 'WORKED',
    section: 'ADVISORY',
    tags: ['marketentry', 'India', 'automotive', 'pharma', 'consumer', 'strategy'],
    industries: ['Automotive', 'Pharma', 'Manufacturing', 'Consumer'],
    description: `India market entry strategy for global clients. Understanding India's competitive structures, regulatory environments, and the gap between how global companies think about the market and what it actually is.`,
    keyProjects: [
      { industry: 'Industrial Conglomerate', description: 'Led full market entry for a $10B French conglomerate across automotive, pharma, and consumer electronics simultaneously. M&A/JV targets, partner origination, competitive intelligence.', problem: 'Market entry and M&A', geos: ['france', 'india'] },
      { industry: 'Metals & Energy Storage', description: 'Built market sizing framework for Indian metals market using import-export and demand-supply modeling for a US industry association.', problem: 'Market sizing', geos: ['usa', 'india'] },
      { industry: 'Automotive (Turnaround)', description: 'Developed turnaround strategy for a German auto parts manufacturer in India. Voice of Customer analysis and operational diagnostic.', problem: 'Turnaround', geos: ['north-america', 'india'] },
      { industry: 'Battery Manufacturing', description: 'Led partner identification and negotiation for a European primary cell manufacturer\'s contract manufacturing arrangement in India.', problem: 'Partner identification', geos: ['germany', 'india'] },
      { industry: 'Cosmetics (Startup)', description: 'Built full business plan from zero: positioning, pricing, financial model, digital marketing. Investor-ready and operationally executable.', problem: 'Business plan', geos: ['france', 'india'] },
    ],
    problemStatements: ['India market entry', 'Partner identification', 'Turnaround strategy', 'Business model design'],
    frameworks: ['Market entry strategy', 'M&A / JV screening', 'Voice of Customer', 'Financial modeling'],
  },
  {
    id: 'delbomblr',
    highlights: [{ label: 'Role', value: "Founder's office" }, { label: 'Stage', value: 'Pre-seed startup' }, { label: 'Focus', value: 'Product development' }],
    company: 'Delbomblr Inc',
    role: "Founder's Office",
    period: 'Feb 2018 – Jun 2019',
    location: 'Delhi',
    status: 'WORKED',
    section: 'ADVISORY',
    tags: ['startup', 'product'],
    industries: ['Startups'],
    description: "Founder's office at a pre-seed startup, supporting the founder in product development.",
    problemStatements: ['Product development'],
  },
  {
    id: 'madcue',
    highlights: [{ label: 'Launched', value: 'December 2014' }, { label: 'Creators', value: '150+ independent creators' }, { label: 'Audience', value: '70,000 monthly viewers' }, { label: 'Growth', value: 'Audience tripled in 8 months through structured PPC experiments' }, { label: 'Interviews', value: 'Gavin Aung Than, Abhilash Tomy, Tashi Malik' }, { label: 'Facebook', value: '9.1K followers, 508 posts' }, { label: 'Sections', value: 'In & Out, Food for Thought, Fiction, In The House' }, { label: 'Belief', value: 'Stories can change the world' }],
    company: 'Madcue',
    role: 'Co-founder',
    period: 'Jun 2015 – Jan 2018',
    location: 'Manipal / Bangalore',
    status: 'BUILT',
    section: 'BUILT FROM ZERO',
    tags: ['startup', 'creator', 'content', 'design', 'community', 'media'],
    industries: ['Media', 'Creator Economy'],
    description: `Madcue, launched in December 2014, is a platform for presenting stories to people around the globe: insights from people's daily lives, the culture they live in and the society around them. We tried to understand the thoughts behind an individual and present ideas, as stories, to ponder upon, and to bring forth the stories of outliers who inspire the world and make a difference. We believed that stories can change the world. Everyone has a story to tell.

As co-founder I built it from zero: brand identity, visual design language and editorial voice, plus product, operations, content strategy, creator acquisition, distribution, and the creator GTM and audience monetization model.`,
    links: [
      { label: 'Madcue on Facebook', url: 'https://www.facebook.com/madcue/' },
      { label: 'Madcue on Instagram', url: 'https://www.instagram.com/madcue/' },
    ],
    keyProjects: [
      { industry: 'Media', description: 'Built the platform from zero: brand identity, visual design language, editorial voice, product and operations.', problem: 'Platform building', geos: ['manipal'] },
      { industry: 'Creator Economy', description: 'Creator acquisition, distribution and audience growth: 150+ independent creators, 70,000 monthly viewers, audience tripled in 8 months through structured PPC experiments.', problem: 'Audience growth', geos: ['bangalore'] },
    ],
    problemStatements: ['Creator platform building', 'Audience growth', 'Brand identity design', 'Content strategy'],
    frameworks: ['Growth hacking', 'PPC optimization', 'Community building', 'Editorial strategy'],
  },
  {
    id: 'parikshit',
    highlights: [{ label: 'Orbital speed', value: '28,800 km/hr' }, { label: 'Control spec', value: 'Angular velocity held within 1 deg/s for the payload' }, { label: 'Presented', value: 'IEEE Aerospace Conference, Big Sky, Montana' }, { label: 'Papers', value: '4 IEEE papers, 3 as lead author' }],
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
      { label: 'See all publications', url: '/atlas/?role=parikshit' },
    ],
    keyProjects: [
      { industry: 'Aerospace', description: 'Dynamics and control system design for the Parikshit nano-satellite in polar low-earth orbit, keeping angular velocity within 1 deg/s for the payload. Presented at ICACCI 2015, Kochi.', problem: 'Satellite attitude control', geos: ['kochi'] },
      { industry: 'Aerospace', description: 'The tether deployment mechanism, the dynamics it sets off, and the control system that counters it. Presented at the 2015 IEEE Aerospace Conference, Big Sky, and ICACCI 2015, Kochi.', problem: 'Tether deployment dynamics', geos: ['big-sky', 'kochi'] },
      { industry: 'Aerospace', description: 'A software-in-the-loop test set-up for the tethered nano-satellite. Presented at the 2016 IEEE Aerospace Conference, Big Sky.', problem: 'Software-in-the-loop testing', geos: ['big-sky'] },
    ],
    problemStatements: ['Satellite attitude control', 'Tether deployment dynamics', 'Software-in-the-loop testing'],
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
