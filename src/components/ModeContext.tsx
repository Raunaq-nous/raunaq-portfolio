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
    const initial: Mode = (saved === 'calm' || saved === 'nerd') ? saved : 'calm';
    setMode(initial);
    document.documentElement.setAttribute('data-mode', initial);
  }, []);

  const toggle = () => {
    const next: Mode = mode === 'calm' ? 'nerd' : 'calm';
    setMode(next);
    localStorage.setItem('site-mode', next);
    document.documentElement.setAttribute('data-mode', next);
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
