'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import PixelTransition from './PixelTransition';
import Reveal from './Reveal';
import { clusters, nodes } from '@/data/atlas';
import { prefersReducedMotion } from '@/lib/motion';

// Static projection of the real cluster centres for the invitation diagram (x/z plane).
function project([x, , z]: [number, number, number]) {
  return { left: 50 + x * 2.2, top: 50 + z * 2.6 };
}

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
          <p className="label text-grey-2">02 / Knowledge Atlas</p>
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
            <div className="absolute left-1/2 top-0 h-full w-px bg-paper/10" />
            <div className="absolute left-0 top-1/2 h-px w-full bg-paper/10" />
            {clusters.map((c) => {
              const pos = project(c.center);
              const count = nodes.filter((n) => n.cluster === c.id).length;
              return (
                <div key={c.id} className="absolute" style={{ left: `${pos.left}%`, top: `${pos.top}%` }}>
                  <span className="absolute -translate-x-1/2 -translate-y-1/2 border border-paper/60" style={{ width: 10 + count * 2.4, height: 10 + count * 2.4 }} />
                  <span className="absolute h-1 w-1 -translate-x-1/2 -translate-y-1/2 bg-paper" />
                  <span className={`label absolute top-2 whitespace-nowrap text-[9px] text-grey-1 ${pos.left > 55 ? 'right-4 text-right' : 'left-4'}`}>
                    {c.code} / {c.label}
                    <br />
                    <span className="text-grey-3">
                      X {c.center[0].toFixed(1)} Z {c.center[2].toFixed(1)}
                    </span>
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
