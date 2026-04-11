'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useMode } from '@/components/ModeContext';

const cards = [
  {
    title: 'Curiosities',
    count: 3,
    description: "What I'm thinking about, building toward, and can't stop reading about.",
    tags: 'AI systems · Strategy tools · Finance',
    href: '/curiosities',
  },
  {
    title: 'Builds',
    count: 12,
    description: 'Tools I made because they should exist. Some are serious. All are real.',
    tags: 'Python · TypeScript · LangChain · React',
    href: '/builds',
  },
  {
    title: 'Past Battles',
    count: 6,
    description: 'Where I\'ve worked and what happened.',
    tags: 'Strategy · AI · Energy · Consumer · Finance',
    href: '/past-battles',
  },
  {
    title: 'Skills & Learning',
    count: 14,
    description: 'What I know, what I\'m learning, and where I\'ve applied it.',
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

                <p className="text-text-secondary text-base leading-relaxed mb-4 fade-in-2">
                  I&apos;m a consulting problem solver who works where strategy, finance, and technology
                  actually overlap. I spend my days advising on high-stakes investment decisions &mdash;
                  the kind where someone has to look at a billion-dollar question and come back with
                  something useful. Evenings and weekends, I build AI tools. Not because someone asked
                  me to, but because the problems were right there and the tools weren&apos;t.
                </p>
                <p className="text-text-secondary text-base leading-relaxed mb-4 fade-in-3">
                  Before any of this, I was designing attitude control systems for a nano-satellite
                  at 28,800 km/hr under ISRO. Five IEEE papers by the time I graduated. Turns out,
                  figuring out how to stop a satellite from spinning taught me more about structured
                  problem-solving than any MBA ever could. I just traded angular velocities for IRR calculations.
                </p>
                <p className="text-text-secondary text-base leading-relaxed mb-10 fade-in-3">
                  Most of what I enjoy doesn&apos;t come with a playbook. It&apos;s messy, ambiguous
                  stuff &mdash; the kind where you have to figure out the question before you can
                  figure out the answer. Sometimes the fastest path is just building the thing yourself.
                </p>

                <div className="fade-in-4">
                  <p className="text-text-muted text-xs font-mono leading-relaxed">
                    Currently consulting at the intersection of strategy, finance &amp; AI.
                    Building tools on GitHub. 12 repos. 5 IEEE publications. Wharton, Harvard, Anthropic certified.
                  </p>
                </div>
              </div>

              {/* Profile photo */}
              <div className="flex-shrink-0 fade-in-2">
                <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden border-2 border-border hover:border-accent/40 transition-colors bg-[#1a2035]">
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
