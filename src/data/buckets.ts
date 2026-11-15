// How the AI builds are grouped. Calm mode groups by the segment of life or work a build serves;
// nerd mode groups by the tech stack or skill stack it mostly exercises. Every room sits in exactly
// one bucket per mode. The Spur Labs tools that run inside another build use that build's stack.

export interface Bucket {
  id: string;
  label: string;
  /** One plain line for the filter chip's hover and the grouped index. */
  blurb: string;
}

/** Calm: segments. The AI wing and the fun wing each have their own. */
export const calmBuckets: (Bucket & { wing: 'work' | 'fun' })[] = [
  { id: 'delivery', wing: 'work', label: 'Planning and delivery', blurb: 'Schedules, digital twins and monitoring for big capital projects.' },
  { id: 'money', wing: 'work', label: 'Money and investment', blurb: 'Costs, financial models, benchmarks and risk, so a number can be defended.' },
  { id: 'evidence', wing: 'work', label: 'Evidence and lessons', blurb: 'Comparable projects, lessons learned and early signals, each cited to its source.' },
  { id: 'research', wing: 'work', label: 'Research, strategy and documents', blurb: 'Surveys, proposals, strategy and document answers, minus the weeks.' },
  { id: 'land', wing: 'work', label: 'Land and property', blurb: 'Records that rarely agree, laid side by side for one family.' },
  { id: 'sport', wing: 'fun', label: 'Sport and play', blurb: 'Cricket, scored on skill alone.' },
  { id: 'family', wing: 'fun', label: 'Family and health', blurb: 'Looking after the people at home.' },
  { id: 'self', wing: 'fun', label: 'Personal productivity', blurb: 'Tasks, habits and focus, with the score kept.' },
];

/** Nerd: tech stack or skill stack. */
export const nerdBuckets: Bucket[] = [
  { id: 'agents', label: 'Multi-agent LLM systems', blurb: 'Planner, specialist and reviewer agents (LangChain, Anthropic API) with evals and cross-checks.' },
  { id: 'rag', label: 'Retrieval and cited evidence', blurb: 'Vector search, source-linked answers and evidence trails.' },
  { id: 'quant', label: 'Optimization, simulation and quant models', blurb: 'Monte Carlo, constraint solvers, schedule and cost engines in Python.' },
  { id: 'viz3d', label: '3D, maps and visual interfaces', blurb: 'Three.js, D3 and MapLibre: models and maps you can walk through.' },
  { id: 'fullstack', label: 'Full-stack TypeScript products', blurb: 'Next.js or React with Express, Postgres and Drizzle, shipped as real apps.' },
];

/** Bucket ids per room, keyed by portfolio slug. */
export const roomBuckets: Record<string, { calm: string; nerd: string }> = {
  'digital-twin': { calm: 'delivery', nerd: 'viz3d' },
  watchtower: { calm: 'delivery', nerd: 'agents' },
  blueprint: { calm: 'delivery', nerd: 'agents' },
  abacus: { calm: 'money', nerd: 'agents' },
  groundwork: { calm: 'money', nerd: 'quant' },
  yardstick: { calm: 'money', nerd: 'quant' },
  pit: { calm: 'evidence', nerd: 'fullstack' },
  needle: { calm: 'research', nerd: 'rag' },
  pulse: { calm: 'research', nerd: 'agents' },
  'first-draft': { calm: 'research', nerd: 'agents' },
  'haus-nous': { calm: 'research', nerd: 'fullstack' },
  cartograph: { calm: 'research', nerd: 'agents' },
  'bhoomi-setu': { calm: 'land', nerd: 'viz3d' },
  hitman: { calm: 'sport', nerd: 'fullstack' },
  maate: { calm: 'family', nerd: 'fullstack' },
  'momentum-os': { calm: 'self', nerd: 'fullstack' },
  'opportunity-map': { calm: 'evidence', nerd: 'agents' },
  'generative-concepts': { calm: 'delivery', nerd: 'quant' },
  'costline': { calm: 'money', nerd: 'quant' },
  'generative-scheduler': { calm: 'delivery', nerd: 'quant' },
  'risk-analysis': { calm: 'money', nerd: 'quant' },
  'precedent': { calm: 'evidence', nerd: 'rag' },
  'outturn-forecast': { calm: 'money', nerd: 'quant' },
  'forensic': { calm: 'evidence', nerd: 'quant' },
  'hindsight': { calm: 'evidence', nerd: 'rag' },
  't-minus': { calm: 'delivery', nerd: 'fullstack' },
  cockpit: { calm: 'delivery', nerd: 'viz3d' },
};
