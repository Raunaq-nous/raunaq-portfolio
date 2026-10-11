'use client';

import { useEffect, useState } from 'react';

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/** True on devices whose primary input cannot hover (phones, most tablets). */
export function useNoHover(): boolean {
  const [noHover, setNoHover] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(hover: none)');
    setNoHover(mq.matches);
    const on = () => setNoHover(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return noHover;
}

export function hasWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
