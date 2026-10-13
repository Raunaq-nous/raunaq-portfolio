'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { brainLinks, brainNodes, brainRegions, type BrainNode } from '@/data/brain';
import { hasWebGL, useReducedMotion } from '@/lib/motion';
import type { BrainScene } from './BrainScene';

const byId = new Map(brainNodes.map((n) => [n.id, n]));
const regionOf = (id: string) => brainRegions.find((r) => r.id === id)!;
const countIn = (rid: string) => brainNodes.filter((n) => n.region === rid).length;
const linksOf = (id: string) => brainLinks.filter((l) => l.kind === 'fact' && (l.a === id || l.b === id)).map((l) => byId.get(l.a === id ? l.b : l.a)!).filter(Boolean);
const SIDES = [
  { side: 'left' as const, title: 'Left hemisphere', sub: 'Logic and work: what I learned doing the job' },
  { side: 'right' as const, title: 'Right hemisphere', sub: 'Curiosity and craft: what I explore beyond it' },
];

/**
 * The knowledge map. The brain is drawn in points; regions sit on it as solid labels you can
 * tap; what you pick is explained beside the brain, never on top of it.
 */
export default function HeroBrain() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<BrainScene | null>(null);
  const reduced = useReducedMotion();
  const [webgl, setWebgl] = useState(true);
  const [region, setRegion] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const regionRef = useRef<string | null>(null);
  regionRef.current = region;
  const focusRef = useRef<string | null>(null);
  focusRef.current = focus;

  useEffect(() => {
    if (!hasWebGL()) {
      setWebgl(false);
      return;
    }
    let alive = true;
    let engine: BrainScene | null = null;
    import('./BrainScene').then(({ BrainScene }) => {
      if (!alive || !canvasRef.current) return;
      const lowPower = window.matchMedia('(max-width: 820px)').matches;
      engine = new BrainScene(
        canvasRef.current,
        {
          onPick: (id) => {
            if (!id) return;
            const n = byId.get(id)!;
            setRegion(n.region);
            setFocus(id);
          },
        },
        reduced,
        lowPower,
      );
      engineRef.current = engine;
      engine.onFrame = () => {
        const host = chipsRef.current;
        if (!host) return;
        // Move every chip to its point on the brain.
        // Region chips sit on their hubs, nudged apart so none overlap.
        const taken: [number, number, number, number][] = [];
        host.querySelectorAll<HTMLElement>('[data-hub]').forEach((el) => {
          const p = engine!.hubScreen.get(el.dataset.hub!);
          if (!p) return;
          const w = el.offsetWidth;
          const h = el.offsetHeight + 3;
          const x = Math.max(4, Math.min(host.clientWidth - w - 4, p.x - w / 2));
          let y = p.y - h / 2;
          for (let k = 0; k < 12 && taken.some((q) => !(x + w < q[0] || x > q[2] || y + h < q[1] || y > q[3])); k++) y += h * (k % 2 ? -k : k);
          taken.push([x, y, x + w, y + h]);
          el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
        });
        const placed: [number, number, number, number][] = [];
        host.querySelectorAll<HTMLElement>('[data-node]').forEach((el) => {
          const id = el.dataset.node!;
          const p = engine!.nodeScreen.get(id);
          if (!p) return;
          const isFocus = id === focusRef.current;
          const rect: [number, number, number, number] = [p.x - 4, p.y - 9, p.x + 44, p.y + 9];
          const clash = !isFocus && placed.some((q) => !(rect[2] < q[0] || rect[0] > q[2] || rect[3] < q[1] || rect[1] > q[3]));
          el.style.visibility = clash ? 'hidden' : 'visible';
          if (!clash) placed.push(rect);
          el.style.transform = `translate3d(${Math.round(p.x)}px, ${Math.round(p.y)}px, 0) translate(-2px, -50%)`;
        });
      };
    });
    return () => {
      alive = false;
      engine?.dispose();
      engineRef.current = null;
    };
  }, [reduced]);

  useEffect(() => engineRef.current?.setRegion(region), [region]);
  useEffect(() => engineRef.current?.setFocus(focus), [focus]);

  const pickRegion = (id: string | null) => {
    setFocus(null);
    setRegion((r) => (r === id ? null : id));
  };
  const node = focus ? byId.get(focus) : null;
  const regionNodes = useMemo(() => (region ? brainNodes.filter((n) => n.region === region) : []), [region]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
      {/* The brain */}
      <div className="vault-frame relative h-[56svh] min-h-[380px] overflow-hidden border border-[#f2c98a]/25 lg:h-[64svh]">
        <div ref={canvasRef} className="absolute inset-0" aria-hidden />
        <div className="pointer-events-none absolute inset-x-3 top-3 flex justify-between gap-3 font-mono text-[10px] tracking-[0.1em]">
          <span className="bg-black/70 px-1.5 py-0.5 text-[#9ec7eb]">LEFT<span className="hidden sm:inline"> / LOGIC + WORK</span></span>
          <span className="bg-black/70 px-1.5 py-0.5 text-[#f2c98a]">RIGHT<span className="hidden sm:inline"> / CURIOSITY + CRAFT</span></span>
        </div>
        <div ref={chipsRef} className="pointer-events-none absolute inset-0 overflow-hidden font-mono [&>button]:pointer-events-auto">
          {!region &&
            brainRegions.map((r) => (
              <button
                key={r.id}
                type="button"
                data-hub={r.id}
                onClick={() => pickRegion(r.id)}
                className={`absolute left-0 top-0 whitespace-nowrap border bg-black/85 px-1.5 py-[3px] text-[10px] leading-none transition-colors ${
                  r.side === 'left' ? 'border-[#9ec7eb]/50 text-[#cfe3f5] hover:bg-[#9ec7eb] hover:text-black' : 'border-[#f2c98a]/50 text-[#f6dfb7] hover:bg-[#f2c98a] hover:text-black'
                }`}
              >
                {r.label} <span className="opacity-60">{countIn(r.id)}</span>
              </button>
            ))}
          {region &&
            regionNodes.map((n) => (
              <button
                key={n.id}
                type="button"
                data-node={n.id}
                onClick={() => setFocus(n.id)}
                aria-label={n.label}
                style={{ visibility: 'hidden' }}
                className={`absolute left-0 top-0 whitespace-nowrap border px-1 py-[2px] text-[10px] leading-none ${
                  focus === n.id ? 'border-white bg-white text-black' : n.side === 'left' ? 'border-[#9ec7eb]/50 bg-black/85 text-[#cfe3f5]' : 'border-[#f2c98a]/50 bg-black/85 text-[#f6dfb7]'
                }`}
              >
                {n.code}
              </button>
            ))}
        </div>
        <p className="pointer-events-none absolute bottom-3 left-3 bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-white/60">
          {region ? 'TAP A CODE / DRAG TO TURN' : 'TAP A REGION / DRAG TO TURN'}
        </p>
        {!webgl && (
          <div className="absolute inset-0 grid place-items-center">
            <p className="label text-white/60">The knowledge map needs WebGL</p>
          </div>
        )}
      </div>

      {/* What you picked, explained beside the brain */}
      <Readout region={region} node={node ?? null} regionNodes={regionNodes} onRegion={pickRegion} onNode={setFocus} />
    </div>
  );
}

function Readout({ region, node, regionNodes, onRegion, onNode }: { region: string | null; node: BrainNode | null; regionNodes: BrainNode[]; onRegion: (id: string | null) => void; onNode: (id: string) => void }) {
  if (node) {
    const links = linksOf(node.id);
    return (
      <div className="space-y-4 lg:pt-1" aria-live="polite">
        <button type="button" onClick={() => onNode('')} className="label link-quiet text-grey-2">
          ← {regionOf(node.region).label}
        </button>
        <p className="label text-grey-3">
          {node.code} / {node.side === 'left' ? 'Left hemisphere' : 'Right hemisphere'}
        </p>
        <h3 className="text-[24px] leading-tight tracking-tight">{node.label}</h3>
        {node.line && <p className="text-[15px] leading-relaxed text-grey-1">{node.line}</p>}
        {links.length > 0 && (
          <div>
            <p className="label text-grey-3">Connected to</p>
            <ul className="mt-2 space-y-1.5">
              {links.slice(0, 10).map((l) => (
                <li key={l.id}>
                  <button type="button" onClick={() => onNode(l.id)} className="text-left text-[14px] hover:underline">
                    <span className="label mr-2 text-grey-3">{l.code}</span>
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {node.href && (
          <a href={node.href} className="label link-quiet inline-block text-paper">
            Open
          </a>
        )}
      </div>
    );
  }
  if (region) {
    const r = regionOf(region);
    return (
      <div className="space-y-4 lg:pt-1" aria-live="polite">
        <button type="button" onClick={() => onRegion(null)} className="label link-quiet text-grey-2">
          ← Whole brain
        </button>
        <p className="label text-grey-3">{r.side === 'left' ? 'Left hemisphere / logic and work' : 'Right hemisphere / curiosity and craft'}</p>
        <h3 className="text-[24px] leading-tight tracking-tight">
          {r.label} <span className="text-grey-3">{regionNodes.length}</span>
        </h3>
        <ul className="thin-scroll max-h-[44svh] space-y-1 overflow-y-auto pr-1">
          {regionNodes.map((n) => (
            <li key={n.id}>
              <button type="button" onClick={() => onNode(n.id)} className="grid w-full grid-cols-[3rem_1fr] gap-2 text-left text-[14px] hover:underline">
                <span className="label pt-0.5 text-grey-3">{n.code}</span>
                {n.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div className="space-y-6 lg:pt-1">
      {SIDES.map((s) => (
        <div key={s.side}>
          <p className="label text-grey-3">{s.title}</p>
          <p className="mt-1 text-[15px] leading-snug text-grey-1">{s.sub}</p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {brainRegions
              .filter((r) => r.side === s.side)
              .map((r) => (
                <li key={r.id}>
                  <button type="button" onClick={() => onRegion(r.id)} className="label border rule px-2 py-1 normal-case tracking-[0.02em] text-grey-1 transition-colors hover:border-paper hover:text-paper">
                    {r.label} <span className="text-grey-3">{countIn(r.id)}</span>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
