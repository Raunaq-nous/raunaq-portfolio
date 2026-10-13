'use client';

import { useEffect, useRef, useState } from 'react';
import { brainLinks, brainNodes, brainRegions } from '@/data/brain';
import { hasWebGL, useReducedMotion } from '@/lib/motion';
import type { BrainScene } from './BrainScene';

const regionLabel = (id: string) => brainRegions.find((r) => r.id === id)?.label ?? id;
const fmt = (v: number) => `${v < 0 ? '-' : '+'}${Math.abs(v * 100).toFixed(1).padStart(5, '0')}`;

/**
 * The brain cloud with its knowledge written on it: every neuron carries a code, and the one in
 * focus opens up in place with its name, region, coordinates and what it links to.
 */
export default function HeroBrain() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const capRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<BrainScene | null>(null);
  const reduced = useReducedMotion();
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    if (!hasWebGL()) {
      setWebgl(false);
      return;
    }
    let alive = true;
    let engine: BrainScene | null = null;
    import('./BrainScene').then(({ BrainScene }) => {
      if (!alive || !canvasRef.current || !tagsRef.current) return;
      const lowPower = window.matchMedia('(max-width: 820px)').matches;
      engine = new BrainScene(canvasRef.current, { onHover: () => undefined, onPick: () => undefined }, reduced, lowPower);
      engineRef.current = engine;
      const host = tagsRef.current;
      host.innerHTML = '';
      const els = brainNodes.map((n) => {
        const el = document.createElement('div');
        el.className = `brain-tag ${n.side === 'left' ? 'is-left' : 'is-right'}`;
        el.innerHTML = '<i></i><div><b></b><span></span><em></em></div>';
        (el.querySelector('b') as HTMLElement).textContent = n.code;
        (el.querySelector('span') as HTMLElement).textContent = n.label;
        host.appendChild(el);
        return el;
      });
      let lastFocus: string | null = null;
      engine.onFrame = () => {
        const e = engine!;
        const focus = e.focus;
        const near = new Set<string>();
        if (focus) brainLinks.forEach((l) => (l.a === focus ? near.add(l.b) : l.b === focus ? near.add(l.a) : null));
        if (focus !== lastFocus) {
          lastFocus = focus;
          els.forEach((el) => (el.querySelector('em') as HTMLElement).replaceChildren());
          if (focus) {
            const i = brainNodes.findIndex((n) => n.id === focus);
            const n = brainNodes[i];
            const c = e.coords(n.id);
            const em = els[i].querySelector('em') as HTMLElement;
            em.textContent = `${regionLabel(n.region).toUpperCase()} / ${n.side === 'left' ? 'LH' : 'RH'}${c ? ` / X ${fmt(c.x)} Y ${fmt(c.y)} Z ${fmt(c.z)}` : ''}${n.line ? `\n${n.line}` : ''}${near.size ? `\nLINKS ${near.size}` : ''}`;
          }
        }
        const placed: [number, number, number, number][] = [];
        const order = e.screen
          .map((s, i) => ({ s, i, n: brainNodes[i] }))
          .sort((a, b) => Number(b.n.id === focus) - Number(a.n.id === focus) || Number(near.has(b.n.id)) - Number(near.has(a.n.id)) || b.s.front - a.s.front);
        let codes = 0;
        const cap = engine!.screen.length < 120 ? 26 : 38;
        for (const { s, i, n } of order) {
          const el = els[i];
          const isFocus = n.id === focus;
          const named = isFocus || near.has(n.id);
          const code = !named && s.front > 0.62 && codes < (focus ? 10 : cap);
          if (!s.visible || (!named && !code)) {
            el.style.display = 'none';
            continue;
          }
          const w = isFocus ? 260 : named ? 14 + n.label.length * 6 + 40 : 42;
          const h = isFocus ? 70 : 14;
          const rect: [number, number, number, number] = [s.x, s.y - 8, s.x + w, s.y + h];
          if (!isFocus && placed.some((p) => !(rect[2] < p[0] || rect[0] > p[2] || rect[3] < p[1] || rect[1] > p[3]))) {
            el.style.display = 'none';
            continue;
          }
          placed.push(rect);
          if (code) codes++;
          el.style.display = 'flex';
          el.classList.toggle('is-named', named);
          el.classList.toggle('is-focus', isFocus);
          el.style.opacity = String(named ? 1 : 0.45 + s.front * 0.5);
          el.style.transform = `translate3d(${Math.round(s.x)}px, ${Math.round(s.y)}px, 0)`;
        }
        if (capRef.current) {
          const left = e.facing === -1;
          capRef.current.dataset.side = left ? 'left' : 'right';
          capRef.current.textContent = left ? 'LEFT HEMISPHERE / LOGIC, WORK, WHAT I LEARNED' : 'RIGHT HEMISPHERE / CURIOSITY, CRAFT, IDEAS';
        }
      };
    });
    return () => {
      alive = false;
      engine?.dispose();
      engineRef.current = null;
    };
  }, [reduced]);

  return (
    <div className="relative h-full w-full select-none">
      <div ref={canvasRef} className="absolute inset-0" aria-hidden />
      <div ref={tagsRef} className="pointer-events-none absolute inset-0 overflow-hidden font-mono" aria-hidden />
      <div ref={capRef} className="brain-caption pointer-events-none absolute left-1/2 top-[7%] -translate-x-1/2 font-mono" aria-hidden />
      <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] tracking-[0.14em] text-[#9fb6ff]/70">
        DRAG TO TURN / TAP A NEURON / {brainNodes.length} NODES
      </p>
      {!webgl && (
        <div className="absolute inset-0 grid place-items-center">
          <p className="label text-grey-2">The knowledge map needs WebGL</p>
        </div>
      )}
    </div>
  );
}
