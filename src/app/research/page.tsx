'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TagList from '@/components/TagList';
import { useMode } from '@/components/ModeContext';
import { papers, researchThreads } from '@/data/research';

export default function ResearchPage() {
  const { mode } = useMode();

  return (
    <>
      <Header />
      <main className="pt-14">
        <section className="grid-bg py-20">
          <div className="max-w-5xl mx-auto px-6">
            <p className="section-label mb-3">~/research</p>
            <h1 className="font-mono text-3xl sm:text-4xl font-bold mb-4">
              Research
            </h1>
            <p className="text-text-secondary max-w-xl">
              Papers I worked on, and the questions I am actively poking at.
            </p>
          </div>
        </section>

        {/* Published Research */}
        <section className="border-t border-border">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <p className="section-label mb-8 pb-3 border-b border-border">
              PUBLISHED RESEARCH
            </p>

            <div className="space-y-0">
              {papers.map((paper, i) => (
                <article
                  key={paper.id}
                  className={`py-8 ${i < papers.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="pill pill-built">{paper.venue}</span>
                    <span className="text-text-muted text-xs font-mono">{paper.year}</span>
                  </div>

                  <h2 className="font-mono text-lg font-semibold text-text-primary mb-3">
                    {paper.title}
                  </h2>

                  <p className="text-text-secondary text-sm leading-[1.75] mb-4 max-w-3xl">
                    {paper.problem}
                  </p>

                  {/* TODO: add the real abstract or a screenshot/thumbnail of the first page of each paper here. Do not invent abstracts. Paste the real ones. */}
                  <div className="card rounded-lg px-5 py-4 mb-4 max-w-3xl">
                    <p className="text-text-muted text-xs font-mono uppercase tracking-wider mb-2">Abstract</p>
                    <p className="text-text-secondary text-sm italic leading-relaxed">
                      {paper.abstract || 'TODO: paste the real abstract from the published paper.'}
                    </p>
                  </div>

                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-accent hover:underline font-mono"
                  >
                    &rarr; Read paper
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Ongoing Research */}
        <section className="border-t border-border">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <p className="section-label mb-4 pb-3 border-b border-border">
              ONGOING RESEARCH
            </p>
            <p className="text-text-secondary text-sm mb-10 max-w-3xl">
              I treat building as a way of doing research. These are the questions I am actively poking at.
            </p>

            <div className="space-y-0">
              {researchThreads.map((thread, i) => (
                <article
                  key={thread.id}
                  className={`py-8 ${i < researchThreads.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <span className="pill pill-ongoing mb-3 inline-block">ONGOING</span>

                  <h2 className="font-mono text-lg font-semibold text-text-primary mb-4">
                    {thread.title}
                  </h2>

                  <div key={mode} className="text-text-secondary text-sm leading-[1.75] mb-5 max-w-3xl mode-fade">
                    {mode === 'calm' ? thread.calm : thread.nerd}
                  </div>

                  {/* TODO: add 1 to 2 sentences of real specifics per thread (a method you tried, a result, a dataset). */}

                  <TagList tags={thread.tags} />
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
