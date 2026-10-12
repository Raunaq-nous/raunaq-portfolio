import PixelImage from './PixelImage';
import HeroBrain from './hero/HeroBrain';
import ModeText from './ModeText';
import { portrait } from '@/data/assets';
import { site } from '@/data/site';
import { battles, education } from '@/data/battles';
import { brainNodes } from '@/data/brain';
import { vaultBuilds } from '@/data/aiBuilds';

const current = battles.find((b) => b.status === 'CURRENT') ?? battles[0];
const satellite = battles.find((b) => b.id === 'parikshit');

function Meter({ label, value, max }: { label: string; value: number; max: number }) {
  const cells = 14;
  const on = Math.round((value / max) * cells);
  return (
    <div className="flex items-center gap-2">
      <span className="w-[74px] text-paper/50">{label}</span>
      <span className="flex gap-[2px]" aria-hidden>
        {Array.from({ length: cells }, (_, i) => (
          <span key={i} className={`h-2 w-1.5 ${i < on ? 'bg-paper/85' : 'bg-paper/15'}`} />
        ))}
      </span>
      <span className="text-paper/70">{value}</span>
    </div>
  );
}

export default function Hero() {
  const left = brainNodes.filter((n) => n.side === 'left').length;
  const right = brainNodes.length - left;
  const rows: [string, string][] = [
    ['Role', `${current.role}, ${current.company}`],
    ['Based', site.location],
    ['Trained', `${education.degree}, ${education.institution.replace(' Institute of Technology', '')}`],
    ['Disciplines', 'Strategy / Finance / AI'],
    ...(satellite ? ([['Before', `${satellite.role}, nano-satellite under ISRO guidance`]] as [string, string][]) : []),
    ['Builds', `${vaultBuilds.length} AI builds in the vault`],
    ['Now', site.now],
  ];

  return (
    <section id="top" className="force-dark crt relative overflow-hidden pb-10 pt-20 lg:min-h-[100svh] lg:pt-20" aria-label="Introduction">
      <div className="wrap grid gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Mind map: left hemisphere logic and work, right hemisphere curiosity and craft */}
        <div className="relative order-2 h-[72svh] min-h-[460px] border border-paper/15 lg:order-1 lg:col-span-8 lg:h-[calc(100svh-7.5rem)]">
          <HeroBrain />
        </div>

        {/* Nameplate */}
        <aside className="order-1 lg:order-2 lg:col-span-4" aria-label="Profile">
          <div className="hud-panel relative border border-paper/35 bg-ink font-mono text-[11px]">
            <div className="flex items-center justify-between border-b border-paper/25 px-3 py-2">
              <span className="flex items-center gap-2 text-paper/80">
                <span className="grid h-3.5 w-3.5 place-items-center border border-paper/60 text-[9px] leading-none">×</span>
                <ModeText calm="SUBJECT FILE / 01" nerd="cat subject.file" />
              </span>
              <span className="hud-blink text-paper">C: ON</span>
            </div>
            <div className="grid grid-cols-[40%_1fr] gap-0 lg:grid-cols-1">
              <div className="relative border-r border-paper/20 lg:border-b lg:border-r-0">
                <div className="relative aspect-[1200/1130] w-full">
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
                  <span className="hud-scan pointer-events-none absolute inset-0" />
                  <span className="pointer-events-none absolute bottom-2 left-2 bg-ink/70 px-1 text-[9px] text-paper/70">ACQ / HOVER TO RESOLVE</span>
                </div>
              </div>
              <div className="px-3 py-3">
                <p className="text-paper/50">Name:</p>
                <h1 className="font-sans text-[clamp(28px,2.6vw,40px)] font-normal leading-none tracking-tight text-paper">{site.name}</h1>
                <p className="mt-2 font-sans text-[14px] leading-snug text-paper/75">{site.descriptor}</p>
              </div>
            </div>
            <dl className="grid grid-cols-[86px_1fr] gap-x-2 gap-y-1.5 border-t border-paper/20 px-3 py-3">
              {rows.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-paper/45">{k}</dt>
                  <dd className="text-paper/85">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="space-y-1.5 border-t border-paper/20 px-3 py-3 text-[10px]">
              <Meter label="LOGIC / LH" value={left} max={Math.max(left, right)} />
              <Meter label="CURIOUS / RH" value={right} max={Math.max(left, right)} />
            </div>
            <nav className="flex flex-wrap gap-1.5 border-t border-paper/20 px-3 py-3" aria-label="Jump to">
              {[
                ['#builds', 'AI BUILDS'],
                ['#experience', 'EXPERIENCE'],
                ['#curiosities', 'CURIOSITIES'],
              ].map(([href, label]) => (
                <a key={href} href={href} className="border border-paper/40 px-2 py-1 text-paper/85 transition-colors hover:bg-paper hover:text-ink">
                  {label}
                </a>
              ))}
            </nav>
            <span className="hud-scan pointer-events-none absolute inset-0" />
          </div>
          <p className="mt-3 font-mono text-[10px] text-paper/40">
            {left + right} NODES MAPPED / NO CERTIFICATES, ONLY KNOWLEDGE
          </p>
        </aside>
      </div>
    </section>
  );
}
