export type Quality = 'high' | 'low';

export interface QualitySettings {
  dpr: [number, number];
  particles: number;
  reflectiveFloor: boolean;
  reflectorResolution: number;
  shadows: boolean;
  transmission: boolean;
  ao: boolean;
  dof: boolean;
  grain: boolean;
  latticeDetail: number;
  beamCount: number;
}

export const QUALITY: Record<Quality, QualitySettings> = {
  high: {
    dpr: [1, 1.75],
    particles: 1400,
    reflectiveFloor: true,
    reflectorResolution: 1024,
    shadows: true,
    transmission: true,
    ao: true,
    dof: true,
    grain: true,
    latticeDetail: 8,
    beamCount: 14,
  },
  low: {
    dpr: [1, 1.25],
    particles: 550,
    reflectiveFloor: false,
    reflectorResolution: 512,
    shadows: false,
    transmission: false,
    ao: false,
    dof: false,
    grain: false,
    latticeDetail: 5,
    beamCount: 8,
  },
};

/** Picks a starting tier. PerformanceMonitor may lower it later. */
export function detectQuality(): Quality {
  if (typeof window === 'undefined') return 'high';
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency ?? 8;
  if (coarse || small || (mem !== undefined && mem <= 4) || cores <= 4) return 'low';
  return 'high';
}
