import type { Metadata } from 'next';
import SiteNav from '@/components/SiteNav';
import ProjectPreview from '@/components/ProjectPreview';
import { layoutCycle } from '@/lib/layouts';
import WorkIndex from '@/components/WorkIndex';
import Reveal from '@/components/Reveal';
import { projects } from '@/data/projects';

export const metadata: Metadata = {
  title: 'Work | Raunaq Rakesh',
  description: 'Every tool and platform I have built.',
};

export default function WorkPage() {
  return (
    <>
      <SiteNav />
      <main className="wrap pb-24 pt-28 lg:pt-36">
        <Reveal className="grid gap-6 lg:grid-cols-12">
          <p className="label text-grey-2 lg:col-span-3">Archive / All work</p>
          <div className="lg:col-span-9">
            <h1 className="display text-[clamp(64px,12vw,200px)]">Work</h1>
            <p className="mt-6 max-w-lg text-[17px] leading-snug text-grey-1">
              {projects.length} tools and platforms. Each one started as a frustration. None of them started as a product idea.
            </p>
          </div>
        </Reveal>

        <div className="mt-20 lg:ml-[25%]">
          <WorkIndex title="Index" />
        </div>

        <div className="mt-32 space-y-28 lg:mt-48 lg:space-y-48">
          {projects.map((p, i) => (
            <ProjectPreview key={p.slug} project={p} layout={layoutCycle[i % layoutCycle.length]} index={i} />
          ))}
        </div>
      </main>
    </>
  );
}
