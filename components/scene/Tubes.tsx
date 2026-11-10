'use client';

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Segment } from '@/lib/geometry';
import { revealGold } from '@/lib/materials';

const UP = new THREE.Vector3(0, 1, 0);

function writeMatrices(mesh: THREE.InstancedMesh, segments: Segment[], radius: number) {
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const p = new THREE.Vector3();
  const s = new THREE.Vector3();
  const d = new THREE.Vector3();
  segments.forEach((seg, i) => {
    d.copy(seg.b).sub(seg.a);
    const len = d.length();
    q.setFromUnitVectors(UP, d.normalize());
    p.copy(seg.a).add(seg.b).multiplyScalar(0.5);
    s.set(radius, len + radius, radius); // slight overlap closes the joints
    mesh.setMatrixAt(i, m.compose(p, q, s));
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
}

interface TubesProps {
  segments: Segment[];
  radius?: number;
  material: THREE.Material;
  sides?: number;
  castShadow?: boolean;
}

/** Many straight members drawn in one call (trusses, hanging wires). */
export function Tubes({ segments, radius = 0.03, material, sides = 5, castShadow }: TubesProps) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => new THREE.CylinderGeometry(1, 1, 1, sides, 1, true), [sides]);
  useLayoutEffect(() => {
    if (ref.current) writeMatrices(ref.current, segments, radius);
  }, [segments, radius]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <instancedMesh ref={ref} args={[geometry, material, segments.length]} castShadow={castShadow} />;
}

interface GlowFrameProps {
  segments: Segment[];
  radius?: number;
  /** 0..1 – how far the light has travelled through the structure. */
  reveal: () => number;
  /** Steady brightness of lit members. Defaults to 1. */
  glow?: () => number;
  color?: string;
  castShadow?: boolean;
}

/** Gold framework with integrated LED lines that illuminate progressively. */
export function GlowFrame({ segments, radius = 0.06, reveal, glow, color, castShadow }: GlowFrameProps) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { material, uniforms } = useMemo(() => revealGold(color), [color]);
  const geometry = useMemo(() => {
    const g = new THREE.CylinderGeometry(1, 1, 1, 8, 1);
    g.setAttribute(
      'aOrder',
      new THREE.InstancedBufferAttribute(Float32Array.from(segments.map((s) => s.order)), 1),
    );
    return g;
  }, [segments]);
  useLayoutEffect(() => {
    if (ref.current) writeMatrices(ref.current, segments, radius);
  }, [segments, radius]);
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );
  useFrame(() => {
    uniforms.uReveal.value = reveal();
    uniforms.uGlow.value = glow ? glow() : 1;
  });
  return <instancedMesh ref={ref} args={[geometry, material, segments.length]} castShadow={castShadow} />;
}
