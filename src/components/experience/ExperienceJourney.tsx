'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import GlyphField from './GlyphField';
import OsWindow, { type Slot } from './OsWindow';
import SectionLabel from '../SectionLabel';
import { useMode } from '../ModeContext';
import { battles, education, type Battle } from '@/data/battles';
import { papers } from '@/data/research';
import { projects } from '@/data/projects';
import { mediaFor, paperSnapshot } from '@/data/assets';
import { asset } from '@/lib/asset';
import { prefersReducedMotion } from '@/lib/motion';

const ORIGIN: Record<string, 'bain' | 'aranca'> = { bain: 'bain', aranca: 'aranca' };

interface Win {
  id: string;
  title: string;
  meta?: string;
  dark?: boolean;
  body: ReactNode;
}

function years(period: string) {
  const ys = (period.match(/\d{4}/g) ?? []).map(Number);
  const end = /present/i.test(period) ? new Date().getFullYear() + 0.8 : ys[1] ?? ys[0];
  return { start: ys[0], end, label: `${ys[0]} / ${/present/i.test(period) ? 'Now' : ys[1] ?? ''}` };
}

// Window layouts, in percent of the stage. The first slot is always the terminal.
const SLOTS: Slot[] = [
  { left: 2, top: 7, width: 37 },
  { left: 42, top: 3, width: 33 },
  { left: 63, top: 44, width: 34 },
  { left: 6, top: 50, width: 31 },
  { left: 40, top: 54, width: 21 },
  { left: 78, top: 4, width: 20 },
  { left: 23, top: 30, width: 22 },
];

function Tabs({ tabs }: { tabs: { label: string; body: ReactNode }[] }) {
  const [i, setI] = useState(0);
  return (
    <div>
      <div className="thin-scroll -mx-4 -mt-4 mb-4 flex overflow-x-auto border-b border-paper/15" role="tablist">
        {tabs.map((t, k) => (
          <button
            key={t.label}
            type="button"
            role="tab"
            aria-selected={k === i}
            onClick={() => setI(k)}
            className={`label shrink-0 border-r border-paper/10 px-3 py-2 normal-case tracking-normal ${k === i ? 'bg-ink text-paper' : 'text-grey-3 hover:text-paper'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div key={i} className="mode-fade">
        {tabs[i]?.body}
      </div>
    </div>
  );
}

function PaperSnapshot({ id, title, url, venue, year }: { id: string; title: string; url: string; venue: string; year: string }) {
  const [failed, setFailed] = useState(false);
  const doc = url.split('/').filter(Boolean).pop();
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="group block">
      <div className="relative aspect-[16/10] overflow-hidden border border-paper/15 bg-paper/5">
        {!failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset(paperSnapshot(id))}
            alt={`IEEE Xplore page for ${title}`}
            className="h-full w-full object-cover object-top grayscale transition-transform duration-700 group-hover:scale-[1.02]"
            onError={() => setFailed(true)}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full flex-col justify-between p-3">
            <span className="label text-grey-3">IEEE Xplore / doc {doc}</span>
            <span className="text-[12px] leading-snug text-grey-1">{title}</span>
            <span className="label text-grey-3">Snapshot pending</span>
          </div>
        )}
      </div>
      <p className="label mt-2 flex justify-between text-grey-3">
        <span>
          {venue} / {year}
        </span>
        <span className="group-hover:text-paper">Open ↗</span>
      </p>
    </a>
  );
}

function windowsFor(b: Battle, mode: 'calm' | 'nerd'): Win[] {
  const y = years(b.period);
  const slug = b.id;
  const wins: Win[] = [];

  wins.push({
    id: 'role',
    title: mode === 'nerd' ? `raunaq@os:~/experience/${slug} $ cat role.md` : `${b.company.split(',')[0]} / role`,
    meta: y.label,
    dark: true,
    body: (
      <div className="space-y-3">
        <p className="text-[22px] leading-tight tracking-tight text-paper">{b.company}</p>
        <dl className="grid grid-cols-[6rem_1fr] gap-y-1 font-mono text-[12px]">
          <dt className="text-grey-3">role:</dt>
          <dd className="text-paper">{b.role}</dd>
          <dt className="text-grey-3">period:</dt>
          <dd>{b.period.replace('–', 'to')}</dd>
          <dt className="text-grey-3">location:</dt>
          <dd>{b.location}</dd>
        </dl>
        {b.description ? <p>{b.description}</p> : <p className="font-mono text-grey-3"># details to be added</p>}
      </div>
    ),
  });

  if (b.keyProjects?.length) {
    wins.push({
      id: 'projects',
      title: mode === 'nerd' ? `projects/ (${b.keyProjects.length})` : `Key projects / ${b.keyProjects.length}`,
      body: (
        <Tabs
          tabs={b.keyProjects.map((k) => ({
            label: k.industry,
            body: (
              <div className="space-y-2">
                <p className="label text-grey-3">{k.industry}</p>
                <p className="text-[14px] text-paper">{k.description}</p>
              </div>
            ),
          }))}
        />
      ),
    });
  }

  const builds = projects.filter((p) => ORIGIN[b.id] && p.origin === ORIGIN[b.id]);
  if (builds.length || b.tools?.length) {
    wins.push({
      id: 'tools',
      title: mode === 'nerd' ? `tools/ --built-here (${builds.length})` : `Tools built / ${builds.length}`,
      body: (
        <ul className="space-y-3">
          {builds.map((p) => {
            const shot = mediaFor(p.slug, p.name).screenshots[0]?.asset;
            return (
              <li key={p.slug}>
                <Link href={`/work/${p.slug}/`} className="group grid grid-cols-[4.5rem_1fr] items-center gap-3">
                  <span className="relative block aspect-[16/10] overflow-hidden border border-paper/15 bg-paper/5">
                    {shot ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={asset(shot.src)} alt="" className="h-full w-full object-cover object-top grayscale" loading="lazy" />
                    ) : (
                      <span className="label absolute inset-0 grid place-items-center text-[8px] text-grey-3">P{p.number}</span>
                    )}
                  </span>
                  <span>
                    <span className="block text-[14px] text-paper group-hover:underline">{p.name}</span>
                    <span className="label text-grey-3">{p.category}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ),
    });
  }

  if (b.industries.length) {
    wins.push({
      id: 'industries',
      title: mode === 'nerd' ? 'industries.json' : 'Industries',
      body: (
        <ul className="flex flex-wrap gap-1.5">
          {b.industries.map((i) => (
            <li key={i} className="label border border-paper/20 px-2 py-1 text-grey-1">
              {i}
            </li>
          ))}
        </ul>
      ),
    });
  }

  if (b.problemStatements?.length || b.frameworks?.length) {
    wins.push({
      id: 'methods',
      title: mode === 'nerd' ? 'problems.yml' : 'Problems and methods',
      body: (
        <dl className="space-y-3 font-mono text-[12px]">
          {b.problemStatements && (
            <div>
              <dt className="text-grey-3">problems:</dt>
              {b.problemStatements.map((s) => (
                <dd key={s} className="pl-3">
                  - {s}
                </dd>
              ))}
            </div>
          )}
          {b.frameworks && (
            <div>
              <dt className="text-grey-3">methods:</dt>
              {b.frameworks.map((s) => (
                <dd key={s} className="pl-3">
                  - {s}
                </dd>
              ))}
            </div>
          )}
        </dl>
      ),
    });
  }

  if (b.id === 'parikshit') {
    papers.forEach((p, i) => {
      wins.push({
        id: `paper-${p.id}`,
        title: mode === 'nerd' ? p.nerdTitle.split(':')[0].replace(/`/g, '') : `Paper ${i + 1}${p.leadAuthor ? ' / lead author' : ''}`,
        body: (
          <div className="space-y-3">
            <PaperSnapshot id={p.id} title={p.formalTitle} url={p.url} venue={p.venue} year={p.year} />
            <p className="text-[13px] text-paper">{mode === 'calm' ? p.calmTitle : p.formalTitle}</p>
          </div>
        ),
      });
    });
  }

  if (b.links?.length && b.id !== 'parikshit') {
    wins.push({
      id: 'links',
      title: 'links',
      body: (
        <ul className="space-y-2">
          {b.links.map((l) => (
            <li key={l.url}>
              <a href={l.url} target="_blank" rel="noopener noreferrer" className="link-quiet text-paper">
                {l.label} ↗
              </a>
            </li>
          ))}
        </ul>
      ),
    });
  }

  return wins;
}

function Panel({ b, active, mode, onExpand }: { b: Battle; active: boolean; mode: 'calm' | 'nerd'; onExpand: (w: Win) => void }) {
  const wins = useMemo(() => windowsFor(b, mode), [b, mode]);
  const [order, setOrder] = useState<string[]>(() => wins.map((w) => w.id));
  const focus = (id: string) => setOrder((o) => [...o.filter((x) => x !== id), id]);
  const slots = b.id === 'parikshit' ? PAPER_SLOTS : SLOTS;

  return (
    <div className="relative h-full w-full shrink-0 px-[var(--gutter)]" aria-hidden={!active} inert={!active ? true : undefined}>
      {active && (
        <div key={`${b.id}-${mode}`} className="relative flex h-full flex-col gap-4 overflow-y-auto pb-6 pt-4 lg:block lg:overflow-visible lg:p-0">
          {wins.map((w, i) => (
            <OsWindow
              key={w.id}
              title={w.title}
              meta={w.meta}
              slot={slots[i % slots.length]}
              index={i}
              z={10 + order.indexOf(w.id)}
              onFocus={() => focus(w.id)}
              onExpand={() => onExpand(w)}
              dark={w.dark}
            >
              {w.body}
            </OsWindow>
          ))}
        </div>
      )}
    </div>
  );
}

const PAPER_SLOTS: Slot[] = [
  { left: 1, top: 6, width: 33 },
  { left: 36, top: 3, width: 20 },
  { left: 58, top: 6, width: 20 },
  { left: 79, top: 3, width: 20 },
  { left: 38, top: 47, width: 20 },
  { left: 60, top: 50, width: 20 },
  { left: 3, top: 52, width: 30 },
];

export default function ExperienceJourney() {
  const { mode } = useMode();
  // Chronological, oldest first: travelling right moves forward in time.
  const timeline = useMemo(() => [...battles].sort((a, b) => years(a.period).start - years(b.period).start), []);
  const [index, setIndex] = useState(timeline.length - 1);
  const [velocity, setVelocity] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState<Win | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const touch = useRef<number | null>(null);

  const first = years(timeline[0].period).start;
  const last = new Date().getFullYear() + 1;
  const span = last - first;

  const go = useCallback(
    (next: number, fromUser = true) => {
      const n = Math.max(0, Math.min(timeline.length - 1, next));
      if (fromUser) setPlaying(false);
      setIndex((cur) => {
        if (n !== cur && !prefersReducedMotion()) {
          setVelocity((n > cur ? 1 : -1) * 900 * Math.min(3, Math.abs(n - cur)));
          window.setTimeout(() => setVelocity(0), 900);
        }
        return n;
      });
    },
    [timeline.length],
  );

  // Time travel: auto-advance through every role once the section is in view.
  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => {
      setIndex((cur) => {
        const n = cur >= timeline.length - 1 ? 0 : cur + 1;
        setVelocity(900);
        window.setTimeout(() => setVelocity(0), 900);
        return n;
      });
    }, 6500);
    return () => window.clearInterval(t);
  }, [playing, timeline.length]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || prefersReducedMotion()) return;
    let started = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started) {
          started = true;
          setIndex(0);
          setVelocity(1400);
          window.setTimeout(() => setVelocity(0), 1100);
          setPlaying(true);
        } else if (!e.isIntersecting) setPlaying(false);
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setExpanded(null);
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [expanded]);

  const cur = timeline[index];
  const prev = timeline[index - 1];
  const next = timeline[index + 1];

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="force-dark relative mt-40 overflow-hidden py-16 lg:mt-56"
      aria-labelledby="experience-title"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(index + 1);
        if (e.key === 'ArrowLeft') go(index - 1);
      }}
    >
      <GlyphField velocity={velocity} className="opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgb(9_9_9/0.85)_100%)]" aria-hidden />

      <div className="wrap relative z-10 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <SectionLabel n="02" calm="Experience" path="experience" cmd="time-travel --all" />
        </div>
        <div className="lg:col-span-9">
          <h2 id="experience-title" className="headline text-[clamp(44px,6vw,96px)]">
            Where I have worked.
          </h2>
          <p className="mt-4 max-w-lg text-[15px] text-grey-2">
            Travel through the timeline. Drag any window to rearrange it, or pull it out to read in full.
          </p>
        </div>
      </div>

      {/* Timeline ruler */}
      <div className="wrap relative z-10 mt-12">
        <div className="relative h-16">
          <div className="ruler absolute inset-x-0 top-7" aria-hidden />
          {Array.from({ length: span + 1 }).map((_, i) => (
            <span key={i} className="label absolute top-0 -translate-x-1/2 text-[9px] text-grey-3" style={{ left: `${(i / span) * 100}%` }}>
              {i % 2 === 0 ? first + i : ''}
            </span>
          ))}
          {timeline.map((b, i) => {
            const y = years(b.period);
            const l = ((y.start - first) / span) * 100;
            const w = Math.max(1.2, ((y.end - y.start) / span) * 100);
            const on = i === index;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => go(i)}
                aria-current={on ? 'step' : undefined}
                aria-label={`${b.company}, ${b.period}`}
                className={`absolute top-10 h-3 border transition-colors ${on ? 'border-paper bg-paper' : 'border-paper/40 bg-paper/10 hover:bg-paper/40'}`}
                style={{ left: `${l}%`, width: `${w}%`, top: `${40 + (i % 2) * 8}px` }}
              />
            );
          })}
          <span
            className="absolute top-5 h-10 w-px bg-paper transition-[left] duration-1000 ease-[cubic-bezier(.7,0,.2,1)]"
            style={{ left: `${((years(cur.period).start - first) / span) * 100}%` }}
            aria-hidden
          />
        </div>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <button type="button" onClick={() => go(index - 1)} disabled={!prev} className="label group flex items-center gap-3 text-grey-1 disabled:opacity-30">
            <span className="border border-paper/40 px-3 py-2 group-hover:bg-paper group-hover:text-ink">←</span>
            <span className="max-sm:hidden">{prev ? `${years(prev.period).start} / ${prev.company.split(',')[0]}` : 'Start'}</span>
          </button>
          <div className="text-center" aria-live="polite">
            <p className="label text-grey-3">
              {String(index + 1).padStart(2, '0')} / {String(timeline.length).padStart(2, '0')} / {years(cur.period).label}
            </p>
            <p className="mt-1 text-2xl tracking-tight">{cur.company.split(',')[0]}</p>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setPlaying((p) => !p)} className="label text-grey-2 hover:text-paper" aria-pressed={playing}>
              {playing ? 'Pause' : 'Time travel'}
            </button>
            <button type="button" onClick={() => go(index + 1)} disabled={!next} className="label group flex items-center gap-3 text-grey-1 disabled:opacity-30">
              <span className="max-sm:hidden">{next ? `${next.company.split(',')[0]} / ${years(next.period).start}` : 'Now'}</span>
              <span className="border border-paper/40 px-3 py-2 group-hover:bg-paper group-hover:text-ink">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Travel track */}
      <div
        className="relative z-10 mt-8 h-[78vh] min-h-[620px] lg:h-[82vh] lg:min-h-[700px]"
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current === null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          if (Math.abs(dx) > 60) go(index + (dx < 0 ? 1 : -1));
          touch.current = null;
        }}
      >
        <div
          className={`flex h-full transition-transform duration-[1100ms] ease-[cubic-bezier(.7,0,.2,1)] ${velocity !== 0 ? 'travel-glitch' : ''}`}
          style={{ transform: `translate3d(${-index * 100}%,0,0)` }}
        >
          {timeline.map((b, i) => (
            <Panel key={b.id} b={b} active={i === index} mode={mode} onExpand={setExpanded} />
          ))}
        </div>
      </div>

      <p className="wrap label relative z-10 mt-10 text-grey-3">
        Education / {education.institution} / {education.degree} / {education.period.replace('–', 'to')}
      </p>

      {expanded && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-ink/80 p-[var(--gutter)] backdrop-blur" role="dialog" aria-modal="true" aria-label={expanded.title} onClick={() => setExpanded(null)}>
          <div className="force-dark thin-scroll max-h-[86vh] w-full max-w-3xl overflow-y-auto border border-paper/30" onClick={(e) => e.stopPropagation()}>
            <header className="sticky top-0 flex items-center gap-3 border-b border-paper/15 bg-ink-3 px-4 py-3">
              <span className="label flex-1 normal-case tracking-normal text-grey-1">{expanded.title}</span>
              <button type="button" className="label text-paper" onClick={() => setExpanded(null)} autoFocus>
                Close
              </button>
            </header>
            <div className="p-6 text-[15px] leading-relaxed text-grey-1">{expanded.body}</div>
          </div>
        </div>
      )}
    </section>
  );
}
