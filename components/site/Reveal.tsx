'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Fades its content up as it scrolls into view. Content is fully visible without JavaScript
 * and for visitors who prefer reduced motion; the hidden state is only applied after mount
 * to elements that are still below the fold.
 */
export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return; // already on screen
    el.classList.add('reveal--pending');
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.remove('reveal--pending');
        observer.disconnect();
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
