'use client';

import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { fx } from '@/store/fx';
import { useShow } from '@/store/useShow';
import { QUALITY } from '@/lib/quality';
import { rng } from '@/lib/geometry';

/** Fine gold dust that drifts through the venue. Deliberately sparse. */
export function Particles() {
  const count = QUALITY[useShow((s) => s.quality)].particles;
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);

  const { geometry, material } = useMemo(() => {
    const rand = rng(1939);
    const position = new Float32Array(count * 3);
    const seed = new Float32Array(count * 3);
    const between = (a: number, b: number) => a + rand() * (b - a);
    for (let i = 0; i < count; i++) {
      const pick = rand();
      let x: number, y: number, z: number;
      if (pick < 0.5) {
        // approach corridor: intro diamond to the gate
        x = between(-9, 9); y = between(0.3, 9); z = between(38, 92);
      } else if (pick < 0.7) {
        // main hall
        x = between(-24, 30); y = between(0.5, 12); z = between(-28, 30);
      } else {
        // around the installations
        x = between(26, 46); y = between(0.4, 9); z = between(-24, 28);
      }
      position.set([x, y, z], i * 3);
      seed.set([rand(), rand(), rand()], i * 3);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 3));
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uScale: { value: 1 },
      },
      vertexShader: /* glsl */ `
        attribute vec3 aSeed;
        uniform float uTime;
        uniform float uScale;
        varying float vTwinkle;
        void main() {
          vec3 p = position;
          float t = uTime * (0.12 + aSeed.x * 0.2);
          p.x += sin(t + aSeed.y * 6.283) * 0.6;
          p.y += sin(t * 0.7 + aSeed.z * 6.283) * 0.45 + uTime * 0.02 * aSeed.x;
          p.z += cos(t * 0.8 + aSeed.x * 6.283) * 0.6;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vTwinkle = 0.55 + 0.45 * sin(uTime * (0.8 + aSeed.y * 2.0) + aSeed.z * 6.283);
          gl_PointSize = (0.035 + aSeed.z * 0.07) * uScale / max(0.5, -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        varying float vTwinkle;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(vec3(1.0, 0.82, 0.5) * 1.3, a * a * vTwinkle * uOpacity);
        }`,
    });
    return { geometry, material };
  }, [count]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uOpacity.value = fx.particles * 0.75;
    material.uniforms.uScale.value = size.height * dpr * 1.2;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
