'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { fx } from '@/store/fx';
import { useShow } from '@/store/useShow';
import { QUALITY } from '@/lib/quality';
import { brilliantSegments } from '@/lib/geometry';
import { glossBlack, ledStrip, polishedGold } from '@/lib/materials';
import { glowTexture } from '@/lib/textures';
import { GlowFrame } from './Tubes';
import { LogoPlaque } from './LogoPlaque';
import { BrandLettering } from './BrandLettering';

const PLATFORM_H = 0.4;
const PAVILION = 4.4;
const CUT = { girdle: 5.2, table: 2.9, crown: 1.9, pavilion: PAVILION, depthScale: 0.6 };
const INNER = 0.8;

/**
 * Scenes 4 and 6 – the signature diamond installation: a brilliant-cut framework of gold
 * members with integrated LED lines, standing on its culet on an oval black-and-gold plinth.
 * Local origin: centre of the plinth at floor level, facing +Z.
 */
export function DiamondInstallation() {
  const shadows = QUALITY[useShow((s) => s.quality)].shadows;

  const built = useMemo(() => {
    const outer = brilliantSegments(CUT);
    // A second, smaller cut nested inside gives the doubled line-work seen in the reference.
    const inner = brilliantSegments({
      girdle: CUT.girdle * INNER,
      table: CUT.table * INNER * 0.9,
      crown: CUT.crown * INNER,
      pavilion: PAVILION * INNER,
      depthScale: CUT.depthScale,
    }).map((s) => ({ ...s, order: Math.min(1, s.order * 0.9 + 0.1) }));
    return {
      outer,
      inner,
      black: glossBlack(),
      gold: polishedGold(),
      rim: ledStrip('#ffd08a'),
      halo: new THREE.MeshBasicMaterial({
        map: glowTexture(),
        color: '#ffb857',
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    };
  }, []);

  useEffect(
    () => () => {
      built.black.dispose();
      built.gold.dispose();
      built.rim.dispose();
      built.halo.map?.dispose();
      built.halo.dispose();
    },
    [built],
  );

  const key = useRef<THREE.SpotLight>(null);
  const fill = useRef<THREE.PointLight>(null);
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0, 3.6, 0);
    return o;
  }, []);

  useFrame(() => {
    const lit = fx.diamondReveal;
    built.rim.emissiveIntensity = lit * (2 + fx.finale * 1.2);
    built.halo.opacity = lit * 0.28 + fx.finale * 0.14;
    if (key.current) {
      key.current.intensity = (0.25 + lit * 0.75) * fx.wallGlow * 900;
      // Stop re-rendering the shadow map before the installation is on camera.
      key.current.shadow.autoUpdate = fx.time >= 16 || !useShow.getState().ready;
    }
    if (fill.current) fill.current.intensity = lit * (70 + fx.finale * 60);
  });

  const glow = () => 0.95 + fx.finale * 0.55;

  return (
    <group>
      {/* Oval plinth */}
      <group scale={[1.25, 1, 1]}>
        <mesh position={[0, PLATFORM_H / 2, 0]} material={built.black} receiveShadow castShadow>
          <cylinderGeometry args={[4.4, 4.5, PLATFORM_H, 96]} />
        </mesh>
        <mesh position={[0, PLATFORM_H - 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} material={built.rim}>
          <torusGeometry args={[4.43, 0.035, 8, 128]} />
        </mesh>
        <mesh position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]} material={built.gold}>
          <torusGeometry args={[4.52, 0.05, 8, 128]} />
        </mesh>
      </group>
      {/* Light pooled on the floor around the plinth */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} material={built.halo}>
        <planeGeometry args={[22, 18]} />
      </mesh>

      {/* Brilliant-cut framework, culet resting on the plinth */}
      <group position={[0, PLATFORM_H + PAVILION, 0]}>
        <GlowFrame segments={built.outer} radius={0.075} reveal={() => fx.diamondReveal} glow={glow} castShadow />
        <group position={[0, -PAVILION * (1 - INNER), 0]}>
          <GlowFrame segments={built.inner} radius={0.045} reveal={() => fx.diamondReveal} glow={glow} />
        </group>
      </group>

      <LogoPlaque width={4.7} position={[0, PLATFORM_H + PAVILION + 0.35, 3.3]} level={() => fx.diamondLogo} />
      <BrandLettering size={0.72} tone="chrome" position={[0, PLATFORM_H, 3.1]} level={() => fx.diamondText} />

      <primitive object={target} />
      <spotLight
        ref={key}
        position={[3, 10, 12]}
        target={target}
        color="#ffe2b4"
        angle={0.6}
        penumbra={1}
        intensity={0}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      <pointLight ref={fill} position={[0, 4.5, -2.4]} color="#ffb85c" intensity={0} distance={18} decay={2} />
    </group>
  );
}
