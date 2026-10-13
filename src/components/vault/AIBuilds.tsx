'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import SectionLabel from '../SectionLabel';
import { useMode } from '../ModeContext';
import { vaultBuilds, wings, type Wing } from '@/data/aiBuilds';
import { videoSlots } from '@/data/assets';
import { projects, splitSystemLabel } from '@/data/projects';
import { asset } from '@/lib/asset';
import { hasWebGL, useReducedMotion } from '@/lib/motion';
import type { StackGraph, VaultScene, VaultView } from './VaultScene';

/** AI builds as a tesseract of rooms. Pick a room to walk into the build. */
export default function AIBuilds() {
  const { mode } = useMode();
  const canvasRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<VaultScene | null>(null);
  const reduced = useReducedMotion();
  const [webgl, setWebgl] = useState(true);
  const [wing, setWing] = useState<'all' | Wing>('all');
  const [hover, setHover] = useState<number | null>(null);
  const [entered, setEntered] = useState<number | null>(null);
  const [view, setView] = useState<VaultView>('overview');
  const [graphs, setGraphs] = useState<Record<number, StackGraph | null>>({});
  const [shot, setShot] = useState(0);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!hasWebGL()) {
      setWebgl(false);
      return;
    }
    let alive = true;
    let engine: VaultScene | null = null;
    import('./VaultScene').then(({ VaultScene }) => {
      if (!alive || !canvasRef.current || !overlayRef.current) return;
      const lowPower = window.matchMedia('(max-width: 820px)').matches;
      engine = new VaultScene(
        canvasRef.current,
        overlayRef.current,
        vaultBuilds,
        {
          onHover: setHover,
          onEnter: (i) => {
            setEntered(i);
            setShot(0);
          },
          onView: setView,
          onGraph: (i, g) => setGraphs((cur) => ({ ...cur, [i]: g })),
          onStage: setStage,
        },
        reduced,
        lowPower,
      );
      engineRef.current = engine;
    });
    return () => {
      alive = false;
      engine?.dispose();
      engineRef.current = null;
    };
  }, [reduced]);

  useEffect(() => {
    if (entered === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') engineRef.current?.exit();
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [entered]);

  const pickWing = (w: 'all' | Wing) => {
    setWing(w);
    engineRef.current?.showWing(w);
  };
  const go = (i: number) => engineRef.current?.enter(((i % vaultBuilds.length) + vaultBuilds.length) % vaultBuilds.length);
  const b = entered !== null ? vaultBuilds[entered] : null;
  const hv = hover !== null && entered === null ? vaultBuilds[hover] : null;
  const g = entered !== null ? graphs[entered] : undefined;
  const count = (w: Wing) => vaultBuilds.filter((x) => x.wing === w).length;

  return (
    <section id="builds" className="force-dark crt relative overflow-hidden pt-24 lg:pt-28" aria-labelledby="builds-title">
      <div className="wrap grid gap-6 lg:grid-cols-12">
        <SectionLabel n="01" calm="AI builds" path="builds" cmd="ls ./vault" className="lg:col-span-3" />
        <div className="lg:col-span-9">
          <h2 id="builds-title" className="headline text-[clamp(44px,6vw,96px)]">
            AI builds
          </h2>
          <p className="mt-5 max-w-xl text-[16px] leading-snug text-grey-1">
            {vaultBuilds.length} rooms, one per build. Walk in and the interface on the back wall lifts from 2D into 3D. The codebase runs along the left wall, layer by layer with the AI features, and the videos hang on the right: walkthrough, product launch, demo.
          </p>
        </div>
      </div>

      <div className="wrap mt-10">
        <div className="vault-frame relative h-[78svh] min-h-[520px] border border-[#f2c98a]/20 md:h-[80svh] md:min-h-[540px]">
          <div ref={canvasRef} className="absolute inset-0" />
          <div ref={overlayRef} className="pointer-events-none absolute inset-0 overflow-hidden font-mono" aria-hidden />
          <span className="hud-corner left-0 top-0" />
          <span className="hud-corner right-0 top-0 rotate-90" />
          <span className="hud-corner bottom-0 right-0 rotate-180" />
          <span className="hud-corner bottom-0 left-0 -rotate-90" />

          {/* Wing tabs */}
          <div className="absolute left-4 top-4 z-10 flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
            <span className="mr-2 text-paper/60">VAULT /</span>
            {(
              [
                ['all', `ALL ${vaultBuilds.length}`],
                ['work', `${wings[0].label.toUpperCase()} ${count('work')}`],
                ['fun', `${wings[1].label.toUpperCase()} ${count('fun')}`],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => pickWing(id)}
                className={`border px-2 py-1 tracking-[0.08em] transition-colors ${wing === id && entered === null ? 'border-paper bg-paper text-ink' : 'border-paper/30 bg-ink/60 text-paper/75 hover:border-paper/70'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="pointer-events-none absolute right-4 top-4 z-10 hidden text-right font-mono text-[10px] leading-relaxed text-paper/55 md:block">
            {entered === null ? 'HOVER A ROOM / CLICK TO ENTER' : 'ESC TO STEP OUT'}
            <br />
            {wing === 'fun' ? wings[1].blurb.toUpperCase() : wing === 'work' ? wings[0].blurb.toUpperCase() : ''}
          </p>

          {/* Hover card */}
          {hv && (
            <div className="pointer-events-none absolute bottom-4 left-4 z-10 w-[min(360px,80%)] border border-paper/30 bg-ink/80 p-3 font-mono text-[11px] text-paper/75 backdrop-blur-sm">
              <p className="text-paper">
                {hv.code} / {hv.project.category.toUpperCase()} / {hv.wing === 'fun' ? 'FUN BUILD' : 'AI BUILD'}
              </p>
              <p className="mt-1 font-sans text-[18px] leading-tight text-paper">{hv.project.name}</p>
              <p className="mt-1 font-sans text-[13px] leading-snug">{hv.project.punchline}</p>
            </div>
          )}

          {/* Room panel */}
          {b && (
            <aside className="absolute bottom-4 left-4 top-14 z-20 flex w-[min(380px,calc(100%-2rem))] flex-col border border-paper/35 bg-ink/85 font-mono text-[11px] text-paper/80 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-paper/25 px-3 py-2">
                <span className="text-paper">
                  {b.code} / ROOM {String(entered! + 1).padStart(2, '0')} OF {vaultBuilds.length}
                </span>
                <button type="button" onClick={() => engineRef.current?.exit()} className="border border-paper/40 px-1.5 leading-tight text-paper hover:bg-paper hover:text-ink" aria-label="Step out of the room">
                  ×
                </button>
              </div>
              <div className="thin-scroll flex-1 space-y-4 overflow-y-auto px-3 py-3">
                <div>
                  <p className="text-paper/50">
                    {b.project.category.toUpperCase()} / {b.wing === 'fun' ? 'FUN BUILD' : 'AI BUILD'}
                  </p>
                  <h3 className="mt-1 font-sans text-[26px] leading-none tracking-tight text-paper">{b.project.name}</h3>
                  <p className="mt-2 font-sans text-[13.5px] leading-snug text-paper/75">{mode === 'calm' ? b.project.calm : splitSystemLabel(b.project.nerd).text}</p>
                </div>

                <div className="flex gap-1.5">
                  {(['interface', 'architecture', 'media'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => engineRef.current?.setView(v)}
                      className={`flex-1 border px-1 py-1.5 text-[10px] tracking-[0.04em] transition-colors ${view === v ? 'border-paper bg-paper text-ink' : 'border-paper/35 text-paper/80 hover:border-paper'}`}
                    >
                      {v === 'interface' ? 'BACK / INTERFACE' : v === 'architecture' ? 'LEFT / CODEBASE' : 'RIGHT / VIDEOS'}
                    </button>
                  ))}
                </div>

                {view === 'interface' && (
                  <div>
                    <div className="flex gap-1.5">
                      {['ARRIVE', 'DEPTH', b.shots.length ? 'PHOTO' : 'SHEET', 'LIFT', 'IN 3D'].map((st, i) => (
                        <span key={st} className={`h-0.5 flex-1 ${i <= stage ? 'bg-[#f2c98a]' : 'bg-paper/20'}`} />
                      ))}
                    </div>
                    <p className="mt-1.5 text-paper/50">{['ARRIVING', 'DEPTH MAP', b.shots.length ? 'THE CAPTURE' : 'THE SPEC SHEET', 'LIFTING INTO 3D', 'LEFT WHERE IT WAS BUILT'][stage]}</p>
                  </div>
                )}

                {b.shots.length > 1 && (
                  <div className="flex items-center justify-between border-t border-paper/15 pt-3">
                    <span className="text-paper/50">CAPTURE {String(shot + 1).padStart(2, '0')} / {String(b.shots.length).padStart(2, '0')}</span>
                    <span className="flex gap-1">
                      {[-1, 1].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            const n = (shot + d + b.shots.length) % b.shots.length;
                            setShot(n);
                            engineRef.current?.setShot(n);
                          }}
                          className="border border-paper/35 px-2 py-0.5 text-paper hover:bg-paper hover:text-ink"
                          aria-label={d < 0 ? 'Previous capture' : 'Next capture'}
                        >
                          {d < 0 ? '←' : '→'}
                        </button>
                      ))}
                    </span>
                  </div>
                )}
                {!b.shots.length && <p className="border-t border-paper/15 pt-3 text-paper/45">NO INTERFACE CAPTURE YET / SHOWING THE SPEC SHEET</p>}

                <div className="border-t border-paper/15 pt-3">
                  <p className="text-paper/50">VIDEOS / {videoSlots.filter((v) => b.videos[v.id]).length} OF {videoSlots.length}</p>
                  <ul className="mt-2 space-y-2">
                    {videoSlots.map((v, k) => {
                      const src = b.videos[v.id];
                      return (
                        <li key={v.id}>
                          <button type="button" onClick={() => engineRef.current?.setView('media')} className="grid w-full grid-cols-[28px_1fr_auto] items-baseline gap-2 text-left hover:text-paper">
                            <span className="text-paper/45">V{k + 1}</span>
                            <span className="text-paper/85">{v.label}</span>
                            <span className={src ? 'text-paper' : 'text-paper/40'}>{src ? 'READY' : 'AWAITING FILE'}</span>
                          </button>
                          {src && view === 'media' && <video src={asset(src)} controls playsInline className="mt-2 w-full border border-paper/25" />}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {g && (
                  <div className="border-t border-paper/15 pt-3">
                    <p className="text-paper/50">
                      STACK / {g.nodes.length} TECHNOLOGIES / {g.edges.length} LINKS
                    </p>
                    <ul className="mt-2 space-y-1">
                      {g.layers
                        .filter((l) => g.nodes.some((n) => n.layer === l.id))
                        .map((l) => (
                          <li key={l.id} className="grid grid-cols-[96px_1fr] gap-2">
                            <span className="text-paper/45">{l.label.toUpperCase()}</span>
                            <span className="text-paper/85">
                              {g.nodes
                                .filter((n) => n.layer === l.id)
                                .map((n) => n.label)
                                .join(', ')}
                            </span>
                          </li>
                        ))}
                    </ul>
                    {g.features.length > 0 && (
                      <>
                        <p className="mt-3 text-paper/50">AI FEATURES</p>
                        <ul className="mt-1 space-y-1 font-sans text-[12.5px] leading-snug text-paper/80">
                          {g.features.map((f) => (
                            <li key={f}>- {f}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    <p className="mt-3 text-paper/40">{g.source.toUpperCase()}</p>
                  </div>
                )}
                {g === null && <p className="border-t border-paper/15 pt-3 text-paper/45">ARCHITECTURE GRAPH COMING SOON</p>}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 border-t border-paper/25 px-3 py-2.5">
                <Link href={`/work/${b.project.slug}/`} className="border border-paper/50 px-2 py-1 text-paper hover:bg-paper hover:text-ink">
                  DEEP DIVE
                </Link>
                {b.project.github && (
                  <a href={b.project.github} target="_blank" rel="noopener noreferrer" className="border border-paper/30 px-2 py-1 text-paper/85 hover:border-paper">
                    REPO ↗
                  </a>
                )}
                {b.project.live && (
                  <a href={b.project.live} target="_blank" rel="noopener noreferrer" className="border border-paper/30 px-2 py-1 text-paper/85 hover:border-paper">
                    LIVE ↗
                  </a>
                )}
                <span className="ml-auto flex gap-1">
                  <button type="button" onClick={() => go(entered! - 1)} className="border border-paper/30 px-2 py-1 text-paper hover:bg-paper hover:text-ink" aria-label="Previous room">
                    ←
                  </button>
                  <button type="button" onClick={() => go(entered! + 1)} className="border border-paper/30 px-2 py-1 text-paper hover:bg-paper hover:text-ink" aria-label="Next room">
                    →
                  </button>
                </span>
              </div>
            </aside>
          )}

          {!webgl && <FallbackList />}
          <div className="hud-scan pointer-events-none absolute inset-0" aria-hidden />
        </div>

        <div className="mt-6 flex flex-wrap justify-between gap-4 border-t border-paper/15 pb-24 pt-5">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] text-paper/60">
            {vaultBuilds.map((v, i) => (
              <li key={v.project.slug}>
                <button type="button" onClick={() => (webgl ? go(i) : undefined)} className="hover:text-paper">
                  <span className="text-paper/35">{v.code}</span> {v.project.name}
                </button>
              </li>
            ))}
          </ul>
          <Link href="/work/" className="label link-quiet text-paper">
            All {projects.length} builds in the archive →
          </Link>
        </div>
      </div>
    </section>
  );
}

function FallbackList() {
  return (
    <div className="absolute inset-0 overflow-y-auto p-6 pt-16">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {vaultBuilds.map((v) => (
          <li key={v.project.slug} className="border border-paper/25 p-3">
            {v.shots[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset(v.shots[0].src)} alt={v.shots[0].alt} className="mb-2 aspect-[16/10] w-full object-cover object-top grayscale" />
            )}
            <p className="font-mono text-[10px] text-paper/50">{v.code}</p>
            <Link href={`/work/${v.project.slug}/`} className="text-[18px] text-paper hover:underline">
              {v.project.name}
            </Link>
            <p className="mt-1 text-[13px] text-paper/70">{v.project.punchline}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
