'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StatusPill from '@/components/StatusPill';
import TagList from '@/components/TagList';
import { battles, education } from '@/data/battles';

const allTags = Array.from(new Set(battles.flatMap((b) => b.tags)));
const allStatuses = Array.from(new Set(battles.map((b) => b.status)));

export default function PastBattlesPage() {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = activeTag
    ? battles.filter((b) => b.tags.includes(activeTag) || b.status === activeTag)
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
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setActiveTag(null)}
                className={`tag ${!activeTag ? 'tag-active' : ''}`}
              >
                All
              </button>
              {allStatuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveTag(activeTag === s ? null : s)}
                  className={`tag ${activeTag === s ? 'tag-active' : ''}`}
                >
                  {s}
                </button>
              ))}
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`tag ${activeTag === tag ? 'tag-active' : ''}`}
                >
                  #{tag}
                </button>
              ))}
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
