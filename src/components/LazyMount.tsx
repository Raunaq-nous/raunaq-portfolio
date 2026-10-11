'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Mounts children only while near the viewport. Keeps the number of live WebGL
 * contexts low on pages with many pixel images.
 */
export default function LazyMount({ children, className = '', margin = '60%' }: { children: ReactNode; className?: string; margin?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: `${margin} 0px` });
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);

  return (
    <div ref={ref} className={`relative h-full w-full bg-ink-3 ${className}`}>
      {on ? children : null}
    </div>
  );
}
