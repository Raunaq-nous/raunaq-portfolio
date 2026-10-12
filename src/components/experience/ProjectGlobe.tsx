'use client';

import { useEffect, useRef } from 'react';
import { places, roleBase, roleGeos } from '@/data/geo';
import { asset } from '@/lib/asset';
import { useReducedMotion } from '@/lib/motion';

let landCache: [number, number][] | null = null;

/*
 * Dot globe for one role. It starts at the base office, then jumps from project to project,
 * drawing an arc for each trip. No text on top: just the travel.
 */
export default function ProjectGlobe({ role, className = '' }: { role: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    let raf = 0;
    let alive = true;
    const base = places[roleBase[role] ?? 'india'];
    const stops = (roleGeos[role] ?? []).map((g) => g.map((k) => places[k]).filter(Boolean));
    const flat = stops.flat();

    const run = (land: [number, number][]) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = rect.width;
      const H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const R = Math.min(W, H) * 0.42;
      const cx = W / 2;
      const cy = H / 2;
      const rad = Math.PI / 180;
      const view = { lon: base.lon, lat: base.lat * 0.6 };
      const target = { ...view };
      let leg = -1;
      let legStart = performance.now();
      const LEG = 2400;

      const project = (lat: number, lon: number) => {
        const l = (lon - view.lon) * rad;
        const p = lat * rad;
        const v = view.lat * rad;
        const x = Math.cos(p) * Math.sin(l);
        const y = Math.cos(v) * Math.sin(p) - Math.sin(v) * Math.cos(p) * Math.cos(l);
        const z = Math.sin(v) * Math.sin(p) + Math.cos(v) * Math.cos(p) * Math.cos(l);
        return { x: cx + x * R, y: cy - y * R, z };
      };
      const slerp = (a: { lat: number; lon: number }, b: { lat: number; lon: number }, t: number) => {
        const toV = (q: { lat: number; lon: number }) => [Math.cos(q.lat * rad) * Math.cos(q.lon * rad), Math.cos(q.lat * rad) * Math.sin(q.lon * rad), Math.sin(q.lat * rad)];
        const A = toV(a);
        const B = toV(b);
        const d = Math.acos(Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2])) || 1e-6;
        const s0 = Math.sin((1 - t) * d) / Math.sin(d);
        const s1 = Math.sin(t * d) / Math.sin(d);
        const v = [A[0] * s0 + B[0] * s1, A[1] * s0 + B[1] * s1, A[2] * s0 + B[2] * s1];
        return { lat: Math.asin(v[2]) / rad, lon: Math.atan2(v[1], v[0]) / rad, lift: Math.sin(Math.PI * t) * Math.min(0.25, d * 0.18) };
      };

      const frame = (now: number) => {
        if (!alive) return;
        const rgb = getComputedStyle(canvas).getPropertyValue('--paper').trim() || '241 240 236';
        if (flat.length && now - legStart > LEG) {
          leg = (leg + 1) % flat.length;
          legStart = now;
          target.lon = flat[leg].lon;
          target.lat = flat[leg].lat * 0.6;
        }
        const t = Math.min(1, (now - legStart) / (LEG * 0.6));
        view.lon += ((((target.lon - view.lon + 540) % 360) - 180) * (reduced ? 1 : 0.06));
        view.lat += (target.lat - view.lat) * (reduced ? 1 : 0.06);

        ctx.clearRect(0, 0, W, H);
        ctx.strokeStyle = `rgb(${rgb} / 0.18)`;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.stroke();
        for (const [lat, lon] of land) {
          const q = project(lat, lon);
          if (q.z < 0) continue;
          ctx.fillStyle = `rgb(${rgb} / ${0.12 + q.z * 0.45})`;
          ctx.fillRect(q.x, q.y, 1.6, 1.6);
        }
        // Past trips
        const from = leg <= 0 ? base : flat[leg - 1];
        const draw = (a: { lat: number; lon: number }, b: { lat: number; lon: number }, upto: number, alpha: number) => {
          ctx.strokeStyle = `rgb(${rgb} / ${alpha})`;
          ctx.beginPath();
          let started = false;
          for (let k = 0; k <= 40 * upto; k++) {
            const s = slerp(a, b, k / 40);
            const q = project(s.lat, s.lon);
            const lift = 1 + s.lift;
            const x = cx + (q.x - cx) * lift;
            const y = cy + (q.y - cy) * lift;
            if (q.z < -0.1) {
              started = false;
              continue;
            }
            if (started) ctx.lineTo(x, y);
            else ctx.moveTo(x, y);
            started = true;
          }
          ctx.stroke();
        };
        for (let k = 0; k < leg; k++) draw(k === 0 ? base : flat[k - 1], flat[k], 1, 0.18);
        if (leg >= 0) draw(from, flat[leg], t, 0.85);
        // Markers
        const mark = (p: { lat: number; lon: number }, strong: boolean, sq = false) => {
          const q = project(p.lat, p.lon);
          if (q.z < 0) return;
          ctx.fillStyle = `rgb(${rgb} / ${strong ? 1 : 0.5})`;
          const s = strong ? 5 : 3;
          ctx.fillRect(q.x - s / 2, q.y - s / 2, s, s);
          if (strong || sq) {
            ctx.strokeStyle = `rgb(${rgb} / 0.8)`;
            const b = 7 + (strong ? Math.sin(now / 200) * 2 : 0);
            ctx.strokeRect(q.x - b, q.y - b, b * 2, b * 2);
          }
        };
        flat.forEach((p, k) => mark(p, k === leg && t >= 1));
        mark(base, false, true);
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    };

    if (landCache) run(landCache);
    else
      fetch(asset('/media/geo/land.json'))
        .then((r) => r.json())
        .then((d) => {
          landCache = d;
          if (alive) run(d);
        });
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [role, reduced]);

  return <canvas ref={ref} className={`block h-full w-full ${className}`} aria-hidden />;
}
