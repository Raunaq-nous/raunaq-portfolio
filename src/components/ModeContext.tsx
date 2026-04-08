'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Mode = 'calm' | 'nerd';

interface ModeContextType {
  mode: Mode;
  toggle: () => void;
}

const ModeContext = createContext<ModeContextType>({ mode: 'calm', toggle: () => {} });

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>('calm');

  useEffect(() => {
    const saved = localStorage.getItem('site-mode') as Mode | null;
    if (saved === 'calm' || saved === 'nerd') setMode(saved);
  }, []);

  const toggle = () => {
    const next = mode === 'calm' ? 'nerd' : 'calm';
    setMode(next);
    localStorage.setItem('site-mode', next);
  };

  return (
    <ModeContext.Provider value={{ mode, toggle }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  return useContext(ModeContext);
}
