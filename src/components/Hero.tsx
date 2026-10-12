import PixelImage from './PixelImage';
import { portrait } from '@/data/assets';
import { site } from '@/data/site';
import ModeText from './ModeText';

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden lg:min-h-[100svh]" aria-label="Introduction">
      {/* Portrait: the dominant visual anchor */}
      <div className="relative mx-[var(--gutter)] mt-20 aspect-[1200/1130] max-w-md lg:absolute lg:bottom-16 lg:right-[var(--gutter)] lg:mx-0 lg:mt-0 lg:w-[30vw] lg:max-w-[520px]">
        <PixelImage
          src={portrait.src}
          alt={portrait.alt}
          mode="distort"
          focus={portrait.focus}
          monochrome={1}
          annotate="hero"
          strength={2}
          fieldLabel="FIELD 01 / PORTRAIT"
          naturalSize={[portrait.width, portrait.height]}
          priority
        />
        <div className="ruler pointer-events-none absolute -top-3 left-0 right-0 hidden lg:block" aria-hidden />
      </div>

      {/* Editorial column */}
      <div className="wrap relative z-10 flex flex-col pb-10 pt-8 lg:pointer-events-none lg:min-h-[100svh] lg:pb-8 lg:pt-[96px]">
        <div className="grid max-w-[50vw] grid-cols-2 gap-6 text-grey-2 max-lg:hidden">
          <p className="label normal-case tracking-normal">
            <ModeText calm="PORTFOLIO / INDEX 00" nerd="raunaq@portfolio:~ $ whoami" />
          </p>
          <p className="label">
            Strategy / Finance / AI
            <br />
            {site.location}
          </p>
        </div>

        <div className="mt-auto">
          <h1 className="display text-[clamp(64px,11.5vw,210px)] text-paper lg:mix-blend-difference">
            <span className="block">{site.firstName}</span>
            <span className="block lg:pl-[8vw]">{site.lastName}</span>
          </h1>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:max-w-[52vw] lg:pointer-events-auto">
            <p className="max-w-sm text-[17px] leading-snug text-paper">{site.descriptor}</p>
            <div className="space-y-3">
              <p className="max-w-xs text-[15px] leading-snug text-grey-1">{site.now}</p>
              <p className="label text-grey-3">Earlier / nanosatellite ADCS, built under ISRO guidance</p>
            </div>
          </div>

          <a href="#work" className="label mt-10 inline-flex items-center gap-3 text-grey-2 transition-colors hover:text-paper lg:pointer-events-auto">
            <span className="inline-block h-px w-10 bg-current" />
            Scroll to selected work
          </a>
        </div>
      </div>
    </section>
  );
}
