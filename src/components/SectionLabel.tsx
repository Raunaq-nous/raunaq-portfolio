'use client';

import { useMode } from './ModeContext';

/** Section label: an editorial index in calm mode, a shell prompt in nerd mode. */
export default function SectionLabel({ n, calm, path, cmd = 'ls', className = '' }: { n: string; calm: string; path: string; cmd?: string; className?: string }) {
  const { mode } = useMode();
  if (mode === 'nerd') {
    return (
      <p className={`label normal-case tracking-normal text-grey-2 ${className}`}>
        <span className="text-grey-3">raunaq@portfolio:</span>~/{path} <span className="text-paper">$ {cmd}</span>
      </p>
    );
  }
  return (
    <p className={`label text-grey-2 ${className}`}>
      {n} / {calm}
    </p>
  );
}
