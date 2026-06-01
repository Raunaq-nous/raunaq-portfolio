'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StatusPill from '@/components/StatusPill';
import TagList from '@/components/TagList';
import { useMode } from '@/components/ModeContext';
import { curiosities } from '@/data/curiosities';

export default function CuriositiesPage() {
  const { mode } = useMode();
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <>
      <Header />
      <main className="pt-14">
        <section className="grid-bg py-20">
          <div className="max-w-5xl mx-auto px-6">
            <p className="section-label mb-3">~/curiosities</p>
            <h1 className="font-mono text-3xl sm:text-4xl font-bold mb-4">
              My Current Curiosities
            </h1>
            <p className="text-text-secondary max-w-xl">
              {mode === 'calm'
                ? "What I'm building, thinking about, and cannot stop reading about."
                : 'Active research threads and production systems. Toggle to calm for the plain version.'}
            </p>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {curiosities.map((c) => {
                const isOpen = expanded === c.id;

                return (
                  <div key={c.id} className="flex flex-col">
                    <button
                      onClick={() => toggle(c.id)}
                      className={`card rounded-lg p-6 text-left transition-all flex flex-col flex-1 ${
                        isOpen ? 'border-accent/40' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <StatusPill status={c.status} />
                        <span className="text-text-muted text-xs font-mono">{c.year}</span>
                      </div>
                      <h2 className="font-mono text-sm font-semibold text-text-primary mb-3 leading-snug">
                        {c.title}
                      </h2>
                      <p className="section-label mb-3">{c.role}</p>
                      <div className="mt-auto pt-3">
                        <TagList tags={c.tags} />
                      </div>
                      <p className="text-accent text-xs font-mono mt-4">
                        {isOpen ? '− collapse' : '+ read more'}
                      </p>
                    </button>

                    {isOpen && (
                      <div className="card rounded-lg rounded-t-none border-t-0 px-6 py-6 mode-fade">
                        <div key={mode} className="text-text-secondary text-sm leading-[1.75] whitespace-pre-line max-w-3xl mode-fade">
                          {mode === 'calm' ? c.calm : c.nerd}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
