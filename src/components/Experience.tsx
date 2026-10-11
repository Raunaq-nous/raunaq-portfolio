'use client';

import Link from 'next/link';
import { useState } from 'react';
import Reveal from './Reveal';
import { battles, education } from '@/data/battles';
import { papers } from '@/data/research';

function years(period: string) {
  const ys = period.match(/\d{4}/g) ?? [];
  const end = /present/i.test(period) ? 'Now' : ys[1] ?? '';
  return { start: ys[0] ?? '', end };
}

export default function Experience() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section id="experience" className="wrap pt-40 lg:pt-56" aria-labelledby="experience-title">
      <div className="grid gap-6 lg:grid-cols-12">
        <Reveal className="lg:col-span-3">
          <p className="label text-grey-2">04 / Experience</p>
        </Reveal>
        <Reveal className="lg:col-span-9" delay={80}>
          <h2 id="experience-title" className="headline text-[clamp(44px,6vw,96px)]">
            Where I have worked.
          </h2>
        </Reveal>
      </div>

      <div className="mt-16 lg:mt-24">
        <div className="label hidden grid-cols-12 gap-6 border-b rule pb-3 text-grey-3 md:grid">
          <span className="col-span-2">Year</span>
          <span className="col-span-4">Company</span>
          <span className="col-span-4">Role</span>
          <span className="col-span-2 text-right">Location</span>
        </div>

        <ul>
          {battles.map((b) => {
            const y = years(b.period);
            const isOpen = open === b.id;
            const panelId = `exp-${b.id}`;
            const isParikshit = b.id === 'parikshit';
            return (
              <li key={b.id} className="border-b rule">
                <button
                  type="button"
                  className="group grid w-full grid-cols-12 items-baseline gap-x-6 gap-y-1 py-6 text-left"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : b.id)}
                >
                  <span className="label col-span-12 text-grey-2 md:col-span-2">
                    {y.start} / {y.end}
                  </span>
                  <span className="col-span-10 text-2xl tracking-tight transition-transform duration-500 group-hover:translate-x-1 md:col-span-4 md:text-3xl">
                    {b.company.split(',')[0]}
                  </span>
                  <span className="col-span-12 text-[15px] text-grey-1 md:col-span-4">{b.role}</span>
                  <span className="label col-span-2 hidden text-right text-grey-3 md:block">
                    {b.location} <span className="ml-2 inline-block w-3 text-paper">{isOpen ? '−' : '+'}</span>
                  </span>
                </button>

                <div id={panelId} hidden={!isOpen} className={`${isOpen ? 'grid' : 'hidden'} gap-10 pb-12 md:grid-cols-12 md:gap-6`}>
                  <div className="md:col-span-5 md:col-start-3">
                    {b.company.includes(',') && <p className="label mb-4 text-grey-3">{b.company}</p>}
                    <p className="text-[16px] leading-relaxed text-grey-1">{b.description}</p>

                    {b.tools && b.tools.length > 0 && (
                      <div className="mt-8">
                        <p className="label mb-3 text-grey-3">Tools built</p>
                        <ul className="space-y-2">
                          {b.tools.map((t) => (
                            <li key={t.url}>
                              <a href={t.url} target="_blank" rel="noopener noreferrer" className="link-quiet text-[14px] text-paper">
                                {t.label} <span aria-hidden>↗</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {b.links && b.links.length > 0 && !isParikshit && (
                      <ul className="mt-8 space-y-2">
                        {b.links.map((l) => (
                          <li key={l.url}>
                            <a href={l.url} target="_blank" rel="noopener noreferrer" className="link-quiet text-[14px] text-paper">
                              {l.label} <span aria-hidden>↗</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="md:col-span-5">
                    {b.keyProjects && b.keyProjects.length > 0 && (
                      <>
                        <p className="label mb-3 text-grey-3">Key projects</p>
                        <ul>
                          {b.keyProjects.map((k, i) => (
                            <li key={i} className="grid grid-cols-[9rem_1fr] gap-4 border-t rule py-3 text-[14px] leading-relaxed">
                              <span className="label pt-0.5 text-grey-2">{k.industry}</span>
                              <span className="text-grey-1">{k.description}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {isParikshit && (
                      <>
                        <p className="label mb-3 text-grey-3">Published papers</p>
                        <ul>
                          {papers.map((p) => (
                            <li key={p.id} className="border-t rule py-3">
                              <a href={p.url} target="_blank" rel="noopener noreferrer" className="group block">
                                <span className="text-[14px] text-paper group-hover:underline">{p.formalTitle}</span>
                                <span className="label mt-1 block text-grey-2">
                                  {p.venue} / {p.year}
                                  {p.leadAuthor ? ' / Lead author' : ''}
                                </span>
                              </a>
                            </li>
                          ))}
                        </ul>
                        <Link href="/atlas/?cluster=ideas" className="label link-quiet mt-4 inline-block text-paper">
                          See them in the Atlas
                        </Link>
                      </>
                    )}

                    {(b.problemStatements?.length || b.frameworks?.length) && (
                      <dl className="mt-8 grid grid-cols-2 gap-6 text-[13px] text-grey-2">
                        {b.problemStatements && (
                          <div>
                            <dt className="label mb-2 text-grey-3">Problems</dt>
                            {b.problemStatements.map((s) => (
                              <dd key={s}>{s}</dd>
                            ))}
                          </div>
                        )}
                        {b.frameworks && (
                          <div>
                            <dt className="label mb-2 text-grey-3">Methods</dt>
                            {b.frameworks.map((s) => (
                              <dd key={s}>{s}</dd>
                            ))}
                          </div>
                        )}
                      </dl>
                    )}
                  </div>
                </div>
              </li>
            );
          })}

          <li className="grid grid-cols-12 items-baseline gap-x-6 gap-y-1 py-6">
            <span className="label col-span-12 text-grey-2 md:col-span-2">{education.period.replace(/\s*\S\s*(?=\d{4})/, ' / ')}</span>
            <span className="col-span-12 text-2xl tracking-tight md:col-span-4 md:text-3xl">{education.institution}</span>
            <span className="col-span-12 text-[15px] text-grey-1 md:col-span-4">{education.degree}</span>
            <span className="label col-span-2 hidden text-right text-grey-3 md:block">Education</span>
            <p className="col-span-12 mt-3 max-w-xl text-[14px] italic text-grey-2 md:col-span-6 md:col-start-3">{education.note}</p>
          </li>
        </ul>
      </div>
    </section>
  );
}
