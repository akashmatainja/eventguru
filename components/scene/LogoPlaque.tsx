'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { getWordmark, LOGO_ASPECT } from '@/lib/textures';

interface LogoPlaqueProps {
  width: number;
  /** 0..1 illumination. Omit for an always-lit sign. */
  level?: () => number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

/** Illuminated sign box carrying the EventGuru wordmark (see getWordmark in lib/textures.ts). */
export function LogoPlaque({ width, level, ...props }: LogoPlaqueProps) {
  const texture = getWordmark().texture;
  const face = useRef<THREE.MeshBasicMaterial>(null);
  const group = useRef<THREE.Group>(null);
  const height = width / LOGO_ASPECT;

  useFrame(() => {
    const v = level ? level() : 1;
    if (group.current) group.current.visible = v > 0.01;
    if (face.current) {
      face.current.opacity = Math.min(1, v * 1.4);
      face.current.color.setScalar(0.25 + 0.7 * v);
    }
  });

  return (
    <group ref={group} {...props}>
      <mesh position={[0, 0, -0.08]}>
        <boxGeometry args={[width + 0.06, height + 0.06, 0.14]} />
        <meshStandardMaterial color="#c99a45" metalness={1} roughness={0.3} />
      </mesh>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial ref={face} map={texture} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}
