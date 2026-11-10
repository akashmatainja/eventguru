'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, MeshReflectorMaterial } from '@react-three/drei';
import { MathUtils } from 'three';
import { fx } from '@/store/fx';
import { useShow } from '@/store/useShow';
import { QUALITY } from '@/lib/quality';

/**
 * Studio lighting environment, built from light cards rather than a downloaded HDRI so the
 * site has no external asset dependency. This is what the gold and the diamonds reflect.
 */
function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={['#020100']} />
      {/* Overhead warm strips: long clean highlights on polished gold */}
      {[-6, -2, 2, 6].map((z) => (
        <Lightformer key={z} form="rect" intensity={5} color="#ffd9a0" position={[0, 9, z]} rotation={[Math.PI / 2, 0, 0]} scale={[14, 0.9, 1]} />
      ))}
      {/* Large soft sides */}
      <Lightformer form="rect" intensity={1.6} color="#ffbf73" position={[-12, 3, 2]} rotation={[0, Math.PI / 2, 0]} scale={[16, 7, 1]} />
      <Lightformer form="rect" intensity={1.1} color="#fff2df" position={[12, 4, -2]} rotation={[0, -Math.PI / 2, 0]} scale={[16, 6, 1]} />
      {/* Front key and a cool rim so facets separate */}
      <Lightformer form="rect" intensity={2.4} color="#fff6e8" position={[0, 4, 12]} scale={[8, 5, 1]} />
      <Lightformer form="rect" intensity={1.3} color="#cfdcff" position={[0, 6, -12]} rotation={[0, Math.PI, 0]} scale={[10, 3, 1]} />
      {/* Small hot points: sparkle on diamond facets and mirror foil */}
      {[
        [5, 7, 7],
        [-6, 6, 6],
        [8, 2, -5],
        [-8, 8, -4],
        [2, 10, -8],
        [-3, 1.5, 9],
      ].map(([x, y, z], i) => (
        <Lightformer key={i} form="circle" intensity={22} color="#fff4dc" position={[x, y, z]} scale={0.7} target={[0, 0, 0]} />
      ))}
      {/* Dark bronze floor bounce */}
      <Lightformer form="rect" intensity={0.25} color="#5a3a12" position={[0, -6, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[30, 30, 1]} />
    </Environment>
  );
}

function Floor() {
  const q = QUALITY[useShow((s) => s.quality)];
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, 0, 20]} receiveShadow>
      <planeGeometry args={[220, 220]} />
      {q.reflectiveFloor ? (
        <MeshReflectorMaterial
          resolution={q.reflectorResolution}
          blur={[320, 120]}
          mixBlur={0.9}
          mixStrength={14}
          mirror={0.72}
          roughness={0.55}
          depthScale={0.8}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.3}
          color="#0c0b0a"
          metalness={0.65}
        />
      ) : (
        <meshStandardMaterial color="#0c0b0a" metalness={0.85} roughness={0.32} />
      )}
    </mesh>
  );
}

/** Raises the reflected studio light in step with the story so the film opens in darkness. */
function Exposure() {
  const scene = useThree((s) => s.scene);
  useFrame(() => {
    // Black at the first frame, then a faint base so distant gold reads as a hint in the haze.
    const base = 0.1 * MathUtils.smoothstep(fx.time, 0.2, 2.4);
    const venue = Math.max(fx.gateGlow, fx.stageBase, fx.wallGlow);
    const level = base + venue * 0.9 + fx.finale * 0.15;
    scene.environmentIntensity = useShow.getState().ready ? level : 1;
  });
  return null;
}

/** Everything that is not a set piece: reflections, haze, the floor and base light. */
export function Venue() {
  return (
    <>
      <color attach="background" args={['#000000']} />
      <fogExp2 attach="fog" args={['#030201', 0.0105]} />
      <Studio />
      <Exposure />
      <Floor />
      <hemisphereLight args={['#3a2a18', '#000000', 0.25]} />
    </>
  );
}
