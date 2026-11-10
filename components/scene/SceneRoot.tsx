'use client';

import { Suspense, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { useShow } from '@/store/useShow';
import { QUALITY } from '@/lib/quality';
import { DIAMOND_POS, GATE_Z, INTRO_POS, PHOTO_POS, STAGE_Z, WALL_X } from '@/lib/layout';
import { CameraRig } from '@/components/camera/CameraRig';
import { Venue } from './Venue';
import { Zone } from './Zone';
import { ModelSlot } from './ModelSlot';
import { IntroDiamond } from './IntroDiamond';
import { EntranceGate } from './EntranceGate';
import { MainStage } from './MainStage';
import { DiamondInstallation } from './DiamondInstallation';
import { PhotoOpp } from './PhotoOpp';
import { BackdropWall } from './BackdropWall';
import { Particles } from './Particles';
import { Effects } from './Effects';

/**
 * Compiles every shader behind the loading screen, then marks the scene ready.
 * Without this, each set piece would stutter the first time it came on camera.
 */
function Warmup() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    let cancelled = false;
    useShow.getState().setCompiling(true);
    const done = () => {
      // Two frames later the first real image is on screen.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!cancelled) useShow.getState().setReady(true);
        }),
      );
    };
    if (typeof gl.compileAsync === 'function') gl.compileAsync(scene, camera).then(done, done);
    else {
      gl.compile(scene, camera);
      done();
    }
    return () => {
      cancelled = true;
    };
  }, [gl, scene, camera]);
  return null;
}

const FACING_HALL: [number, number, number] = [0, -Math.PI / 2, 0];

export function SceneRoot() {
  const shadows = QUALITY[useShow((s) => s.quality)].shadows;
  return (
    <>
      <Venue />
      <CameraRig />
      <Suspense fallback={null}>
        <Zone to={5.4} position={INTRO_POS}>
          <IntroDiamond />
        </Zone>

        {/* Gate and stage are drawn from the start: far off in the haze they read as a hint of gold */}
        <Zone to={12.6} position={[0, 0, GATE_Z]}>
          <ModelSlot slot="gate">
            <EntranceGate />
          </ModelSlot>
        </Zone>

        <Zone to={19.6} position={[0, 0, STAGE_Z]}>
          <ModelSlot slot="stage">
            <MainStage />
          </ModelSlot>
        </Zone>

        <Zone from={16.4}>
          <group position={DIAMOND_POS} rotation={FACING_HALL}>
            <ModelSlot slot="diamondInstallation">
              <DiamondInstallation />
            </ModelSlot>
          </group>
          <group position={PHOTO_POS} rotation={FACING_HALL}>
            <ModelSlot slot="photoOpp">
              <PhotoOpp />
            </ModelSlot>
          </group>
          <group position={[WALL_X, 0, 2]} rotation={FACING_HALL}>
            <BackdropWall />
          </group>
          {shadows && (
            <>
              <ContactShadows position={[DIAMOND_POS[0], 0.015, DIAMOND_POS[2]]} scale={18} far={3} blur={2.4} opacity={0.6} resolution={512} frames={1} />
              <ContactShadows position={[PHOTO_POS[0], 0.015, PHOTO_POS[2]]} scale={18} far={3} blur={2.4} opacity={0.55} resolution={512} frames={1} />
            </>
          )}
        </Zone>

        <Particles />
        <Warmup />
      </Suspense>
      <Effects />
    </>
  );
}
