'use client';

import { useMode } from './ModeContext';

export default function ModeToggle() {
  const { mode, toggle } = useMode();

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border text-[0.625rem] font-mono uppercase tracking-wider transition-all hover:border-accent/40"
      aria-label={`Switch to ${mode === 'calm' ? 'nerd' : 'calm'} mode`}
    >
      <span className={mode === 'calm' ? 'text-accent' : 'text-text-muted'}>calm</span>
      <span className="text-text-muted">/</span>
      <span className={mode === 'nerd' ? 'text-accent' : 'text-text-muted'}>nerd</span>
    </button>
  );
}
