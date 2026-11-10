'use client';

import { useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { fx } from '@/store/fx';
import { useShow } from '@/store/useShow';

interface ZoneProps {
  /** Timeline window (seconds) in which this part of the venue can be on camera. */
  from?: number;
  to?: number;
  children: ReactNode;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

type Drawable = THREE.Object3D & { isMesh?: boolean; isPoints?: boolean; isLine?: boolean };

/**
 * Stops drawing a part of the venue while it is off camera.
 *
 * Only drawable objects are switched; lights are left alone on purpose. Three.js bakes the
 * number of active lights into every shader, so hiding a light would force a recompile
 * (a visible stutter) each time a zone changed. Everything is drawn until the scene is
 * ready so that shaders and textures are prepared behind the loading screen.
 */
export function Zone({ from = -Infinity, to = Infinity, children, ...props }: ZoneProps) {
  const ref = useRef<THREE.Group>(null);
  const shown = useRef<boolean | null>(null);
  const frame = useRef(0);
  useFrame(() => {
    if (!ref.current) return;
    const warmingUp = !useShow.getState().ready;
    const show = warmingUp || (fx.time >= from && fx.time <= to);
    // Re-apply about once a second as well, to catch anything remounted by a quality change.
    frame.current = (frame.current + 1) % 60;
    if (show === shown.current && frame.current !== 0) return;
    shown.current = show;
    ref.current.traverse((o: Drawable) => {
      if (o.isMesh || o.isPoints || o.isLine) o.visible = show;
    });
  });
  return (
    <group ref={ref} {...props}>
      {children}
    </group>
  );
}
