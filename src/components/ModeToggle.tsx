'use client';

import { useMode } from './ModeContext';

export default function ModeToggle() {
  const { mode, toggle } = useMode();

  return (
    <button
      onClick={toggle}
      className="relative flex items-center w-[7.5rem] h-8 rounded-full border border-border transition-all overflow-hidden"
      aria-label={`Switch to ${mode === 'calm' ? 'nerd' : 'calm'} mode`}
    >
      {/* Sliding background */}
      <span
        className={`absolute top-0.5 h-[calc(100%-4px)] w-[calc(50%-2px)] rounded-full transition-all duration-300 ease-in-out ${
          mode === 'calm'
            ? 'left-0.5 bg-white/90'
            : 'left-[calc(50%+2px)] bg-emerald-500/20 border border-emerald-500/40'
        }`}
      />
      {/* Calm label */}
      <span
        className={`relative z-10 flex-1 text-center text-[0.6rem] font-mono uppercase tracking-wider transition-colors duration-300 ${
          mode === 'calm' ? 'text-[#0a0f1e] font-semibold' : 'text-text-muted'
        }`}
      >
        calm
      </span>
      {/* Nerd label */}
      <span
        className={`relative z-10 flex-1 text-center text-[0.6rem] font-mono uppercase tracking-wider transition-colors duration-300 ${
          mode === 'nerd' ? 'text-emerald-400 font-semibold' : 'text-text-muted'
        }`}
      >
        {'<nerd/>'}
      </span>
    </button>
  );
}
