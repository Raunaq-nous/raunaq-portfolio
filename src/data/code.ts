// Shared shape of public/code/manifest.json, written by the clarity kit (tools/clarity).
// Kept outside the client component so server pages (the /code index) can use it too.
export interface CodeEntry {
  /** URL segment of the explorer, from the repository name, for example "survey-tool". */
  slug: string;
  /** The repository name on GitHub, shown as the explorer's title. */
  name: string;
  /** owner/name on GitHub. */
  repo: string;
  /** Slug of the matching project page on this site, if there is one. */
  project?: string | null;
  visibility: 'public' | 'private';
  summary: string;
  files: number;
  explained: number;
  sections: number;
  lines: number;
  stale_files?: number;
  readiness: string;
  mode: 'full' | 'notes';
  map: boolean;
  built_at?: string;
}

export const VERDICT: Record<string, string> = {
  ready: 'Ready',
  'needs-work': 'Needs work',
  'not-ready': 'Not ready',
  unknown: 'Not checked',
};
