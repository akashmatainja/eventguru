import * as THREE from 'three';

/** A straight structural member. `order` (0..1) controls when it lights up. */
export interface Segment {
  a: THREE.Vector3;
  b: THREE.Vector3;
  order: number;
}

/** Small deterministic RNG so procedural detail is identical on every load. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* Round brilliant cut                                                 */
/* ------------------------------------------------------------------ */

export interface BrilliantOptions {
  girdle?: number; // girdle radius
  table?: number; // table radius
  crown?: number; // crown height above girdle
  pavilion?: number; // pavilion depth below girdle
  depthScale?: number; // squash along Z for a shallower installation
}

interface BrilliantRings {
  T: THREE.Vector3[]; // table (8)
  C: THREE.Vector3[]; // crown mid ring (8)
  G: THREE.Vector3[]; // girdle (16)
  P: THREE.Vector3[]; // pavilion mid ring (8)
  culet: THREE.Vector3;
  top: number;
  bottom: number;
}

function brilliantRings(o: BrilliantOptions = {}): BrilliantRings {
  const { girdle = 1, table = 0.56, crown = 0.36, pavilion = 0.9, depthScale = 1 } = o;
  const ring = (n: number, r: number, y: number, offset: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = ((i + offset) / n) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r * depthScale);
    });
  return {
    T: ring(8, table, crown, 0),
    C: ring(8, (table + girdle) * 0.52, crown * 0.52, 0.5),
    G: ring(16, girdle, 0, 0),
    P: ring(8, girdle * 0.5, -pavilion * 0.56, 0),
    culet: new THREE.Vector3(0, -pavilion, 0),
    top: crown,
    bottom: -pavilion,
  };
}

/** Wireframe members of a brilliant-cut diamond, ordered bottom-to-top for the reveal. */
export function brilliantSegments(o: BrilliantOptions = {}): Segment[] {
  const { T, C, G, P, culet, top, bottom } = brilliantRings(o);
  const pairs: [THREE.Vector3, THREE.Vector3][] = [];
  for (let i = 0; i < 8; i++) {
    const n = (i + 1) % 8;
    pairs.push([T[i], T[n]]); // table
    pairs.push([T[i], C[i]], [T[n], C[i]]); // star facets
    pairs.push([C[i], G[2 * i]], [C[i], G[(2 * i + 2) % 16]]); // bezel
    pairs.push([C[i], G[2 * i + 1]]); // upper girdle
    pairs.push([G[2 * i], P[i]]); // pavilion mains
    pairs.push([G[2 * i + 1], P[i]], [G[2 * i + 1], P[n]]); // lower girdle
    pairs.push([P[i], culet]);
  }
  for (let j = 0; j < 16; j++) pairs.push([G[j], G[(j + 1) % 16]]);
  const span = top - bottom;
  return pairs.map(([a, b]) => ({
    a,
    b,
    order: THREE.MathUtils.clamp(((a.y + b.y) / 2 - bottom) / span, 0, 1),
  }));
}

/** Solid, flat-faceted brilliant for the glass diamond in the introduction. */
export function brilliantGeometry(o: BrilliantOptions = {}): THREE.BufferGeometry {
  const { T, C, G, P, culet, top } = brilliantRings(o);
  const tris: THREE.Vector3[] = [];
  const tri = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => tris.push(a, b, c);
  const centre = new THREE.Vector3(0, top, 0);
  for (let i = 0; i < 8; i++) {
    const n = (i + 1) % 8;
    const p = (i + 7) % 8;
    tri(centre, T[n], T[i]); // table
    tri(T[i], T[n], C[i]); // star
    tri(T[i], C[i], G[2 * i]); // bezel kite (two halves)
    tri(T[i], G[2 * i], C[p]);
    tri(C[i], G[2 * i + 1], G[2 * i]); // upper girdle
    tri(C[i], G[(2 * i + 2) % 16], G[2 * i + 1]);
    tri(G[2 * i], G[2 * i + 1], P[i]); // lower girdle
    tri(G[2 * i + 1], G[(2 * i + 2) % 16], P[n]);
    tri(G[2 * i + 1], P[n], P[i]); // pavilion mains
    tri(P[i], P[n], culet);
  }
  const pos = new Float32Array(tris.length * 3);
  tris.forEach((v, i) => v.toArray(pos, i * 3));
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.computeVertexNormals(); // non-indexed, so every facet stays flat
  return g;
}

/* ------------------------------------------------------------------ */
/* Faceted triangular panels (entrance gate side structures)           */
/* ------------------------------------------------------------------ */

function triangleFrame(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) {
  const u = b.clone().sub(a).normalize();
  const n = b.clone().sub(a).cross(c.clone().sub(a)).normalize();
  const v = n.clone().cross(u);
  const B = new THREE.Vector2(b.distanceTo(a), 0);
  const ca = c.clone().sub(a);
  const C = new THREE.Vector2(ca.dot(u), ca.dot(v));
  const matrix = new THREE.Matrix4().makeBasis(u, v, n).setPosition(a);
  return { A: new THREE.Vector2(0, 0), B, C, matrix };
}

/** Solid triangular slab with planar UVs (marble / gold facets). */
export function triPanel(
  a: THREE.Vector3,
  b: THREE.Vector3,
  c: THREE.Vector3,
  thickness = 0.1,
  uvScale = 0.25,
): THREE.BufferGeometry {
  const { A, B, C, matrix } = triangleFrame(a, b, c);
  const shape = new THREE.Shape([A, B, C]);
  const g = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
  const uv = g.attributes.uv as THREE.BufferAttribute;
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) * uvScale, pos.getY(i) * uvScale);
  g.translate(0, 0, -thickness / 2);
  g.applyMatrix4(matrix);
  g.computeVertexNormals();
  return g;
}

/** Triangular gold screen with a field of cut-out openings (jali lattice). */
export function latticePanel(
  a: THREE.Vector3,
  b: THREE.Vector3,
  c: THREE.Vector3,
  rows = 8,
  thickness = 0.1,
  seed = 1,
): THREE.BufferGeometry {
  const { A, B, C, matrix } = triangleFrame(a, b, c);
  const rand = rng(seed);
  const centroid = new THREE.Vector2().add(A).add(B).add(C).multiplyScalar(1 / 3);
  const AB = B.clone().sub(A);
  const AC = C.clone().sub(A);
  const grid = (i: number, j: number) => {
    const p = A.clone()
      .addScaledVector(AB, i / rows)
      .addScaledVector(AC, j / rows);
    return centroid.clone().add(p.sub(centroid).multiplyScalar(0.93)); // leaves a solid border
  };
  const shape = new THREE.Shape([A, B, C]);
  const addHole = (p: THREE.Vector2, q: THREE.Vector2, r: THREE.Vector2) => {
    const m = new THREE.Vector2().add(p).add(q).add(r).multiplyScalar(1 / 3);
    const k = 0.6 + rand() * 0.2;
    // Split each cell into three slivers around its centre for a finer, hand-cut look.
    const corners = [p, q, r].map((x) => m.clone().add(x.clone().sub(m).multiplyScalar(k)));
    if (rand() < 0.45) {
      shape.holes.push(new THREE.Path(corners));
      return;
    }
    for (let e = 0; e < 3; e++) {
      const p0 = corners[e];
      const p1 = corners[(e + 1) % 3];
      const cm = new THREE.Vector2().add(p0).add(p1).add(m).multiplyScalar(1 / 3);
      const pts = [p0, p1, m].map((x) => cm.clone().add(x.clone().sub(cm).multiplyScalar(0.72)));
      shape.holes.push(new THREE.Path(pts));
    }
  };
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < rows - j; i++) {
      addHole(grid(i, j), grid(i + 1, j), grid(i, j + 1));
      if (i + j < rows - 1) addHole(grid(i + 1, j), grid(i + 1, j + 1), grid(i, j + 1));
    }
  }
  const g = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
  g.translate(0, 0, -thickness / 2);
  g.applyMatrix4(matrix);
  g.computeVertexNormals();
  return g;
}

/* ------------------------------------------------------------------ */
/* Stage pieces                                                        */
/* ------------------------------------------------------------------ */

/** Arch frame (rectangle with a semicircular head) with an arched opening. */
export function archFrameGeometry(width: number, height: number, band: number, depth: number) {
  const outline = (w: number, h: number) => {
    const r = w / 2;
    const pts: THREE.Vector2[] = [new THREE.Vector2(-r, 0), new THREE.Vector2(-r, h - r)];
    for (let i = 1; i < 32; i++) {
      const t = Math.PI - (i / 32) * Math.PI;
      pts.push(new THREE.Vector2(Math.cos(t) * r, h - r + Math.sin(t) * r));
    }
    pts.push(new THREE.Vector2(r, h - r), new THREE.Vector2(r, 0));
    return pts;
  };
  // One closed band: up and over the outside, then back along the inside.
  const shape = new THREE.Shape([
    ...outline(width, height),
    ...outline(width - band * 2, height - band).reverse(),
  ]);
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSize: 0.03,
    bevelThickness: 0.03,
    bevelSegments: 2,
    curveSegments: 24,
  });
  g.translate(0, 0, -depth / 2);
  return g;
}

/** Runway footprint: a straight walkway ending in a round thrust, in the XZ plane. */
export function runwayShape(width: number, length: number, endRadius: number) {
  const w = width / 2;
  const s = new THREE.Shape();
  s.moveTo(-w, 0);
  const alpha = Math.acos(Math.min(1, w / endRadius));
  s.lineTo(-w, length - Math.sin(alpha) * endRadius);
  // Sweep clockwise from the near-left of the circle, around the far side, to the near-right.
  s.absarc(0, length, endRadius, Math.PI + alpha, -alpha, true);
  s.lineTo(w, 0);
  s.closePath();
  return s;
}

/** Box truss between two points as individual members (chords, verticals, lacing). */
export function trussSegments(
  from: THREE.Vector3,
  to: THREE.Vector3,
  size = 0.5,
  bay = 1,
): Segment[] {
  const out: Segment[] = [];
  const dir = to.clone().sub(from);
  const len = dir.length();
  dir.normalize();
  const up = Math.abs(dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const sx = dir.clone().cross(up).normalize().multiplyScalar(size / 2);
  const sy = sx.clone().cross(dir).normalize().multiplyScalar(size / 2);
  const corner = (k: number, d: number) =>
    from
      .clone()
      .addScaledVector(dir, d)
      .addScaledVector(sx, k === 0 || k === 3 ? -1 : 1)
      .addScaledVector(sy, k < 2 ? -1 : 1);
  const seg = (a: THREE.Vector3, b: THREE.Vector3) => out.push({ a, b, order: 0 });
  const bays = Math.max(1, Math.round(len / bay));
  for (let k = 0; k < 4; k++) seg(corner(k, 0), corner(k, len));
  for (let i = 0; i <= bays; i++) {
    const d = (i / bays) * len;
    for (let k = 0; k < 4; k++) seg(corner(k, d), corner((k + 1) % 4, d));
    if (i < bays) {
      const d2 = ((i + 1) / bays) * len;
      for (let k = 0; k < 4; k++) {
        const flip = (i + k) % 2 === 0;
        seg(corner(flip ? k : (k + 1) % 4, d), corner(flip ? (k + 1) % 4 : k, d2));
      }
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Crumpled mirror foil (photo opportunity lining, gate tunnel)        */
/* ------------------------------------------------------------------ */

export function crumpledPlane(
  width: number,
  height: number,
  segW: number,
  segH: number,
  amplitude: number,
  seed = 7,
): THREE.BufferGeometry {
  const rand = rng(seed);
  const base = new THREE.PlaneGeometry(width, height, segW, segH);
  const p = base.attributes.position as THREE.BufferAttribute;
  const cellW = width / segW;
  const cellH = height / segH;
  for (let i = 0; i < p.count; i++) {
    const ix = i % (segW + 1);
    const iy = Math.floor(i / (segW + 1));
    const edge = ix === 0 || iy === 0 || ix === segW || iy === segH;
    if (!edge) {
      p.setX(i, p.getX(i) + (rand() - 0.5) * cellW * 0.7);
      p.setY(i, p.getY(i) + (rand() - 0.5) * cellH * 0.7);
    }
    p.setZ(i, (rand() - 0.5) * 2 * amplitude);
  }
  const g = base.toNonIndexed(); // unshared vertices -> hard, mirror-like facets
  base.dispose();
  const count = g.attributes.position.count;
  const colours = new Float32Array(count * 3);
  const gold = new THREE.Color('#f1cf7a');
  const silver = new THREE.Color('#f4efe6');
  const c = new THREE.Color();
  for (let i = 0; i < count; i += 3) {
    c.copy(gold).lerp(silver, rand());
    for (let k = 0; k < 3; k++) c.toArray(colours, (i + k) * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(colours, 3));
  g.computeVertexNormals();
  return g;
}

/** Rewrites UVs to span 0..1 across the XY bounding box (for LED faces cut from shapes). */
export function normalizeUV(g: THREE.BufferGeometry) {
  g.computeBoundingBox();
  const bb = g.boundingBox!;
  const size = new THREE.Vector3();
  bb.getSize(size);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) - bb.min.x) / size.x, (pos.getY(i) - bb.min.y) / size.y);
  }
  uv.needsUpdate = true;
  return g;
}

/** Axis-aligned box edges as segments, ordered by height. */
export function boxEdgeSegments(w: number, h: number, d: number, y0 = 0): Segment[] {
  const x = w / 2;
  const z = d / 2;
  const v = (sx: number, sy: number, sz: number) =>
    new THREE.Vector3(sx * x, y0 + (sy > 0 ? h : 0), sz * z);
  const out: Segment[] = [];
  const add = (a: THREE.Vector3, b: THREE.Vector3) =>
    out.push({ a, b, order: THREE.MathUtils.clamp(((a.y + b.y) / 2 - y0) / h, 0, 1) });
  for (const sz of [-1, 1]) {
    add(v(-1, -1, sz), v(1, -1, sz));
    add(v(-1, 1, sz), v(1, 1, sz));
    add(v(-1, -1, sz), v(-1, 1, sz));
    add(v(1, -1, sz), v(1, 1, sz));
  }
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) add(v(sx, sy, -1), v(sx, sy, 1));
  return out;
}
