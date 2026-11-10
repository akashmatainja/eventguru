'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { fx } from '@/store/fx';
import { CameraPath, type Shot } from './cameraPath';

/** Where the camera is currently looking; the depth-of-field effect focuses here. */
export const focusPoint = new THREE.Vector3(0, 5, 62);

const BASE_FOV = 40;

interface CameraRigProps {
  /** Supply a different list of shots to reuse the rig for another film. */
  shots?: Shot[];
  /** Higher is tighter to the path; lower is floatier. */
  stiffness?: number;
}

/**
 * Flies the default camera along the shot spline at the timeline's current time.
 * A little critically-damped smoothing sits on top so speed changes between shots,
 * and scroll scrubbing, never read as a jolt.
 */
export function CameraRig({ shots, stiffness = 5 }: CameraRigProps) {
  const path = useMemo(() => new CameraPath(shots), [shots]);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const goalPos = useMemo(() => new THREE.Vector3(), []);
  const goalLook = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const lastTime = useRef(-1);

  useFrame((_, delta) => {
    path.sample(fx.time, goalPos, goalLook);
    // Snap on the first frame and on any large jump (seek); otherwise ease.
    const jumped = lastTime.current < 0 || Math.abs(fx.time - lastTime.current) > 1.5;
    const k = jumped ? 1 : 1 - Math.exp(-Math.min(delta, 0.1) * stiffness);
    camera.position.lerp(goalPos, k);
    look.lerp(goalLook, k);
    camera.lookAt(look);
    focusPoint.copy(look);
    lastTime.current = fx.time;

    // Keep the composition on tall screens by widening the lens.
    const aspect = size.width / size.height;
    const fov = aspect >= 1.5 ? BASE_FOV : Math.min(78, BASE_FOV * Math.pow(1.5 / aspect, 0.72));
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
