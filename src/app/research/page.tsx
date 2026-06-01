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
              {mode === 'calm'
                ? 'Papers I worked on, and the questions I am actively poking at.'
                : 'Published papers and active research threads. Two tracks: AI systems now, aerospace controls then.'}
            </p>
          </div>
        </section>

        {/* Track A: AI research (now) */}
        <section className="border-t border-border">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <p className="section-label mb-4 pb-3 border-b border-border">
              {mode === 'nerd' ? '# TRACK_A: AI RESEARCH (NOW)' : 'AI RESEARCH (NOW)'}
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

                  <TagList tags={thread.tags} />
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Track B: Aerospace (then) - two-column */}
        <section className="border-t border-border">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <p className="section-label mb-4 pb-3 border-b border-border">
              {mode === 'nerd' ? '# TRACK_B: PARIKSHIT NANO-SATELLITE (THEN)' : 'PARIKSHIT NANO-SATELLITE (THEN)'}
            </p>

            <div className="grid md:grid-cols-5 gap-10">
              {/* Left: narrative */}
              <div className="md:col-span-2">
                <div key={mode} className="mode-fade">
                  {mode === 'calm' ? (
                    <p className="text-text-secondary text-sm leading-[1.75]">
                      Before AI, I worked on attitude determination and control for Parikshit, a student
                      nanosatellite built under ISRO guidance. The job was to keep a satellite stable at
                      28,800 km/hr while deploying a tether and de-orbiting. Four published papers came
                      out of it, three as lead author.
                    </p>
                  ) : (
                    <div className="text-text-secondary text-sm leading-[1.75] font-mono">
                      <p className="text-text-muted mb-2">
                        raunaq@portfolio:~/research/parikshit $
                        <span className="text-accent"> cat README.md</span>
                      </p>
                      <p>
                        ADCS subsystem for the Parikshit nanosatellite (ISRO student programme).
                        Quaternion-based attitude dynamics, tether deployment control, SIL testing.
                        Four published papers (2015-2016), three as lead author.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: paper cards */}
              <div className="md:col-span-3 space-y-4">
                {papers.map((paper) => (
                  <div key={paper.id} className="card rounded-lg p-5">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="pill pill-built">{paper.venue}</span>
                      <span className="text-text-muted text-xs font-mono">{paper.year}</span>
                      {paper.leadAuthor && (
                        <span className="text-accent-2 text-[0.6rem] font-mono uppercase tracking-wider">
                          lead author
                        </span>
                      )}
                    </div>

                    <h3 key={mode} className="font-mono text-sm font-semibold text-text-primary mb-2 leading-snug mode-fade">
                      {mode === 'calm' ? paper.calmTitle : paper.nerdTitle}
                    </h3>

                    <p key={`${mode}-desc`} className="text-text-secondary text-xs leading-[1.75] mb-3 mode-fade">
                      {mode === 'calm' ? paper.calm : paper.nerd}
                    </p>

                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-accent hover:underline font-mono"
                    >
                      &rarr; Read paper
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
