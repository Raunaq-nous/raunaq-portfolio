'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import ModeToggle from './ModeToggle';
import { useMode } from './ModeContext';

const navItems = [
  { href: '/',             calm: 'Home',         nerd: '~/'             },
  { href: '/builds',       calm: 'Builds',       nerd: 'cd builds'      },
  { href: '/research',     calm: 'Research',     nerd: 'cd research'    },
  { href: '/past-battles', calm: 'Past Battles', nerd: 'cd past-battles'},
  { href: '/curiosities',  calm: 'Curiosities',  nerd: 'cd curiosities' },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { mode } = useMode();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/90 backdrop-blur-xl border-b border-border">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-mono text-sm font-semibold text-text-primary tracking-tight">
          raunaq<span className="text-accent">.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-mono tracking-wide transition-colors ${
                pathname === item.href
                  ? 'text-accent'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {mode === 'nerd' ? item.nerd : item.calm}
            </Link>
          ))}
          <ModeToggle />
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <ModeToggle />
          <button
            onClick={() => setOpen(!open)}
            className="text-text-muted p-2"
            aria-label="Menu"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              {open ? (
                <>
                  <line x1="3" y1="3" x2="13" y2="13" />
                  <line x1="13" y1="3" x2="3" y2="13" />
                </>
              ) : (
                <>
                  <line x1="2" y1="4" x2="14" y2="4" />
                  <line x1="2" y1="8" x2="14" y2="8" />
                  <line x1="2" y1="12" x2="14" y2="12" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-bg-primary border-b border-border px-6 py-4 space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`block text-sm font-mono tracking-wide ${
                pathname === item.href ? 'text-accent' : 'text-text-muted'
              }`}
            >
              {mode === 'nerd' ? item.nerd : item.calm}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
