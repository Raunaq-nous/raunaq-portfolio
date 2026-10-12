import Reveal from './Reveal';
import SectionLabel from './SectionLabel';
import { site } from '@/data/site';

const SLICES = 7;
const SHIFTS = [-14, 9, -4, 18, -10, 6, -16];

function SlicedLine({ text }: { text: string }) {
  return (
    <span className="slice-text">
      <span className="base">{text}</span>
      {Array.from({ length: SLICES }).map((_, i) => {
        const top = (i / SLICES) * 100;
        const bottom = 100 - ((i + 1) / SLICES) * 100;
        return (
          <span
            key={i}
            className="slice"
            aria-hidden
            style={
              {
                clipPath: `inset(${top}% 0 ${bottom}% 0)`,
                '--shift': `${SHIFTS[i]}px`,
                transitionDelay: `${i * 22}ms`,
              } as React.CSSProperties
            }
          >
            {text}
          </span>
        );
      })}
    </span>
  );
}

export default function Contact() {
  return (
    <section id="contact" className="wrap pb-10 pt-32 lg:pt-48" aria-labelledby="contact-title">
      <Reveal>
        <SectionLabel n="06" calm="Contact" path="contact" cmd="ping raunaq" />
        <h2 id="contact-title" className="headline mt-10 max-w-4xl text-[clamp(36px,5vw,80px)]">
          <SlicedLine text="Strategy. Finance. AI." />
          <span className="block text-grey-2">
            <SlicedLine text="Sometimes all three at once." />
          </span>
        </h2>
      </Reveal>

      <Reveal className="mt-16 grid gap-6 border-t rule pt-8 lg:mt-24 lg:grid-cols-12" delay={120}>
        <p className="label text-grey-3 lg:col-span-3">Elsewhere</p>
        <ul className="lg:col-span-6">
          {site.links.map((l) => (
            <li key={l.href} className="border-b rule">
              <a href={l.href} target="_blank" rel="noopener noreferrer" className="group flex items-baseline justify-between py-5">
                <span className="text-3xl tracking-tight transition-transform duration-500 group-hover:translate-x-2 md:text-4xl">{l.label}</span>
                <span className="label text-grey-2 group-hover:text-paper">
                  {l.handle} <span aria-hidden>↗</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Reveal>

      <footer className="label mt-24 flex flex-wrap items-end justify-between gap-4 text-grey-3">
        <span>
          {site.name} / {new Date().getFullYear()}
        </span>
        <span>{site.tagline}</span>
        <a href="#top" className="link-quiet hover:text-paper">
          Back to top
        </a>
      </footer>
    </section>
  );
}
