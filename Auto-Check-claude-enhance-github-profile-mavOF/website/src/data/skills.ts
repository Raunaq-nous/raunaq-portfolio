export interface Skill {
  title: string;
  issuer: string;
  year: string;
  tag: string;
  credential?: string;
}

export interface SkillSection {
  label: string;
  skills: Skill[];
}

export const skillSections: SkillSection[] = [
  {
    label: 'AI & Machine Learning',
    skills: [
      { title: 'Agent Skills with Anthropic', issuer: 'Anthropic', year: '2026', tag: 'AI', credential: 'Show credential' },
      { title: 'Agentic AI', issuer: 'Certified', year: '2025', tag: 'AI' },
      { title: 'Build RAG Applications: Get Started', issuer: 'LinkedIn Learning', year: '2024', tag: 'RAG' },
      { title: 'Vector Databases for RAG: An Introduction', issuer: 'LinkedIn Learning', year: '2024', tag: 'RAG' },
      { title: 'Introduction to Large Language Models', issuer: 'Certified', year: '2024', tag: 'LLMs' },
      { title: 'AI Engineering', issuer: 'IBM', year: '2024', tag: 'AI' },
    ],
  },
  {
    label: 'Strategy & Consulting',
    skills: [
      { title: 'Business & Financial Modeling Specialization', issuer: 'Wharton School', year: '', tag: 'finance' },
      { title: 'Business Strategy: Competitive Advantage', issuer: 'Wharton School', year: '', tag: 'strategy' },
      { title: 'Performance Improvement Projects for Management Consultants', issuer: 'Certified', year: '2024', tag: 'consulting' },
      { title: 'Venture Capital Analyst Fundamentals', issuer: 'Certified', year: '', tag: 'VC' },
    ],
  },
  {
    label: 'Technology & Engineering',
    skills: [
      { title: "CS50's Introduction to Programming with Python", issuer: 'Harvard University', year: '', tag: 'python' },
      { title: 'Introduction to Git and GitHub', issuer: 'Google', year: '2025', tag: 'git' },
      { title: 'Introduction to IT & Cybersecurity', issuer: 'Certified', year: '2024', tag: 'IT' },
      { title: 'Tableau Business Intelligence Analyst', issuer: 'Tableau', year: '', tag: 'data' },
    ],
  },
];

export const technicalSkills = [
  'Python', 'LangChain', 'Streamlit', 'TypeScript', 'Next.js', 'React',
  'FastAPI', 'D3.js', 'SQL', 'GitHub', 'RAG systems', 'Vector databases',
  'Multi-agent LLMs', 'Knowledge graphs', 'Agentic AI', 'AI ADKs',
  'Claude Code', 'Advanced Excel', 'Financial modeling', 'Tableau',
];

export const linkedinSkills = [
  'AI Agents', 'Vector Databases', 'Retrieval-Augmented Generation (RAG)',
  'Financial Modeling', 'Go-to-Market Strategy', 'Market Research',
  'Business Development', 'Data Analysis', 'Strategic Initiatives',
  'Commercial', 'Customer Insight', 'Fundraising', 'Key Performance Indicators',
];
