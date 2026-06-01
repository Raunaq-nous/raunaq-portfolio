export interface Paper {
  id: string;
  formalTitle: string;
  calmTitle: string;
  nerdTitle: string;
  calm: string;
  nerd: string;
  venue: string;
  year: string;
  url: string;
  leadAuthor: boolean;
}

export interface ResearchThread {
  id: string;
  title: string;
  calm: string;
  nerd: string;
  tags: string[];
}

export const researchThreads: ResearchThread[] = [
  {
    id: 'multi-agent-finance',
    title: 'Multi-agent systems for financial reasoning',
    calm: 'Can a team of agents build, challenge, and stress-test a model the way a real deal team does, instead of one model and one answer.',
    nerd: 'Exploring multi-agent architectures where specialist agents (CapEx, OpEx, revenue, risk) build competing model variants and a reviewer agent reconciles contradictions before output. The question is whether adversarial agent interaction produces more robust financial reasoning than single-pass generation.',
    tags: ['multi-agent', 'finance', 'LangChain'],
  },
  {
    id: 'document-intelligence',
    title: 'Document intelligence for high-stakes corpora',
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
    calm: 'Can you learn a role faster by simulating its decisions than by spending years in the seat. Ties to Career OS.',
    nerd: 'Scenario simulation engine on top of a personalized skill graph. Target roles decompose into competencies, which generate decision tasks. An iterative feedback loop scores choices and adapts the next scenario. The hypothesis is that deliberate practice via simulation compresses skill acquisition timelines.',
    tags: ['AI', 'simulation', 'careers'],
  },
];

export const papers: Paper[] = [
  {
    id: 'tether-deploy',
    formalTitle: 'Mechanism, ensuing dynamics and control of a polar low-earth orbit tethered nano-satellite',
    calmTitle: 'What happens to a satellite when you unspool a tether, and how to keep it steady.',
    nerdTitle: '`tether-deploy/`: deployment mechanism, induced dynamics, and counter-control on a polar LEO nanosat.',
    calm: 'When Parikshit deployed its electrodynamic tether, the whole satellite reacted. This works through the deployment mechanism itself, the material, the length, which door it leaves from, even a force sensor for the pull, then designs the control system that settles the satellite back down.',
    nerd: 'Models the tether assembly (material, length, deployment-door axis) and a force sensor for deployment loads, derives the disturbance deployment injects into LEO attitude dynamics, and designs the restabilizing controller. Validated in a space-environment dynamics model.',
    venue: 'IEEE Aerospace Conference',
    year: '2015',
    url: 'https://ieeexplore.ieee.org/document/7119062',
    leadAuthor: true,
  },
  {
    id: 'adcs-core',
    formalTitle: "Dynamics and control system design of a polar low-earth orbit nano-satellite 'Parikshit'",
    calmTitle: "Holding a satellite's spin under one degree per second.",
    nerdTitle: '`adcs-core/`: quaternion-based attitude dynamics and control bounding angular rate at 1 deg/s.',
    calm: 'The payload needed the satellite to rotate no faster than one degree per second. This is the control system that makes that happen, including why we modeled everything in quaternions rather than the obvious angles, and how we accounted for the small forces in orbit that try to nudge it off course.',
    nerd: 'Attitude dynamics in quaternions (with the case for quaternions over Euler angles), numerical-integration scheme and step-size selection, disturbance-torque estimation, controller tuned to the 1 deg/s payload spec. Space-environment simulation.',
    venue: 'ICACCI',
    year: '2015',
    url: 'https://ieeexplore.ieee.org/document/7275676',
    leadAuthor: true,
  },
  {
    id: 'tether-control',
    formalTitle: 'Control system design to counter the effect of tether ejection system on a nano-satellite',
    calmTitle: 'Designing the controller that fights back when the tether fires.',
    nerdTitle: '`tether-control/`: nominal controller countering electrodynamic-tether ejection.',
    calm: 'A close cousin of the deployment work, focused on the nominal control design that counters the kick from the electrodynamic tether ejection and brings the satellite back to stable.',
    nerd: 'Nominal control design countering the attitude disturbance from electrodynamic-tether ejection. Details the tether assembly, post-ejection stabilization, and controller performance in a simulated space environment.',
    venue: 'ICACCI',
    year: '2015',
    url: 'https://ieeexplore.ieee.org/document/7275680',
    leadAuthor: true,
  },
  {
    id: 'sil-rig',
    formalTitle: 'Software in the loop test set-up of a tethered nano-satellite',
    calmTitle: "Testing the satellite's brain on the ground, before it ever flew.",
    nerdTitle: '`sil-rig/`: software-in-the-loop test bed for a tethered nanosat ADCS under de-orbit.',
    calm: 'You cannot launch a satellite just to check your code, so we built a software-in-the-loop rig that simulates de-orbiting and runs the full control system against it. It stitches together models of the descent, the sun, eclipses, and the small disturbing forces, so the ADCS could be tested end to end on a laptop.',
    nerd: 'SIL test bed validating the ADCS under simulated de-orbiting. Integrates descent, sun, and eclipse models, disturbance-torque models, a quaternion estimation algorithm, and the control designs, with results analyzed.',
    venue: 'IEEE Aerospace Conference',
    year: '2016',
    url: 'https://ieeexplore.ieee.org/document/7500603',
    leadAuthor: false,
  },
];
