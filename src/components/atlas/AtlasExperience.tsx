'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { clusters, clusterOf, neighbours, nodes, overviewOf, timeline, type AtlasNode, type ClusterId, type NodeKind } from '@/data/atlas';
import { asset } from '@/lib/asset';
import { hasWebGL, prefersReducedMotion } from '@/lib/motion';
import { places, rolePlaces } from '@/data/geo';
import ModelViewer from './ModelViewer';
import IndustryArt from '../IndustryArt';
import type { AtlasEngine } from './AtlasEngine';

const KIND_LABEL: Record<NodeKind, string> = {
  experience: 'Role',
  engagement: 'Engagement',
  project: 'Build',
  industry: 'Industry',
  idea: 'Idea',
  paper: 'Paper',
  memory: 'Memory',
  model: '3D object',
  image: 'Image',
};

const ACTION_LABEL: Record<NodeKind, string> = {
  experience: 'Overview',
  engagement: 'Read',
  project: 'Open project',
  industry: 'Read',
  idea: 'Read',
  paper: 'Read',
  memory: 'View photo',
  model: 'Inspect object',
  image: 'View image',
};

const byId = (id: string | null) => (id ? nodes.find((n) => n.id === id) ?? null : null);
const fmt = (v: number) => `${v < 0 ? '-' : '+'}${Math.abs(v).toFixed(1).padStart(4, '0')}`;
const expIds = timeline.map((b) => `exp:${b.id}`);

function Thumb({ src, label }: { src?: string; label: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="relative block aspect-[16/10] overflow-hidden border border-paper/15 bg-paper/5">
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={asset(src)} alt="" className="h-full w-full object-cover object-top grayscale" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span className="label absolute inset-0 grid place-items-center text-[8px] text-grey-3">{label}</span>
      )}
    </span>
  );
}

export default function AtlasExperience() {
  const router = useRouter();
  const sceneRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const camRef = useRef<HTMLSpanElement>(null);
  const engineRef = useRef<AtlasEngine | null>(null);

  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [segs, setSegs] = useState<ClusterId[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<{ node: string | null; x: number; y: number }>({ node: null, x: 0, y: 0 });
  const [touring, setTouring] = useState(false);
  const [tourIndex, setTourIndex] = useState(-1);
  const [indexOpen, setIndexOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [reader, setReader] = useState<AtlasNode | null>(null);
  const [viewer, setViewer] = useState<AtlasNode | null>(null);
  const [moment, setMoment] = useState<{ id: string; stage: number; index: number; total: number } | null>(null);

  const selectedNode = byId(selected);
  const activeExp = selectedNode?.kind === 'experience' ? selectedNode.id : selectedNode?.owner ? `exp:${selectedNode.owner}` : null;

  // ------------------------------------------------------------ actions

  const pickNode = useCallback((id: string, fly = true) => {
    const n = byId(id);
    if (!n) return;
    setSelected(id);
    engineRef.current?.selectNode(id, fly);
  }, []);

  const clearSelection = useCallback(() => {
    setSelected(null);
    engineRef.current?.resetView();
  }, []);

  const toggleSeg = useCallback((id: ClusterId) => {
    setSegs((cur) => {
      const next = cur.includes(id) ? cur.filter((s) => s !== id) : [...cur, id];
      engineRef.current?.setSegments(next);
      return next;
    });
  }, []);

  const openNode = useCallback(
    (n: AtlasNode) => {
      if (n.kind === 'project' && n.href) router.push(`${n.href}/`);
      else if (n.kind === 'model') setViewer(n);
      else if (n.kind === 'experience') pickNode(n.id);
      else setReader(n);
    },
    [router, pickNode],
  );

  const stopTour = useCallback(() => {
    setTouring(false);
  }, []);

  const back = useCallback(() => {
    if (viewer) return setViewer(null);
    if (reader) return setReader(null);
    if (searchOpen) return setSearchOpen(false);
    if (indexOpen && webgl) return setIndexOpen(false);
    if (touring) return stopTour();
    if (selected) {
      const n = byId(selected);
      if (n && n.kind !== 'experience' && n.owner) return pickNode(`exp:${n.owner}`);
      return clearSelection();
    }
    if (segs.length) {
      setSegs([]);
      engineRef.current?.setSegments([]);
    }
  }, [viewer, reader, searchOpen, indexOpen, webgl, touring, selected, segs.length, stopTour, pickNode, clearSelection]);

  const cbRef = useRef({ pickNode, back, clearSelection });
  cbRef.current = { pickNode, back, clearSelection };

  // ------------------------------------------------------------ time travel tour

  useEffect(() => {
    if (!touring) return;
    // Each role is a stop; roles with photos then play their moments before moving on.
    let i = 0;
    let timer = 0;
    let cancelled = false;
    const step = () => {
      if (cancelled) return;
      if (i >= expIds.length) {
        setTouring(false);
        setTourIndex(-1);
        return;
      }
      const id = expIds[i];
      const r = i;
      i++;
      setTourIndex(r);
      setSelected(id);
      engineRef.current?.focusExperience(id, 'street', r === 0 ? 1800 : 1600);
      timer = window.setTimeout(() => {
        if (cancelled) return;
        const played = engineRef.current?.focusMemories(id, 0, () => {
          if (!cancelled) timer = window.setTimeout(step, 600);
        });
        if (!played) step();
      }, 4200);
    };
    step();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      engineRef.current?.stopMoments();
    };
  }, [touring]);

  // ------------------------------------------------------------ engine lifecycle

  useEffect(() => {
    const ok = hasWebGL();
    setWebgl(ok);
    const params = new URLSearchParams(window.location.search);
    if (!ok || params.get('view') === 'index') setIndexOpen(true);
  }, []);

  useEffect(() => {
    if (!webgl || !sceneRef.current || !overlayRef.current) return;
    let disposed = false;
    let engine: AtlasEngine | null = null;
    import('./AtlasEngine').then(({ AtlasEngine }) => {
      if (disposed || !sceneRef.current || !overlayRef.current) return;
      const lowPower = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
      engine = new AtlasEngine(
        sceneRef.current,
        overlayRef.current,
        camRef.current,
        {
          onHover: (h) => setHover((cur) => (cur.node === h.node && Math.abs(cur.x - h.x) < 2 && Math.abs(cur.y - h.y) < 2 ? cur : h)),
          onPickNode: (id) => {
            setTouring(false);
            cbRef.current.pickNode(id);
          },
          onPickEmpty: () => undefined,
          onMoment: (m) => setMoment(m),
        },
        { reduced: prefersReducedMotion(), lowPower, assemble: true },
      );
      engineRef.current = engine;
      const params = new URLSearchParams(window.location.search);
      const seg = params.get('segment') as ClusterId | null;
      if (seg && clusters.some((c) => c.id === seg)) {
        setSegs([seg]);
        engine.setSegments([seg]);
      }
      const exp = params.get('role');
      if (exp && expIds.includes(`exp:${exp}`)) setTimeout(() => cbRef.current.pickNode(`exp:${exp}`), 900);
    });
    return () => {
      disposed = true;
      engine?.dispose();
      engineRef.current = null;
    };
  }, [webgl]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.tagName === 'INPUT';
      if (e.key === 'Escape') {
        e.preventDefault();
        cbRef.current.back();
      } else if (e.key === '/' && !typing) {
        e.preventDefault();
        setSearchOpen(true);
      } else if (!typing && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        const cur = expIds.indexOf(activeExp ?? '');
        const next = e.key === 'ArrowRight' ? Math.min(expIds.length - 1, cur + 1) : Math.max(0, cur - 1);
        if (next >= 0) cbRef.current.pickNode(expIds[next === -1 ? 0 : next]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeExp]);

  // ------------------------------------------------------------ render

  const instruction = touring
    ? `Time travel / ${String(tourIndex + 1).padStart(2, '0')} of ${String(expIds.length).padStart(2, '0')}`
    : selected
      ? 'Esc to step back / arrow keys move along the timeline'
      : 'Hover a role for an overview, click to step inside';

  const hoverNode = byId(hover.node);
  const showHover = hoverNode && hoverNode.id !== selected && !touring;
  const expIdx = activeExp ? expIds.indexOf(activeExp) : -1;

  return (
    <div className="force-dark fixed inset-0 overflow-hidden bg-ink text-paper">
      <h1 className="sr-only">Memory Palace</h1>
      <div ref={sceneRef} className="absolute inset-0" />
      <div ref={overlayRef} className="atlas-overlay opacity-0" aria-hidden />

      {/* Top bar */}
      <header className="wrap pointer-events-none absolute inset-x-0 top-0 z-20 flex h-14 items-center justify-between gap-4">
        <nav className="label pointer-events-auto flex min-w-0 items-center gap-2 text-grey-2" aria-label="Breadcrumb">
          <Link href="/" className="link-quiet text-paper max-sm:hidden">
            Raunaq
          </Link>
          <span aria-hidden className="max-sm:hidden">/</span>
          <button type="button" onClick={clearSelection} className={`link-quiet ${selected ? 'hover:text-paper' : 'text-paper'}`}>
            Atlas
          </button>
          {activeExp && (
            <>
              <span aria-hidden>/</span>
              <button type="button" onClick={() => pickNode(activeExp)} className="link-quiet truncate hover:text-paper">
                {byId(activeExp)?.title}
              </button>
            </>
          )}
          {selectedNode && selectedNode.kind !== 'experience' && (
            <>
              <span aria-hidden className="max-sm:hidden">/</span>
              <span className="truncate text-paper max-sm:hidden">{selectedNode.title}</span>
            </>
          )}
        </nav>
        <div className="label pointer-events-auto flex shrink-0 items-center gap-3 sm:gap-5">
          {webgl && (
            <button type="button" className="link-quiet text-grey-1 hover:text-paper" onClick={() => setSearchOpen(true)} aria-keyshortcuts="/">
              Search
            </button>
          )}
          {webgl && (
            <button type="button" className="link-quiet text-grey-1 hover:text-paper" onClick={() => setIndexOpen((v) => !v)} aria-pressed={indexOpen}>
              Index
            </button>
          )}
          <Link href="/#atlas" className="border border-paper/50 px-3 py-2 text-paper transition-colors hover:bg-paper hover:text-ink">
            Exit the Palace
          </Link>
        </div>
      </header>

      {/* Segments */}
      {webgl && (
        <nav className="wrap pointer-events-none absolute inset-x-0 bottom-28 z-20 md:bottom-auto md:top-1/2 md:w-auto md:-translate-y-1/2" aria-label="Atlas segments">
          <p className="label mb-2 text-grey-3 max-md:hidden">Segments</p>
          <ul className="pointer-events-auto flex max-w-full gap-2 overflow-x-auto md:inline-flex md:flex-col md:gap-0">
            {clusters.map((c) => {
              const count = nodes.filter((n) => (c.id === 'memories' ? !!n.memory : n.cluster === c.id)).length;
              const on = segs.includes(c.id);
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => toggleSeg(c.id)}
                    aria-pressed={on}
                    title={c.description}
                    className={`label flex w-max items-baseline gap-3 border px-3 py-2 transition-colors md:border-0 md:border-l md:py-2.5 ${
                      on ? 'border-paper text-paper' : 'border-paper/15 text-grey-2 hover:text-paper'
                    }`}
                  >
                    <span className="text-grey-3">{c.code}</span>
                    <span>{c.label}</span>
                    <span className="text-grey-3">{String(count).padStart(2, '0')}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {/* Hover overview */}
      {showHover && (
        <div
          className="pointer-events-none absolute z-30 w-72 border border-paper/25 bg-ink/90 p-4 backdrop-blur max-md:hidden"
          style={{ left: Math.min(hover.x + 18, (typeof window !== 'undefined' ? window.innerWidth : 1400) - 300), top: Math.max(64, hover.y - 20) }}
        >
          <HoverCard node={hoverNode} />
        </div>
      )}

      {/* Bottom bar */}
      {webgl && (
        <footer className="wrap pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-6 pb-5">
          <div className="label space-y-2" aria-live="polite">
            <div className="pointer-events-auto flex items-center gap-2">
              <button type="button" onClick={() => expIdx > 0 && pickNode(expIds[expIdx - 1])} disabled={expIdx <= 0} className="border border-paper/40 px-2.5 py-1.5 hover:bg-paper hover:text-ink disabled:opacity-30" aria-label="Previous role">
                ←
              </button>
              <button type="button" onClick={() => (touring ? stopTour() : setTouring(true))} aria-pressed={touring} className="border border-paper px-3 py-1.5 text-paper hover:bg-paper hover:text-ink">
                {touring ? 'Stop' : 'Time travel'}
              </button>
              <button type="button" onClick={() => pickNode(expIds[Math.min(expIds.length - 1, expIdx + 1)])} disabled={expIdx >= expIds.length - 1} className="border border-paper/40 px-2.5 py-1.5 hover:bg-paper hover:text-ink disabled:opacity-30" aria-label="Next role">
                →
              </button>
            </div>
            <p className="text-paper">{instruction}</p>
            <p className="text-grey-3 max-md:hidden">Drag to orbit / scroll to zoom / right-drag to pan / press / to search</p>
          </div>
          <div className="label pointer-events-auto flex flex-col items-end gap-2 text-right">
            <span ref={camRef} className="text-grey-3 max-md:hidden" aria-hidden />
            <span className="flex gap-4 text-grey-2">
              <Link href="/#builds" className="link-quiet hover:text-paper">AI builds</Link>
              <Link href="/#experience" className="link-quiet hover:text-paper">Experience</Link>
              <Link href="/#contact" className="link-quiet hover:text-paper">Contact</Link>
            </span>
          </div>
        </footer>
      )}

      {/* Selection panels */}
      {moment && <MomentHud moment={moment} onStop={() => { setTouring(false); engineRef.current?.stopMoments(); }} />}

      {!moment && selectedNode && !reader && !viewer && selectedNode.kind === 'experience' && (
        <ExperiencePanel
          expId={selectedNode.id}
          onClose={clearSelection}
          onPick={(id) => { setTouring(false); pickNode(id); }}
          onOpen={openNode}
          onPlay={() => { setTouring(false); engineRef.current?.focusMemories(selectedNode.id); }}
        />
      )}
      {!moment && selectedNode && !reader && !viewer && selectedNode.kind !== 'experience' && (
        <NodePanel node={selectedNode} onClose={() => (selectedNode.owner ? pickNode(`exp:${selectedNode.owner}`) : clearSelection())} onOpen={() => openNode(selectedNode)} onPick={(id) => pickNode(id)} />
      )}

      {searchOpen && <SearchPanel onClose={() => setSearchOpen(false)} onPick={(id) => { setSearchOpen(false); setIndexOpen(false); setTouring(false); pickNode(id); }} />}

      {indexOpen && (
        <IndexPanel
          fallback={!webgl}
          onClose={webgl ? () => setIndexOpen(false) : undefined}
          onPick={(n) => {
            if (webgl) {
              setIndexOpen(false);
              pickNode(n.id);
            } else openNode(n);
          }}
        />
      )}

      {reader && <Reader node={reader} onClose={() => setReader(null)} onPick={(id) => { setReader(null); webgl ? pickNode(id) : setReader(byId(id)); }} />}
      {viewer && <ModelViewer node={viewer} onClose={() => setViewer(null)} />}
    </div>
  );
}

// ------------------------------------------------------------ panels

function HoverCard({ node }: { node: AtlasNode }) {
  if (node.kind === 'experience') {
    const o = overviewOf(node.id);
    return (
      <div className="space-y-3">
        <p className="label text-grey-3">
          {node.code} / {o.battle.period.replace('–', 'to')}
        </p>
        <p className="text-[20px] leading-tight tracking-tight">{node.title}</p>
        <p className="label text-grey-2">{o.battle.role}</p>
        <dl className="label grid grid-cols-2 gap-y-1 text-grey-2">
          <dt>Engagements</dt>
          <dd className="text-right text-paper">{String(o.engagements.length).padStart(2, '0')}</dd>
          <dt>Builds</dt>
          <dd className="text-right text-paper">{String(o.builds.length).padStart(2, '0')}</dd>
          <dt>Industries</dt>
          <dd className="text-right text-paper">{String(o.industries.length).padStart(2, '0')}</dd>
          {o.papers.length > 0 && (
            <>
              <dt>Papers</dt>
              <dd className="text-right text-paper">{String(o.papers.length).padStart(2, '0')}</dd>
            </>
          )}
        </dl>
        {o.engagements.length > 0 && (
          <ul className="space-y-1 text-[12px] text-grey-1">
            {o.engagements.slice(0, 4).map((e) => (
              <li key={e.id} className="truncate">
                <span className="text-grey-3">- </span>
                {e.title}
              </li>
            ))}
            {o.engagements.length > 4 && <li className="label text-grey-3">+ {o.engagements.length - 4} more</li>}
          </ul>
        )}
        <p className="label text-grey-3">Click to step inside</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <p className="label text-grey-3">
        {node.code} / {KIND_LABEL[node.kind]}
      </p>
      {node.thumb && <Thumb src={node.thumb} label={node.code} />}
      <p className="text-[16px] leading-snug tracking-tight">{node.title}</p>
      <p className="line-clamp-3 text-[12px] text-grey-1">{node.summary}</p>
    </div>
  );
}

function MomentHud({ moment, onStop }: { moment: { id: string; stage: number; index: number; total: number }; onStop: () => void }) {
  const n = byId(moment.id);
  const o = n?.owner ? overviewOf(`exp:${n.owner}`) : null;
  if (!n || !o) return null;
  const b = o.battle;
  const sc = n.scene;
  const stages = sc ? ['Arriving', '', 'Project sheet', 'Lifting into 3D', 'Left where it happened'] : ['Arriving', 'Depth', 'Moment', 'Lifting into 3D', 'Left where it happened'];
  return (
    <aside className="pointer-events-none absolute bottom-24 left-[var(--gutter)] z-30 w-[min(360px,80vw)] md:bottom-28" aria-live="polite">
      <div className="pointer-events-auto border border-paper/20 bg-ink/70 p-4 backdrop-blur">
        <div className="label flex justify-between text-grey-3">
          <span>
            Moment {String(moment.index + 1).padStart(2, '0')} / {String(moment.total).padStart(2, '0')}
          </span>
          <button type="button" onClick={onStop} className="link-quiet text-grey-1 hover:text-paper">
            Stop
          </button>
        </div>
        <p className="mt-3 text-[22px] leading-tight tracking-tight">{b.company.split(',')[0]}</p>
        <p className="label mt-1 text-grey-2">
          {b.role} / {b.period.replace('–', 'to')}
        </p>
        {sc && (
          <>
            <p className="label mt-4 text-paper">
              Project {String(sc.project).padStart(2, '0')} / {sc.industry}
            </p>
            <p className="mt-2 line-clamp-4 text-[13px] leading-snug text-grey-1">{n.summary}</p>
            <dl className="mt-3 grid grid-cols-[6.5rem_1fr] gap-x-3 gap-y-1.5 text-[12px]">
              {sc.problem && (
                <div className="contents">
                  <dt className="label text-grey-3">Problem</dt>
                  <dd className="text-grey-1">{sc.problem}</dd>
                </div>
              )}
              {sc.geos.length > 0 && (
                <div className="contents">
                  <dt className="label text-grey-3">Geography</dt>
                  <dd className="text-grey-1">{sc.geos.map((g) => places[g]?.label).filter(Boolean).join(', ')}</dd>
                </div>
              )}
            </dl>
          </>
        )}
        {!sc && b.highlights && (
          <dl className="mt-4 grid grid-cols-[6.5rem_1fr] gap-x-3 gap-y-1.5 text-[12px]">
            {b.highlights.slice(0, 5).map((h) => (
              <div key={h.label} className="contents">
                <dt className="label text-grey-3">{h.label}</dt>
                <dd className="text-grey-1">{h.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="mt-4 flex items-center gap-2">
          {stages.map((st, i) => (
            <span key={i} className={`h-0.5 flex-1 ${i <= moment.stage ? 'bg-paper' : 'bg-paper/20'}`} title={st} />
          ))}
        </div>
        <p className="label mt-2 text-grey-3">{stages[moment.stage]}</p>
      </div>
    </aside>
  );
}

function ExperiencePanel({ expId, onClose, onPick, onOpen, onPlay }: { expId: string; onClose: () => void; onPick: (id: string) => void; onOpen: (n: AtlasNode) => void; onPlay: () => void }) {
  const node = byId(expId)!;
  const o = overviewOf(expId);
  const b = o.battle;
  return (
    <aside
      className="thin-scroll absolute inset-x-0 bottom-0 z-30 max-h-[62vh] overflow-y-auto border-t rule bg-ink/92 p-6 backdrop-blur md:inset-x-auto md:bottom-24 md:right-[var(--gutter)] md:top-20 md:max-h-none md:w-[420px] md:border"
      aria-label={`${node.title} overview`}
    >
      <div className="label flex justify-between text-grey-3">
        <span>
          {node.code} / Role / {b.period.replace('–', 'to')}
        </span>
        <button type="button" onClick={onClose} className="link-quiet text-grey-1 hover:text-paper">
          Close
        </button>
      </div>
      <h2 className="mt-5 text-[30px] leading-[1.02] tracking-tight">{node.title}</h2>
      <p className="label mt-2 text-grey-2">
        {b.role} / {b.location}
      </p>
      {b.description ? <p className="mt-4 text-[14px] leading-relaxed text-grey-1">{b.description}</p> : <p className="label mt-4 text-grey-3">Details to be added</p>}
      <p className="label mt-4 text-grey-3">
        X {fmt(node.position[0])} / Y {fmt(node.position[1])} / Z {fmt(node.position[2])}
      </p>
      {o.memories.length > 0 && (
        <button type="button" onClick={onPlay} className="label mt-5 border border-paper px-4 py-3 text-paper transition-colors hover:bg-paper hover:text-ink">
          Play {o.memories.length} moments
        </button>
      )}

      {(() => {
        const scenes = o.memories.filter((m) => m.scene);
        const photos = o.memories.filter((m) => m.kind === 'memory' && !m.scene);
        const where = rolePlaces(b.id);
        const Head = ({ n, t, c }: { n: number; t: string; c: number }) => (
          <p className="label mb-2 flex justify-between text-grey-3">
            <span>
              {String(n).padStart(2, '0')} / {t}
            </span>
            <span>{String(c).padStart(2, '0')}</span>
          </p>
        );
        const None = () => <p className="label text-grey-3">None recorded</p>;
        return (
          <>
            <section className="mt-8">
              <Head n={1} t="Projects" c={scenes.length} />
              <ul className="space-y-2">
                {scenes.map((m) => (
                  <li key={m.id}>
                    <button type="button" onClick={() => onPick(m.id)} className="group block w-full border border-paper/15 p-3 text-left hover:border-paper/50">
                      <span className="label flex justify-between gap-3 text-grey-2">
                        <span>
                          P{String(m.scene!.project).padStart(2, '0')} / {m.scene!.industry}
                        </span>
                        {m.scene!.problem && <span className="truncate text-grey-3">{m.scene!.problem}</span>}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-[13px] text-grey-1 group-hover:text-paper">{m.summary}</span>
                      {m.scene!.geos.length > 0 && <span className="label mt-1.5 block text-grey-3">{m.scene!.geos.map((g) => places[g]?.label).filter(Boolean).join(' / ')}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-8">
              <Head n={2} t="Industries" c={o.industries.length} />
              {o.industries.length ? (
                <ul className="flex flex-wrap gap-1.5">
                  {o.industries.map((i) => (
                    <li key={i.id}>
                      <button type="button" onClick={() => onPick(i.id)} className="label border border-paper/20 px-2 py-1 text-grey-1 hover:border-paper hover:text-paper">
                        {i.title}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <None />
              )}
            </section>

            <section className="mt-8">
              <Head n={3} t="Geographies" c={where.length} />
              <ul className="flex flex-wrap gap-x-3 gap-y-1">
                {where.map((pl, i) => (
                  <li key={pl.label} className="label normal-case tracking-normal text-grey-1">
                    <span className="text-grey-3">{i === 0 ? 'base' : String(i).padStart(2, '0')}</span> {pl.label}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-8">
              <Head n={4} t="Problems" c={b.problemStatements?.length ?? 0} />
              {b.problemStatements?.length ? (
                <ul className="space-y-1 font-mono text-[12px] text-grey-1">
                  {b.problemStatements.map((t) => (
                    <li key={t}>- {t}</li>
                  ))}
                </ul>
              ) : (
                <None />
              )}
            </section>

            <section className="mt-8">
              <Head n={5} t="Builds" c={o.builds.length} />
              {o.builds.length ? (
                <ul className="grid grid-cols-2 gap-3">
                  {o.builds.map((p) => (
                    <li key={p.id}>
                      <button type="button" onClick={() => onPick(p.id)} className="group block w-full text-left">
                        <Thumb src={p.thumb} label={p.code} />
                        <span className="mt-1.5 block text-[13px] group-hover:underline">{p.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <None />
              )}
            </section>

            <section className="mt-8">
              <Head n={6} t="Moments" c={photos.length + o.papers.length} />
              {photos.length + o.papers.length ? (
                <ul className="grid grid-cols-2 gap-3">
                  {photos.map((m) => (
                    <li key={m.id}>
                      <button type="button" onClick={() => onPick(m.id)} className="group block w-full text-left">
                        <Thumb src={m.thumb} label="Photo" />
                        <span className="mt-1.5 line-clamp-2 block text-[12px] group-hover:underline">{m.title}</span>
                      </button>
                    </li>
                  ))}
                  {o.papers.map((p) => (
                    <li key={p.id}>
                      <button type="button" onClick={() => onOpen(p)} className="group block w-full text-left">
                        <Thumb src={p.thumb} label="IEEE" />
                        <span className="mt-1.5 line-clamp-2 block text-[12px] group-hover:underline">{p.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <None />
              )}
            </section>
          </>
        );
      })()}
    </aside>
  );
}

function NodePanel({ node, onClose, onOpen, onPick }: { node: AtlasNode; onClose: () => void; onOpen: () => void; onPick: (id: string) => void }) {
  const related = neighbours(node.id);
  const c = clusterOf(node.cluster);
  return (
    <aside
      className="thin-scroll absolute inset-x-0 bottom-0 z-30 max-h-[58vh] overflow-y-auto border-t rule bg-ink/90 p-6 backdrop-blur md:inset-x-auto md:bottom-24 md:right-[var(--gutter)] md:top-20 md:max-h-none md:w-[380px] md:border"
      aria-label={`${node.title} details`}
    >
      <div className="label flex justify-between text-grey-3">
        <span>
          {node.code} / {c.label}
        </span>
        <button type="button" onClick={onClose} className="link-quiet text-grey-1 hover:text-paper">
          Back
        </button>
      </div>
      <p className="label mt-6 text-grey-2">
        {KIND_LABEL[node.kind]}
        {node.placeholder ? ' / Placeholder' : ''}
      </p>
      <h2 className="mt-2 text-[28px] leading-[1.05] tracking-tight">{node.title}</h2>
      {node.meta && <p className="label mt-3 text-grey-3">{node.meta}</p>}
      {node.thumb && (
        <div className="mt-5">
          <Thumb src={node.thumb} label={node.code} />
        </div>
      )}
      {node.kind === 'industry' && (
        <div className="mt-5 aspect-[8/5] overflow-hidden border border-paper/15">
          <IndustryArt
            name={node.title}
            code={node.code}
            rows={[
              ['Roles', String(related.filter((r) => r.kind === 'experience').length)],
              ...related.filter((r) => r.kind === 'experience').slice(0, 4).map((r): [string, string] => ['Role', r.title]),
            ]}
          />
        </div>
      )}
      <p className="mt-5 line-clamp-6 text-[14px] leading-relaxed text-grey-1">{node.summary}</p>
      <p className="label mt-5 text-grey-3">
        X {fmt(node.position[0])} / Y {fmt(node.position[1])} / Z {fmt(node.position[2])}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        {node.kind !== 'engagement' && node.kind !== 'industry' && (
          <button type="button" onClick={onOpen} className="label border border-paper px-4 py-3 text-paper transition-colors hover:bg-paper hover:text-ink">
            {ACTION_LABEL[node.kind]}
          </button>
        )}
        {node.links?.map((l) => (
          <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="label link-quiet text-grey-1 hover:text-paper">
            {l.label.length > 28 ? 'Repository' : l.label} ↗
          </a>
        ))}
      </div>
      {related.length > 0 && (
        <div className="mt-8">
          <p className="label mb-2 text-grey-3">Connected / {String(related.length).padStart(2, '0')}</p>
          <ul>
            {related.map((r) => (
              <li key={r.id} className="border-t rule">
                <button type="button" onClick={() => onPick(r.id)} className="group flex w-full items-baseline gap-3 py-2.5 text-left">
                  <span className="label w-12 shrink-0 text-grey-3">{r.code}</span>
                  <span className="text-[14px] text-grey-1 group-hover:text-paper">{r.title}</span>
                  <span className="label ml-auto text-grey-3">{KIND_LABEL[r.kind]}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}

function SearchPanel({ onClose, onPick }: { onClose: () => void; onPick: (id: string) => void }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<ClusterId | 'all'>('all');
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return nodes
      .filter((n) => cat === 'all' || n.cluster === cat)
      .filter((n) => !t || `${n.title} ${n.summary} ${n.meta ?? ''} ${KIND_LABEL[n.kind]} ${clusterOf(n.cluster).label}`.toLowerCase().includes(t))
      .slice(0, 14);
  }, [q, cat]);

  return (
    <div className="absolute inset-0 z-40 bg-ink/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="wrap mx-auto mt-20 max-w-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Search the Atlas"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border rule bg-ink p-5">
          <div className="flex items-center gap-4 border-b rule pb-3">
            <span className="label text-grey-3">Search</span>
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && results[0]) onPick(results[0].id);
              }}
              placeholder="Projects, repositories, ideas, papers"
              className="w-full bg-transparent text-xl tracking-tight text-paper placeholder:text-grey-3 focus:outline-none"
              aria-label="Search nodes"
            />
            <button type="button" className="label text-grey-2 hover:text-paper" onClick={onClose}>
              Esc
            </button>
          </div>
          <div className="label mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            {(['all', ...clusters.map((c) => c.id)] as const).map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={cat === id}
                onClick={() => setCat(id)}
                className={`border px-2.5 py-1.5 ${cat === id ? 'border-paper text-paper' : 'border-paper/15 text-grey-2 hover:text-paper'}`}
              >
                {id === 'all' ? 'All' : clusterOf(id).label}
              </button>
            ))}
          </div>
          <ul className="thin-scroll mt-3 max-h-[52vh] overflow-y-auto">
            {results.length === 0 && <li className="label py-6 text-grey-3">No matching nodes</li>}
            {results.map((n) => (
              <li key={n.id} className="border-t rule">
                <button type="button" onClick={() => onPick(n.id)} className="group grid w-full grid-cols-[4.5rem_1fr_auto] items-baseline gap-3 py-3 text-left">
                  <span className="label text-grey-3">{n.code}</span>
                  <span className="truncate text-[15px] text-grey-1 group-hover:text-paper">{n.title}</span>
                  <span className="label text-grey-3">{KIND_LABEL[n.kind]}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function IndexPanel({ fallback, onClose, onPick }: { fallback: boolean; onClose?: () => void; onPick: (n: AtlasNode) => void }) {
  return (
    <div className="thin-scroll absolute inset-0 z-30 overflow-y-auto bg-ink">
      <div className="wrap pb-24 pt-24">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <p className="label text-grey-2">Palace / Index</p>
            {onClose && (
              <button type="button" onClick={onClose} className="label link-quiet mt-4 text-paper">
                Return to the spatial view
              </button>
            )}
          </div>
          <div className="lg:col-span-9">
            <h2 className="headline text-[clamp(40px,6vw,96px)]">Everything in the Memory Palace</h2>
            {fallback && (
              <p className="mt-4 max-w-lg text-[15px] text-grey-2">
                The spatial view needs WebGL, which is not available here. Every node is listed below instead.
              </p>
            )}
          </div>
        </div>

        <div className="mt-16 space-y-16">
          {clusters.map((c) => {
            const list = nodes.filter((n) => n.cluster === c.id);
            return (
              <section key={c.id} className="grid gap-6 lg:grid-cols-12" aria-labelledby={`idx-${c.id}`}>
                <div className="lg:col-span-3">
                  <p className="label text-grey-3">{c.code}</p>
                  <h3 id={`idx-${c.id}`} className="mt-1 text-2xl tracking-tight">
                    {c.label}
                  </h3>
                  <p className="mt-2 max-w-xs text-[14px] text-grey-2">{c.description}</p>
                </div>
                <ul className="lg:col-span-9">
                  {list.map((n) => (
                    <li key={n.id} className="border-t rule">
                      <button
                        type="button"
                        onClick={() => onPick(n)}
                        className="group grid w-full grid-cols-[4.5rem_1fr] items-baseline gap-3 py-3 text-left sm:grid-cols-[4.5rem_1fr_10rem]"
                      >
                        <span className="label text-grey-3">{n.code}</span>
                        <span className="text-[16px] text-grey-1 group-hover:text-paper">
                          {n.title}
                          {n.placeholder && <span className="label ml-2 text-grey-3">Placeholder</span>}
                        </span>
                        <span className="label hidden text-right text-grey-3 sm:block">{KIND_LABEL[n.kind]}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Reader({ node, onClose, onPick }: { node: AtlasNode; onClose: () => void; onPick: (id: string) => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => closeRef.current?.focus(), [node]);
  const related = neighbours(node.id);
  const c = clusterOf(node.cluster);

  return (
    <div className="thin-scroll fixed inset-0 z-[60] overflow-y-auto bg-ink" role="dialog" aria-modal="true" aria-label={node.title}>
      <div className="wrap sticky top-0 z-10 flex h-14 items-center justify-between bg-ink/90 backdrop-blur">
        <p className="label text-grey-2">
          Atlas / {c.label} / {node.code}
        </p>
        <button ref={closeRef} type="button" onClick={onClose} className="label link-quiet text-paper">
          Back to the Palace
        </button>
      </div>
      <article className="wrap pb-32 pt-16">
        <div className="grid gap-6 lg:grid-cols-12">
          <p className="label text-grey-3 lg:col-span-3">
            {KIND_LABEL[node.kind]}
            {node.meta ? ` / ${node.meta}` : ''}
          </p>
          <div className="lg:col-span-8">
            <h2 className="headline text-[clamp(36px,5vw,80px)]">{node.title}</h2>

            {node.memory?.sheet && (
              <figure className="mt-12 aspect-[8/5] w-full max-w-3xl overflow-hidden border border-paper/15">
                <IndustryArt {...node.memory.sheet} />
              </figure>
            )}

            {node.memory && !node.memory.sheet && (
              <figure className="mt-12">
                {node.memory.video ? (
                  <video src={asset(node.memory.video)} poster={asset(node.memory.src)} className="w-full max-w-3xl border border-paper/15 grayscale" controls autoPlay muted loop playsInline />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={asset(node.memory.src)} alt={node.memory.alt} className="w-full max-w-3xl border border-paper/15 grayscale" />
                )}
                <figcaption className="label mt-3 text-grey-3">
                  {node.memory.year}
                </figcaption>
              </figure>
            )}

            {node.image && (
              <figure className="mt-12">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(node.image.src)} alt={node.image.alt} className="w-full max-w-xl grayscale" />
                <figcaption className="label mt-3 text-grey-3">
                  {node.image.width} × {node.image.height} PX
                </figcaption>
              </figure>
            )}

            <div className="mt-12 max-w-2xl space-y-6 text-[17px] leading-relaxed text-grey-1">
              {(node.body ?? [node.summary]).map((p, i) => (
                <p key={i} className={`whitespace-pre-line ${i === 0 && node.kind === 'paper' ? 'label text-grey-2' : ''}`}>
                  {p}
                </p>
              ))}
            </div>

            {(node.links?.length || (node.kind === 'project' && node.href)) && (
              <div className="mt-12 flex flex-wrap gap-6 border-t rule pt-6">
                {node.links?.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="label link-quiet text-paper">
                    {l.label} ↗
                  </a>
                ))}
                {node.kind === 'project' && node.href && (
                  <Link href={`${node.href}/`} className="label link-quiet text-paper">
                    Open project
                  </Link>
                )}
              </div>
            )}

            {related.length > 0 && (
              <div className="mt-16">
                <p className="label mb-3 text-grey-3">Connected</p>
                <ul>
                  {related.map((r) => (
                    <li key={r.id} className="border-t rule">
                      <button type="button" onClick={() => onPick(r.id)} className="group flex w-full items-baseline gap-4 py-3 text-left">
                        <span className="label text-grey-3">{r.code}</span>
                        <span className="text-[16px] text-grey-1 group-hover:text-paper">{r.title}</span>
                        <span className="label ml-auto text-grey-3">{KIND_LABEL[r.kind]}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
