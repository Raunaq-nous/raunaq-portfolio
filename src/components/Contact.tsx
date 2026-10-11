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
    <section id="contact" className="wrap pb-10 pt-40 lg:pt-64" aria-labelledby="contact-title">
      <Reveal>
        <SectionLabel n="06" calm="Contact" path="contact" cmd="ping raunaq" />
        <h2 id="contact-title" className="display mt-10 text-[clamp(52px,11vw,200px)]" aria-label="Think. Build. Solve.">
          <span className="block">
            <SlicedLine text="Think." />
          </span>
          <span className="block lg:pl-[10vw]">
            <SlicedLine text="Build." />
          </span>
          <span className="block text-grey-2 lg:pl-[20vw]">
            <SlicedLine text="Solve." />
          </span>
        </h2>
      </Reveal>

      <Reveal className="mt-24 grid gap-6 border-t rule pt-8 lg:mt-40 lg:grid-cols-12" delay={120}>
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

      <footer className="label mt-40 flex flex-wrap items-end justify-between gap-4 text-grey-3">
        <span>
          {site.name} / {new Date().getFullYear()}
        </span>
        <span>{site.descriptor}</span>
        <a href="#top" className="link-quiet hover:text-paper">
          Back to top
        </a>
      </footer>
    </section>
  );
}
