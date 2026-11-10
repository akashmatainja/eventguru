/**
 * GLB override slots.
 *
 * Every structure in the film is built procedurally (see components/scene), so the project
 * runs with no model files at all. When the event designer supplies real models, drop the
 * .glb into public/models and set its path here. The matching procedural build is then
 * replaced by the model, loaded through useGLTF with Draco, Meshopt and KTX2 support.
 *
 * Models should be authored in metres, Y up, with the origin at floor level on the centre
 * line of the piece, facing +Z.
 */
export type ModelSlotName = 'gate' | 'stage' | 'diamondInstallation' | 'photoOpp';

export const MODEL_OVERRIDES: Record<ModelSlotName, string | null> = {
  gate: null, // e.g. '/models/gate.glb'
  stage: null, // e.g. '/models/stage.glb'
  diamondInstallation: null, // e.g. '/models/diamond-installation.glb'
  photoOpp: null, // e.g. '/models/photo-opp.glb'
};

/** Draco decoder location. `true` uses the Google-hosted decoder; use '/draco/' to self-host. */
export const DRACO_PATH: string | boolean = true;

/** Basis transcoder for KTX2 textures. Copy three/examples/jsm/libs/basis here to self-host. */
export const KTX2_TRANSCODER_PATH = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/basis/';

/** Optional soundtrack. If the file is missing, a soft synthesised ambience is used instead. */
export const AUDIO_URL = '/audio/eventguru.mp3';
