import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StatusPill from '@/components/StatusPill';
import TagList from '@/components/TagList';
import { curiosities } from '@/data/curiosities';

export default function CuriositiesPage() {
  return (
    <>
      <Header />
      <main className="pt-14">
        <section className="grid-bg py-20">
          <div className="max-w-5xl mx-auto px-6">
            <p className="section-label mb-3">~/curiosities</p>
            <h1 className="font-mono text-3xl sm:text-4xl font-bold mb-4">
              My Current Curiosities
            </h1>
            <p className="text-text-secondary max-w-xl">
              What I&apos;m building, thinking about, and actively working on.
            </p>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <div className="space-y-0">
              {curiosities.map((c, i) => (
                <article
                  key={c.id}
                  className={`py-10 ${i < curiosities.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <StatusPill status={c.status} />
                    <span className="section-label">{c.role}</span>
                    <span className="text-text-muted text-xs font-mono">{c.year}</span>
                  </div>
                  <h2 className="font-mono text-xl font-semibold text-text-primary mb-5">
                    {c.title}
                  </h2>
                  <div className="text-text-secondary text-sm leading-[1.75] whitespace-pre-line mb-6 max-w-3xl">
                    {c.description}
                  </div>
                  <TagList tags={c.tags} />
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
