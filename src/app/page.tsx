'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useMode } from '@/components/ModeContext';

const cards = [
  {
    title: 'Curiosities',
    count: 4,
    calm: "Things I'm currently obsessed with.",
    nerd: "Active research threads and builds. AI systems, capital allocation, agentic workflows.",
    tags: 'AI systems · Capital allocation · Agentic workflows',
    href: '/curiosities',
  },
  {
    title: 'Builds',
    count: 12,
    calm: 'Tools I made because they should exist.',
    nerd: '12 production tools. Financial modeling, RAG engines, scheduling optimization, survey automation. Repos linked.',
    tags: 'Python · TypeScript · LangChain · React',
    href: '/builds',
  },
  {
    title: 'Past Battles',
    count: 6,
    calm: 'Where I\'ve worked and what happened.',
    nerd: '6 roles across MBB consulting, growth advisory, competitive intelligence, market entry, and a startup. Key projects tagged by industry.',
    tags: 'Strategy · AI · Capital · Energy · Consumer',
    href: '/past-battles',
  },
  {
    title: 'Skills & Learning',
    count: 14,
    calm: 'What I\'ve learned and what I\'m learning.',
    nerd: 'Certifications from Anthropic, Wharton, Harvard, IBM. Technical stack: Python, LangChain, Next.js, RAG, multi-agent systems.',
    tags: 'AI · Consulting · Finance · Engineering',
    href: '/skills',
  },
];

export default function Home() {
  const { mode } = useMode();

  return (
    <>
      <Header />
      <main className="pt-14">
        {/* Hero */}
        <section className="grid-bg min-h-[85vh] flex items-center">
          <div className="max-w-5xl mx-auto px-6 py-24">
            <div className="flex flex-col md:flex-row md:items-center gap-12">
              <div className="max-w-2xl flex-1">
                <p className="section-label mb-6 fade-in">Raunaq Rakesh</p>
                <h1 className="font-mono text-4xl sm:text-5xl md:text-[3.5rem] font-bold leading-[1.1] tracking-tight mb-8 fade-in-1">
                  THINK.<br />BUILD.<br />SOLVE.
                </h1>

                {mode === 'calm' ? (
                  <>
                    <p className="text-text-secondary text-base leading-relaxed mb-4 fade-in-2">
                      I spend my days advising energy companies and utilities at Bain &amp; Company on
                      capital decisions that keep people up at night. Evenings and weekends, I build
                      AI tools &mdash; not because someone asked me to, but because the problems were
                      there and the tools weren&apos;t.
                    </p>
                    <p className="text-text-secondary text-base leading-relaxed mb-10 fade-in-3">
                      Most of what I enjoy doesn&apos;t come with a playbook. It&apos;s messy, ambiguous
                      stuff &mdash; the kind where you have to figure out the question before you can
                      figure out the answer. Sometimes the fastest path is just building the thing yourself.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-text-secondary text-base leading-relaxed mb-4 fade-in-2">
                      Project Leader at Bain &amp; Company, Capital Projects &amp; Infrastructure.
                      I work on upstream oil feasibility, nuclear program sequencing, solar performance
                      optimization &mdash; decisions involving billions in CapEx with multi-year execution
                      horizons. I also build production AI tools: multi-agent financial modeling, RAG
                      document intelligence, EPC schedule optimization, capital allocation tracking.
                    </p>
                    <p className="text-text-secondary text-base leading-relaxed mb-10 fade-in-3">
                      12 tools shipped. All open-source. Built in Python, TypeScript, LangChain, React,
                      FastAPI, D3.js. The pattern: I hit a problem on an engagement, there&apos;s no
                      good tool for it, so I build one. Then I make it general enough that it works
                      for the next engagement too.
                    </p>
                  </>
                )}

                <div className="fade-in-4">
                  <p className="text-text-muted text-xs font-mono leading-relaxed">
                    {mode === 'calm'
                      ? 'Currently at Bain & Company. Building things on GitHub. Figuring out what agentic AI actually changes.'
                      : 'Bain & Company → Capital Projects. 12 repos on GitHub. Anthropic, Wharton, Harvard certified. 5 IEEE publications.'}
                  </p>
                </div>
              </div>

              {/* Profile photo */}
              <div className="flex-shrink-0 fade-in-2">
                <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden border-2 border-border hover:border-accent/40 transition-colors bg-[#1a2035]">
                  {/* Replace public/profile.jpg with your actual photo */}
                  <img
                    src={`${process.env.__NEXT_ROUTER_BASEPATH || ''}/profile.jpg`}
                    alt="Raunaq Rakesh"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Card Grid */}
        <section className="border-t border-border">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <div className="grid sm:grid-cols-2 gap-4">
              {cards.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className="card rounded-lg p-6 group block"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="font-mono text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">
                      {card.title}
                    </h2>
                    <span className="font-mono text-xs text-text-muted">
                      {card.count}
                    </span>
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed mb-4">
                    {mode === 'calm' ? card.calm : card.nerd}
                  </p>
                  <p className="text-text-muted text-xs font-mono">
                    {card.tags}
                  </p>
                  <div className="mt-4 text-accent text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    &rarr;
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
