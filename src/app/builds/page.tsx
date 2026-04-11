'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StatusPill from '@/components/StatusPill';
import { useMode } from '@/components/ModeContext';
import ModeToggle from '@/components/ModeToggle';
import { builds } from '@/data/builds';

const allTags = Array.from(new Set(builds.flatMap((b) => b.tags)));

export default function BuildsPage() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const { mode } = useMode();

  const filtered = activeTag
    ? builds.filter((b) => b.tags.includes(activeTag))
    : builds;

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      <Header />
      <main className="pt-14">
        <section className="grid-bg py-20">
          <div className="max-w-5xl mx-auto px-6">
            <p className="section-label mb-3">~/builds</p>
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-mono text-3xl sm:text-4xl font-bold">
                My Builds
              </h1>
              <ModeToggle />
            </div>
            <p className="text-text-secondary max-w-xl">
              {mode === 'calm'
                ? 'Tools, systems, and experiments. Things I built because they needed to exist.'
                : 'Production tools with open-source repos. Click any build to see architecture, agent chains, and data pipelines.'}
            </p>
          </div>
        </section>

        {/* Filter bar */}
        <section className="border-y border-border bg-bg-secondary sticky top-14 z-40">
          <div className="max-w-5xl mx-auto px-6 py-3 overflow-x-auto scrollbar-hide">
            <div className="flex gap-1.5 whitespace-nowrap">
              <button
                onClick={() => setActiveTag(null)}
                className={`tag ${!activeTag ? 'tag-active' : ''}`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`tag ${activeTag === tag ? 'tag-active' : ''}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="max-w-5xl mx-auto px-6 py-8">
            <p className="text-text-muted text-xs font-mono mb-8">
              {filtered.length} {filtered.length === 1 ? 'build' : 'builds'}
              {activeTag && <> matching <span className="text-accent-muted">{activeTag}</span></>}
            </p>

            <div className="space-y-0">
              {filtered.map((build, i) => (
                <article
                  key={build.id}
                  className={`py-8 ${i < filtered.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <StatusPill status={build.status} />
                  </div>

                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h2 className="font-mono text-lg font-semibold text-text-primary">
                      {build.name}
                    </h2>
                    {build.github && (
                      <a
                        href={build.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-muted hover:text-accent transition-colors text-xs font-mono flex-shrink-0"
                      >
                        &rarr; GitHub
                      </a>
                    )}
                  </div>

                  <div className="text-text-secondary text-sm leading-[1.75] whitespace-pre-line mb-5 max-w-3xl">
                    {mode === 'calm' ? build.calmDescription : build.description}
                  </div>

                  <div className="card rounded-lg px-5 py-3 mb-5 inline-block">
                    <p className="text-xs text-text-muted font-mono uppercase tracking-wider mb-1">What it does</p>
                    <p className="text-sm text-accent-muted italic">{build.punchline}</p>
                  </div>

                  {/* Nerd mode: Process/Method section */}
                  {mode === 'nerd' && build.process && (
                    <div className="mb-5">
                      <button
                        onClick={() => toggleExpand(build.id)}
                        className="flex items-center gap-2 text-xs font-mono text-accent hover:text-accent-muted transition-colors"
                      >
                        <span className="inline-block transition-transform" style={{ transform: expanded.has(build.id) ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                          &#9654;
                        </span>
                        {expanded.has(build.id) ? 'Hide' : 'Show'} how it works
                      </button>
                      {expanded.has(build.id) && (
                        <div className="mt-4 card rounded-lg p-6 border-l-2 border-accent/30">
                          <p className="text-xs text-text-muted font-mono uppercase tracking-wider mb-4">
                            Process / Architecture
                          </p>
                          <div className="text-text-secondary text-sm leading-[1.85] whitespace-pre-line font-mono max-w-3xl">
                            {build.process}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {build.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
