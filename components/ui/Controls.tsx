'use client';

import { useEffect } from 'react';
import { useShow } from '@/store/useShow';
import { ambience } from '@/lib/audio';

const icon = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** Sound control for the showreel, plus its progress line and scroll hint. */
export function Controls() {
  const started = useShow((s) => s.started);
  const ended = useShow((s) => s.ended);
  const soundOn = useShow((s) => s.soundOn);
  const inView = useShow((s) => s.inView);
  const { toggleSound } = useShow.getState();

  // Sound follows the button, and falls silent while the film is scrolled out of view.
  useEffect(() => {
    void ambience.setEnabled(soundOn && inView);
  }, [soundOn, inView]);

  if (!started) return null;

  return (
    <>
      <div className="progress" aria-hidden="true">
        <div className="progress-fill" />
      </div>

      {!ended && <p className="scroll-hint">Scroll to move through the film</p>}

      <div className="controls" role="group" aria-label="Showreel controls">
        <button type="button" className="control" onClick={toggleSound} aria-pressed={soundOn}>
          <svg {...icon} aria-hidden="true">
            <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z" />
            {soundOn ? <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.8 7.8 0 0 1 0 11" /> : <path d="m16 9.5 5 5m0-5-5 5" />}
          </svg>
          <span>{soundOn ? 'Sound on' : 'Sound off'}</span>
        </button>
      </div>
    </>
  );
}
