'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { fx } from '@/store/fx';
import { useShow } from '@/store/useShow';
import { QUALITY } from '@/lib/quality';
import { archFrameGeometry, runwayShape, trussSegments } from '@/lib/geometry';
import { beamMaterial, darkMetal, glossBlack, ledStrip, polishedGold } from '@/lib/materials';
import {
  glowTexture,
  LedScreen,
  paintRing,
  paintStageAccent,
  paintStageCentre,
  paintStageSide,
  swirlTexture,
} from '@/lib/textures';
import { Tubes } from './Tubes';

const DECK_W = 44;
const DECK_D = 9;
const DECK_H = 1;
const RISER_H = 0.5;
const RUNWAY_LEN = 11;
const RUNWAY_R = 3.4;
const TRUSS_Y = 13.2;

const smooth = (a: number, b: number, x: number) => THREE.MathUtils.smoothstep(x, a, b);

/* ------------------------------------------------------------------ */

function Platform() {
  const built = useMemo(() => {
    const swirl = swirlTexture();
    swirl.repeat.set(9, 1);
    const swirlRunway = swirl.clone();
    swirlRunway.repeat.set(0.2, 1);
    swirlRunway.needsUpdate = true;
    const fascia = (map: THREE.Texture) =>
      new THREE.MeshStandardMaterial({
        map,
        emissiveMap: map,
        emissive: new THREE.Color('#ffb44a'),
        emissiveIntensity: 0,
        roughness: 0.3,
        metalness: 0.5,
      });
    const shape = runwayShape(5, RUNWAY_LEN, RUNWAY_R);
    const place = (g: THREE.BufferGeometry, top: number) => g.rotateX(Math.PI / 2).translate(0, top, 0);
    return {
      swirl,
      swirlRunway,
      black: glossBlack(),
      fasciaDeck: fascia(swirl),
      fasciaRunway: fascia(swirlRunway),
      led: ledStrip('#fff2d8'),
      hidden: new THREE.MeshBasicMaterial({ visible: false }),
      runway: place(new THREE.ExtrudeGeometry(shape, { depth: DECK_H, bevelEnabled: false, curveSegments: 40 }), DECK_H),
      // A hairline LED band wrapped around the runway's top edge.
      runwayRim: place(new THREE.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: false, curveSegments: 40 }), DECK_H + 0.01).scale(1.006, 1, 1.003),
    };
  }, []);

  useEffect(
    () => () => {
      Object.values(built).forEach((v) => v.dispose());
    },
    [built],
  );

  useFrame(() => {
    built.led.emissiveIntensity = fx.stageBase * 2.2;
    const e = fx.stageBase * 0.9 + fx.floorSweep * 0.3;
    built.fasciaDeck.emissiveIntensity = e;
    built.fasciaRunway.emissiveIntensity = e;
  });

  const riserTop = DECK_H + RISER_H;
  const riserFront = -0.1;
  const runwayEnd = DECK_D / 2 + RUNWAY_LEN + RUNWAY_R;

  return (
    <group>
      {/* Main deck */}
      <mesh position={[0, DECK_H / 2, 0]} material={built.black} receiveShadow castShadow>
        <boxGeometry args={[DECK_W, DECK_H, DECK_D]} />
      </mesh>
      <mesh position={[0, DECK_H / 2, DECK_D / 2 + 0.01]} material={built.fasciaDeck}>
        <planeGeometry args={[DECK_W, DECK_H]} />
      </mesh>
      <mesh position={[0, DECK_H, DECK_D / 2 + 0.02]} material={built.led}>
        <boxGeometry args={[DECK_W + 0.04, 0.05, 0.05]} />
      </mesh>

      {/* Upper riser and its steps */}
      <mesh position={[0, DECK_H + RISER_H / 2, -2.2]} material={built.black} receiveShadow castShadow>
        <boxGeometry args={[17, RISER_H, 4.2]} />
      </mesh>
      <mesh position={[0, riserTop, riserFront + 0.01]} material={built.led}>
        <boxGeometry args={[17.02, 0.04, 0.04]} />
      </mesh>
      {[0, 1].map((i) => {
        const top = riserTop - (RISER_H / 3) * (i + 1);
        const depth = 0.5;
        const z = riserFront + depth * (i + 0.5);
        return (
          <group key={i}>
            <mesh position={[0, (DECK_H + top) / 2, z]} material={built.black}>
              <boxGeometry args={[12 - i * 0.6, top - DECK_H, depth]} />
            </mesh>
            <mesh position={[0, top, z + depth / 2]} material={built.led}>
              <boxGeometry args={[12 - i * 0.6, 0.035, 0.035]} />
            </mesh>
          </group>
        );
      })}

      {/* Runway with round thrust */}
      <group position={[0, 0, DECK_D / 2]}>
        <mesh geometry={built.runway} material={[built.black, built.fasciaRunway]} receiveShadow castShadow />
        <mesh geometry={built.runwayRim} material={[built.hidden, built.led]} />
      </group>
      {[0, 1, 2].map((i) => {
        const h = DECK_H * (0.75 - i * 0.25);
        const z = runwayEnd - 0.25 + 0.45 * (i + 0.5);
        return (
          <group key={i}>
            <mesh position={[0, h / 2, z]} material={built.black}>
              <boxGeometry args={[3.6, h, 0.45]} />
            </mesh>
            <mesh position={[0, h, z + 0.225]} material={built.led}>
              <boxGeometry args={[3.6, 0.035, 0.035]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ------------------------------------------------------------------ */

function uvSlice(geometry: THREE.PlaneGeometry, u0: number, u1: number) {
  const uv = geometry.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setX(i, u0 + uv.getX(i) * (u1 - u0));
  return geometry;
}

interface PanelProps {
  w: number;
  h: number;
  material: THREE.Material;
  frame: THREE.Material;
  position: [number, number, number];
  rotationY?: number;
  slice?: [number, number];
}

function LedPanel({ w, h, material, frame, position, rotationY = 0, slice = [0, 1] }: PanelProps) {
  const face = useMemo(() => uvSlice(new THREE.PlaneGeometry(w, h), slice[0], slice[1]), [w, h, slice[0], slice[1]]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => face.dispose(), [face]);
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0, -0.14]} material={frame} castShadow>
        <boxGeometry args={[w + 0.12, h + 0.12, 0.26]} />
      </mesh>
      <mesh geometry={face} material={material} />
    </group>
  );
}

function Screens() {
  const built = useMemo(() => {
    const centre = new LedScreen(1536, 726, paintStageCentre);
    const side = new LedScreen(384, 700, paintStageSide, 15);
    const accent = new LedScreen(192, 640, paintStageAccent, 15);
    const ring = new LedScreen(1536, 192, paintRing, 15);
    const mat = (s: LedScreen) => new THREE.MeshBasicMaterial({ map: s.texture, toneMapped: false });
    return {
      screens: { centre, side, accent, ring },
      materials: { centre: mat(centre), side: mat(side), accent: mat(accent), ring: mat(ring) },
      frame: darkMetal(),
      gold: polishedGold(),
    };
  }, []);

  useEffect(
    () => () => {
      Object.values(built.screens).forEach((s) => s.dispose());
      Object.values(built.materials).forEach((m) => m.dispose());
      built.frame.dispose();
      built.gold.dispose();
    },
    [built],
  );

  useFrame(({ clock }) => {
    if (fx.time < 8 || fx.time > 20) return; // stage is off camera
    const t = clock.elapsedTime;
    const { screens, materials } = built;
    screens.centre.update(t, fx.stageLed, fx.stageIdentity);
    screens.side.update(t, smooth(0.15, 1, fx.stageLed));
    screens.accent.update(t, smooth(0.3, 1, fx.stageLed));
    screens.ring.update(t, smooth(0.05, 0.7, fx.stageLed));
    const level = 0.8;
    Object.values(materials).forEach((m) => m.color.setScalar(level));
  });

  const { materials: m, frame } = built;
  const baseC = DECK_H + RISER_H; // centre screen stands on the riser
  const wing = 0.31; // wing angle in radians

  return (
    <group>
      {/* Centre screen in three sections, wings angled towards the audience */}
      <LedPanel w={9} h={8.5} material={m.centre} frame={frame} position={[0, baseC + 4.25, -3.9]} slice={[0.25, 0.75]} />
      <LedPanel w={4.7} h={8.5} material={m.centre} frame={frame} position={[-6.73, baseC + 4.25, -3.2]} rotationY={wing} slice={[0, 0.25]} />
      <LedPanel w={4.7} h={8.5} material={m.centre} frame={frame} position={[6.73, baseC + 4.25, -3.2]} rotationY={-wing} slice={[0.75, 1]} />

      {[-1, 1].map((s) => (
        <group key={s}>
          <LedPanel w={3.6} h={7.4} material={m.side} frame={frame} position={[s * 11.3, DECK_H + 3.7, -2.9]} />
          <LedPanel w={2.6} h={8.6} material={m.accent} frame={frame} position={[s * 14.5, DECK_H + 4.3, -2.1]} rotationY={-s * 0.35} />
          <LedPanel w={5.4} h={10.2} material={m.side} frame={frame} position={[s * 18.6, DECK_H + 5.1, -0.9]} />
        </group>
      ))}

      {/* Circular LED header flown above the stage */}
      <group position={[0, 11.4, 1.6]}>
        <mesh material={m.ring}>
          <cylinderGeometry args={[3.3, 3.3, 1.5, 64, 1, true]} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[3.22, 3.22, 1.5, 48, 1, true]} />
          <meshStandardMaterial color="#080808" side={THREE.BackSide} />
        </mesh>
        {[-0.78, 0.78].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={built.gold}>
            <torusGeometry args={[3.31, 0.06, 8, 64]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */

const ARCHES: [number, number, number][] = [
  // width, height, z – outermost first
  [15.5, 8.7, -0.6],
  [12.2, 7.6, -1.5],
  [9.2, 6.5, -2.4],
  [6.6, 5.4, -3.2],
];

function Arches() {
  const built = useMemo(
    () => ({
      gold: polishedGold(),
      arches: ARCHES.map(([w, h, z]) => ({
        z,
        frame: archFrameGeometry(w, h, 0.45, 0.4),
        rim: archFrameGeometry(w - 0.9, h - 0.45, 0.07, 0.46),
        led: ledStrip('#ffdca0'),
      })),
    }),
    [],
  );
  useEffect(
    () => () => {
      built.gold.dispose();
      built.arches.forEach((a) => {
        a.frame.dispose();
        a.rim.dispose();
        a.led.dispose();
      });
    },
    [built],
  );
  useFrame(() => {
    // One after another, front to back.
    built.arches.forEach((a, i) => {
      const on = smooth(i / 4, i / 4 + 0.3, fx.archReveal);
      a.led.emissiveIntensity = on * (2.4 + fx.finale);
    });
  });
  return (
    <group position={[0, DECK_H + RISER_H, 0]}>
      {built.arches.map((a, i) => (
        <group key={i} position={[0, 0, a.z]}>
          <mesh geometry={a.frame} material={built.gold} castShadow />
          <mesh geometry={a.rim} material={a.led} />
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */

const DOWN = new THREE.Vector3(0, -1, 0);
const BEAM_COLOURS = ['#fff1d6', '#cfe0ff', '#ffd9a0'];

function Rigging() {
  const quality = useShow((s) => s.quality);
  const { beamCount, shadows } = QUALITY[quality];

  const built = useMemo(() => {
    const bay = quality === 'high' ? 1 : 2;
    const x = DECK_W / 2 + 1.5;
    const v = (a: number, b: number, c: number) => new THREE.Vector3(a, b, c);
    const truss = [
      ...trussSegments(v(-x, TRUSS_Y, 6.5), v(x, TRUSS_Y, 6.5), 0.5, bay),
      ...trussSegments(v(-x, TRUSS_Y, -3.5), v(x, TRUSS_Y, -3.5), 0.5, bay),
      ...trussSegments(v(-x, TRUSS_Y, -3.5), v(-x, TRUSS_Y, 6.5), 0.5, bay),
      ...trussSegments(v(x, TRUSS_Y, -3.5), v(x, TRUSS_Y, 6.5), 0.5, bay),
      ...[-1, 1].flatMap((sx) =>
        [-3.5, 6.5].flatMap((z) => trussSegments(v(sx * x, 0, z), v(sx * x, TRUSS_Y, z), 0.5, bay)),
      ),
    ];
    const cone = new THREE.ConeGeometry(1.25, 17, 20, 1, true).translate(0, -8.5, 0);
    const head = new THREE.CylinderGeometry(0.22, 0.28, 0.5, 12).translate(0, 0.1, 0);
    const beams = Array.from({ length: beamCount }, (_, i) => {
      const front = i % 2 === 0;
      const u = beamCount > 1 ? i / (beamCount - 1) : 0.5;
      return {
        origin: v((u - 0.5) * (DECK_W - 4), TRUSS_Y - 0.5, front ? 6.5 : -3.5),
        material: beamMaterial(BEAM_COLOURS[i % BEAM_COLOURS.length]),
        phase: i * 1.37,
        front,
      };
    });
    return { truss, cone, head, beams, metal: darkMetal() };
  }, [beamCount, quality]);

  useEffect(
    () => () => {
      built.cone.dispose();
      built.head.dispose();
      built.metal.dispose();
      built.beams.forEach((b) => b.material.dispose());
    },
    [built],
  );

  const groups = useRef<(THREE.Group | null)[]>([]);
  const spots = useRef<(THREE.SpotLight | null)[]>([]);
  const targets = useMemo(() => [new THREE.Object3D(), new THREE.Object3D()], []);
  const aim = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const live = fx.time >= 8 && fx.time <= 20;
    // Stop re-rendering the shadow map while the stage is off camera.
    const caster = spots.current[0];
    if (caster) caster.shadow.autoUpdate = live || !useShow.getState().ready;
    if (!live) return;
    const t = clock.elapsedTime;
    built.beams.forEach((b, i) => {
      const g = groups.current[i];
      if (!g) return;
      // Slow, overlapping figure-eights across the deck and runway.
      aim.set(
        b.origin.x * 0.55 + Math.sin(t * 0.42 + b.phase) * 6,
        DECK_H,
        (b.front ? 2 : 0) + Math.cos(t * 0.31 + b.phase * 1.7) * 5,
      );
      g.quaternion.setFromUnitVectors(DOWN, aim.sub(b.origin).normalize());
      b.material.uniforms.uIntensity.value =
        fx.stageSpots * (0.13 + 0.03 * Math.sin(t * 0.8 + b.phase)) * (1 + fx.finale * 0.2);
    });
    targets[0].position.set(Math.sin(t * 0.35) * 7, DECK_H, 1 + Math.cos(t * 0.27) * 2);
    targets[1].position.set(Math.cos(t * 0.3) * 3, DECK_H, 10 + Math.sin(t * 0.33) * 5);
    const level = fx.stageBase * 180 + fx.stageSpots * 900;
    spots.current.forEach((s) => s && (s.intensity = level));
  });

  return (
    <group>
      <Tubes segments={built.truss} radius={0.028} material={built.metal} sides={5} />
      {built.beams.map((b, i) => (
        <group key={i} position={b.origin} ref={(g) => void (groups.current[i] = g)}>
          <mesh geometry={built.head} material={built.metal} />
          <mesh geometry={built.cone} material={b.material} />
        </group>
      ))}
      {targets.map((o, i) => (
        <primitive key={i} object={o} />
      ))}
      <spotLight
        ref={(l) => void (spots.current[0] = l)}
        position={[-7, TRUSS_Y - 0.6, 6.5]}
        target={targets[0]}
        color="#ffe6c0"
        angle={0.62}
        penumbra={0.8}
        intensity={0}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      <spotLight
        ref={(l) => void (spots.current[1] = l)}
        position={[7, TRUSS_Y - 0.6, 6.5]}
        target={targets[1]}
        color="#fff4e2"
        angle={0.6}
        penumbra={0.9}
        intensity={0}
      />
    </group>
  );
}

function FloorSweep() {
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: glowTexture(),
        color: '#ffc46a',
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );
  const deck = useRef<THREE.Mesh>(null);
  const runway = useRef<THREE.Mesh>(null);
  useEffect(
    () => () => {
      material.map?.dispose();
      material.dispose();
    },
    [material],
  );
  useFrame(() => {
    const p = fx.floorSweep;
    material.opacity = Math.sin(p * Math.PI) * 0.42;
    if (deck.current) deck.current.position.x = THREE.MathUtils.lerp(-19, 19, p);
    if (runway.current) runway.current.position.z = THREE.MathUtils.lerp(DECK_D / 2, DECK_D / 2 + RUNWAY_LEN + 2, p);
  });
  return (
    <group>
      <mesh ref={deck} rotation={[-Math.PI / 2, 0, 0]} position={[0, DECK_H + 0.02, 1.6]} material={material}>
        <planeGeometry args={[12, 6]} />
      </mesh>
      <mesh ref={runway} rotation={[-Math.PI / 2, 0, 0]} position={[0, DECK_H + 0.02, 6]} material={material}>
        <planeGeometry args={[5, 7]} />
      </mesh>
    </group>
  );
}

/** Scene 3 – the grand main stage. Local origin: centre of the deck at floor level, facing +Z. */
export function MainStage() {
  return (
    <group>
      <Platform />
      <Screens />
      <Arches />
      <Rigging />
      <FloorSweep />
    </group>
  );
}
