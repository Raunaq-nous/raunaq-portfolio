import PixelImage from './PixelImage';
import BrainGraph from './BrainGraph';
import ModeText from './ModeText';
import { portrait } from '@/data/assets';
import { site } from '@/data/site';
import { brainLabels } from '@/data/brain';
import { skillSections } from '@/data/skills';

export default function Hero() {
  return (
    <section id="top" className="wrap relative pb-16 pt-24 lg:min-h-[100svh] lg:pt-28" aria-label="Introduction">
      <div className="grid gap-x-8 gap-y-10 lg:grid-cols-12">
        {/* Brain: what I know, consciously and not */}
        <div className="order-2 lg:order-1 lg:col-span-9">
          <p className="label mb-6 text-grey-3">
            <ModeText calm="FIELD 00 / KNOWLEDGE MAP" nerd="raunaq@portfolio:~ $ cat brain.graph" />
          </p>
          <div className="hidden lg:block">
            <BrainGraph />
          </div>
          <div className="mt-6 hidden border-t rule pt-4 lg:block">
            <p className="label flex flex-wrap gap-x-5 gap-y-1 text-grey-3">
              <span className="text-grey-2">Credentials</span>
              {skillSections
                .flatMap((g) => g.skills)
                .map((c) => (
                  <span key={c.title}>
                    {c.title}
                    {c.issuer ? ` / ${c.issuer}` : ''}
                  </span>
                ))}
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:hidden">
            {(['left', 'right'] as const).map((side) => (
              <div key={side}>
                <p className="label mb-3 text-grey-3">{side === 'left' ? 'Left / conscious / learned' : 'Right / subconscious / intuitive'}</p>
                <ul className="flex flex-wrap gap-1.5">
                  {brainLabels
                    .filter((l) => l.side === side)
                    .map((l) => (
                      <li key={l.id} className={`label border px-2 py-1 normal-case tracking-[0.04em] ${l.active ? 'border-paper/40 text-grey-1' : 'border-paper/15 text-grey-3'}`}>
                        {l.text}
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Portrait: pixelated until you look closer */}
        <div className="order-1 lg:order-2 lg:col-span-3 lg:pt-10">
          <div className="relative aspect-[1200/1130] w-full max-w-[340px]">
            <PixelImage
              src={portrait.src}
              alt={portrait.alt}
              mode="reveal"
              focus={portrait.focus}
              monochrome={1}
              annotate="hero"
              fieldLabel="FIELD 01 / PORTRAIT"
              naturalSize={[portrait.width, portrait.height]}
              priority
            />
          </div>
          <h1 className="headline mt-6 text-[clamp(32px,3vw,46px)]">{site.name}</h1>
          <p className="mt-3 max-w-xs text-[15px] leading-snug text-grey-1">{site.descriptor}</p>
          <p className="mt-2 max-w-xs text-[14px] leading-snug text-grey-2">{site.now}</p>
          <p className="label mt-4 text-grey-3">{site.location}</p>
          <a href="#work" className="label mt-8 inline-flex items-center gap-3 text-grey-2 transition-colors hover:text-paper">
            <span className="inline-block h-px w-10 bg-current" />
            Selected work
          </a>
        </div>
      </div>
    </section>
  );
}
