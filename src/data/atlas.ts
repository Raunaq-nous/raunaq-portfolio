// Knowledge Atlas graph. Content is derived from the existing data files; positions are
// deterministic so the coordinates shown in the interface are the real scene coordinates.
//
// To add a node: push to `extraNodes` (or extend a source file) and add edges in `extraEdges`.

import { projects } from './projects';
import { papers, researchThreads } from './research';
import { curiosities } from './curiosities';
import { portrait, type ImageAsset } from './assets';

export type ClusterId = 'projects' | 'code' | 'ideas' | 'visual';
export type NodeKind = 'project' | 'code' | 'idea' | 'paper' | 'model' | 'image';
export type ModelShape = 'icosahedron' | 'torusknot' | 'lattice';

export type Vec3 = [number, number, number];

export interface AtlasCluster {
  id: ClusterId;
  code: string;
  label: string;
  description: string;
  center: Vec3;
  radius: number;
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
  /** Internal route opened by the primary action. */
  href?: string;
  links?: AtlasLink[];
  model?: ModelShape;
  image?: ImageAsset;
  placeholder?: boolean;
  meta?: string;
  position: Vec3;
}

export interface AtlasEdge {
  from: string;
  to: string;
  kind: 'source' | 'informs' | 'context' | 'illustrative';
}

export const clusters: AtlasCluster[] = [
  {
    id: 'projects',
    code: 'C01',
    label: 'Products & Projects',
    description: 'The tools and platforms I have built.',
    center: [-15, 2.5, -2],
    radius: 7,
  },
  {
    id: 'code',
    code: 'C02',
    label: 'Code & Systems',
    description: 'Public repositories and the architecture behind each build.',
    center: [14, 6, -7],
    radius: 5.5,
  },
  {
    id: 'ideas',
    code: 'C03',
    label: 'Ideas & Research',
    description: 'Open research threads, curiosities and published papers.',
    center: [3, -8, 9],
    radius: 6.5,
  },
  {
    id: 'visual',
    code: 'C04',
    label: 'Visual Archive',
    description: 'Images, objects and visual studies. Mostly placeholders for now.',
    center: [-3, 12, 13],
    radius: 4,
  },
];

// Seeded RNG so layouts are stable across builds.
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

function layout(cluster: AtlasCluster, count: number, seed: number): Vec3[] {
  const r = rng(seed);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const out: Vec3[] = [];
  for (let i = 0; i < count; i++) {
    const y = count === 1 ? 0 : 1 - (i / (count - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const theta = golden * i + r() * 0.6;
    const dist = cluster.radius * (0.55 + r() * 0.45);
    out.push([
      +(cluster.center[0] + Math.cos(theta) * rad * dist).toFixed(2),
      +(cluster.center[1] + y * dist * 0.7).toFixed(2),
      +(cluster.center[2] + Math.sin(theta) * rad * dist).toFixed(2),
    ]);
  }
  return out;
}

const byCluster = (id: ClusterId) => clusters.find((c) => c.id === id)!;

type Draft = Omit<AtlasNode, 'position' | 'code'>;

const projectDrafts: Draft[] = projects.map((p) => ({
  id: `project:${p.slug}`,
  cluster: 'projects',
  kind: 'project',
  title: p.name,
  summary: p.calm,
  meta: `${p.number} / ${p.category}`,
  href: `/work/${p.slug}`,
}));

const codeDrafts: Draft[] = projects
  .filter((p) => p.github)
  .map((p) => {
    const repo = p.github!.split('/').pop()!;
    const nerd = p.nerd.replace(/`/g, '');
    return {
      id: `code:${p.slug}`,
      cluster: 'code',
      kind: 'code',
      title: repo,
      summary: nerd,
      body: p.process ? p.process.split(/\n\s*\n/).map((b) => b.trim()) : [nerd],
      meta: `Repository / ${p.name}`,
      links: [{ label: `github.com/Raunaq-nous/${repo}`, url: p.github! }],
      href: `/work/${p.slug}`,
    };
  });

const ideaDrafts: Draft[] = [
  ...researchThreads.map<Draft>((t) => ({
    id: `idea:${t.id}`,
    cluster: 'ideas',
    kind: 'idea',
    title: t.title,
    summary: t.calm,
    body: [t.calm, t.nerd],
    meta: 'Open research thread',
  })),
  ...curiosities.map<Draft>((c) => ({
    id: `curiosity:${c.id}`,
    cluster: 'ideas',
    kind: 'idea',
    title: c.title,
    summary: c.calm.split('\n')[0],
    body: [...c.calm.split(/\n\s*\n/), ...c.nerd.split(/\n\s*\n/)],
    meta: `Curiosity / ${c.year}`,
  })),
  ...papers.map<Draft>((p) => ({
    id: `paper:${p.id}`,
    cluster: 'ideas',
    kind: 'paper',
    title: p.calmTitle,
    summary: p.calm,
    body: [p.formalTitle, p.calm, p.nerd],
    meta: `${p.venue} / ${p.year}${p.leadAuthor ? ' / Lead author' : ''}`,
    links: [{ label: 'Read the paper on IEEE Xplore', url: p.url }],
  })),
];

const visualDrafts: Draft[] = [
  {
    id: 'visual:portrait',
    cluster: 'visual',
    kind: 'image',
    title: 'Visual field 01: portrait',
    summary: 'The portrait used across the site, as a sampled visual field.',
    image: portrait,
    meta: `Image / ${portrait.width} x ${portrait.height}`,
  },
  {
    id: 'visual:object-01',
    cluster: 'visual',
    kind: 'model',
    title: 'Object 01: icosahedron study',
    summary: 'Placeholder geometry. Replace with a real model when one is ready.',
    model: 'icosahedron',
    placeholder: true,
    meta: '3D object / placeholder',
  },
  {
    id: 'visual:object-02',
    cluster: 'visual',
    kind: 'model',
    title: 'Object 02: knot study',
    summary: 'Placeholder geometry. Replace with a real model when one is ready.',
    model: 'torusknot',
    placeholder: true,
    meta: '3D object / placeholder',
  },
  {
    id: 'visual:object-03',
    cluster: 'visual',
    kind: 'model',
    title: 'Object 03: lattice study',
    summary: 'Placeholder geometry. Replace with a real model when one is ready.',
    model: 'lattice',
    placeholder: true,
    meta: '3D object / placeholder',
  },
];

const extraNodes: Draft[] = [];

const drafts = [...projectDrafts, ...codeDrafts, ...ideaDrafts, ...visualDrafts, ...extraNodes];

export const nodes: AtlasNode[] = (() => {
  const out: AtlasNode[] = [];
  clusters.forEach((c, ci) => {
    const inCluster = drafts.filter((d) => d.cluster === c.id);
    const pos = layout(byCluster(c.id), inCluster.length, 101 + ci * 17);
    inCluster.forEach((d, i) => out.push({ ...d, position: pos[i], code: '' }));
  });
  return out.map((n, i) => ({ ...n, code: `N-${String(i + 1).padStart(3, '0')}` }));
})();

const p = (slug: string) => `project:${slug}`;

const derivedEdges: AtlasEdge[] = [
  // Each repository is the source of its project.
  ...codeDrafts.map((c) => ({ from: c.id, to: c.id.replace('code:', 'project:'), kind: 'source' as const })),

  // Research threads and the builds that test them.
  { from: 'idea:multi-agent-finance', to: p('abacus'), kind: 'informs' },
  { from: 'idea:multi-agent-finance', to: p('blueprint'), kind: 'informs' },
  { from: 'idea:document-intelligence', to: p('needle'), kind: 'informs' },
  { from: 'idea:portfolio-intelligence', to: p('watchtower'), kind: 'informs' },
  { from: 'idea:career-simulation', to: p('career-os'), kind: 'informs' },

  // Curiosities and the projects they describe.
  { from: 'curiosity:agentic-ai-industries', to: p('abacus'), kind: 'context' },
  { from: 'curiosity:agentic-ai-industries', to: p('needle'), kind: 'context' },
  { from: 'curiosity:agentic-ai-industries', to: p('blueprint'), kind: 'context' },
  { from: 'curiosity:agentic-ai-industries', to: p('critical-path'), kind: 'context' },
  { from: 'curiosity:agentic-ai-industries', to: p('watchtower'), kind: 'context' },
  { from: 'curiosity:ai-strategy-platform', to: p('haus-nous'), kind: 'context' },
  { from: 'curiosity:portfolio-tracker', to: p('watchtower'), kind: 'context' },
  { from: 'curiosity:career-os', to: p('career-os'), kind: 'context' },
  { from: 'curiosity:ai-sports', to: p('hitman'), kind: 'context' },
  { from: 'curiosity:career-os', to: 'idea:career-simulation', kind: 'context' },
  { from: 'curiosity:portfolio-tracker', to: 'idea:portfolio-intelligence', kind: 'context' },

  // The Parikshit papers share one satellite.
  { from: 'paper:adcs-core', to: 'paper:tether-deploy', kind: 'context' },
  { from: 'paper:adcs-core', to: 'paper:tether-control', kind: 'context' },
  { from: 'paper:tether-deploy', to: 'paper:tether-control', kind: 'context' },
  { from: 'paper:adcs-core', to: 'paper:sil-rig', kind: 'context' },

  // Placeholder visual studies: illustrative links only.
  { from: 'visual:object-01', to: 'visual:object-02', kind: 'illustrative' },
  { from: 'visual:object-02', to: 'visual:object-03', kind: 'illustrative' },
];

const extraEdges: AtlasEdge[] = [];

const ids = new Set(nodes.map((n) => n.id));
export const edges: AtlasEdge[] = [...derivedEdges, ...extraEdges].filter((e) => ids.has(e.from) && ids.has(e.to));

export function neighbours(id: string): AtlasNode[] {
  const linked = edges.flatMap((e) => (e.from === id ? [e.to] : e.to === id ? [e.from] : []));
  return nodes.filter((n) => linked.includes(n.id));
}

export const clusterOf = (id: ClusterId) => byCluster(id);
