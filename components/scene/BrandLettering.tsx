'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import serifBold from 'three/examples/fonts/droid/droid_serif_bold.typeface.json';
import { chrome, polishedGold } from '@/lib/materials';

const font = new FontLoader().parse(serifBold as unknown as Parameters<FontLoader['parse']>[0]);

interface BrandLetteringProps {
  text?: string;
  /** Cap height in metres. */
  size: number;
  tone: 'gold' | 'chrome';
  /** 0..1 reveal. Omit for lettering that is always present. */
  level?: () => number;
  position?: [number, number, number];
}

/** Free-standing 3D lettering, centred on its position and standing on its baseline. */
export function BrandLettering({ text = 'EVENTGURU', size, tone, level, position }: BrandLetteringProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const animated = level !== undefined;
  const material = useMemo(() => {
    const m = tone === 'gold' ? polishedGold() : chrome();
    m.transparent = animated;
    return m;
  }, [tone, animated]);

  const geometry = useMemo(() => {
    const g = new TextGeometry(text, {
      font,
      size,
      depth: size * 0.3,
      curveSegments: 6,
      bevelEnabled: true,
      bevelThickness: size * 0.016,
      bevelSize: size * 0.012,
      bevelSegments: 2,
    });
    g.computeBoundingBox();
    const box = g.boundingBox!;
    g.translate(-(box.min.x + box.max.x) / 2, -box.min.y, 0);
    return g;
  }, [text, size]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  const baseY = position?.[1] ?? 0;
  useFrame(() => {
    if (!level || !mesh.current) return;
    const v = level();
    // Hidden by scale rather than `visible`, which the Zone component owns.
    mesh.current.scale.setScalar(v > 0.01 ? 1 : 0.0001);
    mesh.current.position.y = baseY - (1 - v) * size * 0.3;
    material.opacity = v;
  });

  return <mesh ref={mesh} geometry={geometry} material={material} position={position} castShadow />;
}
