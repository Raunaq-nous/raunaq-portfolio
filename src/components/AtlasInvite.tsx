'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import PixelTransition from './PixelTransition';
import Reveal from './Reveal';
import SectionLabel from './SectionLabel';
import { nodes, timeline, towerPos, xForYear, STREET_LENGTH, STREET_HALF_WIDTH } from '@/data/atlas';
import { prefersReducedMotion } from '@/lib/motion';

// Plan view of the real scene: the time street along X, roles as towers either side of it.
const SPAN = STREET_LENGTH + 30;
const px = (x: number) => 50 + (x / SPAN) * 100;
const pz = (z: number) => 50 + (z / 60) * 100;

export default function AtlasInvite() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  const enter = () => {
    try {
      sessionStorage.setItem('atlas-entry', String(Date.now()));
    } catch {
      /* storage unavailable */
    }
    if (prefersReducedMotion()) router.push('/atlas/');
    else setLeaving(true);
  };

  return (
    <section id="atlas" className="wrap pt-40 lg:pt-56" aria-labelledby="atlas-title">
      <div className="grid gap-10 border-t rule pt-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-3">
          <SectionLabel n="03" calm="Knowledge Atlas" path="atlas" cmd="./enter" />
        </Reveal>

        <Reveal className="lg:col-span-5" delay={80}>
          <h2 id="atlas-title" className="headline text-[clamp(44px,6vw,96px)]">
            The connections behind the work.
          </h2>
          <p className="mt-6 max-w-md text-[17px] leading-snug text-grey-1">
            An optional, spatial map of the projects, code, research and visual studies on this site, and how they relate.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={enter}
              className="label group inline-flex items-center gap-4 border border-paper px-6 py-4 text-paper transition-colors hover:bg-paper hover:text-ink"
            >
              Enter the Atlas
              <span className="inline-block h-px w-8 bg-current transition-all duration-500 group-hover:w-12" />
            </button>
            <Link href="/atlas/?view=index" className="label link-quiet text-grey-1 hover:text-paper">
              Browse as a list
            </Link>
          </div>
        </Reveal>

        <Reveal className="lg:col-span-4" delay={160}>
          <div className="dot-grid relative aspect-square overflow-hidden border rule" aria-hidden>
            <span className="label absolute left-3 top-3 text-grey-3">Plan view / X Z</span>
            <span className="label absolute bottom-3 right-3 text-grey-3">{nodes.length} nodes</span>
            <div className="absolute inset-x-0 border-y border-paper/25" style={{ top: `${pz(-STREET_HALF_WIDTH)}%`, height: `${(STREET_HALF_WIDTH * 2 / 60) * 100}%` }} />
            <div className="absolute inset-x-0 top-1/2 h-px bg-[repeating-linear-gradient(90deg,rgb(var(--dot)/0.5)_0_6px,transparent_6px_12px)]" />
            {[2013, 2016, 2019, 2022, 2025].map((y) => (
              <span key={y} className="label absolute text-[9px] text-grey-3" style={{ left: `${px(xForYear(y))}%`, top: `${pz(STREET_HALF_WIDTH) + 1}%` }}>
                {y}
              </span>
            ))}
            {timeline.map((b, i) => {
              const t = towerPos.get(b.id)!;
              const above = t.z < 0;
              return (
                <div key={b.id} className="absolute" style={{ left: `${px(t.x - t.w / 2)}%`, top: `${pz(t.z - t.d / 2)}%`, width: `${(t.w / SPAN) * 100}%`, height: `${(t.d / 60) * 100}%` }}>
                  <span className="absolute inset-0 border border-paper/70 bg-paper/10" />
                  <span
                    className="label absolute left-0 whitespace-nowrap text-[9px] text-grey-1"
                    style={above ? { bottom: `calc(100% + ${6 + (i % 3) * 11}px)` } : { top: `calc(100% + ${6 + (i % 3) * 11}px)` }}
                  >
                    {b.company.split(',')[0].split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>

      <PixelTransition active={leaving} onDone={() => router.push('/atlas/')} />
    </section>
  );
}
