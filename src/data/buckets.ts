// How the AI builds are grouped. Builds sit in three tiers: platform builds (the stronger, connected
// ones that make up one platform), AI builds (stand-alone tools) and fun builds. Within a tier, calm
// mode groups by the segment of work or life a build serves; nerd mode groups by the tech stack or
// skill stack it mostly exercises. Every room sits in exactly one bucket per mode.

export type BuildTier = 'platform' | 'ai' | 'fun';

export interface Bucket {
  id: string;
  label: string;
  /** One plain line for the filter chip's hover and the grouped index. */
  blurb: string;
}

export const tiers: { id: BuildTier; label: string; blurb: string }[] = [
  { id: 'platform', label: 'Platform builds', blurb: 'The connected tools that cover a capital project from first signal to operating asset.' },
  { id: 'ai', label: 'AI builds', blurb: 'Stand-alone tools built because a problem at work needed one.' },
  { id: 'fun', label: 'Fun builds', blurb: 'Built for the joy of it: cricket, routines, family.' },
];

/** Calm: segments, per tier. */
export const calmBuckets: (Bucket & { tier: BuildTier })[] = [
  { id: 'p-find', tier: 'platform', label: 'Find and shape', blurb: 'Spot projects forming, generate the concepts and put a traceable cost on each.' },
  { id: 'p-plan', tier: 'platform', label: 'Plan and schedule', blurb: 'Schedules generated from the scope, seen as a digital twin, and planned backwards for a shutdown.' },
  { id: 'p-test', tier: 'platform', label: 'Test the case', blurb: 'Risk, comparable projects, forecasts, lessons and forensics: is this number credible?' },
  { id: 'p-deliver', tier: 'platform', label: 'Deliver and operate', blurb: 'Control the build, keep every stakeholder aligned, and find the value still on the table.' },
  { id: 'money', tier: 'ai', label: 'Money and investment', blurb: 'Financial models, investment costs and benchmarks, so a number can be defended.' },
  { id: 'delivery', tier: 'ai', label: 'Monitoring and planning', blurb: 'Watching a portfolio and turning a brief into a plan.' },
  { id: 'research', tier: 'ai', label: 'Research, strategy and documents', blurb: 'Strategy, proposals and document answers, minus the weeks.' },
  { id: 'land', tier: 'ai', label: 'Land and property', blurb: 'Records that rarely agree, laid side by side for one family.' },
  { id: 'sport', tier: 'fun', label: 'Sport and play', blurb: 'Cricket, scored on skill alone.' },
  { id: 'family', tier: 'fun', label: 'Family and health', blurb: 'Looking after the people at home.' },
  { id: 'self', tier: 'fun', label: 'Personal productivity', blurb: 'Tasks, habits and focus, with the score kept.' },
];

/** Nerd: tech stack or skill stack, across every tier. */
export const nerdBuckets: Bucket[] = [
  { id: 'agents', label: 'Multi-agent LLM systems', blurb: 'Planner, specialist and reviewer agents (LangChain, Anthropic API) with evals and cross-checks.' },
  { id: 'rag', label: 'Retrieval and cited evidence', blurb: 'Vector search, source-linked answers and evidence trails.' },
  { id: 'quant', label: 'Optimization, simulation and quant models', blurb: 'Monte Carlo, constraint solvers, schedule and cost engines in Python.' },
  { id: 'viz3d', label: '3D, maps and visual interfaces', blurb: 'Three.js, D3 and MapLibre: models and maps you can walk through.' },
  { id: 'fullstack', label: 'Full-stack TypeScript products', blurb: 'Next.js or React with Express, Postgres and Drizzle, shipped as real apps.' },
];

/** Tier and bucket ids per room, keyed by portfolio slug. */
export const roomBuckets: Record<string, { tier: BuildTier; calm: string; nerd: string }> = {
  // platform builds
  'opportunity-map': { tier: 'platform', calm: 'p-find', nerd: 'agents' },
  'generative-concepts': { tier: 'platform', calm: 'p-find', nerd: 'quant' },
  costline: { tier: 'platform', calm: 'p-find', nerd: 'quant' },
  'generative-scheduler': { tier: 'platform', calm: 'p-plan', nerd: 'quant' },
  'digital-twin': { tier: 'platform', calm: 'p-plan', nerd: 'viz3d' },
  't-minus': { tier: 'platform', calm: 'p-plan', nerd: 'fullstack' },
  'risk-analysis': { tier: 'platform', calm: 'p-test', nerd: 'quant' },
  precedent: { tier: 'platform', calm: 'p-test', nerd: 'rag' },
  'outturn-forecast': { tier: 'platform', calm: 'p-test', nerd: 'quant' },
  forensic: { tier: 'platform', calm: 'p-test', nerd: 'quant' },
  hindsight: { tier: 'platform', calm: 'p-test', nerd: 'rag' },
  pit: { tier: 'platform', calm: 'p-test', nerd: 'fullstack' },
  cockpit: { tier: 'platform', calm: 'p-deliver', nerd: 'viz3d' },
  pulse: { tier: 'platform', calm: 'p-deliver', nerd: 'agents' },
  cartograph: { tier: 'platform', calm: 'p-deliver', nerd: 'agents' },
  // AI builds
  abacus: { tier: 'ai', calm: 'money', nerd: 'agents' },
  groundwork: { tier: 'ai', calm: 'money', nerd: 'quant' },
  yardstick: { tier: 'ai', calm: 'money', nerd: 'quant' },
  watchtower: { tier: 'ai', calm: 'delivery', nerd: 'agents' },
  blueprint: { tier: 'ai', calm: 'delivery', nerd: 'agents' },
  needle: { tier: 'ai', calm: 'research', nerd: 'rag' },
  'first-draft': { tier: 'ai', calm: 'research', nerd: 'agents' },
  'haus-nous': { tier: 'ai', calm: 'research', nerd: 'fullstack' },
  'bhoomi-setu': { tier: 'ai', calm: 'land', nerd: 'viz3d' },
  // fun builds
  hitman: { tier: 'fun', calm: 'sport', nerd: 'fullstack' },
  maate: { tier: 'fun', calm: 'family', nerd: 'fullstack' },
  'momentum-os': { tier: 'fun', calm: 'self', nerd: 'fullstack' },
};
