export interface Skill {
  title: string;
  issuer: string;
  year: string;
  tag: string;
  credentialUrl?: string;
}

export interface SkillSection {
  label: string;
  skills: Skill[];
}

export const skillSections: SkillSection[] = [
  {
    label: 'AI & Machine Learning',
    skills: [
      { title: 'Agent Skills with Anthropic', issuer: 'Anthropic', year: '2026', tag: 'AI' },
      { title: 'Build RAG Applications: Get Started', issuer: '', year: '2024', tag: 'RAG' },
      { title: 'Vector Databases for RAG: An Introduction', issuer: '', year: '2024', tag: 'RAG' },
      { title: 'AI Engineering', issuer: 'IBM', year: '2024', tag: 'AI' },
    ],
  },
  {
    label: 'Strategy & Consulting',
    skills: [
      { title: 'Business & Financial Modeling Specialization', issuer: 'Wharton School', year: '', tag: 'finance' },
      { title: 'Business Strategy: Competitive Advantage', issuer: 'Wharton School', year: '', tag: 'strategy' },
    ],
  },
  {
    label: 'Technology & Engineering',
    skills: [
      { title: "CS50's Introduction to Programming with Python", issuer: 'Harvard University', year: '', tag: 'python' },
      { title: 'Introduction to Git and GitHub', issuer: 'Google', year: '2025', tag: 'git' },
    ],
  },
];

export const technicalSkills = [
  'Python', 'LangChain', 'Streamlit', 'TypeScript', 'Next.js', 'React',
  'FastAPI', 'D3.js', 'SQL', 'GitHub', 'RAG systems', 'Vector databases',
  'Multi-agent LLMs', 'Knowledge graphs', 'Agentic AI', 'AI ADKs',
  'Claude Code', 'Advanced Excel', 'Financial modeling',
];

// Grouped for the compact home module
export const skillGroups: { label: string; skills: string[] }[] = [
  {
    label: 'AI',
    skills: ['Python', 'LangChain', 'Streamlit', 'RAG systems', 'Vector databases', 'Multi-agent LLMs', 'Agentic AI', 'AI ADKs', 'Claude Code', 'Knowledge graphs'],
  },
  {
    label: 'Engineering',
    skills: ['TypeScript', 'Next.js', 'React', 'FastAPI', 'D3.js', 'SQL', 'GitHub'],
  },
  {
    label: 'Strategy & Finance',
    skills: ['Financial modeling', 'Advanced Excel'],
  },
];

// Map technical skills to related build IDs
export const skillToBuildMap: Record<string, string[]> = {
  'Python': ['financial-modelling', 'solar-cost', 'capital-allocation', 'rag-engine', 'workplan', 'survey', 'solar-benchmark', 'proposal', 'parents-health'],
  'LangChain': ['financial-modelling', 'capital-allocation', 'rag-engine', 'workplan', 'proposal'],
  'Streamlit': ['financial-modelling', 'workplan'],
  'TypeScript': ['haus-nous'],
  'Next.js': ['haus-nous'],
  'React': ['scheduling', 'haus-nous'],
  'FastAPI': ['scheduling'],
  'D3.js': ['scheduling'],
  'RAG systems': ['rag-engine'],
  'Vector databases': ['rag-engine'],
  'Multi-agent LLMs': ['financial-modelling', 'solar-cost', 'workplan', 'survey'],
  'Agentic AI': ['financial-modelling', 'capital-allocation', 'haus-nous'],
  'AI ADKs': ['haus-nous'],
  'Claude Code': ['haus-nous'],
  'Financial modeling': ['financial-modelling', 'solar-cost'],
  'Advanced Excel': ['financial-modelling', 'solar-cost'],
  'SQL': ['capital-allocation'],
  'GitHub': ['financial-modelling', 'solar-cost', 'scheduling', 'capital-allocation', 'rag-engine', 'workplan', 'haus-nous', 'survey'],
  'Knowledge graphs': ['rag-engine'],
};

export const domainSkills = [
  'AI Agents', 'Vector Databases', 'Retrieval-Augmented Generation (RAG)',
  'Financial Modeling', 'Go-to-Market Strategy', 'Market Research',
  'Business Development', 'Data Analysis', 'Strategic Initiatives',
  'Commercial', 'Customer Insight', 'Fundraising', 'Key Performance Indicators',
];
