'use client';

import Reveal from './Reveal';
import SectionLabel from './SectionLabel';
import { useMode } from './ModeContext';
import { intro, site } from '@/data/site';

export default function About() {
  const { mode } = useMode();
  const bio = intro[mode];

  return (
    <section id="about" className="wrap pt-40 lg:pt-56" aria-labelledby="about-title">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-6">
        <Reveal className="lg:col-span-3">
          <SectionLabel n="05" calm="About" path="about" cmd="cat about.md" />
          <dl className="mt-8 space-y-6 text-[14px]">
            <div>
              <dt className="label mb-1 text-grey-3">Based</dt>
              <dd className="text-grey-1">{site.location}</dd>
            </div>
            <div>
              <dt className="label mb-1 text-grey-3">Education</dt>
              <dd className="text-grey-1">{site.education}</dd>
            </div>
          </dl>
        </Reveal>

        <div key={mode} className="mode-fade lg:col-span-8 lg:col-start-5">
          <Reveal>
            <h2 id="about-title" className="headline text-[clamp(32px,4vw,64px)]">
              {bio[0]}
            </h2>
          </Reveal>
          <Reveal className="mt-10 grid gap-6 text-[16px] leading-relaxed text-grey-1 md:grid-cols-2" delay={100}>
            {bio.slice(1).map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
          </Reveal>
          <p className="label mt-8 text-grey-2">Right now: {site.now.charAt(0).toLowerCase() + site.now.slice(1)}</p>

        </div>
      </div>
    </section>
  );
}
