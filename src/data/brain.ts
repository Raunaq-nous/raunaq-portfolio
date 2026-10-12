// The hero brain: what I know, built from the site's own data. Left hemisphere is the conscious,
// learned side; right is the subconscious, intuitive side. `active` marks what I am thinking about
// now (open research threads, current work); the rest is dormant but still in there.

import { battles } from './battles';
import { projects } from './projects';
import { researchThreads } from './research';
import { skillToBuildMap } from './skills';

export type Hemisphere = 'left' | 'right';

export interface BrainLabel {
  id: string;
  text: string;
  side: Hemisphere;
  kind: 'skill' | 'method' | 'industry' | 'credential' | 'thread' | 'instinct' | 'craft';
  active: boolean;
  /** Build slugs this label connects to. */
  builds: string[];
}

const slugOf = (id: string) => projects.find((p) => p.id === id)?.slug;
const skillBuilds = (k: string) => (skillToBuildMap[k] ?? []).map(slugOf).filter((s): s is string => !!s);
const industries = [...new Set(battles.flatMap((b) => b.industries))];

export const brainLabels: BrainLabel[] = [
  // Left: conscious, analytical, learned
  { id: 'fin', text: 'Financial modeling', side: 'left', kind: 'method', active: true, builds: skillBuilds('Financial modeling') },
  { id: 'cap', text: 'Capital allocation', side: 'left', kind: 'method', active: true, builds: ['watchtower', 'abacus'] },
  { id: 'gtm', text: 'GTM and pricing', side: 'left', kind: 'method', active: false, builds: ['first-draft'] },
  { id: 'entry', text: 'Market entry', side: 'left', kind: 'method', active: false, builds: [] },
  { id: 'ma', text: 'M&A roadmaps', side: 'left', kind: 'method', active: false, builds: [] },
  { id: 'py', text: 'Python', side: 'left', kind: 'skill', active: true, builds: skillBuilds('Python') },
  { id: 'lc', text: 'LangChain', side: 'left', kind: 'skill', active: true, builds: skillBuilds('LangChain') },
  { id: 'rag', text: 'RAG systems', side: 'left', kind: 'skill', active: true, builds: skillBuilds('RAG systems') },
  { id: 'agents', text: 'Multi-agent LLMs', side: 'left', kind: 'skill', active: true, builds: [...skillBuilds('Multi-agent LLMs'), 'cartograph'] },
  { id: 'ts', text: 'TypeScript / Next.js', side: 'left', kind: 'skill', active: true, builds: ['haus-nous', 'bhoomi-setu', 'momentum-os', 'hitman', 'career-os', 'kavach'] },
  { id: 'verify', text: 'Deterministic verification', side: 'left', kind: 'method', active: true, builds: ['bhoomi-setu', 'cartograph'] },
  { id: 'adcs', text: 'Control systems / ADCS', side: 'left', kind: 'skill', active: false, builds: [] },
  { id: 'quat', text: 'Quaternion dynamics', side: 'left', kind: 'skill', active: false, builds: [] },
  { id: 'wharton', text: 'Wharton: financial modeling', side: 'left', kind: 'credential', active: false, builds: [] },
  { id: 'cs50', text: 'Harvard CS50 Python', side: 'left', kind: 'credential', active: false, builds: [] },
  { id: 'anthropic', text: 'Anthropic: agent skills', side: 'left', kind: 'credential', active: true, builds: [] },
  ...industries.slice(0, 6).map<BrainLabel>((i) => ({ id: `ind-${i}`, text: i, side: 'left', kind: 'industry', active: ['Oil & Gas', 'Solar', 'Nuclear', 'Mining', 'Infrastructure'].includes(i), builds: [] })),

  // Right: subconscious, intuitive, creative
  { id: 'story', text: 'Stories change the world', side: 'right', kind: 'instinct', active: false, builds: [] },
  { id: 'brand', text: 'Brand and visual language', side: 'right', kind: 'craft', active: false, builds: [] },
  { id: 'editorial', text: 'Editorial voice', side: 'right', kind: 'craft', active: false, builds: [] },
  { id: 'community', text: 'Creator communities', side: 'right', kind: 'craft', active: false, builds: [] },
  { id: 'first', text: 'First principles', side: 'right', kind: 'instinct', active: true, builds: [] },
  { id: 'question', text: 'Find the question first', side: 'right', kind: 'instinct', active: true, builds: [] },
  { id: 'tangled', text: 'Untangling messy problems', side: 'right', kind: 'instinct', active: true, builds: [] },
  { id: 'systems', text: 'Systems over motivation', side: 'right', kind: 'instinct', active: true, builds: ['momentum-os'] },
  { id: 'evidence', text: 'Evidence before answers', side: 'right', kind: 'instinct', active: true, builds: ['bhoomi-setu', 'cartograph', 'needle'] },
  { id: 'cricket', text: 'Cricket, read ball by ball', side: 'right', kind: 'craft', active: true, builds: ['hitman'] },
  { id: 'care', text: 'Caring from a distance', side: 'right', kind: 'instinct', active: true, builds: ['kavach'] },
  { id: 'years', text: 'Experience is not years', side: 'right', kind: 'thread', active: true, builds: ['career-os'] },
  ...researchThreads.map<BrainLabel>((t) => ({ id: `th-${t.id}`, text: t.title, side: 'right', kind: 'thread', active: true, builds: [] })),
];

// Research threads connect to the builds that test them.
const threadBuilds: Record<string, string[]> = {
  'th-multi-agent-finance': ['abacus', 'blueprint'],
  'th-document-intelligence': ['needle'],
  'th-portfolio-intelligence': ['watchtower'],
  'th-career-simulation': ['career-os'],
};
brainLabels.forEach((l) => {
  if (threadBuilds[l.id]) l.builds = threadBuilds[l.id];
});

export const buildName = (slug: string) => projects.find((p) => p.slug === slug)?.name ?? slug;
