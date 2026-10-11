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
  screenshots: ImageSlot[];
  videos: VideoSlot[];
}

export const portrait: ImageAsset = {
  src: '/media/portrait/raunaq-rakesh.jpg',
  alt: 'Portrait of Raunaq Rakesh',
  width: 2000,
  height: 2000,
  focus: [0.5, 0.36],
};

// Per-project overrides, keyed by project slug. Add real media here as it becomes available.
// Example:
//   abacus: {
//     cover: { asset: { src: '/media/projects/abacus/cover.jpg', alt: 'Abacus scenario view', width: 2400, height: 1500 } },
//     videos: [{ asset: { src: '/media/projects/abacus/demo.mp4', poster: '/media/projects/abacus/poster.jpg' } }],
//   },
type SlotOverride<T> = Partial<Omit<T, 'kind'>>;
interface ProjectMediaOverride {
  cover?: SlotOverride<ImageSlot>;
  screenshots?: SlotOverride<ImageSlot>[];
  videos?: SlotOverride<VideoSlot>[];
}

const projectMediaOverrides: Record<string, ProjectMediaOverride> = {};

export function mediaFor(slug: string): ProjectMedia {
  const o = projectMediaOverrides[slug] ?? {};
  const shotDefaults: ImageSlot[] = [
    { kind: 'image', label: 'Interface', aspect: 16 / 10 },
    { kind: 'image', label: 'Detail', aspect: 4 / 5 },
  ];
  const videoDefaults: VideoSlot[] = [{ kind: 'video', label: 'Walkthrough', aspect: 16 / 9 }];

  return {
    cover: { kind: 'image', label: 'Cover', aspect: 16 / 9, ...o.cover },
    screenshots: (o.screenshots ?? shotDefaults).map((s, i) => ({ ...shotDefaults[i % shotDefaults.length], ...s, kind: 'image' })),
    videos: (o.videos ?? videoDefaults).map((v, i) => ({ ...videoDefaults[i % videoDefaults.length], ...v, kind: 'video' })),
  };
}
