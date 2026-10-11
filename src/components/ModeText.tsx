'use client';

import { useMode } from './ModeContext';

/** Renders calm or nerd copy depending on the current mode. */
export default function ModeText({ calm, nerd }: { calm: string; nerd: string }) {
  const { mode } = useMode();
  return (
    <span key={mode} className="mode-fade">
      {mode === 'calm' ? calm : nerd}
    </span>
  );
}
