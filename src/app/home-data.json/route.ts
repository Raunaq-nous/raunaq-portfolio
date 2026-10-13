// Data for the static home page (home/index.html), generated from the site's own data at build
// time: the knowledge map behind the brain rows, the memory photos for the palace and the
// experience boxes, and the details behind each AI build room.
import { brainLinks, brainNodes, brainRegions } from '@/data/brain';
import { battles } from '@/data/battles';
import { buildVideos, mediaFor, memories } from '@/data/assets';
import { projects } from '@/data/projects';
import { places } from '@/data/geo';

export const dynamic = 'force-static';

export function GET() {
  const strip = (s: string) => s.replace(/^\//, '');
  const roles = battles.map((b) => ({
    id: b.id,
    company: b.company,
    memories: memories
      .filter((m) => m.role === b.id)
      .map((m) => ({ src: strip(m.src), alt: m.alt, year: m.year, w: m.width, h: m.height, video: m.video ? strip(m.video) : undefined, url: m.url, paper: m.id.startsWith('paper-') })),
    scenes: (b.keyProjects ?? []).map((k, i) => ({
      n: i + 1,
      industry: k.industry,
      problem: k.problem ?? '',
      description: k.description,
      geos: (k.geos ?? []).map((g) => places[g]?.label ?? g),
    })),
  }));
  const builds = projects.map((p) => ({
    name: p.name,
    slug: p.slug,
    category: p.category,
    calm: p.calm,
    punchline: p.punchline,
    github: p.github,
    live: p.live,
    shots: mediaFor(p.slug, p.name)
      .screenshots.map((s) => s.asset)
      .filter(Boolean)
      .map((a) => ({ src: strip(a!.src), alt: a!.alt })),
    videos: buildVideos[p.slug] ?? {},
  }));
  const brain = {
    regions: brainRegions,
    nodes: brainNodes.map((n) => ({ ...n, image: n.image ? strip(n.image) : undefined })),
    links: brainLinks.filter((l) => l.kind === 'fact'),
  };
  return Response.json({ brain, roles, builds });
}
