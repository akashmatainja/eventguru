# Models

No model files are required. Every set piece is generated in code (see `components/scene`).

To replace a set piece with a designer-supplied model:

1. Export it as `.glb` in metres, Y up, origin at floor level on the centre line, front facing +Z.
2. Optimise it, for example:
   `npx @gltf-transform/cli optimize in.glb out.glb --compress draco --texture-compress ktx2`
3. Put the file in this folder and set its path in `lib/assets.ts` (`MODEL_OVERRIDES`).

Slots: `gate`, `stage`, `diamondInstallation`, `photoOpp`.
