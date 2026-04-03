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
    description: `This is MBB consulting, which means the stakes are real and the timelines are tight. I lead cross-functional teams on capital project advisory engagements across oil and gas, solar, nuclear, and mining \u2014 working directly with C-suites and boards on decisions that don't have easy answers.

Three engagements worth describing:

A national energy company in South America had shelved an upstream oil extraction project \u2014 internally assessed as non-feasible, not worth pursuing. The question they brought us was whether there was a different project concept that could change that answer. I designed an AI-augmented evaluation framework that tested multiple extraction concepts against each other, integrating financial modeling, technical simulation, and regulatory inputs into a structured comparison. The conclusion was yes, there was a viable path, and the C-suite made the investment decision. A project that had been written off came back.

A major North American nuclear utility was trying to figure out how to sequence and govern a multi-plant new-build program. The decisions involved billions of dollars, years of execution, and a level of governance complexity that most program frameworks aren't designed for. I built the decision model that covered program sequencing, operating model design, governance structure, and contractor selection criteria \u2014 and structured the recommendation for the board.

A utility-scale solar project was underperforming against its financial projections. The question was where the value was leaking and what could actually be done about it. I led the performance analysis, identified CapEx and OpEx optimization levers, and built the investment-committee-ready case for the interventions.

Alongside all of this, I've been building the AI toolkit \u2014 financial modeling, scheduling, document intelligence, capital allocation tracking \u2014 that makes the analytical work faster and more rigorous at the same time.`,
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
    description: `Three years of leading growth advisory mandates across EMEA, North America, and APAC for Fortune 500 and PE-backed clients. The scope was intentionally wide \u2014 which is either a feature or a bug depending on what you're looking for. I found it useful. You learn differently when the problem type changes every few months.

The work that's worth describing:

A B2B commerce marketplace was preparing for its Series A. They needed a financial model and business plan rigorous enough to hold up to institutional investor scrutiny, plus a credible narrative for their expansion thesis. I built both, including sizing adjacent market opportunities to strengthen the investment case. The raise happened.

A global drinks company was entering the ready-to-drink segment \u2014 a new category that required a completely different approach to positioning, channel, and launch. I developed the marketing strategy and product launch plan from scratch: consumer positioning, pricing architecture, channel mix across retail and on-trade, and market-by-market sequencing. The legacy commercial model had been built for traditional categories. This wasn't that.

A consumer electronics brand in EMEA had stopped growing. The channel mix was wrong, the brand positioning hadn't evolved, and the product architecture was starting to look like everything else in the market. I led the full strategic and commercial redesign \u2014 positioning, channel, distribution model, product category adjacencies \u2014 and built the efficiency framework to make the new commercial structure viable.

A technology firm needed a pricing strategy for a software suite targeting the carbon credits exchange market. The problem: no clean comparables. The market was too new. I built the pricing model using replacement-cost methodology combined with competitor analysis across adjacent software categories, arriving at a defensible tiered architecture.

A stock trading firm needed a complete solution portfolio architecture for its software suite \u2014 product bundling logic, tier-based pricing, and a commercial framework designed for C-suite adoption. I built the full structure, not just the price points.

For a global port operator expanding across three continents, I led the financial return modeling and bid strategy across geographies with very different competitive and regulatory environments. Structures that work in one region often don't work in another. That tension is where the interesting work lives.

I also formulated the M&A roadmap that enabled PE investment in a global IT services firm. The existing business mix didn't command a premium multiple. The acquisition sequence I recommended changed that calculus.

A logistics firm needed to know where the high-value growth was in its market \u2014 not just a market sizing exercise but a genuine strategic analysis integrating demand forecasting, competitive supply assessment, and business model viability. I built the framework and ran the analysis.

An ecommerce platform was evaluating several expansion directions simultaneously without a rigorous basis for comparing them. I built the market sizing, competitive dynamics, and operational feasibility analysis for each option so leadership had something to actually decide with.

Also published on AI's impact on green manufacturing and digital governance \u2014 Economic Times and Dataquest. Neither was purely promotional. Both tried to say something true.`,
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
    description: `Competitive intelligence and market analysis for Fortune 1000 technology clients. The work was dense, deadline-driven, and required translating complex multi-source data into something a senior executive would actually act on.

A global cloud provider was entering India and needed to know which system integrator partners to prioritize. I built the digital readiness evaluation framework, assessed ten-plus GSI partners, and arrived at a tiered engagement model and prioritized GTM strategy for leadership.

A major Indian telecoms company was launching into CPaaS and CCaaS \u2014 technically complex categories with a crowded competitive landscape. I designed the competitive intelligence-driven GTM strategy, structured the product positioning, and built the customer engagement model for the launch.

For a top hyperscale cloud provider, I led competitive analysis on cloud compliance assurance programs \u2014 work that directly shaped their product roadmap and M&A screening criteria.

I mapped IT solution spending across the Canadian public sector for a global technology firm \u2014 building a structured taxonomy of who was spending what, and where the client had the strongest basis for enterprise engagement.

I also ran the strategic landscape analysis for EV charging infrastructure \u2014 identifying key technologies, deployment models, and investment opportunities as the category was still forming. That kind of early-stage analysis requires being comfortable with uncertainty while still arriving somewhere useful.`,
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
    description: `India market entry strategy for global clients. The work required understanding India specifically \u2014 its competitive structures, regulatory environments, and the gap between how global companies think about the market and what it actually is.

A $10 billion French industrial conglomerate wanted to establish meaningful presence in India across automotive components, pharmaceutical, and consumer electronics simultaneously. Three different sectors with three different competitive dynamics. I led the full engagement \u2014 market sizing, M&A and JV target identification, competitive intelligence, and partner origination across all three. The partners that got signed gave the client its fastest credible route to market.

For a US industry association, I built a market sizing framework for the Indian metals market using import-export data and demand-supply modeling, with a focus on energy storage applications. The findings were used to facilitate strategic connections for member companies.

A German automotive parts manufacturer was having operational difficulties in India. The root causes were partly internal, partly external \u2014 captured through a structured Voice of Customer analysis and operational diagnostic. I developed the turnaround strategy that addressed both.

I led the partner identification and negotiation process for a European primary cell manufacturer that needed a contract manufacturing arrangement in India. Shortlisted partners on technical capability, quality systems, and commercial terms. The partnership that resulted gave the client a viable India manufacturing base.

I also built a full business plan \u2014 market positioning, pricing, financial model, and digital marketing strategy \u2014 for an early-stage cosmetic brand from zero. Every element was built to be both investor-ready and operationally executable, which are harder to reconcile than they sound.`,
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
    description: `I built a creator economy and digital media platform at a time when that phrase didn't really exist yet. The idea was simple and hard: give interesting people \u2014 artists, adventurers, writers, makers \u2014 a platform with a coherent identity and a real audience, rather than just another social aggregator.

What distinguished Madcue wasn't just what it covered but how it looked and felt. I defined the brand identity, the visual design language, and the editorial voice from the ground up. The platform had a distinct aesthetic \u2014 which sounds minor but isn't. In a space full of generic interfaces, having a clear creative identity was what made creators want to be on it.

By the time I left: 150+ independent creators, 70,000 monthly viewers, audience tripled in eight months through structured PPC experiments on Facebook and Google. Exclusive interviews with globally recognized creators \u2014 Gavin Aung Than, Abhilash Tomy, Tashi Malik. The interviews were possible because the platform had a reputation worth lending.

I ran all of it \u2014 product, operations, content strategy, creator acquisition, distribution. That's the useful part of building something at scale with no resources. Everything is your problem.`,
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
    description: `As an undergraduate mechanical engineering student, I was the head of the attitude determination and control subsystem for Parikshit \u2014 a student satellite project developed under the guidance of ISRO, India's space research organization.

My specific problem: designing the control mechanism for a nano-satellite traveling at up to 28,800 km/hr, ensuring angular velocities remained within one degree per second to satisfy payload specifications. The margin for error at those velocities is essentially zero. The system had to work.

Five IEEE and journal publications between 2014 and 2016, including papers presented at the IEEE Aerospace Conference in Big Sky, Montana \u2014 one of the leading aerospace research forums. Topics included tether ejection systems, dynamics and control system design, software-in-loop satellite testing, and earthquake stabilization of buildings (a separate but related structural dynamics thread).

Getting a research paper accepted at a major aerospace conference in your second year of university is the kind of thing that either confirms you're on the right path or convinces you to change direction. For me, it did both. I learned I could do the rigorous technical work. I also learned that the work I found most interesting lived at the intersection of systems and strategy \u2014 not pure engineering.

That tension has defined every career choice since.`,
  },
];

export const education: Education = {
  institution: 'Manipal Institute of Technology',
  degree: 'B.Tech \u2014 Mechanical Engineering',
  period: '2012 \u2013 2016',
  cgpa: '8.0 / 10.0',
  note: 'Where I learned to design control systems for satellites and realized I wanted to solve business problems.',
};
