'use client';

import PixelImage from './PixelImage';
import LazyMount from './LazyMount';
import type { ImageSlot, VideoSlot } from '@/data/assets';
import { asset } from '@/lib/asset';
import { useNoHover } from '@/lib/motion';
import { useState } from 'react';

/** An image slot: the real asset when present, otherwise a labelled placeholder. Both use the pixel system. */
export function ImageMedia({
  slot,
  title,
  code,
  seed,
  annotate = 'project',
  revealed,
  className = '',
}: {
  slot: ImageSlot;
  title: string;
  code: string;
  seed: number;
  annotate?: 'project' | 'none';
  revealed?: boolean;
  className?: string;
}) {
  const noHover = useNoHover();
  const [tapped, setTapped] = useState(false);
  return (
    <figure className={className}>
      <div className="relative w-full" style={{ aspectRatio: String(slot.aspect) }}>
        {noHover && (
          <button
            type="button"
            className="absolute inset-0 z-10"
            onClick={() => setTapped((v) => !v)}
            aria-pressed={tapped}
            aria-label={`${tapped ? 'Fragment' : 'Reveal'} ${slot.label.toLowerCase()} image`}
          />
        )}
        <LazyMount>
        <PixelImage
          mode="reveal"
          src={slot.asset?.src}
          alt={slot.asset?.alt ?? `${title}: ${slot.label.toLowerCase()} (placeholder)`}
          focus={slot.asset?.focus}
          placeholder={slot.asset ? undefined : { title, code, label: slot.label, seed }}
          annotate={annotate}
          fieldLabel={`${code} / ${slot.label}`}
          revealed={revealed || tapped}
          naturalSize={slot.asset ? [slot.asset.width, slot.asset.height] : undefined}
        />
        </LazyMount>
      </div>
      <figcaption className="label mt-3 flex justify-between text-grey-2">
        <span>{slot.label}</span>
        <span>{slot.asset ? '' : 'Placeholder'}</span>
      </figcaption>
    </figure>
  );
}

/** A video slot. Renders a minimal player for real media, or a precise placeholder frame. */
export function VideoMedia({ slot, title, code, index }: { slot: VideoSlot; title: string; code: string; index: number }) {
  const v = slot.asset;
  const label = `VID ${String(index + 1).padStart(2, '0')}`;
  const ratio = slot.aspect >= 1.7 ? '16:9' : slot.aspect >= 1.3 ? '4:3' : slot.aspect >= 0.99 ? '1:1' : '9:16';

  return (
    <figure>
      <div className="relative w-full overflow-hidden border rule bg-ink-2" style={{ aspectRatio: String(slot.aspect) }}>
        {v?.src ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={asset(v.src)}
            poster={v.poster ? asset(v.poster) : undefined}
            controls
            playsInline
            preload="metadata"
          />
        ) : v?.embed ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={v.embed}
            title={`${title}: ${slot.label}`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="dot-grid absolute inset-0" aria-label={`${title} ${slot.label.toLowerCase()} video placeholder`} role="img">
            <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 border border-paper/40">
              <span className="absolute left-1/2 top-1/2 ml-0.5 -translate-x-1/2 -translate-y-1/2 border-y-[7px] border-l-[11px] border-y-transparent border-l-paper/80" />
            </div>
            <div className="absolute left-1/2 top-0 h-full w-px bg-paper/10" />
            <div className="absolute left-0 top-1/2 h-px w-full bg-paper/10" />
            <span className="label absolute left-4 top-4 text-paper/70">
              {code} / {label}
            </span>
            <span className="label absolute right-4 top-4 text-paper/50">{ratio}</span>
            <span className="label absolute bottom-4 left-4 text-paper/50">Video placeholder / replace in src/data/assets.ts</span>
            <span className="label absolute bottom-4 right-4 text-paper/50">00:00 / --:--</span>
          </div>
        )}
      </div>
      <figcaption className="label mt-3 flex justify-between text-grey-2">
        <span>{slot.label}</span>
        <span>{v?.src || v?.embed ? '' : 'Placeholder'}</span>
      </figcaption>
    </figure>
  );
}
