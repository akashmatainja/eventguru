'use client';

import { useEffect, useState } from 'react';
import { useShow } from '@/store/useShow';
import { DESCRIPTOR } from '@/lib/layout';
import { Wordmark } from './TitleCards';

/** Static markup shared with the server-rendered placeholder shown before the 3D code arrives. */
export function LoaderShell({ percent, done = false }: { percent: number; done?: boolean }) {
  return (
    <div className={`loader ${done ? 'loader--done' : ''}`} role="status" aria-live="polite">
      <div className="loader__inner">
        <p className="loader__brand">{DESCRIPTOR}</p>
        <p className="loader__event">
          <Wordmark />
        </p>
        <div className="loader__bar" aria-hidden="true">
          <div className="loader__fill" style={{ transform: `scaleX(${percent / 100})` }} />
        </div>
        <p className="loader__percent">
          <span>{percent}</span>%<span className="sr-only"> of the showreel loaded</span>
        </p>
      </div>
    </div>
  );
}

/**
 * Loading screen for the showreel. The steps are real milestones, not a timer:
 * 3D code downloaded (40%), scene built and shaders compiling (80%), first frame drawn (100%).
 */
export function Loader() {
  const compiling = useShow((s) => s.compiling);
  const ready = useShow((s) => s.ready);
  const setStarted = useShow((s) => s.setStarted);
  const [gone, setGone] = useState(false);

  const percent = ready ? 100 : compiling ? 80 : 40;

  useEffect(() => {
    if (!ready) return;
    // Let the bar reach 100% and the curtain lift before the film begins.
    const start = window.setTimeout(() => setStarted(true), 700);
    const remove = window.setTimeout(() => setGone(true), 1900);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(remove);
    };
  }, [ready, setStarted]);

  if (gone) return null;
  return <LoaderShell percent={percent} done={ready} />;
}
