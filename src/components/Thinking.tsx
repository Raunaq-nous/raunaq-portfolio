import Reveal from './Reveal';
import { thinking } from '@/data/site';

export default function Thinking() {
  return (
    <section id="thinking" className="wrap pt-40 lg:pt-56" aria-labelledby="thinking-title">
      <div className="grid gap-6 lg:grid-cols-12">
        <Reveal className="lg:col-span-3">
          <p className="label text-grey-2">03 / Thinking</p>
        </Reveal>
        <Reveal className="lg:col-span-9" delay={80}>
          <h2 id="thinking-title" className="headline text-[clamp(28px,3vw,44px)] text-grey-1">
            How I approach problems and build products.
          </h2>
        </Reveal>
      </div>

      <ol className="mt-16 lg:mt-24">
        {thinking.map((t, i) => (
          <Reveal as="li" key={t.id} className="grid gap-4 py-10 lg:grid-cols-12 lg:gap-6 lg:py-14">
            <div className="draw-line col-span-full h-px bg-line" />
            <span className="label pt-2 text-grey-3 lg:col-span-1">T{String(i + 1).padStart(2, '0')}</span>
            <p className="headline text-[clamp(32px,4.6vw,76px)] lg:col-span-8">{t.statement}</p>
            <p className="max-w-xs text-[14px] leading-relaxed text-grey-2 lg:col-span-3 lg:self-end">{t.note}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
