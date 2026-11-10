'use client';

import { useEffect, useState } from 'react';
import { NAV } from '@/lib/site';
import { Wordmark } from '@/components/ui/TitleCards';

/** Fixed site header. Clear over the top of the film, solid once the page has scrolled. */
export function Header() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={`site-header ${solid || open ? 'site-header--solid' : ''}`}>
      <a className="site-header__logo" href="#top" aria-label="EventGuru, back to top">
        <Wordmark />
      </a>

      <button
        type="button"
        className="site-header__toggle"
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen(!open)}
      >
        <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}
        </svg>
      </button>

      <nav id="site-nav" className={`site-nav ${open ? 'site-nav--open' : ''}`} aria-label="Main">
        {NAV.map((item) => (
          <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
            {item.label}
          </a>
        ))}
        <a className="button button--solid button--small" href="#contact" onClick={() => setOpen(false)}>
          Get a quote
        </a>
      </nav>
    </header>
  );
}
