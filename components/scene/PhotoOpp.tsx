'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { fx } from '@/store/fx';
import { boxEdgeSegments, crumpledPlane, type Segment } from '@/lib/geometry';
import { chrome, darkMetal, glossBlack } from '@/lib/materials';
import { GlowFrame, Tubes } from './Tubes';
import { LogoPlaque } from './LogoPlaque';
import { BrandLettering } from './BrandLettering';

const W = 11;
const H = 7.8;
const D = 3.6;
const WALL = 0.25;

/** Neon brilliant-cut outline mounted on the back wall, as in the reference. */
function neonDiamond(): Segment[] {
  const p: Record<string, [number, number]> = {
    tl: [-2.1, 1.15], tr: [2.1, 1.15], gl: [-3.35, 0.2], gr: [3.35, 0.2], c: [0, -3.1],
    t1: [-0.8, 1.15], t2: [0.8, 1.15], g1: [-1.55, 0.2], g2: [0, 0.2], g3: [1.55, 0.2],
  };
  const lines: [string, string][] = [
    ['tl', 'tr'], ['tl', 'gl'], ['tr', 'gr'], ['gl', 'gr'],
    ['tl', 'g1'], ['t1', 'g1'], ['t1', 'g2'], ['t2', 'g2'], ['t2', 'g3'], ['tr', 'g3'],
    ['gl', 'c'], ['g1', 'c'], ['g2', 'c'], ['g3', 'c'], ['gr', 'c'],
  ];
  return lines.map(([a, b]) => {
    const A = new THREE.Vector3(p[a][0], p[a][1], 0);
    const B = new THREE.Vector3(p[b][0], p[b][1], 0);
    return { a: A, b: B, order: THREE.MathUtils.clamp(1 - ((A.y + B.y) / 2 + 3.1) / 4.25, 0, 1) };
  });
}

const BALLS: { pos: [number, number, number]; r: number }[] = [
  { pos: [-3.5, 5.9, -0.3], r: 0.85 },
  { pos: [-4.1, 4.2, 0.45], r: 0.9 },
  { pos: [-3.1, 3.1, 0.3], r: 0.5 },
  { pos: [3.9, 6.0, -0.1], r: 0.95 },
  { pos: [4.0, 4.3, 0.5], r: 0.62 },
];

/**
 * Scene 5 – the photo opportunity: a black box frame lined with crumpled mirror foil,
 * LED-edged, with a neon diamond, mirror balls, the EventGuru sign and gold 3D lettering.
 * Local origin: centre of the box at floor level, open face towards +Z.
 */
export function PhotoOpp() {
  const built = useMemo(() => {
    const foil = new THREE.MeshStandardMaterial({
      vertexColors: true,
      metalness: 1,
      roughness: 0.12,
      side: THREE.DoubleSide,
      envMapIntensity: 1.5,
    });
    // Mirror tiles: unshared vertices keep every quad a flat facet.
    const ball = new THREE.SphereGeometry(1, 30, 20).toNonIndexed();
    ball.computeVertexNormals();
    const wires: Segment[] = BALLS.map(({ pos, r }) => ({
      a: new THREE.Vector3(pos[0], pos[1] + r, pos[2]),
      b: new THREE.Vector3(pos[0], H + WALL, pos[2]),
      order: 0,
    }));
    return {
      foil,
      ball,
      wires,
      back: crumpledPlane(W, H, 30, 22, 0.16, 21),
      side: crumpledPlane(D, H, 12, 22, 0.14, 22),
      top: crumpledPlane(W, D, 30, 12, 0.14, 23),
      black: glossBlack(),
      mirror: chrome(),
      metal: darkMetal(),
      // Inset just inside the foil so every line sits in front of the lining.
      edges: boxEdgeSegments(W - 0.44, H - 0.44, D - 0.1, WALL + 0.22),
      neon: neonDiamond(),
    };
  }, []);

  useEffect(
    () => () => {
      [built.foil, built.black, built.mirror, built.metal].forEach((m) => m.dispose());
      [built.ball, built.back, built.side, built.top].forEach((g) => g.dispose());
    },
    [built],
  );

  const balls = useRef<(THREE.Mesh | null)[]>([]);
  const key = useRef<THREE.SpotLight>(null);
  const kick = useRef<THREE.PointLight>(null);
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0, 3.6, -1);
    return o;
  }, []);

  useFrame(({ clock }, delta) => {
    if (fx.time < 16.5) return;
    balls.current.forEach((b, i) => b && (b.rotation.y += delta * (0.18 + i * 0.04)));
    const t = clock.elapsedTime;
    // A slow travelling light makes the foil facets catch and release highlights.
    if (kick.current) {
      kick.current.position.set(Math.sin(t * 0.5) * 4.2, 4 + Math.sin(t * 0.37) * 2, 2.6);
      kick.current.intensity = fx.photoGlow * 55;
    }
    if (key.current) key.current.intensity = (0.2 + fx.photoGlow * 0.8) * fx.wallGlow * 620;
    built.foil.envMapIntensity = 0.7 + fx.photoGlow * 0.9;
  });

  const cy = WALL + H / 2;

  return (
    <group>
      {/* Black box frame, open to the front */}
      <mesh position={[0, WALL / 2, 0]} material={built.black} receiveShadow>
        <boxGeometry args={[W + WALL * 2, WALL, D + WALL]} />
      </mesh>
      <mesh position={[0, WALL + H + WALL / 2, 0]} material={built.black} castShadow>
        <boxGeometry args={[W + WALL * 2, WALL, D + WALL]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (W / 2 + WALL / 2), cy, 0]} material={built.black} castShadow>
          <boxGeometry args={[WALL, H, D + WALL]} />
        </mesh>
      ))}
      <mesh position={[0, cy, -D / 2 - WALL / 2]} material={built.black}>
        <boxGeometry args={[W + WALL * 2, H + WALL * 2, WALL]} />
      </mesh>

      {/* Crumpled mirror-foil lining */}
      <mesh geometry={built.back} material={built.foil} position={[0, cy, -D / 2 + 0.18]} />
      <mesh geometry={built.side} material={built.foil} position={[-W / 2 + 0.16, cy, 0]} rotation={[0, Math.PI / 2, 0]} />
      <mesh geometry={built.side} material={built.foil} position={[W / 2 - 0.16, cy, 0]} rotation={[0, -Math.PI / 2, 0]} />
      <mesh geometry={built.top} material={built.foil} position={[0, WALL + H - 0.16, 0]} rotation={[Math.PI / 2, 0, 0]} />

      {/* LED lines on every inner edge, and the neon diamond */}
      <group position={[0, 0, 0.2]}>
        <GlowFrame segments={built.edges} radius={0.05} reveal={() => fx.photoGlow} glow={() => 1 + fx.finale * 0.3} />
      </group>
      <group position={[0, cy + 0.75, -D / 2 + 0.55]}>
        <GlowFrame segments={built.neon} radius={0.075} reveal={() => fx.photoGlow} glow={() => 1.5} color="#ffd070" />
      </group>

      {/* Mirror balls */}
      <Tubes segments={built.wires} radius={0.012} material={built.metal} sides={4} />
      {BALLS.map(({ pos, r }, i) => (
        <mesh
          key={i}
          ref={(m) => void (balls.current[i] = m)}
          geometry={built.ball}
          material={built.mirror}
          position={pos}
          scale={r}
          castShadow
        />
      ))}

      <LogoPlaque width={4.3} position={[0, cy + 0.55, -D / 2 + 0.95]} level={() => fx.photoLogo} />
      <BrandLettering size={1.0} tone="gold" position={[0, WALL, 0.75]} />

      <primitive object={target} />
      <spotLight ref={key} position={[-2, 8, 10]} target={target} color="#fff0d6" angle={0.75} penumbra={1} intensity={0} />
      <pointLight ref={kick} color="#ffe6bd" intensity={0} distance={12} decay={2} />
    </group>
  );
}
