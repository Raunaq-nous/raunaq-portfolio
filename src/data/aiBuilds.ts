// The AI builds vault: every build except Career OS (which lives with the curiosities), split
// into two wings. Work builds came out of consulting problems or professional ones; fun builds
// are the ones made for the joy of it.
import { projects, type Project } from './projects';
import { mediaFor } from './assets';

export type Wing = 'work' | 'fun';

export interface VaultBuild {
  project: Project;
  wing: Wing;
  code: string;
  /** Interface captures, when there are any. */
  shots: { src: string; alt: string; width: number; height: number }[];
}

const FUN = new Set(['hitman', 'momentum-os', 'maate']);
const ORDER = ['digital-twin', 'cartograph', 'pulse', 'haus-nous', 'abacus', 'needle', 'watchtower', 'blueprint', 'groundwork', 'yardstick', 'first-draft', 'bhoomi-setu', 'hitman', 'momentum-os', 'maate'];

export const vaultBuilds: VaultBuild[] = ORDER.map((slug) => projects.find((p) => p.slug === slug))
  .filter((p): p is Project => !!p)
  .map((p, i) => {
    const wing: Wing = FUN.has(p.slug) ? 'fun' : 'work';
    const shots = mediaFor(p.slug, p.name)
      .screenshots.map((s) => s.asset)
      .filter((a): a is NonNullable<typeof a> => !!a)
      .map((a) => ({ src: a.src, alt: a.alt, width: a.width, height: a.height }));
    return { project: p, wing, code: `${wing === 'fun' ? 'F' : 'B'}${String(i + 1).padStart(2, '0')}`, shots };
  });

export const wings: { id: Wing; label: string; blurb: string }[] = [
  { id: 'work', label: 'AI builds', blurb: 'Built because a problem at work needed a tool that did not exist.' },
  { id: 'fun', label: 'Fun builds', blurb: 'Built for the joy of it: cricket, routines, family.' },
];
