'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { brainLabels, buildName, type BrainLabel } from '@/data/brain';
import { useReducedMotion } from '@/lib/motion';
import { useMode } from './ModeContext';

/*
 * Hero brain: a point-cloud brain seen from above, two hemispheres with folds. Every label is
 * anchored to a point inside its hemisphere by a leader line. Hover a label to light its region
 * and the builds it connects to.
 */

interface P3 {
  x: number;
  y: number;
  z: number;
  side: -1 | 1;
  fold: number;
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Top-down brain. lx is distance from the midline (0..1), ly runs front (-1) to back (1).
function width(ly: number) {
  const e = 2.8;
  const base = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(ly), e)), 1 / e);
  const frontal = ly < 0 ? 1 - 0.16 * Math.pow(-ly, 2) : 1 - 0.05 * ly;
  return 0.94 * base * frontal;
}

function buildPoints(n: number): P3[] {
  const r = rng(11);
  const pts: P3[] = [];
  let guard = 0;
  while (pts.length < n && guard++ < n * 30) {
    const side: -1 | 1 = r() < 0.5 ? -1 : 1;
    const ly = r() * 2 - 1;
    const w = width(ly);
    const lx = r();
    if (lx > w) continue;
    // Sulci: convoluted fold lines. Points gather along them, with a sparse fill between.
    const fx = lx * 11 + Math.sin(ly * 6 + side) * 1.6;
    const fy = ly * 8 + Math.sin(lx * 7) * 1.3;
    const f = Math.sin(fx) * Math.cos(fy) + 0.35 * Math.sin(fx * 2.1 + fy);
    const fold = Math.abs(f);
    const onLine = fold < 0.12;
    if (!onLine && r() > 0.22) continue;
    const edge = lx / Math.max(0.05, w);
    const z = Math.sqrt(Math.max(0, 1 - edge * edge * 0.85 - ly * ly * 0.55)) * 0.55;
    pts.push({ x: side * (0.03 + lx), y: ly, z, side, fold: onLine ? 0 : 1 });
  }
  return pts;
}

function anchors(labels: BrainLabel[], pts: P3[]) {
  const r = rng(29);
  return labels.map((l) => {
    const side = l.side === 'left' ? -1 : 1;
    const pool = pts.filter((p) => p.side === side && p.z > 0.12);
    const i = labels.filter((x) => x.side === l.side).indexOf(l);
    const count = labels.filter((x) => x.side === l.side).length;
    // Spread anchors front to back in label order so leader lines do not cross much.
    const ty = -0.85 + (i / Math.max(1, count - 1)) * 1.7;
    let best = pool[0];
    let bd = Infinity;
    for (let k = 0; k < 40; k++) {
      const p = pool[Math.floor(r() * pool.length)];
      const d = Math.abs(p.y - ty) + Math.abs(Math.abs(p.x) - 0.45) * 0.4;
      if (d < bd) {
        bd = d;
        best = p;
      }
    }
    return best;
  });
}

export default function BrainGraph() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [hover, setHover] = useState<number | null>(null);
  const hoverRef = useRef<number | null>(null);
  hoverRef.current = hover;
  const reduced = useReducedMotion();
  const { mode } = useMode();

  const left = useMemo(() => brainLabels.filter((l) => l.side === 'left'), []);
  const right = useMemo(() => brainLabels.filter((l) => l.side === 'right'), []);
  const ordered = useMemo(() => [...left, ...right], [left, right]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!wrap || !canvas || !ctx) return;
    const pts = buildPoints(window.innerWidth < 768 ? 3000 : 7000);
    const anc = anchors(ordered, pts);
    let W = 1;
    let H = 1;
    let dpr = 1;
    let raf = 0;
    let visible = true;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const t0 = performance.now();

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const colour = () => getComputedStyle(document.documentElement).getPropertyValue('--paper').trim() || '14 14 13';

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    wrap.addEventListener('pointermove', onMove);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) raf = requestAnimationFrame(frame);
    });
    io.observe(wrap);

    function frame(now: number) {
      if (!ctx || !wrap) return;
      const t = (now - t0) / 1000;
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;
      const rgb = colour();
      ctx.clearRect(0, 0, W, H);
      // Brain occupies the centre column; labels sit in the outer columns.
      const bw = Math.min(W * 0.42, H * 0.62);
      const cx = W / 2;
      const cy = H / 2;
      const yaw = (reduced ? 0 : Math.sin(t * 0.25) * 0.12) + pointer.x * 0.25;
      const pitch = 0.42 + pointer.y * 0.12;
      const cyw = Math.cos(yaw);
      const syw = Math.sin(yaw);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      const proj = (p: P3) => {
        // brain local: x across (-1..1), y front(-1) to back(1), z up
        const x = p.x * bw * 0.5;
        const y = p.y * bw * 0.6;
        const z = p.z * bw * 0.45;
        const x1 = x * cyw - y * syw;
        const y1 = x * syw + y * cyw;
        const y2 = y1 * cp - z * sp;
        const z2 = y1 * sp + z * cp;
        const s = 900 / (900 + z2 * -0.6);
        return { sx: cx + x1 * s, sy: cy + y2 * s, d: z2 };
      };
      const hv = hoverRef.current;
      const hl = hv !== null ? ordered[hv] : null;
      const hlSide = hl ? (hl.side === 'left' ? -1 : 1) : 0;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const q = proj(p);
        let a = (p.fold ? 0.12 : 0.5) + p.z * 0.4;
        if (hl) a *= p.side === hlSide ? 1.35 : 0.45;
        if (!reduced) a *= 0.85 + 0.15 * Math.sin(t * 1.3 + i);
        ctx.fillStyle = `rgb(${rgb} / ${Math.min(0.9, a)})`;
        const s = p.fold ? 1 : 1.3 + p.z;
        ctx.fillRect(q.sx, q.sy, s, s);
      }
      // Leader lines from labels to anchors.
      ordered.forEach((l, i) => {
        const el = labelRefs.current[i];
        if (!el) return;
        const lr = el.getBoundingClientRect();
        const wr = wrap.getBoundingClientRect();
        const lx = l.side === 'left' ? lr.right - wr.left + 6 : lr.left - wr.left - 6;
        const ly = lr.top - wr.top + lr.height / 2;
        const q = proj(anc[i]);
        const on = hv === i;
        const related = hl && hl !== l && hl.builds.some((b) => l.builds.includes(b));
        ctx.strokeStyle = `rgb(${rgb} / ${on ? 0.9 : related ? 0.45 : l.active ? 0.18 : 0.08})`;
        ctx.lineWidth = on ? 1.2 : 1;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        const mx = lx + (l.side === 'left' ? 24 : -24);
        ctx.lineTo(mx, ly);
        ctx.lineTo(q.sx, q.sy);
        ctx.stroke();
        ctx.fillStyle = `rgb(${rgb} / ${on ? 1 : 0.5})`;
        ctx.fillRect(q.sx - (on ? 3 : 1.5), q.sy - (on ? 3 : 1.5), on ? 6 : 3, on ? 6 : 3);
        if (on) {
          ctx.strokeStyle = `rgb(${rgb} / 0.8)`;
          ctx.strokeRect(q.sx - 9, q.sy - 9, 18, 18);
        }
      });
      // Midline fissure label
      ctx.fillStyle = `rgb(${rgb} / 0.35)`;
      ctx.font = '10px "JetBrains Mono", ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('LONGITUDINAL FISSURE', cx, cy + bw * 0.62 + 34);
      ctx.textAlign = 'left';
      if (visible) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      wrap.removeEventListener('pointermove', onMove);
    };
  }, [ordered, reduced, mode]);

  const hl = hover !== null ? ordered[hover] : null;

  const column = (list: BrainLabel[], offset: number, side: 'left' | 'right') => (
    <ul className={`flex flex-col justify-center gap-[3px] ${side === 'left' ? 'items-end text-right' : 'items-start text-left'}`}>
      {list.map((l, k) => {
        const i = offset + k;
        const on = hover === i;
        const related = hl && hl !== l && hl.builds.some((b) => l.builds.includes(b));
        return (
          <li key={l.id}>
            <button
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              type="button"
              onPointerEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              className={`label normal-case tracking-[0.04em] transition-colors ${on ? 'text-paper' : related ? 'text-grey-1' : l.active ? 'text-grey-2' : 'text-grey-3'}`}
            >
              {side === 'right' && <span className="mr-1.5 text-grey-4">{l.active ? '●' : '○'}</span>}
              {l.text}
              {side === 'left' && <span className="ml-1.5 text-grey-4">{l.active ? '●' : '○'}</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="relative" onPointerLeave={() => setHover(null)}>
      <div className="label mb-4 grid grid-cols-[1fr_1.4fr_1fr] gap-4 text-grey-3">
        <span className="text-right">Left / conscious / learned</span>
        <span className="text-center">● thinking about now / ○ dormant</span>
        <span>Right / subconscious / intuitive</span>
      </div>
      <div ref={wrapRef} className="relative grid min-h-[560px] grid-cols-[1fr_1.4fr_1fr] gap-4">
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative z-10 flex">{column(left, 0, 'left')}</div>
        <div />
        <div className="relative z-10 flex">{column(right, left.length, 'right')}</div>
      </div>
      <div className="label mt-2 min-h-[2.5em] text-center text-grey-2" aria-live="polite">
        {hl && hl.builds.length > 0 && (
          <span>
            Connects to{' '}
            {hl.builds.slice(0, 6).map((b, i) => (
              <span key={b}>
                {i > 0 && ' / '}
                <Link href={`/work/${b}/`} className="link-quiet text-paper">
                  {buildName(b)}
                </Link>
              </span>
            ))}
          </span>
        )}
      </div>
    </div>
  );
}
