// The hero brain: a map of what I know, built from the site's own data plus the mental models.
// Left hemisphere: logic and work, the things learned professionally (roles, industries,
// methods, stack, builds, and the analytical model families). Right hemisphere: curiosity and
// craft, the things explored beyond work (curiosities, research threads, creative work, and the
// lenses from nature, art and human nature).
//
// Links are real relationships from the data (a role worked in an industry, a build uses a
// skill, a curiosity led to a build). Links inside a model family only group the family.

import { battles } from './battles';
import { builds } from './builds';
import { projects } from './projects';
import { curiosities } from './curiosities';
import { researchThreads } from './research';
import { technicalSkills, skillToBuildMap } from './skills';
import { modelFamilies } from './mentalModels';
import { mediaFor, memories } from './assets';

export type Hemisphere = 'left' | 'right';

export interface BrainRegion {
  id: string;
  label: string;
  side: Hemisphere;
  /** Letter used in node codes, e.g. R104. */
  letter: string;
}

export interface BrainNode {
  id: string;
  code: string;
  region: string;
  side: Hemisphere;
  label: string;
  line?: string;
  /** Optional image for the readout: a photo, a build capture. */
  image?: string;
  href?: string;
  /** Industry name, for a drawn industry sheet in the readout. */
  sheet?: string;
}

export interface BrainLink {
  a: string;
  b: string;
  /** 'fact' links come from the data; 'family' links only group a cluster. */
  kind: 'fact' | 'family';
}

export const brainRegions: BrainRegion[] = [
  { id: 'roles', label: 'Roles', side: 'left', letter: 'R' },
  { id: 'industries', label: 'Industries', side: 'left', letter: 'I' },
  { id: 'methods', label: 'Methods and problems', side: 'left', letter: 'M' },
  { id: 'stack', label: 'Stack', side: 'left', letter: 'S' },
  { id: 'builds', label: 'AI builds', side: 'left', letter: 'B' },
  ...modelFamilies
    .filter((f) => f.side === 'left')
    .map((f, i) => ({ id: f.id, label: f.label, side: 'left' as const, letter: ['T', 'Y', 'Q', 'E', 'W'][i] })),
  { id: 'curiosity', label: 'Curiosities and threads', side: 'right', letter: 'C' },
  { id: 'craft', label: 'Craft and story', side: 'right', letter: 'K' },
  ...modelFamilies
    .filter((f) => f.side === 'right')
    .map((f, i) => ({ id: f.id, label: f.label, side: 'right' as const, letter: ['N', 'A', 'J'][i] })),
];

const regionOf = (id: string) => brainRegions.find((r) => r.id === id)!;
const nodes: BrainNode[] = [];
const links: BrainLink[] = [];
const count = new Map<string, number>();
function add(region: string, id: string, label: string, extra: Partial<BrainNode> = {}) {
  const r = regionOf(region);
  const n = count.get(region) ?? 0;
  count.set(region, n + 1);
  nodes.push({ id, code: `${r.letter}${100 + n}`, region, side: r.side, label, ...extra });
  return id;
}
const link = (a: string, b: string, kind: BrainLink['kind'] = 'fact') => {
  if (a !== b && nodes.some((n) => n.id === a) && nodes.some((n) => n.id === b)) links.push({ a, b, kind });
};

// ---------------------------------------------------------------- left: work and logic
battles.forEach((b) => {
  const photo = memories.find((m) => m.role === b.id && !m.id.startsWith('paper-'));
  add('roles', `role:${b.id}`, b.company.split(',')[0], { line: `${b.role}. ${b.period.replace('–', 'to')}.`, image: photo?.src, href: '#experience' });
});

const industries = [...new Set(battles.flatMap((b) => [...b.industries, ...(b.keyProjects ?? []).map((k) => k.industry)]))];
industries.forEach((i) => {
  const roles = battles.filter((b) => b.industries.includes(i) || b.keyProjects?.some((k) => k.industry === i));
  add('industries', `ind:${i}`, i, { line: `Worked in at ${roles.map((b) => b.company.split(',')[0]).join(', ')}.`, sheet: i });
  roles.forEach((b) => link(`role:${b.id}`, `ind:${i}`));
});

const methods = new Map<string, string[]>();
battles.forEach((b) => [...(b.problemStatements ?? []), ...(b.frameworks ?? []), ...(b.keyProjects ?? []).map((k) => k.problem ?? '')].filter(Boolean).forEach((m) => methods.set(m, [...(methods.get(m) ?? []), b.id])));
[...methods.entries()].forEach(([m, roles]) => {
  add('methods', `met:${m}`, m, { line: `Used at ${[...new Set(roles)].map((r) => battles.find((b) => b.id === r)!.company.split(',')[0]).join(', ')}.` });
  [...new Set(roles)].forEach((r) => link(`role:${r}`, `met:${m}`));
});

technicalSkills.forEach((s) => add('stack', `sk:${s}`, s));

projects
  .filter((p) => p.slug !== 'career-os')
  .forEach((p) => {
    const shot = mediaFor(p.slug, p.name).screenshots[0]?.asset?.src;
    add('builds', `bd:${p.slug}`, p.name, { line: p.punchline, href: `/work/${p.slug}/`, image: shot });
    if (p.origin !== 'independent') link(`role:${p.origin}`, `bd:${p.slug}`);
    p.tags.forEach((t) => technicalSkills.filter((s) => s.toLowerCase() === t.toLowerCase()).forEach((s) => link(`sk:${s}`, `bd:${p.slug}`)));
  });
Object.entries(skillToBuildMap).forEach(([s, ids]) =>
  ids.forEach((id) => {
    const p = projects.find((x) => x.id === id);
    if (p) link(`sk:${s}`, `bd:${p.slug}`);
  }),
);

modelFamilies.forEach((f) => {
  f.models.forEach((m, i) => {
    add(f.id, `mm:${f.id}:${i}`, m.name, { line: m.line });
    if (i > 0) link(`mm:${f.id}:${i - 1}`, `mm:${f.id}:${i}`, 'family');
    if (i > 2 && i % 3 === 0) link(`mm:${f.id}:0`, `mm:${f.id}:${i}`, 'family');
  });
});

// ---------------------------------------------------------------- right: curiosity and craft
const curiosityBuilds: Record<string, string[]> = {
  'agentic-ai-industries': ['abacus', 'needle', 'blueprint', 'digital-twin', 'watchtower'],
  'ai-strategy-platform': ['haus-nous'],
  'portfolio-tracker': ['watchtower'],
  'career-os': ['career-os'],
  'ai-sports': ['hitman'],
};
curiosities.forEach((c) => {
  add('curiosity', `cur:${c.id}`, c.title, { line: c.calm.split('\n')[0], href: '#curiosities' });
  (curiosityBuilds[c.id] ?? []).forEach((s) => link(`cur:${c.id}`, `bd:${s}`));
});
researchThreads.forEach((t) => add('curiosity', `thr:${t.id}`, t.title, { line: t.calm.split('\n')[0] }));
link('thr:multi-agent-finance', 'bd:abacus');
link('thr:document-intelligence', 'bd:needle');
link('thr:portfolio-intelligence', 'bd:watchtower');
link('thr:career-simulation', 'cur:career-os');

const madcue = battles.find((b) => b.id === 'madcue');
[
  ['story', 'Stories can change the world', 'The belief Madcue was built on.'],
  ['brand', 'Brand identity and visual language', 'Built from zero for Madcue.'],
  ['voice', 'Editorial voice', 'Madcue sections: In & Out, Food for Thought, Fiction, In The House.'],
  ['creators', 'Creator communities', '150+ independent creators.'],
  ['interviews', 'Interviews with outliers', 'Gavin Aung Than, Abhilash Tomy, Tashi Malik.'],
  ['satellite', 'Satellites and control', 'Attitude control for a nano-satellite at 28,800 km/hr.'],
  ['cricket', 'Cricket, read ball by ball', 'The idea behind Hitman.'],
  ['care', 'Caring from a distance', 'The reason behind Maate.'],
  ['systems-not', 'Systems, not motivation', 'The tagline of Momentum OS.'],
].forEach(([id, label, line]) => add('craft', `cr:${id}`, label, { line }));
if (madcue) ['story', 'brand', 'voice', 'creators', 'interviews'].forEach((k) => link('role:madcue', `cr:${k}`));
link('role:parikshit', 'cr:satellite');
link('cr:cricket', 'bd:hitman');
link('cr:care', `bd:${projects.find((p) => p.id === 'parents-health')?.slug ?? 'maate'}`);
link('cr:systems-not', 'bd:momentum-os');

export const brainNodes = nodes;
export const brainLinks = links;
export const buildCount = builds.length;
