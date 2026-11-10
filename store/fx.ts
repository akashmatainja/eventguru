/**
 * Mutable animation channels.
 *
 * GSAP tweens these numbers and the 3D components read them inside useFrame.
 * Nothing here is React state, so the film plays without re-rendering React.
 */
export const fx = {
  /** Timeline playhead in seconds (drives the camera path). */
  time: 0,

  // Scene 1 – introduction
  introGlow: 0,
  introDiamond: 0,
  particles: 0,

  // Scene 2 – LED entrance gate
  gateTrace: 0,
  gateGlow: 0,
  gateLed: 0,
  carpetGlow: 0,

  // Scene 3 – main stage
  stageBase: 0,
  archReveal: 0,
  stageLed: 0,
  stageSpots: 0,
  stageIdentity: 0,
  floorSweep: 0,

  // Scene 4 – diamond installation
  wallGlow: 0,
  diamondReveal: 0,
  diamondLogo: 0,
  diamondText: 0,

  // Scene 5 – photo opportunity
  photoGlow: 0,
  photoLogo: 0,

  // Scene 6 – finale
  finale: 0,
};

export type FxChannel = keyof typeof fx;

const initial = { ...fx };

export function resetFx() {
  Object.assign(fx, initial);
}
