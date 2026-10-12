// Per-project additions to the stack graph. `features` are the AI features named in each build's
// write-up (src/data/builds.ts). `nodes` is used only with --spec, for repos not scanned locally:
// those stacks come straight from the write-up. Tuples: [id, label, layer, role].

export const specs = {
  cartograph: {
    extra: [
      ['evidence', 'Evidence store', 'data', 'local'],
      ['manifest', 'Run manifests', 'data', 'local'],
      ['value-model', 'Deterministic value model', 'application', 'validate'],
    ],
    edges: [['claude-agent-sdk', 'evidence', 'cites'], ['value-model', 'manifest', 'pins']],
    features: [
      'Specialist agents map current and future state per process',
      'Nine-dimension process scoring',
      'Reconciler nets overlapping savings at portfolio level',
      'Every claim carries evidence IDs',
      'Confidence computed from evidence, not self-reported',
      'Golden-set evals gate every change',
    ],
  },
  'bhoomi-setu': {
    extra: [['verifier', 'Deterministic verifier', 'application', 'validate']],
    edges: [['@google/genai', 'verifier', 'candidate facts'], ['openai', 'verifier', 'candidate facts']],
    features: [
      'Structured fact extraction from document text (Gemini or OpenAI)',
      'Schema, evidence-span and grounding checks on every candidate',
      'Code, not an LLM, returns PASS, POTENTIAL_ISSUE or INSUFFICIENT_EVIDENCE',
      'Three-way parcel area reconciliation',
    ],
  },
  hitman: {
    extra: [['scoring', 'Skill scoring engine', 'application', 'validate']],
    edges: [['scoring', 'postgres', 'scores']],
    features: [],
  },
  'momentum-os': {
    drop: ['pytest', 'Python', 'gemini-3-pro-image-preview', 'gemini-2.5-flash-image', 'gemini-3.1-pro-preview'],
    extra: [['model:whisper-large-v3', 'whisper-large-v3', 'ai', 'model']],
    features: ['Quick add: plain language parsed into a task, goal, habit or course', 'Voice notes transcribed with Whisper'],
  },
  kavach: {
    drop: ['Pino logging', 'structlog', 'Chart Kit', 'React Hook Form', 'Radix UI', 'Framer Motion', 'tiktoken', 'Vercel Analytics', 'Zod', 'Pydantic', 'NativeWind', 'React'],
    features: ['OCR over medical documents', 'AI summaries of health records'],
  },
  'career-os': {
    features: ['Target-role decomposition', 'Scenario generation', 'Iterative feedback loop', 'Digital avatar of the user profile'],
  },
  'digital-twin': {
    nodes: [
      ['react', 'React', 'interface', 'web'],
      ['d3', 'D3.js Gantt + dependency view', 'interface', 'viz'],
      ['histogram', 'Resource histogram', 'interface', 'viz'],
      ['fastapi', 'FastAPI', 'application', 'server'],
      ['python', 'Python', 'application', 'lang'],
      ['graph', 'Constraint graph + critical path', 'application', 'validate'],
      ['ga', 'Genetic algorithm search', 'ai', 'perception'],
      ['leveling', 'Resource leveling', 'application', 'jobs'],
      ['monte-carlo', 'Monte Carlo durations', 'ai', 'perception'],
      ['tasks', 'Task + dependency list (FS, SS, FF, SF)', 'data', 'local'],
    ],
    edges: [['graph', 'ga', 'bounds'], ['ga', 'leveling'], ['leveling', 'monte-carlo', 'risk-adjust'], ['graph', 'tasks', 'parses']],
    features: [
      'Multi-objective optimization: duration, resource levels, float',
      'Genetic algorithm explores schedule permutations',
      'Monte Carlo risk-adjusted schedule',
      'Drag to reschedule, cascading impacts in real time',
    ],
  },
  pulse: {
    nodes: [
      ['ui', 'Survey + report interface', 'interface', 'web'],
      ['python', 'Python pipeline', 'application', 'server'],
      ['distribution', 'Distribution + quotas', 'application', 'jobs'],
      ['crosstabs', 'Cross-tabs + significance', 'application', 'validate'],
      ['responses', 'Response store', 'data', 'local'],
      ['design-agent', 'Questionnaire design agent', 'ai', 'orchestrate'],
      ['coding', 'Qualitative theme coding', 'ai', 'sdk'],
      ['sentiment', 'Sentiment analysis', 'ai', 'sdk'],
      ['synthesis', 'Insight synthesis agent', 'ai', 'sdk'],
      ['export', 'Report export', 'delivery', 'host'],
    ],
    edges: [['distribution', 'responses', 'collects'], ['crosstabs', 'responses'], ['synthesis', 'export', 'writes']],
    features: [
      'Brief to questionnaire: question types, skip logic, bias checks',
      'Qualitative coding of open-text answers',
      'Sentiment analysis',
      'Insight synthesis that links every finding to its data',
    ],
  },
  'haus-nous': {
    nodes: [
      ['next', 'Next.js', 'interface', 'web'],
      ['tailwindcss', 'Tailwind CSS', 'interface', 'style'],
      ['console', 'AI console', 'interface', 'ui'],
      ['typescript', 'TypeScript', 'application', 'lang'],
      ['router', 'Problem classifier + tool router', 'application', 'validate'],
      ['marketplace', 'Tool marketplace (12+ tools)', 'application', 'jobs'],
      ['frameworks', 'Framework library (12+)', 'data', 'local'],
      ['agents', 'AI agent workflows', 'ai', 'orchestrate'],
      ['reasoning', 'Multi-step reasoning', 'ai', 'sdk'],
    ],
    edges: [['router', 'marketplace', 'recommends'], ['agents', 'frameworks', 'applies']],
    features: [
      'Classifies the problem type from plain language',
      'Recommends frameworks and tools to run',
      'Purpose-built AI workflows across strategy, operations, finance, research',
      'Consulting-grade structured outputs',
    ],
  },
};
