'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ImageMedia, VideoMedia } from './MediaSlot';
import Reveal from './Reveal';
import CodeGraph from './CodeGraph';
import PixelImage from './PixelImage';
import { mediaFor } from '@/data/assets';
import { getProject, parseProcess, projects, relatedProjects, splitSystemLabel } from '@/data/projects';
import { useNoHover } from '@/lib/motion';
import { useMode } from './ModeContext';

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <Reveal as="section" className="grid gap-6 border-t rule pt-8 lg:grid-cols-12">
      <p className="label text-grey-3 lg:col-span-3">
        {n} / {title}
      </p>
      <div className="lg:col-span-9">{children}</div>
    </Reveal>
  );
}

export default function ProjectDetail({ slug }: { slug: string }) {
  const project = getProject(slug)!;
  const media = mediaFor(slug, project.name);
  const { mode } = useMode();
  const noHover = useNoHover();
  const [coverOpen, setCoverOpen] = useState(false);
  const system = splitSystemLabel(project.nerd);
  const process = parseProcess(project.process);
  const related = relatedProjects(project);
  const idx = projects.findIndex((p) => p.slug === slug);
  const next = projects[(idx + 1) % projects.length];
  const code = `P${project.number}`;
  let n = 0;
  const num = () => String(++n).padStart(2, '0');

  const c = media.cover;
  const coverImage = (
      <PixelImage
        mode="reveal"
        src={c.asset?.src}
        alt={c.asset?.alt ?? `${project.name} cover (placeholder)`}
        focus={c.asset?.focus}
        placeholder={c.asset ? undefined : { title: project.name, code, label: project.category, seed: idx + 3 }}
        annotate="project"
        fieldLabel={`${code} / ${project.name}`}
        revealed={coverOpen}
        priority
      />
    );

  return (
    <article>
      {/* Header */}
      <header className="wrap pt-28 lg:pt-36">
        <nav className="label flex flex-wrap gap-3 text-grey-3" aria-label="Breadcrumb">
          <Link href="/#builds" className="link-quiet hover:text-paper">
            Work
          </Link>
          <span aria-hidden>/</span>
          <span className="text-grey-1">{project.name}</span>
        </nav>
        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-9">
            <p className="label flex flex-wrap gap-5 text-grey-2">
              <span>{project.number}</span>
              <span>{project.category}</span>
              <span>{project.type === 'PLATFORM' ? 'Platform' : 'Tool'}</span>
              <span className="text-paper">{project.status === 'LIVE' ? 'Live' : project.status}</span>
            </p>
            <h1 className="display mt-6 text-[clamp(64px,12vw,200px)]">{project.name}</h1>
          </div>
          <div className="lg:col-span-3 lg:self-end">
            <p className="text-[17px] leading-snug text-grey-1">{project.punchline}</p>
            <div className="mt-5 flex flex-wrap gap-5">
              {project.live && (
                <a href={project.live} target="_blank" rel="noopener noreferrer" className="label link-quiet text-paper">
                  Live demo <span aria-hidden>↗</span>
                </a>
              )}
              {project.github && (
                <a href={project.github} target="_blank" rel="noopener noreferrer" className="label link-quiet text-paper">
                  Repository <span aria-hidden>↗</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Cover */}
      <div className="wrap mt-16 lg:mt-24">
        <div className="relative w-full lg:-mx-[var(--gutter)] lg:w-[calc(100%+2*var(--gutter))]" style={{ aspectRatio: String(media.cover.aspect) }}>
          {noHover ? (
            <button type="button" className="absolute inset-0" onClick={() => setCoverOpen((v) => !v)} aria-pressed={coverOpen} aria-label="Reveal cover image">
              {coverImage}
            </button>
          ) : (
            coverImage
          )}
        </div>
        <p className="label mt-3 flex justify-between text-grey-3">
          <span>{code} / Cover</span>
          <span>{media.cover.asset ? '' : 'Placeholder'}</span>
        </p>
      </div>

      <div className="wrap mt-24 space-y-24 lg:mt-36 lg:space-y-36">
        <Section n={num()} title="Overview">
          <p key={mode} className="mode-fade headline max-w-4xl text-[clamp(26px,2.8vw,44px)]">{mode === 'calm' ? project.calm : system.text}</p>
        </Section>

        <Section n={num()} title="System">
          {system.label && <p className="label mb-4 text-grey-2">{system.label}</p>}
          <p className="max-w-2xl text-[17px] leading-relaxed text-grey-1">{system.text}</p>
          <ul className="label mt-8 flex flex-wrap gap-x-6 gap-y-2 text-grey-2">
            {project.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Section>

        {process.steps.length > 0 && (
          <Section n={num()} title="Architecture">
            {process.intro && <p className="mb-8 text-[15px] text-grey-2">{process.intro}</p>}
            <ol className="relative">
              <span className="absolute bottom-6 left-[13px] top-6 w-px bg-line" aria-hidden />
              {process.steps.map((s, i) => (
                <li key={s.label} className="relative grid grid-cols-[28px_1fr] gap-6 py-5 md:grid-cols-[28px_14rem_1fr]">
                  <span className="relative z-10 mt-1 flex h-7 w-7 items-center justify-center border border-paper/60 bg-ink">
                    <span className="h-1 w-1 bg-paper" />
                  </span>
                  <div>
                    <p className="label text-grey-3">S{String(i + 1).padStart(2, '0')}</p>
                    <p className="mt-1 text-[15px] text-paper">{s.label.replace(/^\d+\.\s*/, '')}</p>
                  </div>
                  <p className="col-start-2 whitespace-pre-line text-[15px] leading-relaxed text-grey-1 md:col-start-3">{s.text}</p>
                </li>
              ))}
            </ol>
            {process.notes.map((note) => (
              <p key={note.slice(0, 24)} className="mt-6 max-w-2xl whitespace-pre-line border-l border-paper/30 pl-5 text-[15px] leading-relaxed text-grey-1">
                {note}
              </p>
            ))}
          </Section>
        )}

        {media.screenshots.length > 0 && (
          <Section n={num()} title="Interface">
            <p className="mb-8 max-w-xl text-[14px] text-grey-2">
              Captured from the tool running locally on synthetic or demo data.
            </p>
            <div className="grid gap-10 md:grid-cols-12">
              {media.screenshots.map((s, i) => (
                <div key={s.label} className={i % 3 === 0 ? 'md:col-span-12' : i % 3 === 1 ? 'md:col-span-7' : 'md:col-span-5 md:mt-24'}>
                  <ImageMedia slot={s} title={project.name} code={code} seed={idx * 10 + i + 1} />
                </div>
              ))}
            </div>
          </Section>
        )}

        <Section n={num()} title="Stack and architecture">
          <CodeGraph slug={slug} />
          <p className="mt-6 max-w-xl text-[14px] text-grey-2">
            Every technology in the build, from interface to deployment, and the AI features it runs. Hover a node to trace its links.
          </p>
        </Section>

        <Section n={num()} title="Demo">
          <div className="max-w-3xl">
            <VideoMedia slot={media.demo} title={project.name} code={code} index={0} />
          </div>
        </Section>

        {related.length > 0 && (
          <Section n={num()} title="Related">
            <ul>
              {related.map((r) => (
                <li key={r.slug} className="border-b rule">
                  <Link href={`/work/${r.slug}/`} className="group grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 py-4">
                    <span className="label text-grey-3">{r.number}</span>
                    <span className="text-2xl tracking-tight transition-transform duration-500 group-hover:translate-x-2">{r.name}</span>
                    <span className="label text-grey-2">{r.category}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      {/* Footer navigation */}
      <nav className="wrap mt-40 grid gap-10 border-t rule pb-16 pt-10 md:grid-cols-2" aria-label="Project navigation">
        <Link href="/#builds" className="label link-quiet self-start text-grey-1 hover:text-paper">
          Return to work
        </Link>
        <Link href={`/work/${next.slug}/`} className="group md:text-right">
          <span className="label text-grey-3">Next / {next.number}</span>
          <span className="display mt-3 block text-[clamp(44px,7vw,120px)] transition-colors group-hover:text-grey-1">{next.name}</span>
        </Link>
      </nav>
    </article>
  );
}
