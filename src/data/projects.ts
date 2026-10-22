import { builds, type Build } from './builds';

interface ProjectMeta {
  slug: string;
  /** Short descriptive category, drawn from the build's own description. */
  category: string;
  /** Order in the Selected Work sequence on the home page. */
  featured?: number;
}

const meta: Record<string, ProjectMeta> = {
  'financial-modelling': { slug: 'abacus', category: 'Financial modeling' },
  'solar-cost': { slug: 'groundwork', category: 'Investment modeling' },
  scheduling: { slug: 'digital-twin', category: 'Capital project digital twin', featured: 1 },
  'capital-allocation': { slug: 'watchtower', category: 'Portfolio monitoring' },
  'rag-engine': { slug: 'needle', category: 'Document intelligence' },
  workplan: { slug: 'blueprint', category: 'Planning' },
  'haus-nous': { slug: 'haus-nous', category: 'Strategy platform', featured: 4 },
  survey: { slug: 'pulse', category: 'Research automation', featured: 3 },
  'solar-benchmark': { slug: 'yardstick', category: 'Benchmarking' },
  proposal: { slug: 'first-draft', category: 'Document generation' },
  'parents-health': { slug: 'maate', category: 'Preventive health' },
  hitman: { slug: 'hitman', category: 'Sport and prediction' },
  'career-os': { slug: 'career-os', category: 'Careers and simulation' },
  'bhoomi-setu': { slug: 'bhoomi-setu', category: 'Land records and evidence' },
  'momentum-os': { slug: 'momentum-os', category: 'Personal productivity' },
  pit: { slug: 'pit', category: 'Capital projects research' },
  cartograph: { slug: 'cartograph', category: 'Process transformation', featured: 2 },
};

export interface Project extends Build {
  slug: string;
  number: string;
  category: string;
  featured?: number;
}

export const projects: Project[] = builds.map((b, i) => ({
  ...b,
  ...meta[b.id],
  number: String(i + 1).padStart(2, '0'),
}));

export const featuredProjects = projects
  .filter((p) => p.featured)
  .sort((a, b) => (a.featured ?? 0) - (b.featured ?? 0));

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

export function relatedProjects(p: Project, count = 3): Project[] {
  const tags = new Set(p.tags.map((t) => t.toLowerCase()));
  return projects
    .filter((o) => o.slug !== p.slug)
    .map((o) => ({ o, score: o.tags.filter((t) => tags.has(t.toLowerCase())).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((x) => x.o);
}

/** Strips the backtick system label from nerd copy: "`label`. Rest" -> { label, text }. */
export function splitSystemLabel(nerd: string): { label?: string; text: string } {
  const m = nerd.match(/^`([^`]+)`\.\s*([\s\S]*)$/);
  return m ? { label: m[1], text: m[2] } : { text: nerd };
}

export interface ProcessStep {
  label: string;
  text: string;
}

/** Splits a build's process write-up into labelled steps plus free notes. */
export function parseProcess(process?: string): { intro?: string; steps: ProcessStep[]; notes: string[] } {
  if (!process) return { steps: [], notes: [] };
  const blocks = process.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const steps: ProcessStep[] = [];
  const notes: string[] = [];
  let intro: string | undefined;

  blocks.forEach((block, i) => {
    const m = block.match(/^(?:\d+\.\s*)?([A-Z][A-Z0-9 +&/().-]{2,}?)(?::|\n)\s*([\s\S]*)$/);
    if (m && m[1] === m[1].toUpperCase()) {
      steps.push({ label: m[1].trim(), text: m[2].trim() });
    } else if (i === 0 && block.endsWith(':')) {
      intro = block.replace(/:$/, '');
    } else {
      notes.push(block);
    }
  });
  return { intro, steps, notes };
}
