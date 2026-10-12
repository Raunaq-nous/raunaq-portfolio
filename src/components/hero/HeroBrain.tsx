'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import IndustryArt from '../IndustryArt';
import { brainLinks, brainNodes, brainRegions, type BrainNode } from '@/data/brain';
import { asset } from '@/lib/asset';
import { hasWebGL, useReducedMotion } from '@/lib/motion';
import type { BrainScene } from './BrainScene';

const byId = new Map(brainNodes.map((n) => [n.id, n]));
const regionLabel = (id: string) => brainRegions.find((r) => r.id === id)?.label ?? id;
const fmt = (v: number) => `${v < 0 ? '-' : '+'}${Math.abs(v * 100).toFixed(1).padStart(5, '0')}`;
const linked = (id: string) => brainLinks.filter((l) => l.kind === 'fact' && (l.a === id || l.b === id)).map((l) => byId.get(l.a === id ? l.b : l.a)!).filter(Boolean);

/** The interactive knowledge map: a point-cloud brain with a HUD around it. */
export default function HeroBrain() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const rotRef = useRef<HTMLSpanElement>(null);
  const engineRef = useRef<BrainScene | null>(null);
  const reduced = useReducedMotion();
  const [webgl, setWebgl] = useState(true);
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [region, setRegion] = useState<string | null>(null);
  const regionRef = useRef<string | null>(null);
  regionRef.current = region;

  useEffect(() => {
    if (!hasWebGL()) {
      setWebgl(false);
      return;
    }
    let alive = true;
    let engine: BrainScene | null = null;
    import('./BrainScene').then(({ BrainScene }) => {
      if (!alive || !canvasRef.current) return;
      engine = new BrainScene(canvasRef.current, { onHover: setHover, onPick: setPinned }, reduced);
      engineRef.current = engine;
      // Labels: one element per node, positioned every frame, shown only when relevant.
      const host = tagsRef.current!;
      host.innerHTML = '';
      const els = brainNodes.map((n) => {
        const el = document.createElement('div');
        el.className = 'brain-tag';
        el.innerHTML = `<i></i><b>${n.code}</b><span></span>`;
        (el.lastChild as HTMLElement).textContent = n.label;
        host.appendChild(el);
        return el;
      });
      const regEls = brainRegions.map((r) => {
        const el = document.createElement('div');
        el.className = 'brain-region';
        el.textContent = `${r.letter} / ${r.label}`;
        host.appendChild(el);
        return el;
      });
      engine.onFrame = () => {
        const e = engine!;
        const focus = e.focus;
        const near = new Set<string>();
        if (focus) {
          near.add(focus);
          brainLinks.forEach((l) => (l.a === focus ? near.add(l.b) : l.b === focus ? near.add(l.a) : null));
        }
        const reg = regionRef.current;
        const placed: [number, number, number, number][] = [];
        const order = e.screen
          .map((s, i) => ({ s, i, n: brainNodes[i] }))
          .sort((a, b) => Number(b.n.id === focus) - Number(a.n.id === focus) || Number(near.has(b.n.id)) - Number(near.has(a.n.id)) || b.s.front - a.s.front);
        let codes = 0;
        for (const { s, i, n } of order) {
          const el = els[i];
          const named = n.id === focus || near.has(n.id) || (!!reg && n.region === reg);
          const code = !named && !focus && !reg && s.front > 0.55 && codes < 46 && i % 2 === 0;
          if (!s.visible || (!named && !code)) {
            el.style.display = 'none';
            continue;
          }
          const w = named ? 8 + n.label.length * 6.2 + 34 : 40;
          const rect: [number, number, number, number] = [s.x, s.y - 7, s.x + w, s.y + 7];
          if (n.id !== focus && placed.some((p) => !(rect[2] < p[0] || rect[0] > p[2] || rect[3] < p[1] || rect[1] > p[3]))) {
            el.style.display = 'none';
            continue;
          }
          placed.push(rect);
          if (code) codes++;
          el.style.display = 'flex';
          el.classList.toggle('is-named', named);
          el.classList.toggle('is-focus', n.id === focus);
          el.style.opacity = String(named ? 1 : 0.35 + s.front * 0.45);
          el.style.transform = `translate3d(${Math.round(s.x)}px, ${Math.round(s.y)}px, 0)`;
        }
        brainRegions.forEach((r, i) => {
          const p = e.regionScreen.get(r.id);
          const el = regEls[i];
          const show = !!p && p.visible && !focus && (!reg || reg === r.id);
          el.style.display = show ? 'block' : 'none';
          if (show) el.style.transform = `translate3d(${Math.round(p!.x)}px, ${Math.round(p!.y - 18)}px, 0)`;
        });
        if (rotRef.current) {
          const { yaw, pitch } = e.rotation;
          rotRef.current.textContent = `ROT Y ${((yaw * 180) / Math.PI).toFixed(1).padStart(6, ' ')}° / X ${((pitch * 180) / Math.PI).toFixed(1).padStart(5, ' ')}°`;
        }
      };
    });
    return () => {
      alive = false;
      engine?.dispose();
      engineRef.current = null;
    };
  }, [reduced]);

  useEffect(() => engineRef.current?.setRegion(region), [region]);

  const focus = pinned ?? hover;
  const node = focus ? byId.get(focus) : null;
  const left = brainNodes.filter((n) => n.side === 'left').length;
  const right = brainNodes.length - left;
  const facts = useMemo(() => brainLinks.filter((l) => l.kind === 'fact').length, []);

  return (
    <div ref={wrapRef} className="hud relative h-full w-full select-none">
      <div ref={canvasRef} className="absolute inset-0" aria-hidden />
      <div ref={tagsRef} className="pointer-events-none absolute inset-0 overflow-hidden font-mono" aria-hidden />

      {/* HUD frame */}
      <span className="hud-corner left-0 top-0" />
      <span className="hud-corner right-0 top-0 rotate-90" />
      <span className="hud-corner bottom-0 right-0 rotate-180" />
      <span className="hud-corner bottom-0 left-0 -rotate-90" />
      <div className="pointer-events-none absolute left-4 top-4 font-mono text-[10px] leading-relaxed text-paper/70">
        <p className="text-paper">FIELD 00 / KNOWLEDGE MAP</p>
        <p>
          NODES {brainNodes.length} / LINKS {facts} / REGIONS {brainRegions.length}
        </p>
        <p>
          <span ref={rotRef}>ROT Y 0.0° / X 0.0°</span>
        </p>
      </div>
      <div className="pointer-events-none absolute right-4 top-4 hidden text-right font-mono text-[10px] leading-relaxed text-paper/70 sm:block">
        <p>
          LH {left} <span className="text-paper/40">/</span> RH {right}
        </p>
        <p className="text-paper/45">DRAG TO TURN / CLICK A NODE TO PIN</p>
      </div>
      <div className="pointer-events-none absolute inset-x-4 bottom-[118px] flex justify-between font-mono text-[10px] tracking-[0.12em] text-paper/80">
        <span>LH / LOGIC + WORK</span>
        <span>RH / CURIOSITY + CRAFT</span>
      </div>
      <div className="hud-ruler pointer-events-none absolute bottom-10 left-4 top-24 w-3" aria-hidden />

      {/* Region legends */}
      <div className="absolute bottom-4 left-4 right-4 z-10 grid grid-cols-2 gap-4 font-mono text-[10px]">
        {(['left', 'right'] as const).map((side) => (
          <ul key={side} className={`flex flex-wrap gap-1 ${side === 'right' ? 'justify-end' : ''}`}>
            {brainRegions
              .filter((r) => r.side === side)
              .map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onPointerEnter={() => setRegion(r.id)}
                    onPointerLeave={() => setRegion(null)}
                    onFocus={() => setRegion(r.id)}
                    onBlur={() => setRegion(null)}
                    onClick={() => setRegion((x) => (x === r.id ? null : r.id))}
                    className={`border px-1.5 py-0.5 uppercase tracking-[0.06em] transition-colors ${region === r.id ? 'border-paper bg-paper text-ink' : 'border-paper/25 bg-ink/60 text-paper/70 hover:border-paper/70'}`}
                  >
                    {r.letter} {r.label} <span className="opacity-60">{brainNodes.filter((n) => n.region === r.id).length}</span>
                  </button>
                </li>
              ))}
          </ul>
        ))}
      </div>

      {/* Readout */}
      {node && <Readout node={node} pinned={!!pinned} onClose={() => { setPinned(null); engineRef.current?.setPinned(null); }} coords={engineRef.current?.coords(node.id) ?? null} />}

      {!webgl && (
        <div className="absolute inset-0 grid place-items-center">
          <p className="label text-grey-2">Knowledge map needs WebGL</p>
        </div>
      )}
      <div className="hud-scan pointer-events-none absolute inset-0" aria-hidden />
    </div>
  );
}

function Readout({ node, pinned, onClose, coords }: { node: BrainNode; pinned: boolean; onClose: () => void; coords: { x: number; y: number; z: number } | null }) {
  const links = linked(node.id).slice(0, 8);
  return (
    <aside className="absolute left-4 top-24 z-20 w-[min(300px,70%)] border border-paper/40 bg-ink/85 font-mono text-[11px] text-paper/80 backdrop-blur-sm" aria-live="polite">
      <div className="flex items-center justify-between border-b border-paper/25 px-2.5 py-1.5">
        <span className="text-paper">
          {node.code} / {regionLabel(node.region).toUpperCase()}
        </span>
        {pinned ? (
          <button type="button" onClick={onClose} className="border border-paper/40 px-1 leading-none text-paper hover:bg-paper hover:text-ink" aria-label="Unpin">
            ×
          </button>
        ) : (
          <span className="text-paper/40">{node.side === 'left' ? 'LH' : 'RH'}</span>
        )}
      </div>
      {node.image && (
        <div className="relative aspect-[16/9] overflow-hidden border-b border-paper/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset(node.image)} alt="" className="h-full w-full object-cover object-top grayscale contrast-125" />
          <span className="hud-scan absolute inset-0" />
        </div>
      )}
      {!node.image && node.sheet && (
        <div className="aspect-[16/9] overflow-hidden border-b border-paper/20">
          <IndustryArt name={node.sheet} code={node.code} rows={[['Region', 'Industries'], ['Node', node.code]]} />
        </div>
      )}
      <div className="space-y-2 px-2.5 py-2">
        <p className="font-sans text-[16px] leading-tight text-paper">{node.label}</p>
        {node.line && <p className="font-sans text-[12.5px] leading-snug text-paper/70">{node.line}</p>}
        {coords && (
          <p className="text-paper/45">
            X {fmt(coords.x)} / Y {fmt(coords.y)} / Z {fmt(coords.z)}
          </p>
        )}
        {links.length > 0 && (
          <div>
            <p className="text-paper/45">LINKS {String(links.length).padStart(2, '0')}</p>
            <ul className="mt-1 space-y-0.5">
              {links.map((l) => (
                <li key={l.id} className="truncate">
                  <span className="text-paper/45">{l.code}</span> {l.label}
                </li>
              ))}
            </ul>
          </div>
        )}
        {node.href && pinned && (
          <a href={node.href.startsWith('/') ? asset(node.href) : node.href} className="inline-block border border-paper/50 px-2 py-0.5 text-paper hover:bg-paper hover:text-ink">
            OPEN
          </a>
        )}
      </div>
    </aside>
  );
}
