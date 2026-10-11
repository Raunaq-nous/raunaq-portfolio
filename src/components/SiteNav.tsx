'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export const navItems = [
  { href: '/#work', label: 'Work', match: '/work' },
  { href: '/atlas/', label: 'Atlas', match: '/atlas' },
  { href: '/#thinking', label: 'Thinking' },
  { href: '/#about', label: 'About' },
  { href: '/#contact', label: 'Contact' },
];

export default function SiteNav() {
  const pathname = usePathname();
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
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled || open ? 'bg-ink/85 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <nav className="wrap flex h-14 items-center justify-between" aria-label="Primary">
        <Link href="/" className="label text-paper">
          Raunaq
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            const current = item.match ? pathname.startsWith(item.match) : false;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={current ? 'true' : undefined}
                  className={`label link-quiet ${current ? 'text-paper' : 'text-grey-1 hover:text-paper'}`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          className="label text-grey-1 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </nav>

      {open && (
        <ul id="mobile-nav" className="wrap border-t rule pb-8 pt-4 md:hidden">
          {navItems.map((item, i) => (
            <li key={item.href} className="border-b rule">
              <Link href={item.href} className="flex items-baseline justify-between py-4" onClick={() => setOpen(false)}>
                <span className="text-3xl tracking-tight">{item.label}</span>
                <span className="label text-grey-2">0{i + 1}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
