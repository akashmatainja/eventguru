import * as THREE from 'three';

export const GOLD = '#ffc661';
export const CHAMPAGNE = '#f3dca6';
export const BRONZE = '#5b3c1a';
export const LED_WARM = '#ffd89a';

export const polishedGold = () =>
  new THREE.MeshStandardMaterial({ color: GOLD, metalness: 1, roughness: 0.16, envMapIntensity: 1.25 });

export const brushedGold = () =>
  new THREE.MeshStandardMaterial({ color: '#e9b65a', metalness: 1, roughness: 0.42 });

export const darkBronze = () =>
  new THREE.MeshStandardMaterial({ color: BRONZE, metalness: 1, roughness: 0.38 });

export const glossBlack = () =>
  new THREE.MeshPhysicalMaterial({
    color: '#060606',
    metalness: 0.3,
    roughness: 0.14,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
  });

export const darkMetal = () =>
  new THREE.MeshStandardMaterial({ color: '#1a1a1c', metalness: 0.9, roughness: 0.45 });

export const chrome = () =>
  new THREE.MeshStandardMaterial({ color: '#f4f1ea', metalness: 1, roughness: 0.1, envMapIntensity: 1.4 });

/** Emissive LED surface. Drive `emissiveIntensity` from a channel in useFrame. */
export const ledStrip = (color: string = LED_WARM) =>
  new THREE.MeshStandardMaterial({
    color: '#111',
    emissive: new THREE.Color(color),
    emissiveIntensity: 0,
    roughness: 0.4,
    metalness: 0,
  });

export interface RevealUniforms {
  uReveal: { value: number };
  uGlow: { value: number };
  uGlowColor: { value: THREE.Color };
}

/**
 * Gold structural metal with an integrated LED line that switches on progressively.
 *
 * Each instance carries an `aOrder` attribute (0..1). As `uReveal` sweeps 0 -> 1 a bright
 * head of light travels through the structure and leaves the members glowing at `uGlow`.
 */
export function revealGold(glowColor: string = LED_WARM, roughness = 0.22) {
  const uniforms: RevealUniforms = {
    uReveal: { value: 0 },
    uGlow: { value: 1 },
    uGlowColor: { value: new THREE.Color(glowColor) },
  };
  const material = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 1, roughness });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uReveal = uniforms.uReveal;
    shader.uniforms.uGlow = uniforms.uGlow;
    shader.uniforms.uGlowColor = uniforms.uGlowColor;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aOrder;\nvarying float vOrder;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvOrder = aOrder;');
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nuniform float uReveal;\nuniform float uGlow;\nuniform vec3 uGlowColor;\nvarying float vOrder;',
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        float revealAt = uReveal * 1.14 - 0.07; // fully dark at 0, fully lit at 1
        float revealLit = smoothstep(vOrder - 0.05, vOrder + 0.02, revealAt);
        float revealHead = exp(-pow((revealAt - vOrder) * 16.0, 2.0)) * step(0.002, uReveal) * (1.0 - smoothstep(0.88, 1.0, uReveal));
        totalEmissiveRadiance += uGlowColor * (revealLit * uGlow + revealHead * 2.2);`,
      );
  };
  material.customProgramCacheKey = () => 'reveal-gold';
  return { material, uniforms };
}

/** Additive cone used for visible light beams (cheap stand-in for true volumetrics). */
export function beamMaterial(color: string) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(color) }, uIntensity: { value: 0 } },
    vertexShader: /* glsl */ `
      varying float vAlong;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vAlong = uv.y;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uIntensity;
      varying float vAlong;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        // Brightest at the fixture (uv.y = 1), fading towards the floor, soft at the silhouette.
        float falloff = pow(vAlong, 2.2);
        float facing = pow(abs(dot(normalize(vNormal), normalize(vView))), 1.6);
        gl_FragColor = vec4(uColor, falloff * facing * uIntensity);
      }`,
  });
}
