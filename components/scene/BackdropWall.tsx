'use client';

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { fx } from '@/store/fx';
import { uplightTexture } from '@/lib/textures';

const LENGTH = 72;
const HEIGHT = 12;
const PITCH = 0.48;
const LIGHT_PITCH = 4;

/**
 * Fluted dark feature wall with warm floor uplights, standing behind the installations
 * exactly as in the reference renders. Local origin: wall centre at floor level, facing +Z.
 */
export function BackdropWall() {
  const slats = useRef<THREE.InstancedMesh>(null);
  const washes = useRef<THREE.InstancedMesh>(null);
  const slatCount = Math.floor(LENGTH / PITCH);
  const lightCount = Math.floor(LENGTH / LIGHT_PITCH);

  const wash = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: uplightTexture(),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );
  useEffect(
    () => () => {
      wash.map?.dispose();
      wash.dispose();
    },
    [wash],
  );

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    if (slats.current) {
      for (let i = 0; i < slatCount; i++) {
        // Alternate depths give the wall its ribbed shadow lines.
        m.makeTranslation(-LENGTH / 2 + (i + 0.5) * PITCH, HEIGHT / 2, i % 2 === 0 ? 0 : -0.12);
        slats.current.setMatrixAt(i, m);
      }
      slats.current.instanceMatrix.needsUpdate = true;
    }
    if (washes.current) {
      for (let i = 0; i < lightCount; i++) {
        m.makeTranslation(-LENGTH / 2 + (i + 0.5) * LIGHT_PITCH, 5, 0.32);
        washes.current.setMatrixAt(i, m);
      }
      washes.current.instanceMatrix.needsUpdate = true;
    }
  }, [slatCount, lightCount]);

  useFrame(() => {
    wash.opacity = fx.wallGlow * (0.55 + fx.finale * 0.25);
  });

  return (
    <group>
      <mesh position={[0, HEIGHT / 2, -0.5]}>
        <planeGeometry args={[LENGTH, HEIGHT]} />
        <meshStandardMaterial color="#030303" roughness={0.9} />
      </mesh>
      <instancedMesh ref={slats} args={[undefined, undefined, slatCount]} frustumCulled={false}>
        <boxGeometry args={[PITCH * 0.62, HEIGHT, 0.3]} />
        <meshStandardMaterial color="#0d0c0b" metalness={0.75} roughness={0.36} />
      </instancedMesh>
      <instancedMesh ref={washes} args={[undefined, wash, lightCount]} frustumCulled={false}>
        <planeGeometry args={[3.4, 10]} />
      </instancedMesh>
    </group>
  );
}
