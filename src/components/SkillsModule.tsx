'use client';

import { useState } from 'react';
import { useMode } from './ModeContext';
import { skillGroups, skillSections, skillToBuildMap } from '@/data/skills';
import { builds } from '@/data/builds';

export default function SkillsModule() {
  const { mode } = useMode();
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [certsOpen, setCertsOpen] = useState(false);

  const relatedBuildIds = activeSkill ? (skillToBuildMap[activeSkill] || []) : [];
  const relatedBuilds = builds.filter((b) => relatedBuildIds.includes(b.id));
  const allCerts = skillSections.flatMap((s) => s.skills);

  const handleSkillClick = (skill: string) => {
    const hasBuilds = (skillToBuildMap[skill] || []).length > 0;
    if (hasBuilds) setActiveSkill(activeSkill === skill ? null : skill);
  };

  if (mode === 'nerd') {
    return (
      <section className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-12 font-mono text-sm">
          <p className="mb-6">
            <span className="text-text-muted">raunaq@portfolio:~/</span>
            <span className="text-accent"> $ skills --all</span>
          </p>

          <div className="mb-8 space-y-4">
            {skillGroups.map((group) => (
              <div key={group.label}>
                <p className="text-text-muted text-xs mb-2"># {group.label}</p>
                <div className="flex flex-wrap gap-x-5 gap-y-1">
                  {group.skills.map((skill) => {
                    const hasBuilds = (skillToBuildMap[skill] || []).length > 0;
                    return (
                      <button
                        key={skill}
                        onClick={() => handleSkillClick(skill)}
                        className={`text-sm transition-colors ${
                          activeSkill === skill
                            ? 'text-accent'
                            : hasBuilds
                            ? 'text-text-secondary hover:text-accent'
                            : 'text-text-muted cursor-default'
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {activeSkill && relatedBuilds.length > 0 && (
            <div className="mb-8 pl-4 border-l-2 border-accent/30">
              <p className="text-text-muted text-xs mb-2"># builds using {activeSkill}</p>
              {relatedBuilds.map((b) => (
                <p key={b.id} className="text-text-secondary text-xs leading-relaxed">
                  <span className="text-accent">-</span> {b.name}
                  {b.github && (
                    <a
                      href={b.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-muted hover:text-accent ml-2"
                    >
                      [repo]
                    </a>
                  )}
                </p>
              ))}
              <button
                onClick={() => setActiveSkill(null)}
                className="text-text-muted text-xs mt-2 hover:text-accent transition-colors"
              >
                [close]
              </button>
            </div>
          )}

          <p className="mb-4">
            <span className="text-text-muted">raunaq@portfolio:~/</span>
            <span className="text-accent"> $ certs</span>
          </p>

          <div className="space-y-1">
            {allCerts.map((cert) => (
              <p key={cert.title} className="text-text-secondary text-xs leading-relaxed">
                <span className="text-text-muted mr-2">$</span>
                {cert.title}
                {(cert.issuer || cert.year) && (
                  <span className="text-text-muted">
                    {' '}({cert.issuer}{cert.issuer && cert.year ? ', ' : ''}{cert.year})
                  </span>
                )}
                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline ml-2"
                  >
                    [credential]
                  </a>
                )}
              </p>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Calm mode
  return (
    <section className="border-t border-border">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <p className="section-label mb-8 pb-3 border-b border-border">SKILLS</p>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left: grouped skill chips */}
          <div className="md:col-span-2">
            <div className="space-y-5">
              {skillGroups.map((group) => (
                <div key={group.label}>
                  <p className="text-text-muted text-xs font-mono uppercase tracking-wider mb-2">
                    {group.label}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.skills.map((skill) => {
                      const hasBuilds = (skillToBuildMap[skill] || []).length > 0;
                      return (
                        <button
                          key={skill}
                          onClick={() => handleSkillClick(skill)}
                          className={`tag ${
                            activeSkill === skill
                              ? 'tag-active'
                              : hasBuilds
                              ? 'hover:border-accent/40'
                              : 'opacity-60 cursor-default'
                          }`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {activeSkill && relatedBuilds.length > 0 && (
              <div className="mt-5 p-4 rounded-lg border border-accent/20 bg-accent/5">
                <div className="flex items-center justify-between mb-3">
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
                <div className="flex flex-wrap gap-2">
                  {relatedBuilds.map((b) => (
                    <span
                      key={b.id}
                      className="text-xs font-mono text-text-secondary px-2 py-1 rounded border border-border"
                    >
                      {b.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: certifications (collapsible) */}
          <div>
            <button
              onClick={() => setCertsOpen(!certsOpen)}
              className="flex items-center gap-2 text-text-muted text-xs font-mono uppercase tracking-wider mb-3 w-full text-left hover:text-text-primary transition-colors"
            >
              <span
                className="inline-block text-[0.6rem] transition-transform duration-200"
                style={{ transform: certsOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
              >
                &#9654;
              </span>
              Certifications ({allCerts.length})
            </button>
            {certsOpen && (
              <div className="space-y-3">
                {allCerts.map((cert) => (
                  <div key={cert.title}>
                    <p className="text-text-primary text-xs font-medium leading-snug">
                      {cert.title}
                    </p>
                    <p className="text-text-muted text-xs mt-0.5">
                      {cert.issuer}
                      {cert.issuer && cert.year ? ' · ' : ''}{cert.year}
                      {cert.credentialUrl && (
                        <>
                          {' '}
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline"
                          >
                            credential &rarr;
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
