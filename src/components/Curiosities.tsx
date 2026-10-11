'use client';

import { useState } from 'react';
import Reveal from './Reveal';
import SectionLabel from './SectionLabel';
import { useMode } from './ModeContext';
import { curiosities } from '@/data/curiosities';
import { researchThreads } from '@/data/research';

export default function Curiosities() {
  const { mode } = useMode();
  const [open, setOpen] = useState<string | null>(curiosities[0]?.id ?? null);

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

      <ul className="mt-16 lg:mt-24">
        {curiosities.map((c, i) => {
          const isOpen = open === c.id;
          return (
            <li key={c.id} className="border-t rule">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : c.id)}
                aria-expanded={isOpen}
                aria-controls={`cur-${c.id}`}
                className="group grid w-full grid-cols-12 items-baseline gap-x-6 gap-y-2 py-7 text-left"
              >
                <span className="label col-span-12 text-grey-3 md:col-span-2">
                  C{String(i + 1).padStart(2, '0')} / {c.year}
                </span>
                <span className="headline col-span-11 text-[clamp(26px,3vw,44px)] transition-transform duration-500 group-hover:translate-x-1 md:col-span-7">
                  {c.title}
                </span>
                <span className="label col-span-1 text-right text-grey-2 md:col-span-3">
                  <span className="max-md:hidden">{c.role} </span>
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              <div id={`cur-${c.id}`} hidden={!isOpen} className={isOpen ? 'grid gap-6 pb-12 md:grid-cols-12' : 'hidden'}>
                <div key={mode} className="mode-fade space-y-4 text-[16px] leading-relaxed text-grey-1 md:col-span-7 md:col-start-3">
                  {(mode === 'calm' ? c.calm : c.nerd).split(/\n\s*\n/).map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}
                </div>
                <ul className="label flex flex-wrap content-start gap-x-4 gap-y-2 text-grey-3 md:col-span-3">
                  {c.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-24 grid gap-6 lg:grid-cols-12">
        <p className="label text-grey-3 lg:col-span-3">Ongoing research</p>
        <div className="lg:col-span-9">
          <p className="mb-8 max-w-2xl text-[15px] text-grey-2">I treat building as a way of doing research. These are the questions I am actively poking at.</p>
          <div className="grid gap-px border rule bg-line md:grid-cols-2">
            {researchThreads.map((t) => (
              <article key={t.id} className="bg-ink p-6">
                <p className="label text-grey-3">Ongoing</p>
                <h3 className="mt-3 text-[20px] leading-snug tracking-tight">{t.title}</h3>
                <p key={mode} className="mode-fade mt-3 text-[14px] leading-relaxed text-grey-1">
                  {mode === 'calm' ? t.calm : t.nerd}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
