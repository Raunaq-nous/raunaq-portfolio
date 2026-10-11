'use client';

import { useEffect, useRef } from 'react';

/*
 * Background field of code fragments and pixel blocks arranged in horizontal bands.
 * `velocity` (px/s) streams the bands sideways during a time-travel transition.
 */

const TOKENS = [
  'med(', 'ra', '&&e)', 'pe', 'ro', 'e=e', 'd(Sy', 'n(', 'const', 'contours', 'blobCol', 'perimeter',
  '=>', '{ }', 'irr(', 'capex', 'opex', 'npv', 'fn', 'map(', 'reduce', 'agent', 'rag', '0x1f', '//',
  'tx', 'Δ', 'σ', 'lerp', 'y:', 'x:', 'q[w]', 'ω', 'θ', '|>', '::', '[]', '#', '$', '>>', 'λ', 'enters',
];

interface Band {
  y: number;
  h: number;
  speed: number;
  items: { x: number; w: number; kind: 0 | 1 | 2; text: string; a: number }[];
  width: number;
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export default function GlyphField({ velocity, className = '' }: { velocity: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const vel = useRef(velocity);
  vel.current = velocity;

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let bands: Band[] = [];
    let W = 1;
    let H = 1;
    let dpr = 1;
    let raf = 0;
    let visible = true;
    let current = 0;
    let last = 0;

    const build = () => {
      const r = rng(17);
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width;
      H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bands = [];
      let y = 6;
      while (y < H) {
        const h = 9 + Math.floor(r() * 3) * 4;
        const width = W * 2;
        const items: Band['items'] = [];
        let x = 0;
        while (x < width) {
          const k = r();
          const kind: 0 | 1 | 2 = k < 0.62 ? 0 : k < 0.9 ? 1 : 2;
          const text = TOKENS[Math.floor(r() * TOKENS.length)];
          const w = kind === 0 ? text.length * 7 + 6 : kind === 1 ? 6 + Math.floor(r() * 5) * 6 : 10 + r() * 50;
          items.push({ x, w, kind, text, a: 0.06 + Math.pow(r(), 3) * 0.55 });
          x += w + 4 + r() * 60;
        }
        bands.push({ y, h, speed: 0.4 + r() * 1.2, items, width });
        y += h + 8 + r() * 26;
      }
    };

    const draw = (t: number) => {
      const dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016);
      last = t;
      const target = vel.current + (reduced ? 0 : 10);
      current += (target - current) * Math.min(1, dt * 4);
      ctx.clearRect(0, 0, W, H);
      ctx.font = '10px "JetBrains Mono", ui-monospace, monospace';
      ctx.textBaseline = 'top';
      for (const b of bands) {
        const shift = ((t / 1000) * current * b.speed) % b.width;
        for (const it of b.items) {
          let x = it.x - shift;
          if (x < -it.w) x += b.width;
          if (x > W) continue;
          const boost = Math.min(1, Math.abs(current) / 600);
          const a = Math.min(0.85, it.a + boost * 0.15);
          if (it.kind === 0) {
            ctx.fillStyle = `rgba(241,240,236,${a})`;
            ctx.fillText(it.text, x, b.y);
          } else if (it.kind === 1) {
            ctx.fillStyle = `rgba(241,240,236,${a * 0.9})`;
            ctx.fillRect(x, b.y + 1, it.w, b.h - 3);
          } else {
            ctx.strokeStyle = `rgba(241,240,236,${a * 0.6})`;
            ctx.beginPath();
            ctx.moveTo(x, b.y + b.h / 2);
            ctx.lineTo(x + it.w, b.y + b.h / 2);
            ctx.stroke();
          }
        }
      }
      if (visible) raf = requestAnimationFrame(draw);
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) {
        last = 0;
        raf = requestAnimationFrame(draw);
      }
    });
    io.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={ref} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden />;
}
