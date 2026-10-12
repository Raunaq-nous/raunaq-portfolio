'use client';

import { useEffect, useRef, useState } from 'react';
import { asset } from '@/lib/asset';

interface GraphNode {
  id: number;
  path: string;
  group: string;
  lines: number;
  x: number;
  y: number;
}

interface Graph {
  files: number;
  imports: number;
  lines: number;
  groups: string[];
  nodes: GraphNode[];
  edges: [number, number][];
}

/** Knowledge graph of a codebase: files as nodes, imports as edges, coloured by module. */
export default function CodeGraph({ slug, className = '' }: { slug: string; className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [graph, setGraph] = useState<Graph | null>(null);
  const [missing, setMissing] = useState(false);
  const [hover, setHover] = useState<GraphNode | null>(null);
  const [group, setGroup] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(asset(`/media/projects/${slug}/codegraph.json`))
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((g: Graph) => alive && setGraph(g))
      .catch(() => alive && setMissing(true));
    return () => {
      alive = false;
    };
  }, [slug]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!graph || !wrap || !canvas || !ctx) return;
    const pad = 24;
    let W = 1;
    let H = 1;
    const deg = new Map<number, number>();
    graph.edges.forEach(([a, b]) => {
      deg.set(a, (deg.get(a) ?? 0) + 1);
      deg.set(b, (deg.get(b) ?? 0) + 1);
    });
    const pos = (n: GraphNode) => [pad + n.x * (W - pad * 2), pad + n.y * (H - pad * 2)];
    const draw = () => {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const rgb = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim() || '14 14 13';
      ctx.clearRect(0, 0, W, H);
      const hv = hover?.id;
      const linked = new Set<number>();
      if (hv !== undefined) graph.edges.forEach(([a, b]) => (a === hv ? linked.add(b) : b === hv ? linked.add(a) : null));
      graph.edges.forEach(([a, b]) => {
        const A = graph.nodes[a];
        const B = graph.nodes[b];
        const on = hv !== undefined && (a === hv || b === hv);
        const inG = group && (A.group === group || B.group === group);
        ctx.strokeStyle = `rgb(${rgb} / ${on ? 0.8 : inG ? 0.3 : group ? 0.04 : 0.12})`;
        const [ax, ay] = pos(A);
        const [bx, by] = pos(B);
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      });
      graph.nodes.forEach((n) => {
        const [x, y] = pos(n);
        const s = 2 + Math.min(6, Math.sqrt(n.lines) / 6) + Math.min(3, (deg.get(n.id) ?? 0) * 0.3);
        const dim = group && n.group !== group;
        const on = n.id === hv || linked.has(n.id);
        ctx.fillStyle = `rgb(${rgb} / ${on ? 1 : dim ? 0.12 : 0.65})`;
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
        if (n.id === hv) {
          ctx.strokeStyle = `rgb(${rgb} / 0.9)`;
          ctx.strokeRect(x - s / 2 - 4, y - s / 2 - 4, s + 8, s + 8);
        }
      });
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(wrap);
    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      let best: GraphNode | null = null;
      let bd = 14;
      graph.nodes.forEach((n) => {
        const [x, y] = pos(n);
        const d = Math.hypot(x - mx, y - my);
        if (d < bd) {
          bd = d;
          best = n;
        }
      });
      setHover((h) => (h?.id === (best as GraphNode | null)?.id ? h : best));
    };
    const onLeave = () => setHover(null);
    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerleave', onLeave);
    return () => {
      ro.disconnect();
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', onLeave);
    };
  }, [graph, hover, group]);

  if (missing)
    return (
      <div className={`dot-grid relative grid place-items-center border rule ${className}`}>
        <span className="label text-grey-3">Codebase graph / coming soon</span>
      </div>
    );

  const counts = graph ? graph.groups.map((g) => [g, graph.nodes.filter((n) => n.group === g).length] as const).sort((a, b) => b[1] - a[1]) : [];

  return (
    <figure className={className}>
      <div ref={wrapRef} className="dot-grid relative aspect-[16/10] border rule">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-label="Codebase knowledge graph" role="img" />
        <span className="label pointer-events-none absolute left-3 top-3 text-grey-3">Codebase graph</span>
        {graph && (
          <span className="label pointer-events-none absolute right-3 top-3 text-grey-3">
            {graph.files} files / {graph.imports} imports / {graph.lines.toLocaleString()} lines
          </span>
        )}
        {hover && (
          <span className="label pointer-events-none absolute bottom-3 left-3 max-w-[90%] truncate normal-case tracking-normal text-paper">
            {hover.path} / {hover.lines} lines
          </span>
        )}
      </div>
      <figcaption className="mt-3 flex flex-wrap gap-1.5">
        {counts.slice(0, 8).map(([g, c]) => (
          <button
            key={g}
            type="button"
            onPointerEnter={() => setGroup(g)}
            onPointerLeave={() => setGroup(null)}
            onFocus={() => setGroup(g)}
            onBlur={() => setGroup(null)}
            className={`label border px-2 py-1 normal-case tracking-normal ${group === g ? 'border-paper text-paper' : 'border-paper/20 text-grey-2'}`}
          >
            {g} <span className="text-grey-3">{c}</span>
          </button>
        ))}
      </figcaption>
    </figure>
  );
}
