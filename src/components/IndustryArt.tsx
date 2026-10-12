'use client';

import { useEffect, useState } from 'react';
import { drawIndustrySheet } from '@/lib/industrySheet';

/** Renders an industry's procedural spec sheet as an image. */
export default function IndustryArt({ name, code, rows, motif, className = '' }: { name: string; code: string; rows: [string, string][]; motif?: string; className?: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const key = `${name}|${motif}|${code}|${rows.map((r) => r.join(':')).join('|')}`;
  useEffect(() => {
    let alive = true;
    const run = () => alive && setSrc(drawIndustrySheet(name, code, rows, 960, 600, motif));
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts?.ready) fonts.ready.then(run);
    else run();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  // eslint-disable-next-line @next/next/no-img-element
  return src ? <img src={src} alt={`${name} sector sheet`} className={`h-full w-full object-cover ${className}`} /> : <span className={`block h-full w-full bg-ink-3 ${className}`} />;
}
