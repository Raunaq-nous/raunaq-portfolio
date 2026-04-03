import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const cards = [
  {
    title: 'Curiosities',
    count: 4,
    description: "What I'm building, thinking about, and advising on right now.",
    tags: 'AI systems \u00b7 Capital allocation \u00b7 Agentic workflows',
    href: '/curiosities',
  },
  {
    title: 'Builds',
    count: 12,
    description: 'Tools I built because the problem annoyed me enough. Some are serious. All are real.',
    tags: 'Python \u00b7 TypeScript \u00b7 LangChain \u00b7 React',
    href: '/builds',
  },
  {
    title: 'Past Battles',
    count: 6,
    description: 'The work. The companies. What actually happened.',
    tags: 'Strategy \u00b7 AI \u00b7 Capital \u00b7 Energy \u00b7 Consumer',
    href: '/past-battles',
  },
  {
    title: 'Skills & Learning',
    count: 14,
    description: 'Courses completed, skills being built, credentials earned.',
    tags: 'AI \u00b7 Consulting \u00b7 Finance \u00b7 Engineering',
    href: '/skills',
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main className="pt-14">
        {/* Hero */}
        <section className="grid-bg min-h-[85vh] flex items-center">
          <div className="max-w-5xl mx-auto px-6 py-24">
            <div className="max-w-2xl">
              <p className="section-label mb-6 fade-in">Raunaq Rakesh</p>
              <h1 className="font-mono text-4xl sm:text-5xl md:text-[3.5rem] font-bold leading-[1.1] tracking-tight mb-8 fade-in-1">
                THINK.<br />BUILD.<br />SOLVE.
              </h1>
              <p className="text-text-secondary text-base leading-relaxed mb-4 fade-in-2">
                I work at the intersection of strategy, capital, and AI &mdash; where the interesting
                problems actually live. By day, I&apos;m a Project Leader at Bain & Company, advising
                energy companies and utilities on decisions that involve a lot of zeros. Outside of
                that, I build AI systems. Not as a side project. As a habit.
              </p>
              <p className="text-text-secondary text-base leading-relaxed mb-10 fade-in-3">
                I love hard problems. The kind that don&apos;t have a clean framework. The kind that
                require you to think clearly, move fast, and occasionally just build the tool that
                doesn&apos;t exist yet.
              </p>
              <div className="fade-in-4">
                <p className="text-text-muted text-xs font-mono leading-relaxed">
                  Currently at Bain & Company &mdash; Capital Projects. Building things on GitHub.
                  Thinking about what agentic AI actually changes.
                </p>
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
                    {card.description}
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
