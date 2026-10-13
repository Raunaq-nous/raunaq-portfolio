import PixelImage from './PixelImage';
import HeroBrain from './hero/HeroBrain';
import SectionLabel from './SectionLabel';
import { portrait } from '@/data/assets';
import { site } from '@/data/site';
import { battles, education } from '@/data/battles';
import { vaultBuilds } from '@/data/aiBuilds';

const current = battles.find((b) => b.status === 'CURRENT') ?? battles[0];

export default function Hero() {
  const rows: [string, string][] = [
    ['Role', `${current.role}, ${current.company}`],
    ['Based', site.location],
    ['Trained', `${education.degree}, ${education.institution}`],
    ['Builds', `${vaultBuilds.length} AI builds`],
  ];
  return (
    <section id="top" className="wrap pb-20 pt-24 lg:pt-28" aria-label="Introduction">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        {/* Who */}
        <div className="lg:col-span-4">
          <SectionLabel n="00" calm="Hello" path="" cmd="whoami" />
          <div className="mt-6 grid grid-cols-[38%_1fr] items-end gap-5 lg:block">
            <div className="relative aspect-[1200/1130] w-full max-w-[240px] border rule">
              <PixelImage src={portrait.src} alt={portrait.alt} mode="reveal" focus={portrait.focus} monochrome={1} annotate="none" naturalSize={[portrait.width, portrait.height]} priority />
            </div>
            <div className="lg:mt-6">
              <h1 className="headline text-[clamp(36px,4vw,60px)]">{site.name}</h1>
              <p className="mt-3 text-[16px] leading-snug text-grey-1">{site.descriptor}</p>
            </div>
          </div>
          <p className="mt-4 text-[15px] leading-snug text-grey-2">{site.now}</p>
          <dl className="mt-6 grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-2 border-t rule pt-4 text-[14px]">
            {rows.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="label pt-0.5 text-grey-3">{k}</dt>
                <dd className="text-grey-1">{v}</dd>
              </div>
            ))}
          </dl>
          <nav className="mt-6 flex flex-wrap gap-x-5 gap-y-2" aria-label="Jump to">
            {[
              ['#builds', 'AI builds'],
              ['#experience', 'Experience'],
              ['#curiosities', 'Curiosities'],
            ].map(([href, label]) => (
              <a key={href} href={href} className="label link-quiet text-paper">
                {label} →
              </a>
            ))}
          </nav>
        </div>

        {/* What is in here */}
        <div className="lg:col-span-8">
          <SectionLabel n="01" calm="Knowledge map" path="brain" cmd="ls --map" />
          <div className="mt-6">
            <HeroBrain />
          </div>
        </div>
      </div>
    </section>
  );
}
