// Central asset registry. Replace placeholders here, never inside components.
//
// Image paths are relative to /public (e.g. '/media/projects/abacus/cover.jpg').
// Leave `asset` undefined to render a clearly labelled placeholder slot.

export interface ImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Focal point used when the image is cropped, 0..1 from top-left. */
  focus?: [number, number];
}

export interface VideoAsset {
  /** Local or remote video file (mp4/webm). */
  src?: string;
  /** Alternatively, an embeddable player URL (YouTube, Vimeo, Loom). */
  embed?: string;
  poster?: string;
}

export interface ImageSlot {
  kind: 'image';
  label: string;
  aspect: number;
  asset?: ImageAsset;
}

export interface VideoSlot {
  kind: 'video';
  label: string;
  aspect: number;
  asset?: VideoAsset;
}

export interface ProjectMedia {
  cover: ImageSlot;
  /** Real interface captures of the running tool. */
  screenshots: ImageSlot[];
  /** Short demo video of the tool. */
  demo: VideoSlot;
  /** Knowledge graph of the tool's codebase and tech layers. */
  codeGraph: ImageSlot;
}

export const portrait: ImageAsset = {
  src: '/media/portrait/raunaq-rakesh.jpg',
  alt: 'Raunaq Rakesh at his desk, holding a cat',
  width: 1200,
  height: 1130,
  focus: [0.4, 0.42],
};

// Interface captures taken from each tool running locally (synthetic or demo data only).
// Width and height are the stored file size.
const SHOT_W = 1600;
const SHOT_H = 1000;

const captures: Record<string, string[]> = {
  maate: ['01-dashboard', '02-family', '03-extraction-review', '04-upload', '05-permissions', '06-reminders'],
  hitman: ['01-home', '02-schedule', '03-standings', '04-squads', '05-leagues'],
  'momentum-os': ['01-home-base', '02-dashboard', '03-analytics', '04-focus', '05-systems', '06-achievements'],
  'career-os': ['02-onboarding-role', '01-login', '03-onboarding-profile', '04-invite'],
  abacus: ['s01-oracle-home', 's02-research', 's03-assumptions', 's04-income-statement', 's05-cash-flow', 's06-valuation', 's07-autonomous-builder', 's08-discovery'],
  'bhoomi-setu': ['s01-home', 's02-create-case', 's03-case-dashboard', 's04-documents', 's05-document-source', 's06-verification', 's07-public-verify', 's08-parcel-map', 's09-area-comparison', 's10-official-records', 's11-earth-observation', 's12-next-action'],
  cartograph: ['s01-portfolio', 's02-value-bridge', 's03-prerequisites', 's04-sensitivity', 's05-process', 's06-evidence', 's07-scorecard', 's08-future-state', 's09-value-parameters', 's10-confidence', 's11-critic', 's12-provenance'],
  'digital-twin': ['s01-upload', 's02-column-mapping', 's03-project-chooser', 's04-programme-mode', 's05-combined-3d-playback', 's06-project-model', 's07-inspector-activity', 's08-inspector-coverage', 's09-inspector-logic', 's11-element-inspector', 's12-exports'],
  'first-draft': ['s01-home', 's02-rfp-uploaded', 's04-ready-to-generate', 's05-content-summary-overview', 's06-workstreams', 's07-modules', 's08-timeline-governance', 's09-download'],
  groundwork: ['s01-configure-inputs', 's02-inverters-storage', 's03-balance-of-system', 's04-other-costs-om', 's05-cost-results', 's06-cost-tables', 's07-system-diagram', 's08-lecture-system-size', 's09-lecture-storage', 's10-market-research', 's11-research-om'],
  'haus-nous': ['s01-home', 's02-process', 's03-capabilities', 's04-tools', 's05-tools-filtered', 's06-frameworks', 's07-frameworks-filtered', 's08-console', 's09-console-input', 's10-console-recommendation'],
  needle: ['s01-index-documents', 's03-indexing-complete', 's04-ask-questions', 's05-query-filters', 's06-simple-ui', 's07-simple-ui-index-done', 's08-api-docs', 's09-model-presets'],
  pit: ['s01-sign-in', 's02-yard-industries', 's03-portfolio-summary', 's04-project-dataset', 's05-explore-table', 's06-timeline-chart', 's07-project-record', 's08-issue-register', 's09-citation-detail', 's10-glossary'],
  pulse: ['s01-welcome', 's02-knowledge-base', 's03-documents-added', 's04-plan-survey', 's05-validate', 's06-export', 's07-classic-planner', 's08-question-author', 's09-model-registry'],
  watchtower: ['s01-dashboard', 's02-time-window', 's03-capex-impact-filters', 's04-sector-filter', 's05-event-detail', 's06-full-width'],
  yardstick: ['s01-dashboard', 's02-projects', 's03-create-project', 's04-api-docs', 's05-swagger-overview'],
  costline: ['s01-source-workbook', 's02-projects', 's03-project-properties', 's04-field-data-trace', 's05-production-profile', 's06-concept-selector', 's07-schematic', 's08-cost-sheet-trace'],
  precedent: ['s01-choose-scope', 's02-industry-scope-resolved', 's03-project-scope-selected'],
  hindsight: ['s01-choose-scope', 's02-industry-scope-resolved', 's03-project-scope-selected'],
  'opportunity-map': ['s01-tracked-clients', 's02-project-profiles', 's03-build-advisor', 's04-delivery-models'],
  't-minus': ['s01-portfolio-of-facilities', 's02-data-integration', 's03-north-river-site-plan', 's04-scope-decisions', 's05-outage-economics', 's06-schedule-check', 's07-execution-readiness', 's08-stage-gate'],
  'generative-scheduler': ['s01-project-3d-model', 's02-recipe', 's03-resources', 's04-cost-vs-time', 's05-chosen-schedule', 's06-compare'],
};

function labelFor(file: string) {
  return file
    .replace(/^\d+-/, '')
    .split('-')
    .map((w, i) => (i === 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

// Additional per-project overrides (demo videos, codebase graphs, hand-picked covers). Example:
//   abacus: {
//     demo: { asset: { src: '/media/projects/abacus/demo.mp4', poster: '/media/projects/abacus/poster.jpg' } },
//     codeGraph: { asset: { src: '/media/projects/abacus/codebase.png', alt: 'Abacus codebase graph', width: 2400, height: 1500 } },
//   },
type SlotOverride<T> = Partial<Omit<T, 'kind'>>;
interface ProjectMediaOverride {
  cover?: SlotOverride<ImageSlot>;
  demo?: SlotOverride<VideoSlot>;
  codeGraph?: SlotOverride<ImageSlot>;
}

const projectMediaOverrides: Record<string, ProjectMediaOverride> = {};

export function hasCaptures(slug: string) {
  return !!captures[slug]?.length;
}

export function mediaFor(slug: string, name = slug): ProjectMedia {
  const o = projectMediaOverrides[slug] ?? {};
  const files = captures[slug] ?? [];
  const screenshots: ImageSlot[] = files.map((f) => ({
    kind: 'image',
    label: labelFor(f),
    aspect: SHOT_W / SHOT_H,
    asset: { src: `/media/projects/${slug}/${f}.jpg`, alt: `${name}: ${labelFor(f).toLowerCase()} screen`, width: SHOT_W, height: SHOT_H, focus: [0.5, 0] },
  }));

  return {
    cover: { kind: 'image', label: 'Cover', aspect: 16 / 9, asset: screenshots[0]?.asset, ...o.cover },
    screenshots,
    demo: { kind: 'video', label: 'Demo video', aspect: 16 / 9, ...o.demo },
    codeGraph: { kind: 'image', label: 'Codebase graph', aspect: 16 / 9, ...o.codeGraph },
  };
}

// Snapshots of the published papers. Captured by .github/workflows/capture-snapshots.yml
// (IEEE Xplore is not reachable from the build sandbox). Missing files fall back to a card.
export function paperSnapshot(id: string): string {
  return `/media/snapshots/paper-${id}.jpg`;
}

// ---------------------------------------------------------------- memories
// Photos "left exactly where they happened": each one floats beside its role in the Atlas and
// lifts from a flat photo into a depth map and then a point cloud. Add photos here (files in
// public/media/memories/<role>/), keyed to the role id from src/data/battles.ts.

export interface Memory {
  id: string;
  /** Role id from battles.ts. */
  role: string;
  src: string;
  /** Accessible description. Not shown on screen. */
  alt: string;
  year: number;
  width: number;
  height: number;
  /** Optional link out (a paper, an article). */
  url?: string;
  /** Optional video; `src` is then its still frame. */
  video?: string;
  /** Drawn at runtime instead of loading `src`: a project spec sheet (see src/lib/industrySheet.ts). */
  sheet?: { name: string; code: string; rows: [string, string][] };
}

export const memories: Memory[] = [
  { id: 'paper-tether-deploy', role: 'parikshit', src: '/media/snapshots/paper-tether-deploy.jpg', alt: 'IEEE Aerospace Conference 2015: tether deployment dynamics and control', year: 2015, width: 1400, height: 1018, url: 'https://ieeexplore.ieee.org/document/7119062' },
  { id: 'paper-adcs-core', role: 'parikshit', src: '/media/snapshots/paper-adcs-core.jpg', alt: 'ICACCI 2015: dynamics and control system design of Parikshit', year: 2015, width: 1400, height: 1018, url: 'https://ieeexplore.ieee.org/document/7275676' },
  { id: 'paper-tether-control', role: 'parikshit', src: '/media/snapshots/paper-tether-control.jpg', alt: 'ICACCI 2015: countering the tether ejection', year: 2015, width: 1400, height: 1018, url: 'https://ieeexplore.ieee.org/document/7275680' },
  { id: 'parikshit-ground-station', role: 'parikshit', src: '/media/memories/parikshit/ground-station.jpg', alt: 'Up on the ground station antenna tower', year: 2015, width: 1200, height: 1600 },
  { id: 'parikshit-structure', role: 'parikshit', src: '/media/memories/parikshit/structure.jpg', alt: 'The satellite structure, mid-assembly', year: 2015, width: 780, height: 1040 },
  { id: 'parikshit-test-chamber', role: 'parikshit', src: '/media/memories/parikshit/test-chamber.jpg', alt: 'Hardware on a test chamber plate', year: 2015, width: 1280, height: 720 },
  { id: 'parikshit-coil-rig', role: 'parikshit', src: '/media/memories/parikshit/coil-rig.jpg', video: '/media/memories/parikshit/coil-rig.mp4', alt: 'Coil test rig in the lab', year: 2015, width: 640, height: 352 },
  { id: 'parikshit-sil-board-1', role: 'parikshit', src: '/media/memories/parikshit/sil-board-part1.jpg', alt: 'Software in the loop, part 1: orbit, sun and magnetic field models feeding the simulated sensors', year: 2015, width: 1280, height: 720, url: 'https://ieeexplore.ieee.org/document/7500603' },
  { id: 'parikshit-sil-board-2', role: 'parikshit', src: '/media/memories/parikshit/sil-board-part2.jpg', alt: 'Software in the loop, version 1, parts 2 and 3: QUEST attitude estimation, quaternion error and control torque', year: 2015, width: 1280, height: 720, url: 'https://ieeexplore.ieee.org/document/7500603' },
  { id: 'madcue-site', role: 'madcue', src: '/media/memories/madcue/site.jpg', alt: 'The Madcue website: In The House stories, including the Gavin Aung Than interview', year: 2016, width: 1600, height: 904 },
  { id: 'madcue-stories', role: 'madcue', src: '/media/memories/madcue/stories.jpg', alt: 'Featured and fiction stories on Madcue', year: 2016, width: 911, height: 872 },
  { id: 'madcue-facebook', role: 'madcue', src: '/media/memories/madcue/facebook.jpg', alt: 'Madcue Facebook page: 9.1K followers, 508 posts', year: 2017, width: 1080, height: 880 },
  { id: 'madcue-archive', role: 'madcue', src: '/media/memories/madcue/archive.jpg', alt: 'Web archive captures of madcue by year, 2014 to 2020', year: 2018, width: 1223, height: 1014 },
  { id: 'paper-sil-rig', role: 'parikshit', src: '/media/snapshots/paper-sil-rig.jpg', alt: 'IEEE Aerospace Conference 2016: software in the loop test set-up', year: 2016, width: 1400, height: 1018, url: 'https://ieeexplore.ieee.org/document/7500603' },
];

// ---------------------------------------------------------------- build videos
// Three video screens hang on the left wall of every room in the AI builds vault. Add a file under
// public/media/projects/<slug>/ and list it here; empty slots show as placeholders.
export type BuildVideoKind = 'walkthrough' | 'launch' | 'demo';

export const videoSlots: { id: BuildVideoKind; label: string; hint: string }[] = [
  { id: 'walkthrough', label: 'Walkthrough', hint: 'Me, walking through the build' },
  { id: 'launch', label: 'Product launch', hint: 'The launch film' },
  { id: 'demo', label: 'Demo', hint: 'The product, end to end' },
];

export const buildVideos: Record<string, Partial<Record<BuildVideoKind, string>>> = {
  // 'cartograph': { demo: '/media/projects/cartograph/demo.mp4' },
};
