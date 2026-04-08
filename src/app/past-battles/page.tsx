'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StatusPill from '@/components/StatusPill';
import TagList from '@/components/TagList';
import { battles, education } from '@/data/battles';

// Build filter categories
const allIndustries = Array.from(
  new Set(battles.flatMap((b) => (b.keyProjects || []).map((p) => p.industry)))
);
const allProblemStatements = Array.from(
  new Set(battles.flatMap((b) => b.problemStatements || []))
);
const allFrameworks = Array.from(
  new Set(battles.flatMap((b) => b.frameworks || []))
);

type FilterCategory = 'industry' | 'problem' | 'framework';

export default function PastBattlesPage() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<FilterCategory | null>(null);

  const handleFilter = (value: string, category: FilterCategory) => {
    if (activeFilter === value) {
      setActiveFilter(null);
      setActiveCategory(null);
    } else {
      setActiveFilter(value);
      setActiveCategory(category);
    }
  };

  const clearFilter = () => {
    setActiveFilter(null);
    setActiveCategory(null);
  };

  const filtered = activeFilter
    ? battles.filter((b) => {
        if (activeCategory === 'industry') {
          return (b.keyProjects || []).some((p) => p.industry === activeFilter);
        }
        if (activeCategory === 'problem') {
          return (b.problemStatements || []).includes(activeFilter);
        }
        if (activeCategory === 'framework') {
          return (b.frameworks || []).includes(activeFilter);
        }
        return true;
      })
    : battles;

  // Group by section
  const sections = Array.from(new Set(filtered.map((b) => b.section)));

  return (
    <>
      <Header />
      <main className="pt-14">
        <section className="grid-bg py-20">
          <div className="max-w-5xl mx-auto px-6">
            <p className="section-label mb-3">~/past-battles</p>
            <h1 className="font-mono text-3xl sm:text-4xl font-bold mb-4">
              Past Battles
            </h1>
            <p className="text-text-secondary max-w-xl">
              The companies. The work. What actually happened. Outcomes listed honestly.
            </p>
          </div>
        </section>

        {/* Filter bar */}
        <section className="border-y border-border bg-bg-secondary sticky top-14 z-40">
          <div className="max-w-5xl mx-auto px-6 py-3">
            <div className="space-y-2">
              {/* Industries */}
              <div>
                <span className="text-text-muted text-[0.6rem] font-mono uppercase tracking-wider mr-2">Industries:</span>
                <div className="inline-flex flex-wrap gap-1.5">
                  {allIndustries.map((ind) => (
                    <button
                      key={ind}
                      onClick={() => handleFilter(ind, 'industry')}
                      className={`tag ${activeFilter === ind ? 'tag-active' : ''}`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>
              {/* Problem Statements */}
              <div>
                <span className="text-text-muted text-[0.6rem] font-mono uppercase tracking-wider mr-2">Problems:</span>
                <div className="inline-flex flex-wrap gap-1.5">
                  {allProblemStatements.map((ps) => (
                    <button
                      key={ps}
                      onClick={() => handleFilter(ps, 'problem')}
                      className={`tag ${activeFilter === ps ? 'tag-active' : ''}`}
                    >
                      {ps}
                    </button>
                  ))}
                </div>
              </div>
              {/* Frameworks */}
              <div>
                <span className="text-text-muted text-[0.6rem] font-mono uppercase tracking-wider mr-2">Frameworks:</span>
                <div className="inline-flex flex-wrap gap-1.5">
                  {allFrameworks.map((fw) => (
                    <button
                      key={fw}
                      onClick={() => handleFilter(fw, 'framework')}
                      className={`tag ${activeFilter === fw ? 'tag-active' : ''}`}
                    >
                      {fw}
                    </button>
                  ))}
                </div>
              </div>
              {/* Active filter indicator */}
              {activeFilter && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-accent text-xs font-mono">Filtered: {activeFilter}</span>
                  <button onClick={clearFilter} className="text-text-muted text-xs hover:text-accent transition-colors">&times; clear</button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section>
          <div className="max-w-5xl mx-auto px-6 py-8">
            {sections.map((section) => {
              const sectionBattles = filtered.filter((b) => b.section === section);
              if (sectionBattles.length === 0) return null;

              return (
                <div key={section} className="mb-12">
                  <p className="section-label mb-6 pb-3 border-b border-border">
                    {section}
                  </p>

                  {sectionBattles.map((battle) => (
                    <article key={battle.id} className="py-8 border-b border-border last:border-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <StatusPill status={battle.status} />
                        <span className="text-text-muted text-xs font-mono">{battle.period}</span>
                        <span className="text-text-muted text-xs">&middot;</span>
                        <span className="text-text-muted text-xs font-mono">{battle.location}</span>
                      </div>

                      <h2 className="font-mono text-lg font-semibold text-text-primary mb-1">
                        {battle.company}
                      </h2>
                      <p className="text-accent text-sm mb-5">{battle.role}</p>

                      <div className="text-text-secondary text-sm leading-[1.75] whitespace-pre-line mb-6 max-w-3xl">
                        {battle.description}
                      </div>

                      {/* Key Projects by Industry */}
                      {battle.keyProjects && battle.keyProjects.length > 0 && (
                        <div className="mb-6 max-w-3xl">
                          <p className="text-text-muted text-xs font-mono uppercase tracking-wider mb-3">
                            Key Projects
                          </p>
                          <div className="space-y-3">
                            {battle.keyProjects
                              .filter((p) => !activeFilter || activeCategory !== 'industry' || p.industry === activeFilter)
                              .map((project, i) => (
                                <div key={i} className="card rounded-lg px-5 py-3">
                                  <span className="inline-block px-2 py-0.5 rounded text-[0.625rem] font-mono uppercase tracking-wider bg-accent/10 text-accent border border-accent/20 mb-2">
                                    {project.industry}
                                  </span>
                                  <p className="text-text-secondary text-sm leading-relaxed">
                                    {project.description}
                                  </p>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Tools Built */}
                      {battle.tools && battle.tools.length > 0 && (
                        <div className="mb-6">
                          <p className="text-text-muted text-xs font-mono uppercase tracking-wider mb-2">
                            Tools Built
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {battle.tools.map((tool) => (
                              <a
                                key={tool.url}
                                href={tool.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-mono text-text-secondary hover:text-accent hover:border-accent/40 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                                {tool.label}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* External Links (papers, social, etc.) */}
                      {battle.links && battle.links.length > 0 && (
                        <div className="mb-6">
                          <p className="text-text-muted text-xs font-mono uppercase tracking-wider mb-2">
                            {battle.id === 'parikshit' ? 'IEEE Publications & Research' : 'Links'}
                          </p>
                          <div className="space-y-1.5">
                            {battle.links.map((link) => (
                              <a
                                key={link.url}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-sm text-accent-muted hover:text-accent transition-colors"
                              >
                                &rarr; {link.label}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <TagList tags={battle.tags} />
                    </article>
                  ))}
                </div>
              );
            })}

            {/* Education */}
            <div className="mt-8">
              <p className="section-label mb-6 pb-3 border-b border-border">
                EDUCATION
              </p>
              <div className="card rounded-lg p-6">
                <p className="font-mono text-sm font-semibold text-text-primary mb-1">
                  {education.institution}
                </p>
                <p className="text-accent text-sm mb-1">{education.degree}</p>
                <p className="text-text-muted text-xs font-mono mb-3">
                  {education.period} &middot; CGPA {education.cgpa}
                </p>
                <p className="text-text-secondary text-sm italic">{education.note}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
