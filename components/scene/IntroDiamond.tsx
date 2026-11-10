'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { fx } from '@/store/fx';
import { useShow } from '@/store/useShow';
import { QUALITY } from '@/lib/quality';
import { brilliantGeometry, brilliantSegments } from '@/lib/geometry';
import { beamMaterial } from '@/lib/materials';
import { glowTexture } from '@/lib/textures';
import { GlowFrame } from './Tubes';

const CUT = { girdle: 2.5, table: 1.42, crown: 0.9, pavilion: 2.15 };

/**
 * Scene 1 – a brilliant-cut diamond emerging from darkness. A faceted glass body sits inside
 * a fine gold wire outline; the outline lights first so the silhouette appears before the stone.
 */
export function IntroDiamond() {
  const transmission = QUALITY[useShow((s) => s.quality)].transmission;
  const spin = useRef<THREE.Group>(null);
  const root = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);

  const built = useMemo(() => {
    const glass = transmission
      ? new THREE.MeshPhysicalMaterial({
          color: '#ffffff',
          metalness: 0,
          roughness: 0.02,
          transmission: 1,
          ior: 2.4,
          thickness: 2.2,
          attenuationColor: new THREE.Color('#ffe7bd'),
          attenuationDistance: 6,
          specularIntensity: 1,
          clearcoat: 1,
          envMapIntensity: 2.4,
          side: THREE.DoubleSide,
          transparent: true,
        })
      : new THREE.MeshStandardMaterial({
          color: '#fff6e6',
          metalness: 1,
          roughness: 0.04,
          envMapIntensity: 2,
          side: THREE.DoubleSide,
          transparent: true,
        });
    return {
      glass,
      body: brilliantGeometry(CUT),
      outline: brilliantSegments(CUT),
      halo: new THREE.MeshBasicMaterial({
        map: glowTexture(),
        color: '#ffb650',
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
      shaft: beamMaterial('#ffd9a0'),
      cone: new THREE.ConeGeometry(3.4, 14, 24, 1, true).translate(0, -7, 0),
    };
  }, [transmission]);

  useEffect(
    () => () => {
      built.glass.dispose();
      built.body.dispose();
      built.halo.map?.dispose();
      built.halo.dispose();
      built.shaft.dispose();
      built.cone.dispose();
    },
    [built],
  );

  useFrame(({ scene }, delta) => {
    if (fx.time > 5.2 && useShow.getState().ready) return;
    const d = fx.introDiamond;
    // The venue's reflected light is still near zero here, so the stone compensates:
    // its own reflections follow the diamond channel, independent of the room level.
    built.glass.envMapIntensity = (2.4 * d) / Math.max(scene.environmentIntensity, 0.02);
    if (spin.current) spin.current.rotation.y += delta * 0.22;
    if (root.current) {
      // Swells very slightly into place as it appears.
      root.current.scale.setScalar(0.86 + d * 0.14);
    }
    built.glass.opacity = THREE.MathUtils.smoothstep(d, 0.25, 1);
    built.halo.opacity = fx.introGlow * 0.5;
    built.shaft.uniforms.uIntensity.value = fx.introGlow * 0.1;
    if (light.current) light.current.intensity = fx.introGlow * 160;
  });

  return (
    <group ref={root}>
      {/* The distant golden light the diamond is first seen against */}
      <mesh position={[0, 0.4, -7]} material={built.halo}>
        <planeGeometry args={[26, 26]} />
      </mesh>
      <mesh position={[0, 11, -1]} geometry={built.cone} material={built.shaft} />
      <group ref={spin} rotation={[0.16, 0, 0.05]}>
        <mesh geometry={built.body} material={built.glass} />
        <GlowFrame
          segments={built.outline}
          radius={0.014}
          reveal={() => fx.introDiamond}
          glow={() => 0.7}
          color="#ffdca0"
        />
      </group>
      <pointLight ref={light} position={[0, 2.5, 5]} color="#ffcf8a" intensity={0} distance={30} decay={2} />
    </group>
  );
}
