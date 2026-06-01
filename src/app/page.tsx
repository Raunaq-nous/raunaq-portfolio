'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useMode } from '@/components/ModeContext';

const cards = [
  {
    title: 'Curiosities',
    count: 5,
    calm: "What I'm thinking about, building toward, and can't stop reading about.",
    nerd: 'Active research threads and production systems. Architecture, stack, the hard part.',
    tags: 'AI systems · strategy tools · finance',
    href: '/curiosities',
  },
  {
    title: 'Builds',
    count: 13,
    calm: 'Tools I made because they should exist. Some are serious. All are real.',
    nerd: '13 production tools. Financial modeling, RAG engines, scheduling, survey automation. Repos linked.',
    tags: 'Python · TypeScript · LangChain · React',
    href: '/builds',
  },
  {
    title: 'Past Battles',
    count: 6,
    calm: "Where I've worked and what happened.",
    nerd: '6 roles across consulting, growth advisory, competitive intelligence, market entry, and a startup.',
    tags: 'strategy · AI · energy · consumer · finance',
    href: '/past-battles',
  },
  {
    title: 'Skills & Learning',
    count: 14,
    calm: "What I know, what I'm learning, and where I've applied it.",
    nerd: 'Certifications from Anthropic, Wharton, Harvard, IBM. Stack: Python, LangChain, Next.js, RAG, multi-agent systems.',
    tags: 'AI · consulting · finance · engineering',
    href: '/skills',
  },
  {
    title: 'Research',
    count: 5,
    calm: 'Papers I worked on, and the AI questions I am chewing on now.',
    nerd: 'IEEE publications, ongoing research threads in multi-agent finance, document intelligence, and portfolio monitoring.',
    tags: 'IEEE · satellite ADCS · AI · document intelligence',
    href: '/research',
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

                <div key={mode} className="mode-fade">
                  {mode === 'calm' ? (
                    <>
                      <p className="text-text-secondary text-base leading-relaxed mb-4 fade-in-2">
                        I like problems that don&apos;t come with instructions. The kind where you have
                        to work out the question before you can touch the answer.
                      </p>
                      <p className="text-text-secondary text-base leading-relaxed mb-4 fade-in-3">
                        These days that mostly means expensive decisions in large, capital heavy industries.
                        Someone has a very big question and a lot riding on it, and I help them get to an
                        answer they can actually act on. Nights and weekends, I build AI tools, usually
                        because I ran into a problem during the day and the tool I wanted did not exist yet.
                      </p>
                      <p className="text-text-secondary text-base leading-relaxed mb-10 fade-in-3">
                        Before any of this I was working out how to stop a nanosatellite from tumbling
                        in orbit. That is where I learned that a messy problem is just a clean problem
                        you have not broken down yet. I swapped angular velocities for cash flows, but
                        the job is basically the same. Take something tangled and make it make sense.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-text-secondary text-base leading-relaxed mb-4 fade-in-2">
                        I like problems that don&apos;t come with instructions. The kind where you have
                        to work out the question before you can touch the answer.
                      </p>
                      <p className="text-text-secondary text-base leading-relaxed mb-4 fade-in-3">
                        These days that means expensive decisions in large, capital heavy industries,
                        and the AI systems I build to make that work faster. Mostly Python, LangChain,
                        and multi-agent setups for the analytical tools, with TypeScript and Next.js
                        when something needs a real front end. The pattern is always the same. Take a
                        slow manual process and turn it into something that runs while you are still
                        in the room.
                      </p>
                      <p className="text-text-secondary text-base leading-relaxed mb-10 fade-in-3">
                        Before any of this I ran the attitude determination and control subsystem on a
                        student nanosatellite built under ISRO. The job was to hold its orientation
                        within spec while it moved at orbital speed, which comes down to reading noisy
                        sensor data and feeding a control loop that corrects the spin. That is where I
                        learned that a messy problem is just a clean problem you have not broken down
                        yet. I swapped angular velocities for cash flows, but the work is basically the same.
                      </p>
                    </>
                  )}
                </div>

                <div className="fade-in-4">
                  <p className="text-text-muted text-xs font-mono leading-relaxed">
                    Right now: solving expensive problems by day, building tools by night.
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
                  <p key={mode} className="text-text-secondary text-sm leading-relaxed mb-4 mode-fade">
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
