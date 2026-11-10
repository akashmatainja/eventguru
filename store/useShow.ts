import { create } from 'zustand';
import { detectQuality, type Quality } from '@/lib/quality';

interface ShowState {
  /** The 3D scene has mounted and its shaders are compiling. */
  compiling: boolean;
  /** Scene has compiled and rendered its first frame. */
  ready: boolean;
  /** The showreel is on screen. Rendering and playback pause while it is scrolled away. */
  inView: boolean;
  /** Loading screen has finished fading out; the film may start. */
  started: boolean;
  ended: boolean;
  soundOn: boolean;
  quality: Quality;
  /** Incremented to jump the showreel to `seekTime` (seconds). */
  seekToken: number;
  seekTime: number;

  setCompiling: (v: boolean) => void;
  setReady: (v: boolean) => void;
  setInView: (v: boolean) => void;
  /** Scroll to a moment in the showreel. */
  seek: (time: number) => void;
  setStarted: (v: boolean) => void;
  setEnded: (v: boolean) => void;
  toggleSound: () => void;
  setQuality: (q: Quality) => void;
}

/** Low-frequency UI state only. Per-frame values live in store/fx.ts. */
export const useShow = create<ShowState>((set) => ({
  compiling: false,
  ready: false,
  inView: true,
  started: false,
  ended: false,
  soundOn: false,
  quality: detectQuality(), // evaluated in the browser only; the experience is never server-rendered
  seekToken: 0,
  seekTime: 0,

  setCompiling: (compiling) => set({ compiling }),
  setInView: (inView) => set({ inView }),
  seek: (seekTime) => set((s) => ({ seekTime, seekToken: s.seekToken + 1, ended: false })),
  setReady: (ready) => set({ ready }),
  setStarted: (started) => set({ started }),
  setEnded: (ended) => set({ ended }),
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
  setQuality: (quality) => set({ quality }),
}));
