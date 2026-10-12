'use client';

import { useEffect, useState } from 'react';
import Reveal from './Reveal';
import SectionLabel from './SectionLabel';
import IndustryArt from './IndustryArt';
import { useMode } from './ModeContext';
import { curiosities, type Curiosity } from '@/data/curiosities';
import { researchThreads } from '@/data/research';

// Each curiosity gets a sheet whose visual motif comes from its subject.
const motif = (c: Curiosity) => {
  const t = c.tags.join(' ').toLowerCase();
  if (/compute|hardware/.test(t)) return 'Compute';
  if (/sport|cricket/.test(t)) return 'Media';
  if (/career|simulation/.test(t)) return 'Aerospace';
  if (/portfolio|monitoring/.test(t)) return 'Financial Services';
  if (/strategy|consult/.test(t)) return 'Infrastructure';
  return 'Cloud';
};

const SPANS = ['lg:col-span-7', 'lg:col-span-5 lg:mt-24', 'lg:col-span-5', 'lg:col-span-7', 'lg:col-span-6', 'lg:col-span-6 lg:mt-24'];

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

      <div className="mt-16 grid gap-6 lg:mt-24 lg:grid-cols-12">
        {curiosities.map((c, i) => (
          <Reveal key={c.id} className={SPANS[i % SPANS.length]} delay={i * 60}>
            <button type="button" onClick={() => setOpen(c)} className="group block w-full text-left">
              <div className="relative aspect-[8/5] overflow-hidden border rule">
                <IndustryArt
                  name={c.title}
                  code={`C${String(i + 1).padStart(2, '0')}`}
                  rows={[
                    ['Status', c.status === 'ACTIVE' ? 'Thinking about it now' : 'Ongoing'],
                    ['Since', c.year],
                    ['Role', c.role.toLowerCase()],
                    ['Tags', c.tags.slice(0, 3).join(', ')],
                  ]}
                  motif={motif(c)}
                  className="transition-transform duration-700 group-hover:scale-[1.02]"
                />
                
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-4">
                <p className="label text-grey-3">
                  C{String(i + 1).padStart(2, '0')} / {c.year}
                </p>
                <p className="label text-grey-3 group-hover:text-paper">Read ↗</p>
              </div>
              <h3 className="headline mt-2 text-[clamp(24px,2.4vw,38px)]">{c.title}</h3>
              <p key={mode} className="mode-fade mt-3 line-clamp-2 max-w-xl text-[15px] text-grey-2">
                {(mode === 'calm' ? c.calm : c.nerd).split('\n')[0]}
              </p>
            </button>
          </Reveal>
        ))}
      </div>

      {/* Open questions, as a live feed */}
      <Reveal className="mt-28 grid gap-6 lg:grid-cols-12">
        <p className="label text-grey-3 lg:col-span-3">Open questions / thinking about now</p>
        <ol className="lg:col-span-9">
          {researchThreads.map((t, i) => (
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
