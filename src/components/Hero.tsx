import PixelImage from "./PixelImage";
import HeroBrain from "./hero/HeroBrain";
import HeroBackdrop from "./hero/HeroBackdrop";
import { portrait } from "@/data/assets";
import { site } from "@/data/site";
import { battles, education } from "@/data/battles";
import { brainNodes } from "@/data/brain";
import { vaultBuilds } from "@/data/aiBuilds";

const current = battles.find((b) => b.status === "CURRENT") ?? battles[0];

/** The name tag, drawn as part of the scan: a captured frame, a name, and a short file. */
function NameTag() {
  const rows: [string, string][] = [
    ["Role", `${current.role}, ${current.company}`],
    ["Based", site.location],
    ["Trained", `${education.degree.replace("B.Tech, ", "B.Tech ")}, Manipal`],
    ["Builds", `${vaultBuilds.length} AI builds`],
    ["Status", site.now],
  ];
  return (
    <div className="nametag relative w-full font-mono text-[11px] text-[#cfd8ff]">
      <div className="grid grid-cols-[40%_1fr] items-end gap-3 lg:block">
        <div className="nametag-frame relative">
          <span className="absolute -left-px -top-px z-10 grid h-4 w-4 place-items-center border border-[#cfd8ff]/80 bg-[#07051a] text-[10px] leading-none">
            ×
          </span>
          <div className="relative aspect-[1200/1130] w-full overflow-hidden">
            <PixelImage
              src={portrait.src}
              alt={portrait.alt}
              mode="reveal"
              focus={portrait.focus}
              monochrome={0}
              annotate="none"
              naturalSize={[portrait.width, portrait.height]}
              priority
            />
            <span className="nametag-tint pointer-events-none absolute inset-0" />
            <span className="hud-scan pointer-events-none absolute inset-0" />
            <span className="pointer-events-none absolute right-2 top-2 text-[9px] text-[#5ce1ff]">
              TIR/M
            </span>
            <span className="pointer-events-none absolute bottom-2 right-2 text-[9px] text-[#ff9b3d]">
              SC 7
            </span>
          </div>
        </div>
        <div className="space-y-0.5 lg:mt-3">
          <p className="text-[#9fb6ff]">Name:</p>
          <h1 className="font-sans text-[clamp(26px,2.4vw,38px)] font-normal leading-none tracking-tight text-white [text-shadow:0_0_18px_rgba(92,225,255,0.35)]">
            {site.name}
          </h1>
          <p className="pt-1 text-[#9fb6ff]">
            Nodes #: <span className="text-white">{brainNodes.length}</span>
          </p>
        </div>
      </div>
      <dl className="nametag-table mt-3 grid grid-cols-[64px_1fr] gap-x-3 gap-y-1 border border-[#9d7bff]/35 bg-[#07051a]/70 p-2.5">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-[#8f8bd8]">{k}</dt>
            <dd className="text-[#e3e8ff]">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-2 flex items-center justify-between text-[10px]">
        <span className="text-[#8f8bd8]">{site.descriptor}</span>
        <span className="hud-blink text-[#ff6fae]">C: ON</span>
      </div>
      <nav className="mt-3 flex flex-wrap gap-1.5" aria-label="Jump to">
        {[
          ["#builds", "AI BUILDS"],
          ["#experience", "EXPERIENCE"],
          ["#curiosities", "CURIOSITIES"],
        ].map(([href, label]) => (
          <a
            key={href}
            href={href}
            className="border border-[#5ce1ff]/50 bg-[#07051a]/60 px-2 py-1 text-[#bff3ff] transition-colors hover:bg-[#5ce1ff] hover:text-[#07051a]"
          >
            {label}
          </a>
        ))}
      </nav>
    </div>
  );
}

export default function Hero() {
  return (
    <section
      id="top"
      className="force-dark crt relative overflow-hidden bg-[#05040f]"
      aria-label="Introduction"
    >
      <HeroBackdrop className="absolute inset-0" />
      <div className="relative z-[2] lg:h-[100svh] lg:min-h-[680px]">
        {/* The brain: left hemisphere logic and work, right hemisphere curiosity and craft */}
        <div className="relative h-[58svh] min-h-[400px] pt-14 lg:absolute lg:inset-y-0 lg:left-0 lg:h-auto lg:w-[72%] lg:pt-0">
          <HeroBrain />
        </div>
        {/* The name tag sits in the scan, to the right */}
        <div className="wrap pb-12 lg:absolute lg:right-0 lg:top-1/2 lg:w-[min(330px,26vw)] lg:-translate-y-1/2 lg:px-0 lg:pb-0 lg:pr-[var(--gutter)]">
          <div className="mx-auto max-w-[420px] lg:max-w-none">
            <NameTag />
          </div>
        </div>
      </div>
    </section>
  );
}
