'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import ModeToggle from './ModeToggle';
import { useMode } from './ModeContext';

export const navItems = [
  { href: '/#builds', calm: 'AI builds', nerd: 'cd builds', match: '/work' },
  { href: '/#experience', calm: 'Experience', nerd: 'cd experience' },
  { href: '/atlas/', calm: 'Palace', nerd: 'cd palace', match: '/atlas' },
  { href: '/#curiosities', calm: 'Curiosities', nerd: 'cd curiosities' },
  { href: '/#about', calm: 'About', nerd: 'cd about' },
  { href: '/#contact', calm: 'Contact', nerd: 'cd contact' },
];

export default function SiteNav() {
  const pathname = usePathname();
  const { mode } = useMode();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${scrolled || open ? 'bg-ink/90 backdrop-blur-md' : 'bg-transparent'}`}
    >
      <nav className="wrap flex h-14 items-center justify-between gap-6" aria-label="Primary">
        <Link href="/" className="label text-paper">
          {mode === 'nerd' ? '~/raunaq' : 'Raunaq'}
          {mode === 'nerd' && <span className="cursor-blink" aria-hidden />}
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          <ul className="flex items-center gap-7">
            {navItems.map((item) => {
              const current = item.match ? pathname.startsWith(item.match) : false;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current ? 'true' : undefined}
                    className={`label link-quiet ${mode === 'nerd' ? 'normal-case tracking-normal' : ''} ${
                      current ? 'text-paper' : 'text-grey-1 hover:text-paper'
                    }`}
                  >
                    {mode === 'nerd' ? item.nerd : item.calm}
                  </Link>
                </li>
              );
            })}
          </ul>
          <ModeToggle />
        </div>

        <div className="flex items-center gap-4 lg:hidden">
          <ModeToggle />
          <button
            type="button"
            className="label text-grey-1"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </nav>

      {open && (
        <ul id="mobile-nav" className="wrap border-t rule pb-8 pt-4 lg:hidden">
          {navItems.map((item, i) => (
            <li key={item.href} className="border-b rule">
              <Link href={item.href} className="flex items-baseline justify-between py-4" onClick={() => setOpen(false)}>
                <span className="text-3xl tracking-tight">{mode === 'nerd' ? item.nerd : item.calm}</span>
                <span className="label text-grey-2">0{i + 1}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
