'use client';

import Link from 'next/link';
import { useState } from 'react';
import PixelImage from './PixelImage';
import LazyMount from './LazyMount';
import Reveal from './Reveal';
import { mediaFor } from '@/data/assets';
import type { Project } from '@/data/projects';
import { useNoHover } from '@/lib/motion';
import type { PreviewLayout } from '@/lib/layouts';
import { useMode } from './ModeContext';
import { splitSystemLabel } from '@/data/projects';


const imageBox: Record<PreviewLayout, { cls: string; aspect: string }> = {
  full: { cls: 'lg:col-span-12', aspect: '21 / 9' },
  right: { cls: 'lg:col-start-5 lg:col-span-8', aspect: '16 / 10' },
  'left-tall': { cls: 'lg:col-start-1 lg:col-span-5', aspect: '4 / 5' },
  bleed: { cls: 'lg:col-span-12 lg:-mx-[var(--gutter)]', aspect: '2.35 / 1' },
  offset: { cls: 'lg:col-start-3 lg:col-span-8', aspect: '3 / 2' },
  pair: { cls: 'lg:col-start-6 lg:col-span-7', aspect: '1.1 / 1' },
};

const textBox: Record<PreviewLayout, string> = {
  full: 'lg:col-span-12 lg:grid lg:grid-cols-12 lg:gap-6',
  right: 'lg:col-start-1 lg:col-span-4 lg:row-start-1 lg:self-end lg:-mr-[6vw] lg:pb-10 relative z-10',
  'left-tall': 'lg:col-start-7 lg:col-span-5 lg:self-end',
  bleed: 'lg:col-span-12 lg:grid lg:grid-cols-12 lg:gap-6',
  offset: 'lg:col-start-3 lg:col-span-8',
  pair: 'lg:col-start-1 lg:col-span-4 lg:row-start-1 lg:self-start lg:pt-16',
};

export default function ProjectPreview({ project, layout, index }: { project: Project; layout: PreviewLayout; index: number }) {
  const noHover = useNoHover();
  const [revealed, setRevealed] = useState(false);
  const media = mediaFor(project.slug, project.name);
  const { mode } = useMode();
  const cover = media.cover;
  const href = `/work/${project.slug}/`;
  const wideText = layout === 'full' || layout === 'bleed';

  const image = (
    <LazyMount>
      <PixelImage
        mode="reveal"
        src={cover.asset?.src}
        alt={cover.asset?.alt ?? `${project.name} cover (placeholder)`}
        focus={cover.asset?.focus}
        placeholder={cover.asset ? undefined : { title: project.name, code: `P${project.number}`, label: project.category, seed: index + 3 }}
        annotate="project"
        fieldLabel={`P${project.number} / ${project.name}`}
        revealed={revealed}
      />
    </LazyMount>
  );

  return (
    <article className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-x-6">
      <Reveal className={`${imageBox[layout].cls} relative`}>
        <div className="relative w-full" style={{ aspectRatio: imageBox[layout].aspect }}>
          {noHover ? (
            <button
              type="button"
              className="absolute inset-0 block h-full w-full text-left"
              onClick={() => setRevealed((v) => !v)}
              aria-pressed={revealed}
              aria-label={`${revealed ? 'Fragment' : 'Reveal'} ${project.name} image`}
            >
              {image}
            </button>
          ) : (
            <Link href={href} className="absolute inset-0 block" aria-label={`Open ${project.name}`} tabIndex={-1}>
              {image}
            </Link>
          )}
          {noHover && revealed && (
            <Link href={href} className="label absolute bottom-3 right-3 z-10 bg-paper px-3 py-2 text-ink">
              Open project
            </Link>
          )}
        </div>
      </Reveal>

      <Reveal className={textBox[layout]} delay={120}>
        <div className={wideText ? 'lg:col-span-7' : ''}>
          <p className="label flex gap-4 text-grey-2">
            <span>{project.number}</span>
            <span>{project.category}</span>
            <span className="text-grey-3">{project.type === 'PLATFORM' ? 'Platform' : 'Tool'}</span>
          </p>
          <h3 className="headline mt-3 text-[clamp(40px,6.4vw,104px)]">
            <Link href={href} className="transition-colors hover:text-grey-1">
              {project.name}
            </Link>
          </h3>
        </div>
        <div className={wideText ? 'mt-4 lg:col-span-4 lg:col-start-9 lg:mt-0 lg:self-end' : 'mt-4'}>
          <p key={mode} className="mode-fade max-w-md text-[15px] leading-relaxed text-grey-1">
            {mode === 'calm' ? project.punchline : `${splitSystemLabel(project.nerd).label ?? ''}. ${project.tags.join(', ')}`}
          </p>
          <Link href={href} className="label link-quiet mt-4 inline-block text-paper">
            View project
          </Link>
        </div>
      </Reveal>
    </article>
  );
}
