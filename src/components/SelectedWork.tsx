import Link from 'next/link';
import ProjectPreview from './ProjectPreview';
import { layoutCycle } from '@/lib/layouts';
import Reveal from './Reveal';
import WorkIndex from './WorkIndex';
import { featuredProjects, projects } from '@/data/projects';

export default function SelectedWork() {
  return (
    <section id="work" className="wrap pt-24 lg:pt-40" aria-labelledby="work-title">
      <Reveal className="grid gap-6 lg:grid-cols-12">
        <p className="label text-grey-2 lg:col-span-3">01 / Selected work</p>
        <div className="lg:col-span-9">
          <div className="draw-line h-px w-full bg-line" />
          <h2 id="work-title" className="headline mt-8 text-[clamp(48px,8vw,140px)]">
            Selected work
            <span className="label ml-4 align-top text-grey-2">
              ({String(featuredProjects.length).padStart(2, '0')} / {projects.length})
            </span>
          </h2>
          <p className="mt-6 max-w-lg text-[17px] leading-snug text-grey-1">
            Tools I made because they should exist. Some are serious. All are real.
          </p>
        </div>
      </Reveal>

      <div className="mt-24 space-y-28 lg:mt-40 lg:space-y-48">
        {featuredProjects.map((p, i) => (
          <ProjectPreview key={p.slug} project={p} layout={layoutCycle[i % layoutCycle.length]} index={i} />
        ))}
      </div>

      <Reveal className="mt-32 grid gap-10 lg:mt-48 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <p className="label text-grey-2">All work</p>
          <Link href="/work/" className="label link-quiet mt-3 inline-block text-paper">
            Open the full archive
          </Link>
        </div>
        <div className="lg:col-span-9">
          <WorkIndex />
        </div>
      </Reveal>
    </section>
  );
}
