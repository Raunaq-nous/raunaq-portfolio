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
  'bhoomi-setu': ['01-home', '02-case', '03-verification', '04-documents', '05-survey-record', '06-next-action'],
  maate: ['01-dashboard', '02-family', '03-extraction-review', '04-upload', '05-permissions', '06-reminders'],
  hitman: ['01-home', '02-schedule', '03-standings', '04-squads', '05-leagues'],
  'momentum-os': ['01-home-base', '02-dashboard', '03-analytics', '04-focus', '05-systems', '06-achievements'],
  cartograph: ['01-portfolio', '02-process', '03-provenance'],
  'career-os': ['02-onboarding-role', '01-login', '03-onboarding-profile', '04-invite'],
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
