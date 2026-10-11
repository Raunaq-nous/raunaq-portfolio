'use client';

import { useMode } from './ModeContext';

export default function ModeToggle() {
  const { mode, toggle } = useMode();

  return (
    <button
      onClick={toggle}
      className="relative flex items-center w-32 h-8 rounded-full border border-line bg-ink-2/80 transition-all overflow-hidden hover:border-paper/40"
      aria-label={`Switch to ${mode === 'calm' ? 'nerd' : 'calm'} mode`}
    >
      <span
        className={`absolute top-[3px] h-[calc(100%-6px)] w-[calc(50%-3px)] rounded-full transition-all duration-300 ease-out bg-paper/10 border border-paper/30 ${
          mode === 'calm' ? 'left-[3px]' : 'left-[calc(50%+1px)]'
        }`}
      />
      <span
        className={`relative z-10 flex-1 text-center text-[0.6rem] font-mono uppercase tracking-wider transition-colors duration-300 ${
          mode === 'calm' ? 'text-paper font-semibold' : 'text-grey-3'
        }`}
      >
        calm
      </span>
      <span
        className={`relative z-10 flex-1 text-center text-[0.6rem] font-mono tracking-wider transition-colors duration-300 ${
          mode === 'nerd' ? 'text-paper font-semibold' : 'text-grey-3'
        }`}
      >
        {'<nerd/>'}
      </span>
    </button>
  );
}
