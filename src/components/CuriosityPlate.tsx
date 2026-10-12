'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/lib/motion';

type Motif = 'plant' | 'layers' | 'radar' | 'branches' | 'pitch' | 'die';
type P = [number, number, number, number]; // x, y, z, brightness

const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
};

/** Each motif is a point cloud in a unit-ish box, y up. */
function build(motif: Motif): { pts: P[]; marks: { at: [number, number, number]; label: string }[] } {
  const r = rng(motif.length * 97 + motif.charCodeAt(0));
  const pts: P[] = [];
  const marks: { at: [number, number, number]; label: string }[] = [];
  const ring = (cx: number, cy: number, cz: number, rad: number, n: number, b: number) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push([cx + Math.cos(a) * rad, cy, cz + Math.sin(a) * rad, b]);
    }
  };
  if (motif === 'plant') {
    // Tanks, pipe racks and agents watching over them.
    [[-0.55, 0.0], [-0.15, -0.3], [0.3, 0.1]].forEach(([x, z], k) => {
      const h = 0.7 + k * 0.15;
      for (let y = 0; y <= 24; y++) ring(x, -0.5 + (y / 24) * h, z, 0.18, 34, 0.35 + 0.5 * (y % 6 === 0 ? 1 : 0.4));
      marks.push({ at: [x, -0.5 + h, z], label: `TANK ${k + 1}` });
    });
    for (let i = 0; i < 900; i++) {
      const t = r();
      const lane = Math.floor(r() * 4);
      pts.push([-0.9 + t * 1.8, -0.35 + lane * 0.08, 0.55 + (lane % 2) * 0.06, 0.55]);
    }
    for (let a = 0; a < 6; a++) {
      const ax = Math.cos(a) * 0.75;
      const az = Math.sin(a * 1.7) * 0.6;
      const ay = 0.55 + (a % 3) * 0.12;
      for (let i = 0; i < 60; i++) pts.push([ax + (r() - 0.5) * 0.06, ay + (r() - 0.5) * 0.06, az + (r() - 0.5) * 0.06, 1]);
      for (let i = 0; i < 40; i++) {
        const t = i / 40;
        pts.push([ax * (1 - t) + -0.15 * t, ay * (1 - t) + 0.2 * t, az * (1 - t) + -0.3 * t, 0.35]);
      }
      if (a < 3) marks.push({ at: [ax, ay, az], label: `AGENT ${String(a + 1).padStart(2, '0')}` });
    }
  } else if (motif === 'layers') {
    // Console, marketplace of tools, framework library: three planes.
    const names = ['CONSOLE', 'MARKETPLACE 12+', 'FRAMEWORKS 12+'];
    names.forEach((n, k) => {
      const y = 0.45 - k * 0.45;
      for (let i = 0; i < 1100; i++) pts.push([(r() - 0.5) * 1.5, y, (r() - 0.5) * 1.0, 0.18]);
      for (let e = 0; e < 120; e++) {
        const t = e / 120;
        [[-0.75, -0.5, 0.75, -0.5], [-0.75, 0.5, 0.75, 0.5]].forEach(([x0, z0, x1]) => pts.push([x0 + (x1 - x0) * t, y, z0, 0.8]));
        pts.push([-0.75, y, -0.5 + t, 0.8], [0.75, y, -0.5 + t, 0.8]);
      }
      if (k === 1)
        for (let c = 0; c < 12; c++) {
          const cx = -0.6 + (c % 4) * 0.4;
          const cz = -0.3 + Math.floor(c / 4) * 0.3;
          for (let i = 0; i < 40; i++) pts.push([cx + (r() - 0.5) * 0.22, y + 0.01, cz + (r() - 0.5) * 0.16, 0.85]);
        }
      if (k === 2)
        for (let c = 0; c < 12; c++) {
          const cx = -0.65 + c * 0.12;
          for (let i = 0; i < 30; i++) pts.push([cx, y + r() * 0.18, -0.2 + r() * 0.4, 0.6]);
        }
      marks.push({ at: [0.75, y, -0.5], label: `L${k + 1} / ${n}` });
    });
    for (let i = 0; i < 160; i++) {
      const t = r();
      pts.push([0, 0.45 - t * 0.9, 0, 0.9]);
    }
  } else if (motif === 'radar') {
    // A portfolio of projects as bars on a field, a sweep finding the ones drifting.
    for (let q = 0; q < 5; q++) ring(0, -0.45, 0, 0.2 + q * 0.17, 140, q === 4 ? 0.7 : 0.25);
    for (let k = 0; k < 34; k++) {
      const a = r() * Math.PI * 2;
      const d = 0.15 + r() * 0.75;
      const h = 0.1 + r() * 0.7;
      const hot = r() < 0.18;
      for (let i = 0; i < 26; i++) pts.push([Math.cos(a) * d, -0.45 + (i / 26) * h, Math.sin(a) * d, hot ? 1 : 0.45]);
      if (hot && marks.length < 4) marks.push({ at: [Math.cos(a) * d, -0.45 + h, Math.sin(a) * d], label: `FLAG P${String(k + 1).padStart(2, '0')}` });
    }
    for (let i = 0; i < 300; i++) {
      const t = i / 300;
      pts.push([t * 0.88, -0.45, t * 0.1, 0.9]);
    }
  } else if (motif === 'branches') {
    // Scenarios branching from one starting point: decisions as forks.
    const grow = (x: number, y: number, z: number, a: number, b: number, len: number, depth: number) => {
      const n = 26;
      const ex = x + Math.sin(a) * Math.cos(b) * len;
      const ey = y + Math.cos(a) * len;
      const ez = z + Math.sin(a) * Math.sin(b) * len;
      for (let i = 0; i < n; i++) {
        const t = i / n;
        pts.push([x + (ex - x) * t, y + (ey - y) * t, z + (ez - z) * t, 0.35 + depth * 0.12]);
      }
      for (let i = 0; i < 18; i++) pts.push([ex + (r() - 0.5) * 0.04, ey + (r() - 0.5) * 0.04, ez + (r() - 0.5) * 0.04, 1]);
      if (depth === 4 && marks.length < 4 && r() < 0.3) marks.push({ at: [ex, ey, ez], label: `SCENARIO ${String(marks.length + 1).padStart(2, '0')}` });
      if (depth < 5) {
        grow(ex, ey, ez, a + 0.5 + r() * 0.2, b + r() * 1.2, len * 0.78, depth + 1);
        grow(ex, ey, ez, a - 0.5 - r() * 0.2, b - r() * 1.2, len * 0.78, depth + 1);
      }
    };
    grow(0, -0.6, 0, 0, 0, 0.32, 0);
    marks.push({ at: [0, -0.6, 0], label: 'START / YOU' });
  } else if (motif === 'pitch') {
    // A cricket ground: boundary, inner ring, pitch strip, ball paths.
    ring(0, -0.4, 0, 0.92, 420, 0.7);
    ring(0, -0.4, 0, 0.5, 260, 0.3);
    for (let i = 0; i < 700; i++) pts.push([(r() - 0.5) * 0.12, -0.4, (r() - 0.5) * 0.5, 0.6]);
    for (let s = 0; s < 7; s++) {
      const a = (s / 7) * Math.PI * 2 + 0.3;
      const reach = 0.5 + r() * 0.42;
      const apex = 0.15 + r() * 0.55;
      for (let i = 0; i <= 80; i++) {
        const t = i / 80;
        pts.push([Math.cos(a) * reach * t, -0.4 + 4 * apex * t * (1 - t), -0.2 + Math.sin(a) * reach * t, 0.85]);
      }
      if (s < 3) marks.push({ at: [Math.cos(a) * reach, -0.4, -0.2 + Math.sin(a) * reach], label: `BALL ${s + 1}.${s + 2}` });
    }
  } else {
    // A die of cores; one tuned to the person, brighter at the centre.
    for (let gx = 0; gx < 8; gx++)
      for (let gz = 0; gz < 8; gz++) {
        const cx = -0.7 + gx * 0.2;
        const cz = -0.7 + gz * 0.2;
        const centre = Math.hypot(cx, cz) < 0.25;
        const h = centre ? 0.35 : 0.04 + r() * 0.08;
        for (let i = 0; i < 26; i++) pts.push([cx + (r() - 0.5) * 0.16, -0.35 + r() * h, cz + (r() - 0.5) * 0.16, centre ? 1 : 0.3 + r() * 0.2]);
      }
    for (let i = 0; i < 400; i++) {
      const t = r();
      const side = Math.floor(r() * 4);
      const x = side < 2 ? -0.82 + t * 1.64 : side === 2 ? -0.82 : 0.82;
      const z = side < 2 ? (side === 0 ? -0.82 : 0.82) : -0.82 + t * 1.64;
      pts.push([x, -0.36, z, 0.7]);
    }
    marks.push({ at: [0, 0, 0], label: 'CORE / ONE PERSON' }, { at: [0.7, -0.35, 0.7], label: 'DIE 8 x 8' });
  }
  return { pts, marks };
}

/** A slowly turning point-cloud plate with HUD annotations, one per curiosity. */
export default function CuriosityPlate({ motif, code, title, className = '' }: { motif: Motif; code: string; title: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const { pts, marks } = build(motif);
    let raf = 0;
    let visible = false;
    let t = Math.random() * 10;
    let last = 0;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (!visible && last) return;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      if (!reduced) t += dt * 0.18;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = rect.width;
      const H = rect.height;
      if (canvas.width !== Math.round(W * dpr)) {
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const css = getComputedStyle(canvas);
      const paper = css.getPropertyValue('--paper').trim() || '241 240 236';
      const ink = css.getPropertyValue('--ink').trim() || '9 9 9';
      ctx.fillStyle = `rgb(${ink})`;
      ctx.fillRect(0, 0, W, H);
      const ca = Math.cos(t);
      const sa = Math.sin(t);
      const tilt = 0.42;
      const ct = Math.cos(tilt);
      const st = Math.sin(tilt);
      const S = Math.min(W, H) * 0.62;
      const proj = (x: number, y: number, z: number) => {
        const rx = x * ca + z * sa;
        const rz = -x * sa + z * ca;
        const ry = y * ct - rz * st;
        const rzz = y * st + rz * ct;
        const f = 2.6 / (2.6 + rzz);
        return { x: W / 2 + rx * S * f, y: H * 0.54 - ry * S * f, d: rzz };
      };
      for (const [x, y, z, b] of pts) {
        const p = proj(x, y, z);
        const fog = Math.max(0.2, Math.min(1, 0.75 - p.d * 0.45));
        ctx.fillStyle = `rgb(${paper} / ${(b * fog * 0.85).toFixed(3)})`;
        const s = b > 0.9 ? 1.6 : 1.1;
        ctx.fillRect(p.x, p.y, s, s);
      }
      // Annotations: blue-free, black and white: a dot, a leader, a code.
      ctx.font = '9.5px "JetBrains Mono", ui-monospace, monospace';
      marks.forEach((m, i) => {
        const p = proj(...m.at);
        const lx = p.x + (i % 2 ? -1 : 1) * 34;
        const ly = p.y - 18 - (i % 3) * 6;
        ctx.strokeStyle = `rgb(${paper} / 0.55)`;
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(lx, ly);
        ctx.stroke();
        ctx.fillStyle = `rgb(${paper})`;
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
        ctx.fillStyle = `rgb(${paper} / 0.85)`;
        ctx.textAlign = i % 2 ? 'right' : 'left';
        ctx.fillText(m.label, lx + (i % 2 ? -4 : 4), ly + 3);
      });
      ctx.textAlign = 'left';
      ctx.fillStyle = `rgb(${paper} / 0.75)`;
      ctx.fillText(`${code} / ${title.toUpperCase().slice(0, 42)}`, 12, 18);
      ctx.fillStyle = `rgb(${paper} / 0.45)`;
      ctx.fillText(`PTS ${pts.length} / ROT ${(((t * 180) / Math.PI) % 360).toFixed(1)}°`, 12, 31);
      ctx.textAlign = 'right';
      ctx.fillText('PLATE / POINT CLOUD', W - 12, 18);
      ctx.textAlign = 'left';
      // Ticks along the bottom edge.
      ctx.fillStyle = `rgb(${paper} / 0.35)`;
      for (let x = 12; x < W - 12; x += 8) ctx.fillRect(x, H - 10 - (Math.round((x - 12) / 8) % 5 === 0 ? 5 : 2), 1, Math.round((x - 12) / 8) % 5 === 0 ? 5 : 2);
      if (reduced) cancelAnimationFrame(raf);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [motif, code, title, reduced]);

  return <canvas ref={ref} className={`block h-full w-full ${className}`} role="img" aria-label={`${title}: point-cloud plate`} />;
}
