'use client';

import { useEffect, useState } from 'react';
import Reveal from './Reveal';
import SectionLabel from './SectionLabel';
import Link from 'next/link';
import CuriosityPlate from './CuriosityPlate';
import { useMode } from './ModeContext';
import { curiosities, type Curiosity } from '@/data/curiosities';
import { researchThreads } from '@/data/research';
import { getProject } from '@/data/projects';
import { mediaFor } from '@/data/assets';
import { asset } from '@/lib/asset';

const paras = (t: string) => t.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
const linkedThreads = new Set(curiosities.map((c) => c.thread).filter(Boolean));

export default function Curiosities() {
  const { mode } = useMode();
  const [open, setOpen] = useState<Curiosity | null>(null);

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open]);

  return (
    <section id="curiosities" className="wrap pt-40 lg:pt-56" aria-labelledby="curiosities-title">
      <div className="grid gap-6 lg:grid-cols-12">
        <Reveal className="lg:col-span-3">
          <SectionLabel n="04" calm="Curiosities" path="curiosities" cmd="ls -la" />
        </Reveal>
        <Reveal className="lg:col-span-9" delay={80}>
          <h2 id="curiosities-title" className="headline text-[clamp(44px,6vw,96px)]">
            My current curiosities
          </h2>
          <p key={mode} className="mode-fade mt-6 max-w-xl text-[17px] leading-snug text-grey-1">
            {mode === 'calm'
              ? "What I'm building, thinking about, and cannot stop reading about."
              : 'Active research threads and production systems. Toggle to calm for the plain version.'}
          </p>
        </Reveal>
      </div>

      <div className="mt-16 lg:mt-24">
        {curiosities.map((c, i) => {
          const code = `C${String(i + 1).padStart(2, '0')}`;
          const ps = paras(mode === 'calm' ? c.calm : c.nerd);
          const thread = c.thread ? researchThreads.find((t) => t.id === c.thread) : undefined;
          const flip = i % 2 === 1;
          return (
            <Reveal key={c.id}>
              <article className="grid gap-8 border-t rule py-12 lg:grid-cols-12 lg:gap-10 lg:py-16">
                <button type="button" onClick={() => setOpen(c)} className={`group relative block aspect-[4/3] w-full self-start overflow-hidden border border-[#f2c98a]/25 lg:col-span-5 ${flip ? 'lg:order-2' : ''}`} aria-label={`Read ${c.title}`}>
                  <CuriosityPlate motif={c.plate} code={code} title={c.title} className="transition-transform duration-700 group-hover:scale-[1.015]" />
                </button>
                <div className={`lg:col-span-7 ${flip ? 'lg:order-1' : ''}`}>
                  <p className="label flex flex-wrap gap-x-4 gap-y-1 text-grey-3">
                    <span className="text-grey-1">{code}</span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-1.5 w-1.5 animate-pulse bg-paper" />
                      {c.status === 'ACTIVE' ? 'Active' : 'Ongoing'}
                    </span>
                    <span>Since {c.year}</span>
                    <span>{c.role.toLowerCase()}</span>
                  </p>
                  <h3 className="headline mt-4 text-[clamp(28px,2.8vw,44px)]">{c.title}</h3>
                  <p className="mt-5 border-l-2 border-paper pl-4 text-[19px] leading-snug text-paper">{c.thesis}</p>
                  <dl className="mt-6 space-y-4 text-[15px] leading-relaxed">
                    <div>
                      <dt className="label text-grey-3">{ps.length > 1 ? 'What I see' : 'The idea'}</dt>
                      <dd key={mode} className="mode-fade mt-1.5 text-grey-1">{ps[0]}</dd>
                    </div>
                    {ps.length > 1 && (
                      <div>
                        <dt className="label text-grey-3">{mode === 'nerd' ? 'How it works' : 'What I am doing about it'}</dt>
                        <dd key={mode} className="mode-fade mt-1.5 line-clamp-5 text-grey-1">{ps.slice(1).join(' ')}</dd>
                      </div>
                    )}
                  </dl>
                  {c.builds.length > 0 && (
                    <div className="mt-6">
                      <p className="label text-grey-3">Built toward it</p>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {c.builds.map((slug) => {
                          const p = getProject(slug);
                          if (!p) return null;
                          const shot = mediaFor(p.slug, p.name).screenshots[0]?.asset;
                          return (
                            <li key={slug}>
                              <Link href={`/work/${slug}/`} className="group/b flex items-center gap-2 border border-paper/25 px-2.5 py-1.5 text-[13px] transition-colors hover:border-paper">
                                {shot && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={asset(shot.src)} alt="" className="h-7 w-10 object-cover object-top grayscale" />
                                )}
                                {p.name}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                  {thread && (
                    <div className="mt-6 border-t rule pt-4">
                      <p className="label text-grey-3">Open question</p>
                      <p className="mt-1.5 text-[17px] leading-snug">{thread.title}</p>
                    </div>
                  )}
                  <button type="button" onClick={() => setOpen(c)} className="label link-quiet mt-6 text-paper">
                    Read the full note
                  </button>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>

      {/* Open questions, as a live feed */}
      <Reveal className="mt-28 grid gap-6 lg:grid-cols-12">
        <p className="label text-grey-3 lg:col-span-3">More open questions</p>
        <ol className="lg:col-span-9">
          {researchThreads.filter((t) => !linkedThreads.has(t.id)).map((t, i) => (
            <li key={t.id} className="group grid grid-cols-[2.5rem_1fr] gap-4 border-t rule py-6 md:grid-cols-[2.5rem_1fr_1.2fr]">
              <span className="label flex items-center gap-2 pt-1 text-grey-3">
                <span className="inline-block h-1.5 w-1.5 animate-pulse bg-paper" />Q{i + 1}
              </span>
              <p className="text-[22px] leading-tight tracking-tight">{t.title}</p>
              <p key={mode} className="mode-fade col-start-2 text-[14px] leading-relaxed text-grey-2 md:col-start-3">
                {mode === 'calm' ? t.calm : t.nerd}
              </p>
            </li>
          ))}
        </ol>
      </Reveal>

      {open && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-ink/80 p-[var(--gutter)] backdrop-blur" role="dialog" aria-modal="true" aria-label={open.title} onClick={() => setOpen(null)}>
          <div className="thin-scroll max-h-[88vh] w-full max-w-3xl overflow-y-auto border border-paper/30 bg-ink" onClick={(e) => e.stopPropagation()}>
            <header className="sticky top-0 flex items-center justify-between border-b border-paper/15 bg-ink px-5 py-3">
              <span className="label text-grey-2">
                {open.role} / {open.year}
              </span>
              <button type="button" className="label text-paper" onClick={() => setOpen(null)} autoFocus>
                Close
              </button>
            </header>
            <div className="space-y-5 p-6">
              <h3 className="headline text-[clamp(28px,3.4vw,52px)]">{open.title}</h3>
              <div key={mode} className="mode-fade space-y-4 text-[16px] leading-relaxed text-grey-1">
                {(mode === 'calm' ? open.calm : open.nerd).split(/\n\s*\n/).map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
              <ul className="label flex flex-wrap gap-x-4 gap-y-2 text-grey-3">
                {open.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
