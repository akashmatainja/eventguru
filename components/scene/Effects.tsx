'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Bloom,
  BrightnessContrast,
  DepthOfField,
  EffectComposer,
  HueSaturation,
  N8AO,
  Noise,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode, type DepthOfFieldEffect } from 'postprocessing';
import { useShow } from '@/store/useShow';
import { focusPoint } from '@/components/camera/CameraRig';

/**
 * Finishing: ambient occlusion, focus pull, restrained bloom and a warm film grade.
 * Bloom is thresholded high so only LED lines and hot speculars glow; surfaces keep detail.
 * Mobile gets bloom, tone mapping and vignette only.
 */
export function Effects() {
  const quality = useShow((s) => s.quality);
  const dof = useRef<DepthOfFieldEffect>(null);

  useFrame(() => {
    // Focus follows whatever the camera is looking at.
    dof.current?.target?.copy(focusPoint);
  });

  if (quality === 'low') {
    return (
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.2} intensity={0.6} radius={0.7} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette offset={0.28} darkness={0.72} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={4}>
      <N8AO halfRes aoRadius={1.4} distanceFalloff={1} intensity={1.6} quality="medium" />
      <DepthOfField ref={dof} target={focusPoint} worldFocusRange={20} bokehScale={2.2} resolutionScale={0.5} />
      <Bloom mipmapBlur luminanceThreshold={0.82} luminanceSmoothing={0.22} intensity={0.72} radius={0.74} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <HueSaturation saturation={0.06} />
      <BrightnessContrast brightness={-0.01} contrast={0.08} />
      <Vignette offset={0.26} darkness={0.78} />
      <Noise premultiply blendFunction={BlendFunction.SCREEN} opacity={0.18} />
    </EffectComposer>
  );
}
