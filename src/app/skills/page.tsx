'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { skillSections, technicalSkills, domainSkills, skillToBuildMap } from '@/data/skills';
import { builds } from '@/data/builds';

export default function SkillsPage() {
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  const relatedBuildIds = activeSkill ? (skillToBuildMap[activeSkill] || []) : [];
  const relatedBuilds = builds.filter((b) => relatedBuildIds.includes(b.id));

  return (
    <>
      <Header />
      <main className="pt-14">
        <section className="grid-bg py-20">
          <div className="max-w-5xl mx-auto px-6">
            <p className="section-label mb-3">~/skills</p>
            <h1 className="font-mono text-3xl sm:text-4xl font-bold mb-4">
              Skills & Learning
            </h1>
            <p className="text-text-secondary max-w-xl">
              Courses completed. Credentials earned. Click a technical skill to see where I&apos;ve applied it.
            </p>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="max-w-5xl mx-auto px-6 py-12">
            {/* Certified Skills */}
            {skillSections.map((section) => (
              <div key={section.label} className="mb-12">
                <p className="section-label mb-6 pb-3 border-b border-border">
                  {section.label}
                </p>
                <div className="space-y-0">
                  {section.skills.map((skill, i) => (
                    <div
                      key={skill.title}
                      className={`flex items-start justify-between py-4 ${
                        i < section.skills.length - 1 ? 'border-b border-border/50' : ''
                      }`}
                    >
                      <div>
                        <p className="text-text-primary text-sm font-medium">
                          {skill.title}
                        </p>
                        <p className="text-text-muted text-xs mt-0.5">
                          {skill.issuer}
                          {skill.year && <> &middot; {skill.year}</>}
                        </p>
                      </div>
                      {skill.credentialUrl && (
                        <a
                          href={skill.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent text-xs font-mono flex-shrink-0 hover:underline"
                        >
                          credential &rarr;
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Technical Skills - Clickable */}
            <div className="mb-12">
              <p className="section-label mb-6 pb-3 border-b border-border">
                TECHNICAL SKILLS (CLICK TO SEE RELATED BUILDS)
              </p>
              <div className="flex flex-wrap gap-2">
                {technicalSkills.map((skill) => {
                  const hasBuilds = (skillToBuildMap[skill] || []).length > 0;
                  return (
                    <button
                      key={skill}
                      onClick={() => hasBuilds ? setActiveSkill(activeSkill === skill ? null : skill) : undefined}
                      className={`tag transition-all ${
                        activeSkill === skill
                          ? 'tag-active'
                          : hasBuilds
                          ? 'cursor-pointer hover:border-accent/40'
                          : 'opacity-70'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>

              {/* Related builds panel */}
              {activeSkill && relatedBuilds.length > 0 && (
                <div className="mt-6 p-5 rounded-lg border border-accent/20 bg-accent/5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-accent text-xs font-mono uppercase tracking-wider">
                      Builds using {activeSkill}
                    </p>
                    <button
                      onClick={() => setActiveSkill(null)}
                      className="text-text-muted text-xs hover:text-accent transition-colors"
                    >
                      &times; close
                    </button>
                  </div>
                  <div className="space-y-3">
                    {relatedBuilds.map((build) => (
                      <div key={build.id} className="card rounded-lg px-5 py-3">
                        <p className="text-text-primary text-sm font-medium font-mono mb-1">
                          {build.name}
                        </p>
                        <p className="text-text-secondary text-xs leading-relaxed">
                          {build.calm}
                        </p>
                        {build.github && (
                          <a
                            href={build.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-accent text-xs font-mono mt-2 hover:underline"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                            View repo
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* LinkedIn Verified */}
            <div className="mb-12">
              <p className="section-label mb-6 pb-3 border-b border-border">
                SKILLS
              </p>
              <div className="flex flex-wrap gap-2">
                {domainSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-md border border-border text-text-secondary text-xs hover:border-accent/40 transition-colors"
                  >
                    {skill}
                  </span>
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
