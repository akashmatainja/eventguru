'use client';

import { Suspense, useEffect, type ReactNode } from 'react';
import { useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import type * as THREE from 'three';
import { DRACO_PATH, KTX2_TRANSCODER_PATH, MODEL_OVERRIDES, type ModelSlotName } from '@/lib/assets';

let ktx2: KTX2Loader | null = null;

function Model({ url }: { url: string }) {
  const gl = useThree((s) => s.gl);
  const { scene } = useGLTF(url, DRACO_PATH, true, (loader) => {
    if (!ktx2) ktx2 = new KTX2Loader().setTranscoderPath(KTX2_TRANSCODER_PATH).detectSupport(gl);
    (loader as unknown as { setKTX2Loader: (l: KTX2Loader) => void }).setKTX2Loader(ktx2);
  });

  useEffect(() => {
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    // Release GPU memory when the model leaves the scene.
    return () => useGLTF.clear(url);
  }, [scene, url]);

  return <primitive object={scene} />;
}

interface ModelSlotProps {
  slot: ModelSlotName;
  /** The procedural build, used when no GLB is configured and while one is loading. */
  children: ReactNode;
}

/**
 * Renders a supplied GLB for this set piece if one is configured in lib/assets.ts,
 * otherwise the procedural geometry passed as children.
 */
export function ModelSlot({ slot, children }: ModelSlotProps) {
  const url = MODEL_OVERRIDES[slot];
  if (!url) return <>{children}</>;
  return (
    <Suspense fallback={children}>
      <Model url={url} />
    </Suspense>
  );
}
