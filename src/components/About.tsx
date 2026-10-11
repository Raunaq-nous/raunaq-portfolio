'use client';

import PixelImage from './PixelImage';
import LazyMount from './LazyMount';
import Reveal from './Reveal';
import SectionLabel from './SectionLabel';
import { useMode } from './ModeContext';
import { portrait } from '@/data/assets';
import { intro, site } from '@/data/site';
import { skillGroups, skillSections } from '@/data/skills';

export default function About() {
  const { mode } = useMode();
  const certs = skillSections.flatMap((s) => s.skills);
  const bio = intro[mode];

  return (
    <section id="about" className="wrap pt-40 lg:pt-56" aria-labelledby="about-title">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-6">
        <Reveal className="lg:col-span-4">
          <SectionLabel n="05" calm="About" path="about" cmd="cat about.md" className="mb-6" />
          <div className="relative aspect-[4/5]">
            <LazyMount>
              <PixelImage
                src={portrait.src}
                alt={portrait.alt}
                mode="distort"
                focus={portrait.focus}
                monochrome={1}
                annotate="none"
                naturalSize={[portrait.width, portrait.height]}
              />
            </LazyMount>
          </div>
          <p className="label mt-3 flex justify-between text-grey-3">
            <span>Field 02</span>
            <span>{site.location}</span>
          </p>
        </Reveal>

        <div key={mode} className="mode-fade lg:col-span-7 lg:col-start-6">
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

          {mode === 'calm' ? (
            <Reveal className="mt-16 grid gap-10 border-t rule pt-8 sm:grid-cols-2" delay={160}>
              <div>
                <p className="label mb-4 text-grey-3">Skills</p>
                <dl className="space-y-4 text-[14px]">
                  {skillGroups.map((g) => (
                    <div key={g.label}>
                      <dt className="label text-grey-2">{g.label}</dt>
                      <dd className="mt-1 leading-relaxed text-grey-1">{g.skills.join(' / ')}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <p className="label mb-4 text-grey-3">Certifications</p>
                <ul className="text-[14px]">
                  {certs.map((c) => (
                    <li key={c.title} className="border-b rule py-2">
                      <span className="text-grey-1">{c.title}</span>
                      {c.issuer && <span className="label ml-2 text-grey-3">{c.issuer}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ) : (
            <Reveal className="mt-16 space-y-8 border-t rule pt-8 text-[13px]" delay={160}>
              <div>
                <p className="text-grey-2">
                  <span className="text-grey-3">raunaq@portfolio:~/about</span> <span className="text-paper">$ skills --all</span>
                </p>
                <div className="mt-3 space-y-2">
                  {skillGroups.map((g) => (
                    <p key={g.label} className="leading-relaxed text-grey-1">
                      <span className="text-grey-3"># {g.label.toLowerCase()}</span>
                      <br />
                      {g.skills.join('  ')}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-grey-2">
                  <span className="text-grey-3">raunaq@portfolio:~/about</span> <span className="text-paper">$ certs</span>
                </p>
                <ul className="mt-3 space-y-1 text-grey-1">
                  {certs.map((c) => (
                    <li key={c.title}>
                      <span className="text-grey-3">-</span> {c.title}
                      {(c.issuer || c.year) && (
                        <span className="text-grey-3">
                          {' '}
                          ({[c.issuer, c.year].filter(Boolean).join(', ')})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}

          <Reveal as="dl" className="mt-16 grid gap-x-6 gap-y-8 border-t rule pt-8 text-[14px] sm:grid-cols-2" delay={200}>
            <div>
              <dt className="label mb-2 text-grey-3">Based</dt>
              <dd className="text-grey-1">{site.location}</dd>
            </div>
            <div>
              <dt className="label mb-2 text-grey-3">Education</dt>
              <dd className="text-grey-1">{site.education}</dd>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
