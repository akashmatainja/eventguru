import * as THREE from 'three';

export interface Shot {
  /** Timeline time in seconds. */
  t: number;
  pos: [number, number, number];
  look: [number, number, number];
}

/**
 * The whole film is one unbroken camera move. Each key is a point the camera passes
 * through at time `t`; a smooth spline is fitted through them, so there are no cuts.
 *
 * World layout is described in lib/layout.ts.
 */
export const SHOTS: Shot[] = [
  // Scene 1 – drift towards the diamond in the dark
  { t: 0.0, pos: [0, 2.4, 88], look: [0, 5.0, 62] },
  { t: 2.2, pos: [0, 2.6, 77], look: [0, 5.0, 62] },
  { t: 4.0, pos: [0, 2.3, 67], look: [0, 4.7, 44] },
  // Scene 2 – the gate, then through the portal along the red carpet
  { t: 5.5, pos: [0, 2.7, 58.5], look: [0, 4.5, 34] },
  { t: 7.6, pos: [0, 2.5, 50], look: [0, 4.2, 34] },
  { t: 9.2, pos: [0, 2.2, 40], look: [0, 3.6, 16] },
  { t: 10.3, pos: [0, 2.3, 30.5], look: [0, 4.8, -30] },
  // Scene 3 – crane up over the hall and dolly in on the stage
  { t: 12.4, pos: [0, 6.2, 15], look: [0, 6.0, -30] },
  { t: 14.8, pos: [2.4, 8.6, -1], look: [0, 5.6, -30] },
  { t: 16.8, pos: [5, 7.6, -6], look: [6, 5.4, -30] },
  // Scene 4 – sweep across to the diamond installation and orbit it
  { t: 18.6, pos: [18, 4.6, -10.5], look: [42, 4.2, -12] },
  { t: 20.0, pos: [28.5, 3.4, -12], look: [42, 4.0, -12] },
  { t: 21.6, pos: [29.8, 3.5, -6.5], look: [42, 3.9, -12] },
  { t: 23.0, pos: [33, 3.6, -1.5], look: [42, 3.8, -12] },
  // Scene 5 – the photo opportunity, with a sideways drift for depth
  { t: 24.7, pos: [31, 3.0, 10], look: [42, 3.6, 16] },
  { t: 26.2, pos: [29.2, 3.0, 15], look: [42, 3.6, 16] },
  { t: 28.0, pos: [30.2, 3.0, 19.5], look: [42, 3.7, 16] },
  // Scene 6 – back to the diamond for the wide finale and a slow pull-back
  { t: 29.6, pos: [27, 4.2, 1], look: [42, 4.0, -11] },
  { t: 31.2, pos: [23.5, 4.6, -12], look: [42, 4.0, -12] },
  { t: 35.0, pos: [13, 5.8, -12], look: [42, 4.2, -12] },
];

const toV = (a: [number, number, number]) => new THREE.Vector3(...a);

export class CameraPath {
  private positions: THREE.CatmullRomCurve3;
  private targets: THREE.CatmullRomCurve3;
  private times: number[];

  constructor(shots: Shot[] = SHOTS) {
    this.times = shots.map((s) => s.t);
    this.positions = new THREE.CatmullRomCurve3(shots.map((s) => toV(s.pos)), false, 'centripetal');
    this.targets = new THREE.CatmullRomCurve3(shots.map((s) => toV(s.look)), false, 'centripetal');
  }

  /** Writes the camera position and look-at point for timeline time `t`. */
  sample(t: number, outPos: THREE.Vector3, outLook: THREE.Vector3) {
    const { times } = this;
    const last = times.length - 1;
    const clamped = THREE.MathUtils.clamp(t, times[0], times[last]);
    let i = 0;
    while (i < last - 1 && clamped > times[i + 1]) i++;
    const f = (clamped - times[i]) / (times[i + 1] - times[i]);
    const u = (i + f) / last;
    this.positions.getPoint(u, outPos);
    this.targets.getPoint(u, outLook);
  }
}
