'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { fx } from '@/store/fx';
import { useShow } from '@/store/useShow';
import { QUALITY } from '@/lib/quality';
import { crumpledPlane, latticePanel, normalizeUV, triPanel, type Segment } from '@/lib/geometry';
import { brushedGold, darkBronze, ledStrip, polishedGold } from '@/lib/materials';
import { glowTexture, LedScreen, marbleTexture, paintGateLed } from '@/lib/textures';
import { GlowFrame } from './Tubes';
import { LogoPlaque } from './LogoPlaque';

const WALL_HALF = 7.1;
const WALL_H = 9;
const PORTAL_HALF = 2.9;
const PORTAL_H = 6.6;

/*
 * Faceted side structure, measured from the reference elevation (x grows outward from the
 * LED wall, y up, z towards the guest). Seven triangular facets fold around a raised node.
 */
const V = {
  innerTop: new THREE.Vector3(0, 9, 0),
  peak: new THREE.Vector3(5.8, 6.25, 0.25),
  outerBase: new THREE.Vector3(6.35, 0, 0),
  node: new THREE.Vector3(2.45, 3.8, 0.95),
  innerMid: new THREE.Vector3(0, 4.45, 0),
  innerBase: new THREE.Vector3(0, 0, 0),
  baseOuter: new THREE.Vector3(3.9, 0, 0.5),
  baseMid: new THREE.Vector3(2.45, 0, 0.2),
};

type FacetKind = 'lattice' | 'marble' | 'gold' | 'bronze';
const FACETS: { kind: FacetKind; pts: [THREE.Vector3, THREE.Vector3, THREE.Vector3] }[] = [
  { kind: 'lattice', pts: [V.innerTop, V.node, V.peak] },
  { kind: 'marble', pts: [V.innerTop, V.innerMid, V.node] },
  { kind: 'marble', pts: [V.peak, V.node, V.baseOuter] },
  { kind: 'gold', pts: [V.peak, V.baseOuter, V.outerBase] },
  { kind: 'lattice', pts: [V.node, V.innerMid, V.innerBase] },
  { kind: 'marble', pts: [V.node, V.innerBase, V.baseMid] },
  { kind: 'bronze', pts: [V.node, V.baseMid, V.baseOuter] },
];

function SideStructure({ mirrored }: { mirrored?: boolean }) {
  const quality = useShow((s) => s.quality);
  const rows = QUALITY[quality].latticeDetail;

  const built = useMemo(() => {
    const marble = marbleTexture();
    const materials = {
      lattice: polishedGold(),
      gold: brushedGold(),
      bronze: darkBronze(),
      marble: new THREE.MeshStandardMaterial({
        map: marble,
        emissiveMap: marble,
        emissive: new THREE.Color('#ffe2b0'),
        emissiveIntensity: 0,
        roughness: 0.35,
        metalness: 0,
      }),
      backlight: ledStrip('#ffcf8a'),
    };
    Object.values(materials).forEach((m) => (m.side = THREE.DoubleSide));

    const facets = FACETS.map(({ kind, pts: [a, b, c] }, i) => ({
      kind,
      geometry: kind === 'lattice' ? latticePanel(a, b, c, rows, 0.1, 40 + i) : triPanel(a, b, c, 0.1),
      // A glowing sheet set behind each lattice screen so the cut-outs read as light.
      backlight: kind === 'lattice' ? triPanel(a, b, c, 0.02).translate(0, 0, -0.32) : null,
    }));

    // Every facet edge carries an LED line; the light runs outward from the portal.
    const seen = new Set<string>();
    const edges: Segment[] = [];
    const key = (p: THREE.Vector3) => `${p.x},${p.y},${p.z}`;
    FACETS.forEach(({ pts }) => {
      for (let k = 0; k < 3; k++) {
        const a = pts[k];
        const b = pts[(k + 1) % 3];
        const id = [key(a), key(b)].sort().join('|');
        if (seen.has(id)) continue;
        seen.add(id);
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const lift = new THREE.Vector3(0, 0, 0.07);
        edges.push({
          a: a.clone().add(lift),
          b: b.clone().add(lift),
          order: THREE.MathUtils.clamp(mid.x / 6.35 * 0.7 + (mid.y / 9) * 0.3, 0, 1),
        });
      }
    });
    return { materials, facets, edges, marble };
  }, [rows]);

  useEffect(
    () => () => {
      built.facets.forEach((f) => {
        f.geometry.dispose();
        f.backlight?.dispose();
      });
      Object.values(built.materials).forEach((m) => m.dispose());
      built.marble.dispose();
    },
    [built],
  );

  useFrame(() => {
    built.materials.marble.emissiveIntensity = fx.gateGlow * 0.5;
    built.materials.backlight.emissiveIntensity = fx.gateGlow * 1.6;
  });

  return (
    <group position={[mirrored ? -WALL_HALF : WALL_HALF, 0, 0]} scale={[mirrored ? -1 : 1, 1, 1]}>
      {built.facets.map((f, i) => (
        <group key={i}>
          <mesh geometry={f.geometry} material={built.materials[f.kind]} castShadow />
          {f.backlight && <mesh geometry={f.backlight} material={built.materials.backlight} />}
        </group>
      ))}
      <GlowFrame
        segments={built.edges}
        radius={0.045}
        reveal={() => fx.gateTrace}
        glow={() => 0.35 + fx.gateGlow * 0.9}
      />
    </group>
  );
}

function LedWall() {
  const screen = useMemo(() => new LedScreen(1024, 648, paintGateLed), []);
  const geometry = useMemo(() => {
    // One continuous LED face wrapping around the portal opening.
    const shape = new THREE.Shape([
      new THREE.Vector2(-WALL_HALF, 0),
      new THREE.Vector2(-WALL_HALF, WALL_H),
      new THREE.Vector2(WALL_HALF, WALL_H),
      new THREE.Vector2(WALL_HALF, 0),
      new THREE.Vector2(PORTAL_HALF, 0),
      new THREE.Vector2(PORTAL_HALF, PORTAL_H),
      new THREE.Vector2(-PORTAL_HALF, PORTAL_H),
      new THREE.Vector2(-PORTAL_HALF, 0),
    ]);
    return normalizeUV(new THREE.ShapeGeometry(shape));
  }, []);
  const back = useMemo(() => geometry.clone().translate(0, 0, -0.3), [geometry]);
  const material = useRef<THREE.MeshBasicMaterial>(null);

  useEffect(
    () => () => {
      screen.dispose();
      geometry.dispose();
      back.dispose();
    },
    [screen, geometry, back],
  );

  useFrame(({ clock }) => {
    if (fx.time > 13) return; // the gate is behind the camera by now
    screen.update(clock.elapsedTime, fx.gateLed);
    if (material.current) material.current.color.setScalar(0.82 + fx.finale * 0.1);
  });

  return (
    <group>
      <mesh geometry={geometry}>
        <meshBasicMaterial ref={material} map={screen.texture} toneMapped={false} />
      </mesh>
      <mesh geometry={back}>
        <meshStandardMaterial color="#0a0908" metalness={0.6} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Portal() {
  const gold = useMemo(() => polishedGold(), []);
  const foilMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        metalness: 1,
        roughness: 0.14,
        side: THREE.DoubleSide,
        envMapIntensity: 1.5,
      }),
    [],
  );
  const foil = useMemo(
    () => ({
      side: crumpledPlane(3.6, 6.4, 12, 20, 0.11, 3),
      top: crumpledPlane(5.2, 3.6, 16, 12, 0.11, 4),
    }),
    [],
  );
  const lintelLed = useMemo(() => ledStrip(), []);
  useEffect(
    () => () => {
      gold.dispose();
      foilMaterial.dispose();
      foil.side.dispose();
      foil.top.dispose();
      lintelLed.dispose();
    },
    [gold, foilMaterial, foil, lintelLed],
  );
  useFrame(() => {
    lintelLed.emissiveIntensity = fx.gateGlow * 2;
  });

  return (
    <group>
      {/* Outer polished-gold frame standing proud of the LED wall */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 3.15, 3.45, 0.5]} material={gold} castShadow>
          <boxGeometry args={[0.5, 6.9, 1.8]} />
        </mesh>
      ))}
      <mesh position={[0, 6.85, 0.5]} material={gold} castShadow>
        <boxGeometry args={[6.8, 0.5, 1.8]} />
      </mesh>
      {/* LED reveal line inside the outer frame */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 2.88, 3.3, 1.38]} material={lintelLed}>
          <boxGeometry args={[0.05, 6.6, 0.05]} />
        </mesh>
      ))}
      <mesh position={[0, 6.58, 1.38]} material={lintelLed}>
        <boxGeometry args={[5.8, 0.05, 0.05]} />
      </mesh>
      {/* Crumpled mirror-foil tunnel lining */}
      <mesh geometry={foil.side} material={foilMaterial} position={[-2.62, 3.2, -0.6]} rotation={[0, Math.PI / 2, 0]} />
      <mesh geometry={foil.side} material={foilMaterial} position={[2.62, 3.2, -0.6]} rotation={[0, -Math.PI / 2, 0]} />
      <mesh geometry={foil.top} material={foilMaterial} position={[0, 6.42, -0.6]} rotation={[Math.PI / 2, 0, 0]} />
      {/* Inner gold frame at the hall end of the tunnel */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 2.5, 3.2, -2.5]} material={gold}>
          <boxGeometry args={[0.3, 6.4, 0.5]} />
        </mesh>
      ))}
      <mesh position={[0, 6.3, -2.5]} material={gold}>
        <boxGeometry args={[5.3, 0.3, 0.5]} />
      </mesh>
    </group>
  );
}

function RedCarpet() {
  const edge = useMemo(() => ledStrip('#ffc978'), []);
  const light = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0, 0, 8);
    return o;
  }, []);
  useEffect(() => () => edge.dispose(), [edge]);
  useFrame(() => {
    edge.emissiveIntensity = fx.carpetGlow * 1.8;
    if (light.current) light.current.intensity = fx.carpetGlow * 520;
  });
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 4]} receiveShadow>
        <planeGeometry args={[5.2, 34]} />
        <meshPhysicalMaterial
          color="#a50d14"
          roughness={0.92}
          metalness={0}
          sheen={1}
          sheenRoughness={0.45}
          sheenColor="#ff5a4a"
        />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 2.63, 0.035, 4]} material={edge}>
          <boxGeometry args={[0.05, 0.03, 34]} />
        </mesh>
      ))}
      <primitive object={target} />
      <spotLight
        ref={light}
        position={[0, 10, 12]}
        target={target}
        color="#ffd9a0"
        angle={0.5}
        penumbra={0.9}
        intensity={0}
        decay={2}
      />
    </group>
  );
}

function BaseGlows() {
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: glowTexture(),
        color: '#ffbf66',
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );
  useEffect(
    () => () => {
      material.map?.dispose();
      material.dispose();
    },
    [material],
  );
  useFrame(() => {
    material.opacity = fx.gateGlow * 0.55;
  });
  // Floor uplights at the feet of the side structures, as in the reference.
  const spots = [-13.2, -11, -7.4, 7.4, 11, 13.2];
  return (
    <group>
      {spots.map((x) => (
        <mesh key={x} position={[x, 1.1, 1.3]} material={material}>
          <planeGeometry args={[3.2, 3.2]} />
        </mesh>
      ))}
    </group>
  );
}

/** Scene 2 – the grand LED entrance gate. Local origin: centre of the portal at floor level. */
export function EntranceGate() {
  const key = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0, 4, 0);
    return o;
  }, []);
  useFrame(() => {
    if (key.current) key.current.intensity = fx.gateGlow * 900;
  });
  return (
    <group>
      <LedWall />
      <Portal />
      <SideStructure />
      <SideStructure mirrored />
      <LogoPlaque width={5} position={[0, 7.95, 0.12]} level={() => Math.max(0.12, fx.gateLed)} />
      <RedCarpet />
      <BaseGlows />
      <primitive object={target} />
      <spotLight
        ref={key}
        position={[0, 11, 17]}
        target={target}
        color="#ffe1b0"
        angle={0.85}
        penumbra={1}
        intensity={0}
        decay={2}
      />
    </group>
  );
}
