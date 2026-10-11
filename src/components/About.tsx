import PixelImage from './PixelImage';
import LazyMount from './LazyMount';
import Reveal from './Reveal';
import { portrait } from '@/data/assets';
import { intro, site } from '@/data/site';
import { skillGroups, skillSections } from '@/data/skills';

export default function About() {
  const certs = skillSections.flatMap((s) => s.skills).filter((c) => c.issuer);

  return (
    <section id="about" className="wrap pt-40 lg:pt-56" aria-labelledby="about-title">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-6">
        <Reveal className="lg:col-span-4">
          <p className="label mb-6 text-grey-2">05 / About</p>
          <div className="relative aspect-[4/5]">
            <LazyMount>
              <PixelImage
                src={portrait.src}
                alt={portrait.alt}
                mode="distort"
                focus={[0.5, 0.62]}
                monochrome={1}
                annotate="none"
                naturalSize={[portrait.width, portrait.height]}
              />
            </LazyMount>
          </div>
          <p className="label mt-3 flex justify-between text-grey-3">
            <span>Field 02</span>
            <span>{site.location}</span>
          </p>
        </Reveal>

        <div className="lg:col-span-7 lg:col-start-6">
          <Reveal>
            <h2 id="about-title" className="headline text-[clamp(36px,4.4vw,72px)]">
              {intro[0]}
            </h2>
          </Reveal>
          <Reveal className="mt-10 grid gap-6 text-[16px] leading-relaxed text-grey-1 md:grid-cols-2" delay={100}>
            {intro.slice(1).map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
          </Reveal>

          <Reveal as="dl" className="mt-16 grid gap-x-6 gap-y-8 border-t rule pt-8 text-[14px] sm:grid-cols-2" delay={160}>
            <div>
              <dt className="label mb-2 text-grey-3">Based</dt>
              <dd className="text-grey-1">{site.location}</dd>
            </div>
            <div>
              <dt className="label mb-2 text-grey-3">Education</dt>
              <dd className="text-grey-1">{site.education}</dd>
            </div>
            <div>
              <dt className="label mb-2 text-grey-3">Earlier</dt>
              <dd className="text-grey-1">Head of attitude determination and control for Parikshit, a student nanosatellite built under ISRO guidance.</dd>
            </div>
            <div>
              <dt className="label mb-2 text-grey-3">Off hours</dt>
              <dd className="text-grey-1">Building AI tools, and watching a lot of cricket.</dd>
            </div>
          </Reveal>

          <Reveal className="mt-16 grid gap-10 border-t rule pt-8 sm:grid-cols-2" delay={200}>
            <div>
              <p className="label mb-4 text-grey-3">Toolkit</p>
              <dl className="space-y-4 text-[14px]">
                {skillGroups.map((g) => (
                  <div key={g.label}>
                    <dt className="label text-grey-2">{g.label}</dt>
                    <dd className="mt-1 leading-relaxed text-grey-1">{g.skills.join(' / ')}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <p className="label mb-4 text-grey-3">Certifications</p>
              <ul className="text-[14px]">
                {certs.map((c) => (
                  <li key={c.title} className="border-b rule py-2">
                    <span className="text-grey-1">{c.title}</span>
                    <span className="label ml-2 text-grey-3">{c.issuer}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
