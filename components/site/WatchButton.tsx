'use client';

import { useShow } from '@/store/useShow';

/** Scrolls the showreel to a given moment in the pinned hero. */
export function WatchButton({ at, label }: { at: number; label: string }) {
  const watch = () => useShow.getState().seek(at);
  return (
    <button type="button" className="watch" onClick={watch}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8 5.5v13l11-6.500-11-6.500Z" />
      </svg>
      <span>
        Watch in the film<span className="sr-only">: {label}</span>
      </span>
    </button>
  );
}
