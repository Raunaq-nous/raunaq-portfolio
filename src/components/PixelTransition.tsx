'use client';

import { useEffect, useRef } from 'react';

/*
 * The 2D page breaks into rectangular fragments, the fragments lift off and fall into depth,
 * then onDone fires (navigation into the Atlas, where the particles assemble).
 */
export default function PixelTransition({ active, onDone }: { active: boolean; onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!active) return;
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      doneRef.current();
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    interface Cell {
      x: number;
      y: number;
      w: number;
      h: number;
      t: number;
      frag: boolean;
      vx: number;
      vy: number;
    }
    const cells: Cell[] = [];
    const base = Math.max(18, Math.round(W / 48));
    for (let y = 0; y < H; ) {
      const rh = base * (Math.random() < 0.5 ? 0.5 : 1);
      for (let x = 0; x < W; ) {
        const rw = base * [0.5, 1, 2, 3][Math.floor(Math.random() * 4)];
        const cx = x + rw / 2 - W / 2;
        const cy = y + rh / 2 - H / 2;
        const dist = Math.hypot(cx / W, cy / H);
        cells.push({
          x,
          y,
          w: rw,
          h: rh,
          t: dist * 0.45 + Math.random() * 0.25,
          frag: Math.random() < 0.16,
          vx: -cx,
          vy: -cy,
        });
        x += rw;
      }
      y += rh;
    }

    const T_BREAK = 520;
    const T_DEPTH = 620;
    const start = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      const t = now - start;
      ctx.clearRect(0, 0, W, H);
      const p1 = Math.min(1, t / T_BREAK);
      const p2 = Math.max(0, Math.min(1, (t - T_BREAK) / T_DEPTH));

      if (p2 > 0) {
        ctx.fillStyle = '#090909';
        ctx.fillRect(0, 0, W, H);
      }
      for (const c of cells) {
        const local = Math.max(0, Math.min(1, (p1 - c.t) / 0.3));
        if (local <= 0) continue;
        if (p2 === 0) {
          ctx.fillStyle = '#090909';
          const inset = (1 - local) * Math.min(c.w, c.h) * 0.5;
          ctx.fillRect(c.x + inset, c.y + inset, c.w - inset * 2, c.h - inset * 2);
        }
        if (c.frag) {
          const e = p2 * p2 * (3 - 2 * p2);
          const z = 1 - e * 0.94;
          const fx = W / 2 + (c.x + c.w / 2 - W / 2 + c.vx * e * 0.85) * z;
          const fy = H / 2 + (c.y + c.h / 2 - H / 2 + c.vy * e * 0.85) * z;
          const fw = Math.max(1.2, c.w * 0.18 * z * local);
          const fh = Math.max(1.2, c.h * 0.18 * z * local);
          ctx.fillStyle = `rgba(241,240,236,${0.85 * local * (1 - e * 0.4)})`;
          ctx.fillRect(fx - fw / 2, fy - fh / 2, fw, fh);
        }
      }
      if (t < T_BREAK + T_DEPTH) raf = requestAnimationFrame(frame);
      else doneRef.current();
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  if (!active) return null;
  return <canvas ref={ref} className="pixel-overlay h-full w-full" aria-hidden />;
}
