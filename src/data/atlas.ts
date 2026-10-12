// Knowledge Atlas graph: an accumulation of every role, engagement, build, industry and paper.
//
// Spatial model, a "time street": roles stand as towers along the X axis in chronological order,
// their engagements stack inside them as floors, builds stand in a second row next to the role
// they came from, industries float above the roles that touched them, and research sits by the
// satellite work. Positions are deterministic, so the coordinates shown are the real scene ones.
//
// To add a node: push to `extraNodes`; to add a link: push to `extraEdges`.

import { battles, type Battle } from './battles';
import { projects } from './projects';
import { papers, researchThreads } from './research';
import { curiosities } from './curiosities';
import { portrait, mediaFor, memories, type ImageAsset, type Memory } from './assets';

export type ClusterId = 'experience' | 'engagements' | 'builds' | 'industries' | 'research' | 'memories' | 'visual';
export type NodeKind = 'experience' | 'engagement' | 'project' | 'industry' | 'paper' | 'idea' | 'memory' | 'model' | 'image';
export type ModelShape = 'icosahedron' | 'torusknot' | 'lattice';
export type Vec3 = [number, number, number];

export interface AtlasCluster {
  id: ClusterId;
  code: string;
  label: string;
  description: string;
}

export interface AtlasLink {
  label: string;
  url: string;
}

export interface AtlasNode {
  id: string;
  code: string;
  cluster: ClusterId;
  kind: NodeKind;
  title: string;
  summary: string;
  body?: string[];
  href?: string;
  links?: AtlasLink[];
  model?: ModelShape;
  image?: ImageAsset;
  thumb?: string;
  /** A photo lifted into 3D at this node's position. */
  memory?: Memory;
  placeholder?: boolean;
  meta?: string;
  /** Experience this node belongs to, if any (drives the per-role overview). */
  owner?: string;
  /** Tower dimensions for experience nodes: [width, height, depth]. */
  size?: Vec3;
  year?: number;
  position: Vec3;
}

export interface AtlasEdge {
  from: string;
  to: string;
  kind: 'contains' | 'built' | 'sector' | 'informs' | 'context' | 'illustrative';
}

export const clusters: AtlasCluster[] = [
  { id: 'experience', code: 'S01', label: 'Experience', description: 'Every role, standing in time order along the street.' },
  { id: 'engagements', code: 'S02', label: 'Engagements', description: 'Projects delivered inside each role, stacked as floors.' },
  { id: 'builds', code: 'S03', label: 'Builds', description: 'Tools and platforms, next to the role they came from.' },
  { id: 'industries', code: 'S04', label: 'Industries', description: 'Sectors worked across, floating above the roles that touched them.' },
  { id: 'research', code: 'S05', label: 'Research', description: 'Papers, open research threads and curiosities.' },
  { id: 'memories', code: 'S06', label: 'Memories', description: 'Photos left where they happened, lifted from 2D into 3D.' },
  { id: 'visual', code: 'S07', label: 'Visual archive', description: 'Images and objects. Mostly placeholders for now.' },
];

// ---------------------------------------------------------------- layout helpers

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (v: number) => +v.toFixed(2);

function yearsOf(b: Battle) {
  const ys = (b.period.match(/\d{4}/g) ?? []).map(Number);
  const end = /present/i.test(b.period) ? 2026.5 : ys[1] ?? ys[0];
  return { start: ys[0], end };
}

export const timeline = [...battles].sort((a, b) => yearsOf(a).start - yearsOf(b).start);
export const YEAR0 = 2012.5;
export const YEAR1 = 2027.5;
export const STREET_LENGTH = 96;
export const xForYear = (y: number) => round(((y - YEAR0) / (YEAR1 - YEAR0) - 0.5) * STREET_LENGTH);
export const STREET_HALF_WIDTH = 4.5;

// Experience towers alternate sides of the street.
const towerSide = (i: number) => (i % 2 === 0 ? -1 : 1);

// ---------------------------------------------------------------- nodes

type Draft = Omit<AtlasNode, 'code'>;
const drafts: Draft[] = [];

const towerPos = new Map<string, { x: number; z: number; w: number; h: number; d: number }>();

timeline.forEach((b, i) => {
  const { start, end } = yearsOf(b);
  const side = towerSide(i);
  const count = b.keyProjects?.length ?? 0;
  const w = 5 + Math.min(4, (end - start) * 0.9);
  const h = 7 + count * 1.6 + (b.problemStatements?.length ?? 0) * 0.6;
  const d = 4.5;
  const x = xForYear((start + end) / 2);
  const z = side * (STREET_HALF_WIDTH + 1.5 + d / 2);
  towerPos.set(b.id, { x, z, w, h, d });
  drafts.push({
    id: `exp:${b.id}`,
    cluster: 'experience',
    kind: 'experience',
    title: b.company.split(',')[0],
    summary: b.description || `${b.role}, ${b.location}.`,
    body: b.description ? [b.description] : undefined,
    meta: `${b.role} / ${b.period.replace('–', 'to')}`,
    owner: b.id,
    size: [round(w), round(h), d],
    year: start,
    position: [x, round(h + 1.2), z],
  });

  (b.keyProjects ?? []).forEach((k, j) => {
    const r = rng(31 + i * 97 + j);
    drafts.push({
      id: `eng:${b.id}:${j}`,
      cluster: 'engagements',
      kind: 'engagement',
      title: k.industry,
      summary: k.description,
      meta: `${b.company.split(',')[0]} / engagement ${String(j + 1).padStart(2, '0')}`,
      owner: b.id,
      year: start,
      position: [round(x + (r() - 0.5) * (w - 1.4)), round(1.4 + (j + 0.5) * ((h - 1.8) / count)), round(z - side * (d / 2) + side * 0.2)],
    });
  });
});

// Builds: a second row behind the towers, near the role they came from. Independent builds
// gather at the "now" end of the street.
const ORIGIN_EXP: Record<string, string> = { bain: 'bain', aranca: 'aranca' };
const buildGroups = new Map<string, typeof projects>();
projects.forEach((p) => {
  const key = ORIGIN_EXP[p.origin] ?? 'independent';
  buildGroups.set(key, [...(buildGroups.get(key) ?? []), p]);
});
buildGroups.forEach((list, key) => {
  const anchor = towerPos.get(key);
  const baseX = anchor ? anchor.x : xForYear(2026.9);
  const side = anchor ? Math.sign(anchor.z) : 1;
  list.forEach((p, j) => {
    const row = Math.floor(j / 4);
    const col = (j % 4) - 1.5;
    const media = mediaFor(p.slug, p.name);
    drafts.push({
      id: `build:${p.slug}`,
      cluster: 'builds',
      kind: 'project',
      title: p.name,
      summary: p.calm,
      meta: `${p.number} / ${p.category}${p.github ? ' / repository' : ''}`,
      href: `/work/${p.slug}`,
      links: [
        ...(p.live ? [{ label: 'Live demo', url: p.live }] : []),
        ...(p.github ? [{ label: p.github.replace('https://', ''), url: p.github }] : []),
      ],
      thumb: media.screenshots[0]?.asset?.src,
      owner: anchor ? key : undefined,
      position: anchor
        ? [round(baseX + col * 3.4), round(2.2 + (j % 2) * 0.8), round(side * (STREET_HALF_WIDTH + 13 + row * 4.5))]
        : [round(baseX + row * 4.5), round(2.2 + (j % 2) * 0.8), round(col * 3.6)],
    });
  });
});

// Industries: one node per sector, above the mean position of the roles that worked in it.
const industryRoles = new Map<string, string[]>();
battles.forEach((b) => b.industries.forEach((ind) => industryRoles.set(ind, [...(industryRoles.get(ind) ?? []), b.id])));
let ii = 0;
industryRoles.forEach((roles, ind) => {
  const r = rng(503 + ii++);
  const xs = roles.map((id) => towerPos.get(id)!.x);
  const mx = xs.reduce((a, v) => a + v, 0) / xs.length;
  drafts.push({
    id: `ind:${ind}`,
    cluster: 'industries',
    kind: 'industry',
    title: ind,
    summary: `Worked across ${roles.length} role${roles.length > 1 ? 's' : ''}: ${roles.map((id) => battles.find((b) => b.id === id)!.company.split(',')[0]).join(', ')}.`,
    meta: `Industry / ${roles.length} role${roles.length > 1 ? 's' : ''}`,
    position: [round(mx + (r() - 0.5) * 9), round(19 + r() * 8 + roles.length * 1.5), round((r() - 0.5) * 22)],
  });
});

// Memory galleries: photos float in a staggered wall beside their role, facing the street.
const galleryCount = new Map<string, number>();
function galleryPos(role: string, j: number): Vec3 {
  const t = towerPos.get(role)!;
  const side = Math.sign(t.z);
  const col = j % 4;
  const row = Math.floor(j / 4);
  galleryCount.set(role, Math.max(galleryCount.get(role) ?? 0, j + 1));
  return [round(t.x - 12 + col * 8 + (row % 2) * 4), round(t.h + 5 + row * 6.2 + (col % 2) * 1.4), round(side * (STREET_HALF_WIDTH + 12 + (col % 2) * 2.5))];
}
export const galleryCenter = (role: string): Vec3 | null => {
  const n = galleryCount.get(role);
  if (!n) return null;
  const t = towerPos.get(role)!;
  return [t.x, t.h + 5 + Math.floor((n - 1) / 4) * 3.1, Math.sign(t.z) * (STREET_HALF_WIDTH + 13)];
};
export const galleryRows = (role: string) => Math.ceil((galleryCount.get(role) ?? 0) / 4);


// Research: papers by the satellite tower, ideas and curiosities near the builds.
papers.forEach((p, j) => {
  drafts.push({
    id: `paper:${p.id}`,
    cluster: 'research',
    kind: 'paper',
    title: p.calmTitle,
    summary: p.calm,
    body: [p.formalTitle, p.calm, p.nerd],
    meta: `${p.venue} / ${p.year}${p.leadAuthor ? ' / lead author' : ''}`,
    links: [{ label: 'Read the paper on IEEE Xplore', url: p.url }],
    thumb: `/media/snapshots/paper-${p.id}.jpg`,
    memory: memories.find((m) => m.id === `paper-${p.id}`),
    owner: 'parikshit',
    year: Number(p.year),
    position: galleryPos('parikshit', j),
  });
});
const ideaDrafts: Draft[] = [
  ...researchThreads.map<Draft>((t) => ({
    id: `idea:${t.id}`,
    cluster: 'research',
    kind: 'idea',
    title: t.title,
    summary: t.calm,
    body: [t.calm, t.nerd],
    meta: 'Open research thread',
    position: [0, 0, 0],
  })),
  ...curiosities.map<Draft>((c) => ({
    id: `curiosity:${c.id}`,
    cluster: 'research',
    kind: 'idea',
    title: c.title,
    summary: c.calm.split('\n')[0],
    body: [...c.calm.split(/\n\s*\n/), ...c.nerd.split(/\n\s*\n/)],
    meta: `Curiosity / ${c.year}`,
    position: [0, 0, 0],
  })),
];
ideaDrafts.forEach((d, j) => {
  const a = (j / ideaDrafts.length) * Math.PI * 2;
  d.position = [round(xForYear(2027.2) + 5 + Math.cos(a) * 6), round(12 + Math.sin(a * 2) * 2.5), round(Math.sin(a) * 9)];
  drafts.push(d);
});

// Visual archive
const visualBase: Vec3 = [xForYear(2013) - 10, 6, 0];
[
  { id: 'visual:portrait', kind: 'image' as const, title: 'Visual field 01: portrait', summary: 'The portrait used across the site, as a sampled visual field.', image: portrait, meta: `Image / ${portrait.width} x ${portrait.height}` },
  { id: 'visual:object-01', kind: 'model' as const, title: 'Object 01: icosahedron study', summary: 'Placeholder geometry. Replace with a real model when one is ready.', model: 'icosahedron' as const, placeholder: true, meta: '3D object / placeholder' },
  { id: 'visual:object-02', kind: 'model' as const, title: 'Object 02: knot study', summary: 'Placeholder geometry. Replace with a real model when one is ready.', model: 'torusknot' as const, placeholder: true, meta: '3D object / placeholder' },
  { id: 'visual:object-03', kind: 'model' as const, title: 'Object 03: lattice study', summary: 'Placeholder geometry. Replace with a real model when one is ready.', model: 'lattice' as const, placeholder: true, meta: '3D object / placeholder' },
].forEach((v, j) => drafts.push({ ...v, cluster: 'visual', position: [visualBase[0] - (j % 2) * 3.5, visualBase[1] + Math.floor(j / 2) * 3.5, visualBase[2] + ((j % 2) - 0.5) * 4] }));

// Photos that are not papers become memory nodes in their role's gallery.
const paperMemoryIds = new Set(papers.map((p) => `paper-${p.id}`));
const memByRole = new Map<string, number>();
memories
  .filter((m) => !paperMemoryIds.has(m.id) && towerPos.has(m.role))
  .forEach((m) => {
    const offset = m.role === 'parikshit' ? papers.length : 0;
    const j = (memByRole.get(m.role) ?? 0) + offset;
    memByRole.set(m.role, (memByRole.get(m.role) ?? 0) + 1);
    drafts.push({
      id: `mem:${m.id}`,
      cluster: 'memories',
      kind: 'memory',
      title: m.caption,
      summary: m.caption,
      meta: `Memory / ${m.year}`,
      memory: m,
      thumb: m.src,
      owner: m.role,
      year: m.year,
      links: m.url ? [{ label: 'Open source', url: m.url }] : undefined,
      position: galleryPos(m.role, j),
    });
  });

const extraNodes: Draft[] = [];

export const nodes: AtlasNode[] = [...drafts, ...extraNodes].map((n, i) => ({ ...n, code: `N-${String(i + 1).padStart(3, '0')}` }));

// ---------------------------------------------------------------- edges

const ids = new Set(nodes.map((n) => n.id));
const derived: AtlasEdge[] = [];

nodes.forEach((n) => {
  if (n.kind === 'engagement' && n.owner) derived.push({ from: `exp:${n.owner}`, to: n.id, kind: 'contains' });
  if (n.kind === 'project' && n.owner) derived.push({ from: `exp:${n.owner}`, to: n.id, kind: 'built' });
  if ((n.kind === 'paper' || n.kind === 'memory') && n.owner) derived.push({ from: `exp:${n.owner}`, to: n.id, kind: 'contains' });
});
industryRoles.forEach((roles, ind) => roles.forEach((r) => derived.push({ from: `exp:${r}`, to: `ind:${ind}`, kind: 'sector' })));

// Engagements link to the industry they belong to, when the names match.
const industryNames = [...industryRoles.keys()];
nodes
  .filter((n) => n.kind === 'engagement')
  .forEach((n) => {
    const t = n.title.toLowerCase();
    const hit = industryNames.find((ind) => t.includes(ind.toLowerCase()) || ind.toLowerCase().includes(t.split(' ')[0]));
    if (hit) derived.push({ from: n.id, to: `ind:${hit}`, kind: 'sector' });
  });

const b = (slug: string) => `build:${slug}`;
derived.push(
  { from: 'idea:multi-agent-finance', to: b('abacus'), kind: 'informs' },
  { from: 'idea:multi-agent-finance', to: b('blueprint'), kind: 'informs' },
  { from: 'idea:document-intelligence', to: b('needle'), kind: 'informs' },
  { from: 'idea:portfolio-intelligence', to: b('watchtower'), kind: 'informs' },
  { from: 'idea:career-simulation', to: b('career-os'), kind: 'informs' },
  { from: 'curiosity:agentic-ai-industries', to: b('abacus'), kind: 'context' },
  { from: 'curiosity:agentic-ai-industries', to: b('needle'), kind: 'context' },
  { from: 'curiosity:agentic-ai-industries', to: b('critical-path'), kind: 'context' },
  { from: 'curiosity:ai-strategy-platform', to: b('haus-nous'), kind: 'context' },
  { from: 'curiosity:portfolio-tracker', to: b('watchtower'), kind: 'context' },
  { from: 'curiosity:career-os', to: b('career-os'), kind: 'context' },
  { from: 'curiosity:ai-sports', to: b('hitman'), kind: 'context' },
  { from: 'paper:adcs-core', to: 'paper:tether-deploy', kind: 'context' },
  { from: 'paper:adcs-core', to: 'paper:tether-control', kind: 'context' },
  { from: 'paper:adcs-core', to: 'paper:sil-rig', kind: 'context' },
  { from: 'visual:object-01', to: 'visual:object-02', kind: 'illustrative' },
  { from: 'visual:object-02', to: 'visual:object-03', kind: 'illustrative' },
);

const extraEdges: AtlasEdge[] = [];

export const edges: AtlasEdge[] = [...derived, ...extraEdges].filter((e) => ids.has(e.from) && ids.has(e.to));

export function neighbours(id: string): AtlasNode[] {
  const linked = new Set(edges.flatMap((e) => (e.from === id ? [e.to] : e.to === id ? [e.from] : [])));
  return nodes.filter((n) => linked.has(n.id));
}

export const clusterOf = (id: ClusterId) => clusters.find((c) => c.id === id)!;

/** Everything attached to one role, for the experience overview. */
export function overviewOf(expId: string) {
  const owner = expId.replace('exp:', '');
  const battle = battles.find((x) => x.id === owner)!;
  const rel = neighbours(expId);
  return {
    battle,
    engagements: rel.filter((n) => n.kind === 'engagement'),
    builds: rel.filter((n) => n.kind === 'project'),
    industries: rel.filter((n) => n.kind === 'industry'),
    papers: rel.filter((n) => n.kind === 'paper'),
    memories: rel.filter((n) => n.kind === 'memory' || (n.kind === 'paper' && n.memory)),
  };
}

export { towerPos };
