'use client';

import Link from 'next/link';
import Reveal from './Reveal';
import SectionLabel from './SectionLabel';
import CodeGraph from './CodeGraph';
import { useMode } from './ModeContext';
import { featuredProjects, parseProcess, projects, splitSystemLabel, type Project } from '@/data/projects';
import { mediaFor } from '@/data/assets';
import { asset } from '@/lib/asset';

function Showcase({ p, i }: { p: Project; i: number }) {
  const { mode } = useMode();
  const media = mediaFor(p.slug, p.name);
  const shot = media.screenshots[0]?.asset;
  const sys = splitSystemLabel(p.nerd);
  const steps = parseProcess(p.process).steps.slice(0, 4);
  const flip = i % 2 === 1;

  return (
    <article className="grid gap-8 border-t rule pt-10 lg:grid-cols-12 lg:gap-10">
      <div className={`lg:col-span-5 ${flip ? 'lg:order-2' : ''}`}>
        <p className="label flex flex-wrap gap-4 text-grey-2">
          <span>{String(i + 1).padStart(2, '0')}</span>
          <span>{p.category}</span>
          <span className="text-grey-3">{p.type === 'PLATFORM' ? 'Platform' : 'Tool'}</span>
        </p>
        <h3 className="headline mt-4 text-[clamp(36px,4.4vw,68px)]">
          <Link href={`/work/${p.slug}/`} className="transition-colors hover:text-grey-1">
            {p.name}
          </Link>
        </h3>
        <p key={mode} className="mode-fade mt-5 text-[16px] leading-relaxed text-grey-1">
          {mode === 'calm' ? p.calm : sys.text}
        </p>
        {steps.length > 0 && (
          <ol className="mt-6 space-y-2 border-t rule pt-4">
            {steps.map((s, k) => (
              <li key={s.label} className="grid grid-cols-[2.5rem_1fr] gap-2 text-[13px]">
                <span className="label text-grey-3">S{String(k + 1).padStart(2, '0')}</span>
                <span>
                  <span className="text-paper">{s.label.replace(/^\d+\.\s*/, '').toLowerCase().replace(/^./, (c) => c.toUpperCase())}</span>
                  <span className="text-grey-2"> / {s.text.split(/(?<=\.)\s/)[0]}</span>
                </span>
              </li>
            ))}
          </ol>
        )}
        <p className="label mt-6 text-grey-3">{p.tags.join(' / ')}</p>
        <div className="mt-6 flex flex-wrap gap-5">
          <Link href={`/work/${p.slug}/`} className="label link-quiet text-paper">
            Deep dive
          </Link>
          {p.live && (
            <a href={p.live} target="_blank" rel="noopener noreferrer" className="label link-quiet text-paper">
              Live demo ↗
            </a>
          )}
          {p.github && (
            <a href={p.github} target="_blank" rel="noopener noreferrer" className="label link-quiet text-paper">
              Repository ↗
            </a>
          )}
        </div>
      </div>

      <div className={`grid gap-6 lg:col-span-7 ${flip ? 'lg:order-1' : ''}`}>
        <figure>
          <div className="relative aspect-[16/10] overflow-hidden border rule bg-ink-3">
            {shot ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset(shot.src)} alt={shot.alt} className="h-full w-full object-cover object-top" loading="lazy" />
            ) : (
              <div className="dot-grid absolute inset-0 grid place-items-center">
                <span className="label text-grey-3">Interface capture / coming soon</span>
              </div>
            )}
            <span className="label absolute left-3 top-3 bg-ink/70 px-1.5 py-0.5 text-grey-1">Interface</span>
          </div>
        </figure>
        <CodeGraph slug={p.slug} />
      </div>
    </article>
  );
}

export default function SelectedWork() {
  return (
    <section id="work" className="wrap pt-24 lg:pt-32" aria-labelledby="work-title">
      <Reveal className="grid gap-6 lg:grid-cols-12">
        <SectionLabel n="01" calm="Selected work" path="work" cmd="ls --featured" className="lg:col-span-3" />
        <div className="lg:col-span-9">
          <h2 id="work-title" className="headline text-[clamp(44px,6vw,96px)]">
            Selected work
          </h2>
          <p className="mt-5 max-w-xl text-[16px] leading-snug text-grey-1">
            {featuredProjects.length} tools in depth: what they do, the interface, and a graph of their real codebase. The rest of the {projects.length} builds live in the archive.
          </p>
        </div>
      </Reveal>

      <div className="mt-16 space-y-20 lg:mt-20 lg:space-y-28">
        {featuredProjects.map((p, i) => (
          <Reveal key={p.slug}>
            <Showcase p={p} i={i} />
          </Reveal>
        ))}
      </div>

      <div className="mt-20 flex justify-end border-t rule pt-6">
        <Link href="/work/" className="label link-quiet text-paper">
          All {projects.length} builds in the archive →
        </Link>
      </div>
    </section>
  );
}
