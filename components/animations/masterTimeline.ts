import gsap from 'gsap';
import { fx, resetFx, type FxChannel } from '@/store/fx';
import { DURATION } from '@/lib/layout';

/**
 * The master timeline. One GSAP timeline owns everything that changes during the film:
 *
 *  - `fx.time`, which the camera rig follows along its spline;
 *  - every lighting / LED / reveal channel in store/fx.ts;
 *  - the on-screen title cards.
 *
 * Because it is a single timeline it can be played, replayed, or scrubbed by scroll, and
 * camera, lights and text always stay in step. All times are in seconds.
 */
export function buildMasterTimeline(root: HTMLElement) {
  resetFx();
  const q = gsap.utils.selector(root);
  const tl = gsap.timeline({ paused: true });

  // Playhead for the camera.
  tl.fromTo(fx, { time: 0 }, { time: DURATION, duration: DURATION, ease: 'none', immediateRender: false }, 0);

  /** Animate one channel from `a` to `b`, starting at `at` and lasting `dur` seconds. */
  const ch = (key: FxChannel, a: number, b: number, at: number, dur: number, ease = 'power2.inOut') =>
    tl.fromTo(fx, { [key]: a }, { [key]: b, duration: dur, ease, immediateRender: false }, at);

  /* Scene 1 – Introduction (0–4s) ------------------------------------ */
  ch('introGlow', 0, 1, 0.2, 2.2, 'power1.inOut');
  ch('particles', 0, 1, 0.4, 2.0, 'power1.out');
  ch('introDiamond', 0, 1, 0.7, 2.3, 'power2.out');
  tl.fromTo(
    q('.title-intro .line'),
    { autoAlpha: 0, y: 22, filter: 'blur(6px)' },
    { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1.1, stagger: 0.22, ease: 'power3.out' },
    1.5,
  );
  tl.to(q('.title-intro .line'), { autoAlpha: 0, y: -12, duration: 0.6, stagger: 0.06, ease: 'power2.in' }, 3.5);
  ch('introDiamond', 1, 0, 3.6, 1.0, 'power2.in');
  ch('introGlow', 1, 0, 3.7, 1.1);

  /* Scene 2 – LED entrance gate (4–10s) ------------------------------- */
  ch('gateTrace', 0, 1, 4.5, 2.9, 'power1.inOut'); // light runs along the geometric patterns
  ch('gateGlow', 0, 1, 5.3, 2.6); // structures illuminate progressively
  ch('gateLed', 0, 1, 6.5, 1.6, 'power1.inOut'); // centre LED powers on
  ch('carpetGlow', 0, 1, 7.5, 1.6); // golden wash on the red carpet
  ch('particles', 1, 0.55, 5.0, 2.0);

  /* Scene 3 – Main stage (10–17s) ------------------------------------- */
  ch('stageBase', 0, 1, 9.6, 1.6);
  ch('archReveal', 0, 1, 11.0, 3.0, 'none'); // arches light one after another
  ch('stageLed', 0, 1, 11.4, 1.9, 'power1.inOut');
  ch('stageSpots', 0, 1, 12.0, 1.6);
  ch('stageIdentity', 0, 1, 14.0, 1.4, 'power2.out'); // centre screen reveals the EventGuru sign
  ch('floorSweep', 0, 1, 14.2, 2.8, 'sine.inOut'); // reflections travel across the floor

  /* Scene 4 – Signature diamond installation (17–23s) ----------------- */
  ch('wallGlow', 0, 1, 16.8, 1.8);
  ch('diamondReveal', 0, 1, 18.4, 2.6, 'power1.inOut'); // lines illuminate progressively
  ch('diamondLogo', 0, 1, 20.6, 0.9, 'power2.out');
  ch('diamondText', 0, 1, 21.2, 1.0, 'power2.out');

  /* Scene 5 – Photo opportunity (23–28s) ------------------------------ */
  ch('photoGlow', 0, 1, 23.2, 2.0, 'power1.inOut');
  ch('photoLogo', 0, 1, 25.0, 1.0, 'power2.out');

  /* Scene 6 – Finale (28–35s) ----------------------------------------- */
  ch('finale', 0, 1, 28.4, 2.6);
  ch('particles', 0.55, 1, 28.4, 2.0);
  tl.fromTo(
    q('.title-final .line'),
    { autoAlpha: 0, y: 20, filter: 'blur(6px)' },
    { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1.2, stagger: 0.28, ease: 'power3.out' },
    30.2,
  );
  // The film holds on its last frame behind the closing titles and their calls to action.

  // Guarantee the exact running time regardless of the last tween's end.
  tl.set({}, {}, DURATION);
  return tl;
}
