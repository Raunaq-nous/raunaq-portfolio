'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import GlyphField from './GlyphField';
import OsWindow from './OsWindow';
import IndustryArt from '../IndustryArt';
import ProjectGlobe from './ProjectGlobe';
import { places, rolePlaces } from '@/data/geo';
import SectionLabel from '../SectionLabel';
import { useMode } from '../ModeContext';
import { battles, education, type Battle } from '@/data/battles';
import { papers } from '@/data/research';
import { projects, splitSystemLabel } from '@/data/projects';
import { mediaFor, memories, paperSnapshot } from '@/data/assets';
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

interface Tile {
  id: string;
  group: 'Highlights' | 'Projects' | 'Photos' | 'Industries' | 'Tools built' | 'Papers' | 'Methods' | 'Links';
  title: string;
  kicker?: string;
  preview?: ReactNode;
  image?: string;
  art?: { name: string; code: string; rows: [string, string][] };
  body: ReactNode;
}

function years(period: string) {
  const ys = (period.match(/\d{4}/g) ?? []).map(Number);
  const end = /present/i.test(period) ? new Date().getFullYear() + 0.8 : ys[1] ?? ys[0];
  return { start: ys[0], end, label: `${ys[0]} / ${/present/i.test(period) ? 'Now' : ys[1] ?? ''}` };
}

function Shot({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={asset(src)} alt={alt} className="h-full w-full object-cover object-top grayscale" loading="lazy" onError={() => setFailed(true)} />
  );
}

function roleWindow(b: Battle, mode: 'calm' | 'nerd'): Win {
  const y = years(b.period);
  return {
    id: 'role',
    title: mode === 'nerd' ? `raunaq@os:~/experience/${b.id} $ cat role.md` : `${b.company.split(',')[0]} / role`,
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
  };
}

function tilesFor(b: Battle, mode: 'calm' | 'nerd'): Tile[] {
  const tiles: Tile[] = [];

  (b.highlights ?? []).forEach((h, i) =>
    tiles.push({
      id: `hl-${i}`,
      group: 'Highlights',
      title: h.label,
      preview: <p className="text-[13px] text-paper">{h.value}</p>,
      body: (
        <div className="space-y-2">
          <p className="label text-grey-3">{h.label}</p>
          <p className="text-[18px] leading-snug text-paper">{h.value}</p>
        </div>
      ),
    }),
  );

  (b.keyProjects ?? []).forEach((k, i) =>
    tiles.push({
      id: `pj-${i}`,
      group: 'Projects',
      title: k.industry,
      kicker: [`P${String(i + 1).padStart(2, '0')}`, k.problem].filter(Boolean).join(' / '),
      preview: (
        <div className="space-y-1.5">
          <p className="line-clamp-3 text-[12px]">{k.description}</p>
          {k.geos?.length ? <p className="label text-grey-3">{k.geos.map((g) => places[g]?.label).filter(Boolean).join(' / ')}</p> : null}
        </div>
      ),
      body: (
        <div className="space-y-4">
          <p className="label text-grey-3">
            {b.company.split(',')[0]} / project {String(i + 1).padStart(2, '0')}
          </p>
          <p className="text-[18px] leading-snug text-paper">{k.description}</p>
          <dl className="grid grid-cols-[7rem_1fr] gap-y-1 border-t border-paper/15 pt-3 font-mono text-[12px]">
            <dt className="text-grey-3">industry:</dt>
            <dd>{k.industry}</dd>
            {k.problem && (
              <>
                <dt className="text-grey-3">problem:</dt>
                <dd>{k.problem}</dd>
              </>
            )}
            {k.geos?.length ? (
              <>
                <dt className="text-grey-3">geography:</dt>
                <dd>{k.geos.map((g) => places[g]?.label).filter(Boolean).join(', ')}</dd>
              </>
            ) : null}
          </dl>
        </div>
      ),
    }),
  );

  b.industries.forEach((ind, i) => {
    const linked = (b.keyProjects ?? []).filter((k) => {
      const a = k.industry.toLowerCase();
      const n = ind.toLowerCase();
      return a.includes(n) || n.includes(a.split(' ')[0]);
    });
    const art = {
      name: ind,
      code: `${b.id.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(2, '0')}`,
      rows: [
        ['Role', b.company.split(',')[0]],
        ['Period', b.period.replace('–', 'to')],
        ['Projects', String(linked.length || '-')],
        ...linked.slice(0, 3).map((k, j): [string, string] => [`Project ${j + 1}`, k.industry]),
      ] as [string, string][],
    };
    tiles.push({
      id: `in-${i}`,
      group: 'Industries',
      title: ind,
      art,
      preview: <p className="label text-grey-3">{linked.length ? `${linked.length} project${linked.length > 1 ? 's' : ''}` : 'Sector'}</p>,
      body: (
        <div className="space-y-3">
          <div className="aspect-[8/5] overflow-hidden border border-paper/15">
            <IndustryArt {...art} />
          </div>
          <p className="label text-grey-3">Industry</p>
          <p className="text-[24px] tracking-tight text-paper">{ind}</p>
          {linked.length > 0 && (
            <ul className="space-y-2">
              {linked.map((k) => (
                <li key={k.description.slice(0, 20)} className="border-t border-paper/15 pt-2 text-[14px]">
                  {k.description}
                </li>
              ))}
            </ul>
          )}
        </div>
      ),
    });
  });

  projects
    .filter((p) => ORIGIN[b.id] && p.origin === ORIGIN[b.id])
    .forEach((p) => {
      const shot = mediaFor(p.slug, p.name).screenshots[0]?.asset;
      const sys = splitSystemLabel(p.nerd);
      tiles.push({
        id: `tl-${p.slug}`,
        group: 'Tools built',
        title: p.name,
        kicker: p.category,
        image: shot?.src,
        preview: shot ? undefined : <p className="font-mono text-[11px] text-grey-2">{sys.label ?? p.category}</p>,
        body: (
          <div className="space-y-4">
            {shot && (
              <div className="aspect-[16/10] overflow-hidden border border-paper/15">
                <Shot src={shot.src} alt={shot.alt} />
              </div>
            )}
            <p className="label text-grey-3">
              {p.number} / {p.category}
            </p>
            <p className="text-[17px] leading-snug text-paper">{mode === 'calm' ? p.calm : sys.text}</p>
            <p className="label text-grey-3">{p.tags.join(' / ')}</p>
            <Link href={`/work/${p.slug}/`} className="label link-quiet inline-block text-paper">
              Open project
            </Link>
          </div>
        ),
      });
    });

  if (b.id === 'parikshit') {
    papers.forEach((p, i) =>
      tiles.push({
        id: `pp-${p.id}`,
        group: 'Papers',
        title: mode === 'nerd' ? p.nerdTitle.split(':')[0].replace(/`/g, '') : p.calmTitle,
        kicker: `${p.venue} / ${p.year}${p.leadAuthor ? ' / lead author' : ''}`,
        image: paperSnapshot(p.id),
        body: (
          <div className="space-y-4">
            <a href={p.url} target="_blank" rel="noopener noreferrer" className="block aspect-[1400/1018] overflow-hidden border border-paper/15">
              <Shot src={paperSnapshot(p.id)} alt={`IEEE Xplore page for ${p.formalTitle}`} />
            </a>
            <p className="text-[19px] leading-snug text-paper">{p.formalTitle}</p>
            <p>{mode === 'calm' ? p.calm : p.nerd}</p>
            <dl className="grid grid-cols-[7rem_1fr] gap-y-1 font-mono text-[12px]">
              <dt className="text-grey-3">venue:</dt>
              <dd>{p.conference}</dd>
              <dt className="text-grey-3">dates:</dt>
              <dd>{p.dates}</dd>
              <dt className="text-grey-3">location:</dt>
              <dd>{p.location}</dd>
              <dt className="text-grey-3">authors:</dt>
              <dd>{p.authors.join(', ')}</dd>
              <dt className="text-grey-3">doi:</dt>
              <dd>{p.doi}</dd>
            </dl>
            <a href={p.url} target="_blank" rel="noopener noreferrer" className="label link-quiet inline-block text-paper">
              Read on IEEE Xplore ↗
            </a>
            {i === 0 && <span className="sr-only">Lead author</span>}
          </div>
        ),
      }),
    );
  }

  memories
    .filter((m) => m.role === b.id && !m.id.startsWith('paper-'))
    .forEach((m, mi) =>
      tiles.push({
        id: `ph-${m.id}`,
        group: 'Photos',
        title: `Moment ${String(mi + 1).padStart(2, '0')}`,
        kicker: String(m.year),
        image: m.src,
        body: (
          <figure className="space-y-3">
            {m.video ? (
              <video src={asset(m.video)} poster={asset(m.src)} className="w-full border border-paper/15" controls autoPlay muted loop playsInline />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset(m.src)} alt={m.alt} className="w-full border border-paper/15" />
            )}
            <figcaption className="sr-only">{m.alt}</figcaption>
            {m.url && (
              <a href={m.url} target="_blank" rel="noopener noreferrer" className="label link-quiet inline-block text-paper">
                Related paper ↗
              </a>
            )}
          </figure>
        ),
      }),
    );

  if (b.problemStatements?.length || b.frameworks?.length) {
    tiles.push({
      id: 'methods',
      group: 'Methods',
      title: mode === 'nerd' ? 'problems.yml' : 'Problems and methods',
      preview: <p className="line-clamp-2 font-mono text-[11px] text-grey-2">{(b.problemStatements ?? []).join(' / ')}</p>,
      body: (
        <dl className="space-y-3 font-mono text-[13px]">
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

  if (b.links?.length && b.id !== 'parikshit') {
    b.links.forEach((l, i) =>
      tiles.push({
        id: `ln-${i}`,
        group: 'Links',
        title: l.label,
        preview: <p className="label text-grey-3">{l.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</p>,
        body: (
          <a href={l.url} target="_blank" rel="noopener noreferrer" className="link-quiet text-[18px] text-paper">
            {l.label} ↗
          </a>
        ),
      }),
    );
  }

  return tiles;
}

const GROUP_ORDER: Tile['group'][] = ['Highlights', 'Projects', 'Tools built', 'Papers', 'Photos', 'Industries', 'Methods', 'Links'];

function Panel({ b, active, mode, onExpand }: { b: Battle; active: boolean; mode: 'calm' | 'nerd'; onExpand: (w: Win) => void }) {
  const role = useMemo(() => roleWindow(b, mode), [b, mode]);
  const tiles = useMemo(() => tilesFor(b, mode), [b, mode]);
  const groups = GROUP_ORDER.map((g) => ({ g, items: tiles.filter((t) => t.group === g) })).filter((x) => x.items.length);
  let k = 0;

  return (
    <div className="relative h-full w-full shrink-0 px-[var(--gutter)]" aria-hidden={!active} inert={!active ? true : undefined}>
      {active && (
        <div key={`${b.id}-${mode}`} className="grid h-full gap-5 lg:grid-cols-12">
          <div className="thin-scroll overflow-y-auto pb-8 lg:col-span-4">
            <OsWindow title={role.title} meta={role.meta} slot={{ left: 0, top: 0, width: 100 }} index={0} z={10} onFocus={() => undefined} onExpand={() => onExpand(role)} dark static>
              {role.body}
            </OsWindow>
            <div className="os-tile mt-4 border border-paper/20 bg-ink-2" style={{ animationDelay: '220ms' }}>
              <div className="flex items-center gap-2 border-b border-paper/10 bg-ink-3 px-2.5 py-1.5">
                <span className="flex gap-1" aria-hidden>
                  <span className="h-1.5 w-1.5 border border-paper/40" />
                  <span className="h-1.5 w-1.5 bg-paper/50" />
                </span>
                <span className="label normal-case tracking-normal text-grey-1">{mode === 'nerd' ? 'geo.trace' : 'Where the work went'}</span>
              </div>
              <div className="aspect-[16/10]">
                <ProjectGlobe role={b.id} />
              </div>
              <ul className="flex flex-wrap gap-x-3 gap-y-1 border-t border-paper/10 px-2.5 py-2">
                {rolePlaces(b.id).map((pl, i) => (
                  <li key={pl.label} className="label normal-case tracking-normal text-grey-2">
                    <span className="text-grey-3">{i === 0 ? 'base' : String(i).padStart(2, '0')}</span> {pl.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="thin-scroll space-y-6 overflow-y-auto pb-8 pr-1 lg:col-span-8">
            {groups.map(({ g, items }) => (
              <section key={g}>
                <p className="label mb-2 flex items-center gap-3 text-grey-3">
                  <span>{mode === 'nerd' ? `${g.toLowerCase().replace(' ', '-')}/` : g}</span>
                  <span className="h-px flex-1 bg-paper/10" />
                  <span>{String(items.length).padStart(2, '0')}</span>
                </p>
                <ul className={`grid gap-3 ${g === 'Industries' ? 'grid-cols-2 sm:grid-cols-3' : 'sm:grid-cols-2 xl:grid-cols-3'}`}>
                  {items.map((t) => (
                    <li key={t.id} className="os-tile" style={{ animationDelay: `${160 + k++ * 55}ms` }}>
                      <button
                        type="button"
                        onClick={() => onExpand({ id: t.id, title: `${t.group} / ${t.title}`, body: t.body })}
                        className="group flex h-full w-full flex-col border border-paper/20 bg-ink-2 text-left transition-colors hover:border-paper/60"
                      >
                        <span className="flex items-center gap-2 border-b border-paper/10 bg-ink-3 px-2.5 py-1.5">
                          <span className="flex gap-1" aria-hidden>
                            <span className="h-1.5 w-1.5 border border-paper/40" />
                            <span className="h-1.5 w-1.5 bg-paper/50" />
                          </span>
                          <span className="label min-w-0 flex-1 truncate normal-case tracking-normal text-grey-1">{t.title}</span>
                          <span className="label text-grey-3 group-hover:text-paper" aria-hidden>
                            ⤢
                          </span>
                        </span>
                        {t.image && (
                          <span className="block aspect-[16/9] overflow-hidden border-b border-paper/10">
                            <Shot src={t.image} alt="" />
                          </span>
                        )}
                        {t.art && (
                          <span className="block aspect-[8/5] overflow-hidden border-b border-paper/10">
                            <IndustryArt {...t.art} />
                          </span>
                        )}
                        <span className="block space-y-1 p-2.5">
                          {t.kicker && <span className="label block truncate text-grey-3">{t.kicker}</span>}
                          {t.preview}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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
      className="force-dark relative mt-40 overflow-hidden bg-[#0b0806] py-16 lg:mt-56"
      aria-labelledby="experience-title"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(index + 1);
        if (e.key === 'ArrowLeft') go(index - 1);
      }}
    >
      <GlyphField velocity={velocity} className="opacity-20" />
      {/* A solid overlay so nothing in the field reads through the text above it. */}
      <div className="pointer-events-none absolute inset-0 bg-[#0b0806]/90" aria-hidden />

      <div className="wrap relative z-10 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <SectionLabel n="02" calm="Experience" path="experience" cmd="time-travel --all" />
        </div>
        <div className="lg:col-span-9">
          <h2 id="experience-title" className="headline text-[clamp(44px,6vw,96px)]">
            Where I have worked.
          </h2>
          <p className="mt-4 max-w-lg text-[15px] text-grey-2">
            Travel through the timeline. Open any box to read it in full.
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
