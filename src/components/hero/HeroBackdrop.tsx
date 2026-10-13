'use client';

import { useEffect, useRef } from 'react';
import { memories, mediaFor, portrait } from '@/data/assets';
import { projects } from '@/data/projects';
import { battles } from '@/data/battles';
import { brainNodes } from '@/data/brain';
import { papers } from '@/data/research';
import { asset } from '@/lib/asset';
import { useReducedMotion } from '@/lib/motion';

// The brain scan palette.
const PAL = ['#5ce1ff', '#4f6bff', '#9d7bff', '#e05cff', '#ff6fae', '#ff4b3e', '#ff9b3d', '#7cf0c8'];

const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
};

/** Every image the site has gathered: memories, papers, interface captures, the portrait. */
function imageList() {
  const list = new Set<string>();
  memories.forEach((m) => list.add(m.src));
  projects.forEach((p) => mediaFor(p.slug, p.name).screenshots.forEach((s) => s.asset && list.add(s.asset.src)));
  list.add(portrait.src);
  return [...list];
}

/** Short tokens from the real data, for the readouts scattered across the field. */
function tokens() {
  const t: string[] = [];
  brainNodes.forEach((n, i) => i % 3 === 0 && t.push(`${n.code}`));
  battles.forEach((b) => t.push(`${b.company.split(',')[0].toUpperCase().slice(0, 14)} / ${b.period.slice(-4)}`));
  papers.forEach((p) => t.push(`IEEE ${p.year}`));
  t.push('28,800 KM/HR', '1 DEG/S', `NODES ${brainNodes.length}`, `BUILDS ${projects.length}`, 'C: ON', 'C: OFF', 'ACQ TM_', 'LH / RH', 'SCAN 01', 'SIG/9.6', 'SIG/4.6');
  return t;
}

type Tile =
  | { kind: 'image'; x: number; y: number; w: number; h: number; src: number; tint: string; a: number; px: number }
  | { kind: 'pixels'; x: number; y: number; cells: { dx: number; dy: number; c: string }[]; s: number; flick: number }
  | { kind: 'hatch' | 'frame' | 'bar'; x: number; y: number; w: number; h: number; c: string; label?: string; flick: number }
  | { kind: 'text'; x: number; y: number; text: string; size: number; c: string; flick: number };

/**
 * A HUD collage behind the hero, in the style of a scan readout: pixelated fragments of every
 * photo and capture on the site, clusters of lit cells, hatched panels, frames and codes.
 * It flickers a little; the brain sits on top of it.
 */
export default function HeroBackdrop({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const srcs = imageList();
    const imgs: (HTMLImageElement | null)[] = srcs.map(() => null);
    const small = new Map<string, HTMLCanvasElement>();
    let tiles: Tile[] = [];
    let W = 0;
    let H = 0;
    let raf = 0;
    let last = 0;
    let visible = true;
    const toks = tokens();

    srcs.forEach((s, i) => {
      const im = new Image();
      im.decoding = 'async';
      im.src = asset(s);
      im.onload = () => {
        imgs[i] = im;
        draw(performance.now(), true);
      };
    });

    const layout = () => {
      const r = rng(1234);
      const cell = W < 700 ? 9 : 12;
      tiles = [];
      const n = Math.round((W * H) / 7000);
      for (let k = 0; k < n; k++) {
        const roll = r();
        const x = Math.floor((r() * W) / cell) * cell;
        const y = Math.floor((r() * H) / cell) * cell;
        const c = PAL[Math.floor(r() * PAL.length)];
        if (roll < 0.14 && srcs.length) {
          const w = cell * (4 + Math.floor(r() * 8));
          tiles.push({ kind: 'image', x, y, w, h: Math.round(w * (0.55 + r() * 0.35)), src: Math.floor(r() * srcs.length), tint: c, a: 0.18 + r() * 0.24, px: 6 + Math.floor(r() * 10) });
        } else if (roll < 0.5) {
          const cells: { dx: number; dy: number; c: string }[] = [];
          const cw = 2 + Math.floor(r() * 7);
          const ch = 1 + Math.floor(r() * 4);
          for (let a = 0; a < cw; a++) for (let b = 0; b < ch; b++) if (r() < 0.6) cells.push({ dx: a, dy: b, c: r() < 0.7 ? c : PAL[Math.floor(r() * PAL.length)] });
          tiles.push({ kind: 'pixels', x, y, cells, s: cell * (r() < 0.7 ? 0.8 : 1.4), flick: r() });
        } else if (roll < 0.6) {
          tiles.push({ kind: 'hatch', x, y, w: cell * (4 + Math.floor(r() * 10)), h: cell * (3 + Math.floor(r() * 8)), c, flick: r() });
        } else if (roll < 0.72) {
          tiles.push({ kind: 'frame', x, y, w: cell * (3 + Math.floor(r() * 8)), h: cell * (3 + Math.floor(r() * 6)), c, flick: r() });
        } else if (roll < 0.8) {
          tiles.push({ kind: 'bar', x, y, w: cell * (3 + Math.floor(r() * 5)), h: cell, c, label: toks[Math.floor(r() * toks.length)], flick: r() });
        } else {
          tiles.push({ kind: 'text', x, y, text: toks[Math.floor(r() * toks.length)], size: r() < 0.15 ? 18 + Math.floor(r() * 8) : 9 + Math.floor(r() * 3), c: r() < 0.6 ? '#c9d6ff' : c, flick: r() });
        }
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width;
      H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout();
      draw(performance.now(), true);
    };

    const pixelated = (i: number, px: number) => {
      const im = imgs[i];
      if (!im) return null;
      const key = `${i}:${px}`;
      if (!small.has(key)) {
        const c = document.createElement('canvas');
        // Each fragment is the image at a few dozen pixels across, scaled up without smoothing.
        c.width = 6 * px;
        c.height = Math.max(3, Math.round((c.width * im.naturalHeight) / im.naturalWidth));
        c.getContext('2d')!.drawImage(im, 0, 0, c.width, c.height);
        small.set(key, c);
      }
      return small.get(key)!;
    };

    function draw(now: number, force = false) {
      if (!force && (!visible || now - last < 140)) return;
      last = now;
      const t = now / 1000;
      // Ground: deep indigo, darker at the edges, a fine grid.
      const g = ctx!.createRadialGradient(W * 0.45, H * 0.5, 0, W * 0.45, H * 0.5, Math.max(W, H) * 0.75);
      g.addColorStop(0, '#140d33');
      g.addColorStop(0.6, '#0a0720');
      g.addColorStop(1, '#040310');
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, W, H);
      ctx!.strokeStyle = 'rgba(120,110,220,0.07)';
      ctx!.lineWidth = 1;
      for (let x = 0; x < W; x += 48) {
        ctx!.beginPath();
        ctx!.moveTo(x + 0.5, 0);
        ctx!.lineTo(x + 0.5, H);
        ctx!.stroke();
      }
      for (let y = 0; y < H; y += 48) {
        ctx!.beginPath();
        ctx!.moveTo(0, y + 0.5);
        ctx!.lineTo(W, y + 0.5);
        ctx!.stroke();
      }
      ctx!.imageSmoothingEnabled = false;
      for (const tl of tiles) {
        const on = tl.kind === 'image' ? 1 : reduced ? 1 : Math.sin(t * (1.3 + tl.flick * 3) + tl.flick * 40) > -0.65 ? 1 : 0.25;
        if (tl.kind === 'image') {
          const sm = pixelated(tl.src, tl.px);
          if (!sm) continue;
          ctx!.globalAlpha = tl.a;
          ctx!.drawImage(sm, tl.x, tl.y, tl.w, tl.h);
          ctx!.globalCompositeOperation = 'color';
          ctx!.fillStyle = tl.tint;
          ctx!.fillRect(tl.x, tl.y, tl.w, tl.h);
          ctx!.globalCompositeOperation = 'source-over';
          ctx!.globalAlpha = 0.6;
          ctx!.strokeStyle = tl.tint;
          ctx!.strokeRect(tl.x + 0.5, tl.y + 0.5, tl.w, tl.h);
          ctx!.globalAlpha = 1;
        } else if (tl.kind === 'pixels') {
          ctx!.globalAlpha = 0.55 * on;
          tl.cells.forEach((c) => {
            ctx!.fillStyle = c.c;
            ctx!.fillRect(tl.x + c.dx * (tl.s + 2), tl.y + c.dy * (tl.s + 2), tl.s, tl.s * 0.7);
          });
          ctx!.globalAlpha = 1;
        } else if (tl.kind === 'hatch') {
          ctx!.save();
          ctx!.beginPath();
          ctx!.rect(tl.x, tl.y, tl.w, tl.h);
          ctx!.clip();
          ctx!.strokeStyle = tl.c;
          ctx!.globalAlpha = 0.18 * on;
          for (let k = -tl.h; k < tl.w; k += 7) {
            ctx!.beginPath();
            ctx!.moveTo(tl.x + k, tl.y + tl.h);
            ctx!.lineTo(tl.x + k + tl.h, tl.y);
            ctx!.stroke();
          }
          ctx!.restore();
          ctx!.globalAlpha = 1;
        } else if (tl.kind === 'frame') {
          ctx!.globalAlpha = 0.45 * on;
          ctx!.strokeStyle = tl.c;
          ctx!.strokeRect(tl.x + 0.5, tl.y + 0.5, tl.w, tl.h);
          ctx!.globalAlpha = 1;
        } else if (tl.kind === 'bar') {
          ctx!.globalAlpha = 0.55 * on;
          ctx!.fillStyle = tl.c;
          ctx!.fillRect(tl.x, tl.y, tl.w, tl.h * 0.9);
          ctx!.fillStyle = '#07051a';
          ctx!.font = '9px "JetBrains Mono", ui-monospace, monospace';
          ctx!.fillText((tl.label ?? '').slice(0, Math.floor(tl.w / 6)), tl.x + 3, tl.y + tl.h * 0.68);
          ctx!.globalAlpha = 1;
        } else if (tl.kind === 'text') {
          ctx!.globalAlpha = (tl.size > 14 ? 0.55 : 0.6) * on;
          ctx!.fillStyle = tl.c;
          ctx!.font = `${tl.size}px "JetBrains Mono", ui-monospace, monospace`;
          ctx!.fillText(tl.text, tl.x, tl.y);
          ctx!.globalAlpha = 1;
        }
      }
      // Hold the brain's area darker so it reads on top, and calm the area behind the name tag.
      const wide = W >= 1024;
      const bx = wide ? W * 0.36 : W * 0.5;
      const by = wide ? H * 0.5 : H * 0.3;
      const v = ctx!.createRadialGradient(bx, by, 0, bx, by, Math.min(W, H) * (wide ? 0.6 : 0.5));
      v.addColorStop(0, 'rgba(6,4,20,0.9)');
      v.addColorStop(0.65, 'rgba(6,4,20,0.5)');
      v.addColorStop(1, 'rgba(6,4,20,0)');
      ctx!.fillStyle = v;
      ctx!.fillRect(0, 0, W, H);
      if (wide) {
        const n = ctx!.createLinearGradient(W * 0.7, 0, W * 0.78, 0);
        n.addColorStop(0, 'rgba(6,4,20,0)');
        n.addColorStop(1, 'rgba(6,4,20,0.45)');
        ctx!.fillStyle = n;
        ctx!.fillRect(W * 0.7, 0, W * 0.3, H);
      }
    }

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!reduced) draw(now);
    };
    resize();
    raf = requestAnimationFrame(loop);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [reduced]);

  return <canvas ref={ref} className={`block h-full w-full ${className}`} aria-hidden />;
}
