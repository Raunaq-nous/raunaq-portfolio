'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { clusters, clusterOf, neighbours, nodes, type AtlasNode, type ClusterId, type NodeKind } from '@/data/atlas';
import { asset } from '@/lib/asset';
import { hasWebGL, prefersReducedMotion } from '@/lib/motion';
import ModelViewer from './ModelViewer';
import type { AtlasEngine } from './AtlasEngine';

const KIND_LABEL: Record<NodeKind, string> = {
  project: 'Project',
  code: 'Repository',
  idea: 'Idea',
  paper: 'Paper',
  model: '3D object',
  image: 'Image',
};

const ACTION_LABEL: Record<NodeKind, string> = {
  project: 'Open project',
  code: 'View system',
  idea: 'Read',
  paper: 'Read',
  model: 'Inspect object',
  image: 'View image',
};

const byId = (id: string | null) => (id ? nodes.find((n) => n.id === id) ?? null : null);
const fmt = (v: number) => `${v < 0 ? '-' : '+'}${Math.abs(v).toFixed(1).padStart(4, '0')}`;

export default function AtlasExperience() {
  const router = useRouter();
  const sceneRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const camRef = useRef<HTMLSpanElement>(null);
  const engineRef = useRef<AtlasEngine | null>(null);

  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [active, setActive] = useState<ClusterId | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<{ cluster: ClusterId | null; node: string | null }>({ cluster: null, node: null });
  const [indexOpen, setIndexOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [reader, setReader] = useState<AtlasNode | null>(null);
  const [viewer, setViewer] = useState<AtlasNode | null>(null);

  const selectedNode = byId(selected);

  // ------------------------------------------------------------ actions

  const pickCluster = useCallback((id: ClusterId | null) => {
    setActive(id);
    setSelected(null);
    engineRef.current?.selectNode(null, false);
    engineRef.current?.enterCluster(id);
  }, []);

  const pickNode = useCallback((id: string, fly = true) => {
    const n = byId(id);
    if (!n) return;
    setActive(n.cluster);
    setSelected(id);
    engineRef.current?.selectNode(id, fly);
  }, []);

  const openNode = useCallback(
    (n: AtlasNode) => {
      if (n.kind === 'project' && n.href) router.push(`${n.href}/`);
      else if (n.kind === 'model') setViewer(n);
      else setReader(n);
    },
    [router],
  );

  const back = useCallback(() => {
    if (viewer) return setViewer(null);
    if (reader) return setReader(null);
    if (searchOpen) return setSearchOpen(false);
    if (indexOpen && webgl) return setIndexOpen(false);
    if (selected) {
      setSelected(null);
      engineRef.current?.selectNode(null, false);
      return;
    }
    if (active) pickCluster(null);
  }, [viewer, reader, searchOpen, indexOpen, webgl, selected, active, pickCluster]);

  const cbRef = useRef({ pickCluster, pickNode, back });
  cbRef.current = { pickCluster, pickNode, back };

  // ------------------------------------------------------------ engine lifecycle

  useEffect(() => {
    const ok = hasWebGL();
    setWebgl(ok);
    const params = new URLSearchParams(window.location.search);
    if (!ok || params.get('view') === 'index') setIndexOpen(true);
  }, []);

  useEffect(() => {
    if (!webgl || !sceneRef.current || !overlayRef.current) return;
    let disposed = false;
    let engine: AtlasEngine | null = null;
    import('./AtlasEngine').then(({ AtlasEngine }) => {
      if (disposed || !sceneRef.current || !overlayRef.current) return;
      const lowPower = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
      engine = new AtlasEngine(
        sceneRef.current,
        overlayRef.current,
        camRef.current,
        {
          onHover: (h) => setHover(h),
          onPickCluster: (id) => cbRef.current.pickCluster(id),
          onPickNode: (id) => cbRef.current.pickNode(id),
          onPickEmpty: () => undefined,
        },
        { reduced: prefersReducedMotion(), lowPower, assemble: true },
      );
      engineRef.current = engine;
      const c = new URLSearchParams(window.location.search).get('cluster') as ClusterId | null;
      if (c && clusters.some((x) => x.id === c)) setTimeout(() => cbRef.current.pickCluster(c), 900);
    });
    return () => {
      disposed = true;
      engine?.dispose();
      engineRef.current = null;
    };
  }, [webgl]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.tagName === 'INPUT';
      if (e.key === 'Escape') {
        e.preventDefault();
        cbRef.current.back();
      } else if (e.key === '/' && !typing) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ------------------------------------------------------------ render

  const instruction = !active
    ? 'Select a cluster to explore'
    : selected
      ? 'Esc to return to the cluster'
      : 'Select a node / Esc to return to the Atlas';

  const hoverCluster = hover.cluster ? clusterOf(hover.cluster) : null;

  return (
    <div className="fixed inset-0 overflow-hidden bg-ink text-paper">
      <h1 className="sr-only">Knowledge Atlas</h1>
      <div ref={sceneRef} className="absolute inset-0" />
      <div ref={overlayRef} className="atlas-overlay opacity-0" aria-hidden />

      {/* Top bar */}
      <header className="wrap pointer-events-none absolute inset-x-0 top-0 z-20 flex h-14 items-center justify-between gap-4">
        <nav className="label pointer-events-auto flex min-w-0 items-center gap-2 text-grey-2" aria-label="Breadcrumb">
          <Link href="/" className="link-quiet text-paper max-sm:hidden">
            Raunaq
          </Link>
          <span aria-hidden className="max-sm:hidden">/</span>
          <button type="button" onClick={() => pickCluster(null)} className={`link-quiet ${active ? 'hover:text-paper' : 'text-paper'}`}>
            Atlas
          </button>
          {active && (
            <>
              <span aria-hidden>/</span>
              <button type="button" onClick={() => pickCluster(active)} className={`link-quiet truncate ${selected ? 'hover:text-paper' : 'text-paper'}`}>
                {clusterOf(active).label}
              </button>
            </>
          )}
          {selectedNode && (
            <>
              <span aria-hidden className="max-sm:hidden">/</span>
              <span className="truncate text-paper max-sm:hidden">{selectedNode.title}</span>
            </>
          )}
        </nav>
        <div className="label pointer-events-auto flex shrink-0 items-center gap-3 sm:gap-5">
          {webgl && (
            <button type="button" className="link-quiet text-grey-1 hover:text-paper" onClick={() => setSearchOpen(true)} aria-keyshortcuts="/">
              Search
            </button>
          )}
          {webgl && (
            <button type="button" className="link-quiet text-grey-1 hover:text-paper" onClick={() => setIndexOpen((v) => !v)} aria-pressed={indexOpen}>
              Index
            </button>
          )}
          <Link href="/#atlas" className="border border-paper/50 px-3 py-2 text-paper transition-colors hover:bg-paper hover:text-ink">
            Exit Atlas
          </Link>
        </div>
      </header>

      {/* Categories */}
      {webgl && (
        <nav
          className="wrap pointer-events-none absolute inset-x-0 bottom-24 z-20 md:bottom-auto md:top-1/2 md:w-auto md:-translate-y-1/2"
          aria-label="Atlas categories"
        >
          <ul className="pointer-events-auto flex max-w-full gap-2 overflow-x-auto md:inline-flex md:flex-col md:gap-0">
            {clusters.map((c) => {
              const count = nodes.filter((n) => n.cluster === c.id).length;
              const on = active === c.id;
              const hov = hover.cluster === c.id;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => pickCluster(on ? null : c.id)}
                    aria-pressed={on}
                    className={`label flex w-max items-baseline gap-3 border px-3 py-2 transition-colors md:border-0 md:border-l md:py-2.5 ${
                      on ? 'border-paper text-paper' : hov ? 'border-paper/60 text-paper' : 'border-paper/15 text-grey-2 hover:text-paper'
                    }`}
                  >
                    <span className="text-grey-3">{c.code}</span>
                    <span>{c.label}</span>
                    <span className="text-grey-3">{String(count).padStart(2, '0')}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {/* Bottom bar */}
      {webgl && (
        <footer className="wrap pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-6 pb-5">
          <div className="label space-y-1" aria-live="polite">
            <p className="text-paper">{instruction}</p>
            <p className="text-grey-3 max-md:hidden">
              {hoverCluster && !active ? `${hoverCluster.code} / ${hoverCluster.description}` : 'Drag to orbit / scroll to zoom / right-drag to pan / press / to search'}
            </p>
          </div>
          <div className="label pointer-events-auto flex flex-col items-end gap-2 text-right">
            <span ref={camRef} className="text-grey-3 max-md:hidden" aria-hidden />
            <span className="flex gap-4 text-grey-2">
              <Link href="/#work" className="link-quiet hover:text-paper">
                Work
              </Link>
              <Link href="/#about" className="link-quiet hover:text-paper">
                About
              </Link>
              <Link href="/#contact" className="link-quiet hover:text-paper">
                Contact
              </Link>
            </span>
          </div>
        </footer>
      )}

      {/* Selected node */}
      {selectedNode && !reader && !viewer && (
        <NodePanel
          node={selectedNode}
          onClose={() => {
            setSelected(null);
            engineRef.current?.selectNode(null, false);
          }}
          onOpen={() => openNode(selectedNode)}
          onPick={(id) => pickNode(id)}
        />
      )}

      {searchOpen && <SearchPanel onClose={() => setSearchOpen(false)} onPick={(id) => { setSearchOpen(false); setIndexOpen(false); pickNode(id); }} />}

      {indexOpen && (
        <IndexPanel
          fallback={!webgl}
          onClose={webgl ? () => setIndexOpen(false) : undefined}
          onPick={(n) => {
            if (webgl) {
              setIndexOpen(false);
              pickNode(n.id);
            } else openNode(n);
          }}
        />
      )}

      {reader && <Reader node={reader} onClose={() => setReader(null)} onPick={(id) => { setReader(null); webgl ? pickNode(id) : setReader(byId(id)); }} />}
      {viewer && <ModelViewer node={viewer} onClose={() => setViewer(null)} />}
    </div>
  );
}

// ------------------------------------------------------------ panels

function NodePanel({ node, onClose, onOpen, onPick }: { node: AtlasNode; onClose: () => void; onOpen: () => void; onPick: (id: string) => void }) {
  const related = neighbours(node.id);
  const c = clusterOf(node.cluster);
  return (
    <aside
      className="thin-scroll absolute inset-x-0 bottom-0 z-30 max-h-[58vh] overflow-y-auto border-t rule bg-ink/90 p-6 backdrop-blur md:inset-x-auto md:bottom-20 md:right-[var(--gutter)] md:top-20 md:max-h-none md:w-[380px] md:border"
      aria-label={`${node.title} details`}
    >
      <div className="label flex justify-between text-grey-3">
        <span>
          {node.code} / {c.label}
        </span>
        <button type="button" onClick={onClose} className="link-quiet text-grey-1 hover:text-paper">
          Close
        </button>
      </div>
      <p className="label mt-6 text-grey-2">
        {KIND_LABEL[node.kind]}
        {node.placeholder ? ' / Placeholder' : ''}
      </p>
      <h2 className="mt-2 text-[28px] leading-[1.05] tracking-tight">{node.title}</h2>
      {node.meta && <p className="label mt-3 text-grey-3">{node.meta}</p>}
      <p className="mt-5 line-clamp-6 text-[14px] leading-relaxed text-grey-1">{node.summary}</p>

      <p className="label mt-5 text-grey-3">
        X {fmt(node.position[0])} / Y {fmt(node.position[1])} / Z {fmt(node.position[2])}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="button" onClick={onOpen} className="label border border-paper px-4 py-3 text-paper transition-colors hover:bg-paper hover:text-ink">
          {ACTION_LABEL[node.kind]}
        </button>
        {node.kind === 'code' && node.href && (
          <Link href={`${node.href}/`} className="label link-quiet text-grey-1 hover:text-paper">
            Open project
          </Link>
        )}
        {node.kind === 'paper' && node.links?.[0] && (
          <a href={node.links[0].url} target="_blank" rel="noopener noreferrer" className="label link-quiet text-grey-1 hover:text-paper">
            IEEE Xplore ↗
          </a>
        )}
      </div>

      {related.length > 0 && (
        <div className="mt-8">
          <p className="label mb-2 text-grey-3">Connected / {String(related.length).padStart(2, '0')}</p>
          <ul>
            {related.map((r) => (
              <li key={r.id} className="border-t rule">
                <button type="button" onClick={() => onPick(r.id)} className="group flex w-full items-baseline gap-3 py-2.5 text-left">
                  <span className="label w-12 shrink-0 text-grey-3">{r.code}</span>
                  <span className="text-[14px] text-grey-1 group-hover:text-paper">{r.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}

function SearchPanel({ onClose, onPick }: { onClose: () => void; onPick: (id: string) => void }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<ClusterId | 'all'>('all');
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return nodes
      .filter((n) => cat === 'all' || n.cluster === cat)
      .filter((n) => !t || `${n.title} ${n.summary} ${n.meta ?? ''} ${KIND_LABEL[n.kind]} ${clusterOf(n.cluster).label}`.toLowerCase().includes(t))
      .slice(0, 14);
  }, [q, cat]);

  return (
    <div className="absolute inset-0 z-40 bg-ink/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="wrap mx-auto mt-20 max-w-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Search the Atlas"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border rule bg-ink p-5">
          <div className="flex items-center gap-4 border-b rule pb-3">
            <span className="label text-grey-3">Search</span>
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && results[0]) onPick(results[0].id);
              }}
              placeholder="Projects, repositories, ideas, papers"
              className="w-full bg-transparent text-xl tracking-tight text-paper placeholder:text-grey-3 focus:outline-none"
              aria-label="Search nodes"
            />
            <button type="button" className="label text-grey-2 hover:text-paper" onClick={onClose}>
              Esc
            </button>
          </div>
          <div className="label mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            {(['all', ...clusters.map((c) => c.id)] as const).map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={cat === id}
                onClick={() => setCat(id)}
                className={`border px-2.5 py-1.5 ${cat === id ? 'border-paper text-paper' : 'border-paper/15 text-grey-2 hover:text-paper'}`}
              >
                {id === 'all' ? 'All' : clusterOf(id).label}
              </button>
            ))}
          </div>
          <ul className="thin-scroll mt-3 max-h-[52vh] overflow-y-auto">
            {results.length === 0 && <li className="label py-6 text-grey-3">No matching nodes</li>}
            {results.map((n) => (
              <li key={n.id} className="border-t rule">
                <button type="button" onClick={() => onPick(n.id)} className="group grid w-full grid-cols-[4.5rem_1fr_auto] items-baseline gap-3 py-3 text-left">
                  <span className="label text-grey-3">{n.code}</span>
                  <span className="truncate text-[15px] text-grey-1 group-hover:text-paper">{n.title}</span>
                  <span className="label text-grey-3">{KIND_LABEL[n.kind]}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function IndexPanel({ fallback, onClose, onPick }: { fallback: boolean; onClose?: () => void; onPick: (n: AtlasNode) => void }) {
  return (
    <div className="thin-scroll absolute inset-0 z-30 overflow-y-auto bg-ink">
      <div className="wrap pb-24 pt-24">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <p className="label text-grey-2">Atlas / Index</p>
            {onClose && (
              <button type="button" onClick={onClose} className="label link-quiet mt-4 text-paper">
                Return to the spatial view
              </button>
            )}
          </div>
          <div className="lg:col-span-9">
            <h2 className="headline text-[clamp(40px,6vw,96px)]">Everything in the Atlas</h2>
            {fallback && (
              <p className="mt-4 max-w-lg text-[15px] text-grey-2">
                The spatial view needs WebGL, which is not available here. Every node is listed below instead.
              </p>
            )}
          </div>
        </div>

        <div className="mt-16 space-y-16">
          {clusters.map((c) => {
            const list = nodes.filter((n) => n.cluster === c.id);
            return (
              <section key={c.id} className="grid gap-6 lg:grid-cols-12" aria-labelledby={`idx-${c.id}`}>
                <div className="lg:col-span-3">
                  <p className="label text-grey-3">{c.code}</p>
                  <h3 id={`idx-${c.id}`} className="mt-1 text-2xl tracking-tight">
                    {c.label}
                  </h3>
                  <p className="mt-2 max-w-xs text-[14px] text-grey-2">{c.description}</p>
                </div>
                <ul className="lg:col-span-9">
                  {list.map((n) => (
                    <li key={n.id} className="border-t rule">
                      <button
                        type="button"
                        onClick={() => onPick(n)}
                        className="group grid w-full grid-cols-[4.5rem_1fr] items-baseline gap-3 py-3 text-left sm:grid-cols-[4.5rem_1fr_10rem]"
                      >
                        <span className="label text-grey-3">{n.code}</span>
                        <span className="text-[16px] text-grey-1 group-hover:text-paper">
                          {n.title}
                          {n.placeholder && <span className="label ml-2 text-grey-3">Placeholder</span>}
                        </span>
                        <span className="label hidden text-right text-grey-3 sm:block">{KIND_LABEL[n.kind]}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Reader({ node, onClose, onPick }: { node: AtlasNode; onClose: () => void; onPick: (id: string) => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => closeRef.current?.focus(), [node]);
  const related = neighbours(node.id);
  const c = clusterOf(node.cluster);

  return (
    <div className="thin-scroll fixed inset-0 z-[60] overflow-y-auto bg-ink" role="dialog" aria-modal="true" aria-label={node.title}>
      <div className="wrap sticky top-0 z-10 flex h-14 items-center justify-between bg-ink/90 backdrop-blur">
        <p className="label text-grey-2">
          Atlas / {c.label} / {node.code}
        </p>
        <button ref={closeRef} type="button" onClick={onClose} className="label link-quiet text-paper">
          Back to Atlas
        </button>
      </div>
      <article className="wrap pb-32 pt-16">
        <div className="grid gap-6 lg:grid-cols-12">
          <p className="label text-grey-3 lg:col-span-3">
            {KIND_LABEL[node.kind]}
            {node.meta ? ` / ${node.meta}` : ''}
          </p>
          <div className="lg:col-span-8">
            <h2 className="headline text-[clamp(36px,5vw,80px)]">{node.title}</h2>

            {node.image && (
              <figure className="mt-12">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(node.image.src)} alt={node.image.alt} className="w-full max-w-xl grayscale" />
                <figcaption className="label mt-3 text-grey-3">
                  {node.image.width} × {node.image.height} PX
                </figcaption>
              </figure>
            )}

            <div className="mt-12 max-w-2xl space-y-6 text-[17px] leading-relaxed text-grey-1">
              {(node.body ?? [node.summary]).map((p, i) => (
                <p key={i} className={`whitespace-pre-line ${i === 0 && node.kind === 'paper' ? 'label text-grey-2' : ''}`}>
                  {p}
                </p>
              ))}
            </div>

            {(node.links?.length || (node.kind === 'code' && node.href)) && (
              <div className="mt-12 flex flex-wrap gap-6 border-t rule pt-6">
                {node.links?.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="label link-quiet text-paper">
                    {l.label} ↗
                  </a>
                ))}
                {node.kind === 'code' && node.href && (
                  <Link href={`${node.href}/`} className="label link-quiet text-paper">
                    Open project
                  </Link>
                )}
              </div>
            )}

            {related.length > 0 && (
              <div className="mt-16">
                <p className="label mb-3 text-grey-3">Connected</p>
                <ul>
                  {related.map((r) => (
                    <li key={r.id} className="border-t rule">
                      <button type="button" onClick={() => onPick(r.id)} className="group flex w-full items-baseline gap-4 py-3 text-left">
                        <span className="label text-grey-3">{r.code}</span>
                        <span className="text-[16px] text-grey-1 group-hover:text-paper">{r.title}</span>
                        <span className="label ml-auto text-grey-3">{KIND_LABEL[r.kind]}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
