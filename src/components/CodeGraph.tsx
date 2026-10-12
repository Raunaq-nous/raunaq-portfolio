'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { asset } from '@/lib/asset';

interface StackNode {
  id: string;
  label: string;
  layer: string;
  role: string;
}

interface StackGraph {
  source: string;
  layers: { id: string; label: string }[];
  nodes: StackNode[];
  edges: { s: string; t: string; label?: string }[];
  features: string[];
}

interface Line {
  s: string;
  t: string;
  label?: string;
  d: string;
  mx: number;
  my: number;
}

const ROLE_NOTE: Record<string, string> = {
  web: 'app shell',
  mobile: 'mobile',
  ui: 'ui',
  build: 'build',
  style: 'styling',
  viz: 'visual',
  state: 'state',
  server: 'server',
  lang: 'language',
  auth: 'auth',
  jobs: 'jobs',
  ingest: 'ingest',
  validate: 'logic',
  geo: 'geo',
  observe: 'observe',
  orm: 'orm',
  db: 'database',
  cache: 'cache',
  local: 'store',
  storage: 'files',
  vector: 'vectors',
  sdk: 'sdk',
  orchestrate: 'agents',
  model: 'model',
  perception: 'perception',
  eval: 'evals',
  host: 'hosting',
  ci: 'ci',
  container: 'container',
  test: 'tests',
};

/** Architecture graph of a build: technologies in layers, linked by how a request flows. */
export default function CodeGraph({ slug, className = '' }: { slug: string; className?: string }) {
  const boardRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLElement>());
  const [graph, setGraph] = useState<StackGraph | null>(null);
  const [missing, setMissing] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [size, setSize] = useState({ w: 1, h: 1 });
  const [hover, setHover] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(asset(`/media/projects/${slug}/stack.json`))
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((g: StackGraph) => alive && setGraph(g))
      .catch(() => alive && setMissing(true));
    return () => {
      alive = false;
    };
  }, [slug]);

  const measure = useCallback(() => {
    const board = boardRef.current;
    if (!board || !graph) return;
    const b = board.getBoundingClientRect();
    setSize({ w: b.width, h: b.height });
    const box = (id: string) => {
      const el = nodeRefs.current.get(id);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { l: r.left - b.left, r: r.right - b.left, t: r.top - b.top, b: r.bottom - b.top, cy: r.top - b.top + r.height / 2, cx: r.left - b.left + r.width / 2 };
    };
    const out: Line[] = [];
    for (const e of graph.edges) {
      const A = box(e.s);
      const B = box(e.t);
      if (!A || !B) continue;
      let d: string;
      if (Math.abs(A.cx - B.cx) < 8) {
        // Same column: bow out to the right.
        const x = Math.max(A.r, B.r);
        d = `M${A.r},${A.cy} C${x + 28},${A.cy} ${x + 28},${B.cy} ${B.r},${B.cy}`;
      } else {
        const [P, Q] = A.cx < B.cx ? [A, B] : [B, A];
        const x1 = P.r;
        const x2 = Q.l;
        const k = Math.max(24, (x2 - x1) * 0.45);
        d = `M${x1},${P.cy} C${x1 + k},${P.cy} ${x2 - k},${Q.cy} ${x2},${Q.cy}`;
      }
      out.push({ ...e, d, mx: (A.cx + B.cx) / 2, my: (A.cy + B.cy) / 2 });
    }
    setLines(out);
  }, [graph]);

  useLayoutEffect(() => {
    measure();
    const board = boardRef.current;
    if (!board) return;
    const ro = new ResizeObserver(measure);
    ro.observe(board);
    return () => ro.disconnect();
  }, [measure]);

  if (missing)
    return (
      <div className={`dot-grid relative grid aspect-[16/10] place-items-center border rule ${className}`}>
        <span className="label text-grey-3">Architecture graph / coming soon</span>
      </div>
    );
  if (!graph) return <div className={`dot-grid aspect-[16/10] border rule ${className}`} />;

  const linked = new Set<string>();
  if (hover) graph.edges.forEach((e) => (e.s === hover ? linked.add(e.t) : e.t === hover ? linked.add(e.s) : null));
  const layers = graph.layers.filter((l) => graph.nodes.some((n) => n.layer === l.id));

  return (
    <figure className={className}>
      <div className="dot-grid relative border rule">
        <div className="flex items-center justify-between border-b rule px-3 py-2">
          <span className="label text-grey-3">Architecture graph</span>
          <span className="label text-grey-3">
            {graph.nodes.length} technologies / {graph.edges.length} links
          </span>
        </div>
        <div ref={boardRef} className="relative grid gap-x-4 gap-y-5 p-4 sm:grid-cols-[repeat(var(--cols),minmax(0,1fr))]" style={{ ['--cols' as string]: layers.length }}>
          <svg className="pointer-events-none absolute inset-0 hidden sm:block" width={size.w} height={size.h} aria-hidden>
            {lines.map((l, i) => {
              const on = hover && (l.s === hover || l.t === hover);
              return (
                <g key={i}>
                  <path d={l.d} fill="none" stroke="rgb(var(--paper))" strokeOpacity={on ? 0.85 : hover ? 0.06 : 0.22} strokeWidth={on ? 1.2 : 0.8} />
                  {on && l.label && (
                    <text x={l.mx} y={l.my - 4} textAnchor="middle" className="fill-paper font-mono text-[10px]">
                      {l.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          {layers.map((layer, li) => (
            <div key={layer.id} className="relative flex flex-col gap-1.5">
              <span className="label mb-1 text-grey-3">
                {String(li + 1).padStart(2, '0')} / {layer.label}
              </span>
              {graph.nodes
                .filter((n) => n.layer === layer.id)
                .map((n) => {
                  const on = hover === n.id;
                  const near = linked.has(n.id);
                  return (
                    <button
                      key={n.id}
                      type="button"
                      ref={(el) => {
                        if (el) nodeRefs.current.set(n.id, el);
                        else nodeRefs.current.delete(n.id);
                      }}
                      onPointerEnter={() => setHover(n.id)}
                      onPointerLeave={() => setHover(null)}
                      onFocus={() => setHover(n.id)}
                      onBlur={() => setHover(null)}
                      className={`relative flex flex-col gap-0.5 border bg-ink px-2 py-1.5 text-left leading-tight transition-colors ${
                        on ? 'border-paper text-paper' : near ? 'border-paper/60 text-paper' : hover ? 'border-paper/10 text-grey-3' : 'border-paper/20 text-grey-1'
                      } ${n.role === 'model' ? 'font-mono text-[11px]' : 'text-[12.5px]'}`}
                    >
                      <span className="break-words">{n.label}</span>
                      <span className="label text-[8.5px] text-grey-3">{ROLE_NOTE[n.role] ?? n.role}</span>
                    </button>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
      <figcaption className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
        {graph.features.length > 0 && (
          <div>
            <span className="label text-grey-3">AI features</span>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {graph.features.map((f) => (
                <li key={f} className="border border-paper/20 px-2 py-1 text-[13px] text-grey-1">
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}
        <span className="label self-end text-grey-3">{graph.source}</span>
      </figcaption>
    </figure>
  );
}
