'use client';

import { useEffect, useRef, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useShow } from '@/store/useShow';
import { buildMasterTimeline } from './masterTimeline';

gsap.registerPlugin(ScrollTrigger);

interface DirectorProps {
  /** The hero element: contains the title cards and progress bar, and is the scroll track. */
  scope: RefObject<HTMLDivElement>;
}

/**
 * Owns the master timeline. The hero is a tall pinned section: the film auto-plays and
 * scrolls the page to match, while scrolling by hand scrubs it. The "Watch in the
 * film" buttons scroll to a given moment.
 */
export function Director({ scope }: DirectorProps) {
  const started = useShow((s) => s.started);
  const seekToken = useShow((s) => s.seekToken);
  const timeline = useRef<gsap.core.Timeline | null>(null);

  // Build once.
  useEffect(() => {
    const root = scope.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      const tl = buildMasterTimeline(root);
      let bar: HTMLElement | null = null;
      tl.eventCallback('onUpdate', () => {
        const p = tl.progress();
        // The progress line mounts with the controls, after the timeline exists.
        if (!bar || !bar.isConnected) bar = root.querySelector<HTMLElement>('.progress-fill');
        if (bar) bar.style.transform = `scaleX(${p})`;
        const ended = p >= 0.999;
        const show = useShow.getState();
        if (ended !== show.ended) show.setEnded(ended);
      });
      timeline.current = tl;
    }, root);
    return () => {
      ctx.revert();
      timeline.current = null;
    };
  }, [scope]);

  // Drive it: the film auto-plays and the scrollbar mirrors the playhead (scroll
  // position is the film's position). Scrolling takes over and scrubs; auto-play
  // resumes a moment after the last scroll. Playback pauses off screen.
  useEffect(() => {
    const tl = timeline.current;
    const root = scope.current;
    if (!tl || !root || !started) return;

    const range = () => Math.max(1, root.offsetHeight - window.innerHeight);
    const top = root.getBoundingClientRect().top + window.scrollY;
    let held = false; // the user has the scrollbar; auto-play is paused
    let holdTimer = 0;
    let loopTimer = 0; // pending restart once the film has finished
    let mirrorY = -1; // the scroll position we last wrote ourselves

    const tick = () => {
      if (!useShow.getState().inView) {
        if (!tl.paused()) tl.pause();
        return;
      }
      if (held) return;
      if (tl.progress() >= 0.999) {
        // Rest on the last frame, then loop back to the start.
        if (!loopTimer) {
          loopTimer = window.setTimeout(() => {
            loopTimer = 0;
            if (held || !useShow.getState().inView) return;
            gsap.killTweensOf(tl);
            tl.restart();
            mirrorY = top;
            window.scrollTo({ top, behavior: 'instant' });
          }, 3000);
        }
        return;
      }
      if (tl.paused()) {
        gsap.killTweensOf(tl);
        tl.play();
      }
      const target = top + tl.progress() * range();
      if (Math.abs(window.scrollY - target) > 1) {
        mirrorY = target;
        window.scrollTo({ top: target, behavior: 'instant' });
      }
    };
    gsap.ticker.add(tick);

    const trigger = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        if (Math.abs(self.scroll() - mirrorY) < 3) return; // our own mirroring, not the user
        held = true;
        window.clearTimeout(holdTimer);
        holdTimer = window.setTimeout(() => {
          held = false;
        }, 900);
        tl.pause();
        gsap.to(tl, { progress: self.progress, duration: 0.7, ease: 'power2.out', overwrite: true });
      },
    });

    return () => {
      trigger.kill();
      gsap.ticker.remove(tick);
      window.clearTimeout(holdTimer);
      window.clearTimeout(loopTimer);
      gsap.killTweensOf(tl);
      tl.pause();
    };
  }, [started, scope]);

  // Jump to a scene (used by the "Watch in the film" buttons further down the page):
  // scroll to the point on the hero's track that matches `seekTime`.
  useEffect(() => {
    const tl = timeline.current;
    const root = scope.current;
    if (!tl || !root || seekToken === 0) return;
    const { seekTime, started: go } = useShow.getState();
    const range = Math.max(1, root.offsetHeight - window.innerHeight);
    const top = root.getBoundingClientRect().top + window.scrollY;
    const target = top + (seekTime / tl.duration()) * range;
    // While loading, or when the film is already parked there, set the playhead directly;
    // otherwise let the smooth scroll scrub it into place.
    if (!go || Math.abs(window.scrollY - target) < 2) {
      tl.time(seekTime);
      return;
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: target, behavior: reduce ? 'instant' : 'smooth' });
  }, [seekToken, scope]);

  return null;
}
