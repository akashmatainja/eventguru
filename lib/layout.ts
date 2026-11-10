/**
 * World layout (metres, Y up). The film is one continuous camera journey:
 *
 *   intro diamond  ->  LED gate  ->  main stage  ->  diamond installation
 *        z=62           z=34          z=-30            x=42, z=-12
 *                                                   photo opp  x=42, z=16
 */
export const DURATION = 35;

export const INTRO_POS: [number, number, number] = [0, 5.2, 62];
export const GATE_Z = 34;
export const STAGE_Z = -30;
export const DIAMOND_POS: [number, number, number] = [42, 0, -12];
export const PHOTO_POS: [number, number, number] = [42, 0, 16];
export const WALL_X = 47.5;

/** Scene start times in seconds, matching the storyboard. */
export const SCENES = [
  { id: 'intro', start: 0 },
  { id: 'gate', start: 4 },
  { id: 'stage', start: 10 },
  { id: 'diamond', start: 17 },
  { id: 'photo', start: 23 },
  { id: 'finale', start: 28 },
] as const;

export const BRAND = 'EventGuru';
export const DESCRIPTOR = 'Event Design & Management';
export const TAGLINE = 'Extraordinary events, flawlessly delivered';
