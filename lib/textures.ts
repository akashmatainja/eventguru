import * as THREE from 'three';
import { rng } from './geometry';

/** Width / height of the EventGuru sign artwork. */
export const LOGO_ASPECT = 4;

const TITLE_FONT = '"Cinzel", "Cormorant Garamond", "Times New Roman", serif';

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return { canvas, ctx: canvas.getContext('2d')! };
}

function toTexture(canvas: HTMLCanvasElement, repeat = false) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/* ------------------------------------------------------------------ */
/* EventGuru wordmark                                                  */
/* ------------------------------------------------------------------ */

function drawWordmark(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#15100a');
  bg.addColorStop(1, '#070504');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const gold = ctx.createLinearGradient(0, h * 0.2, 0, h * 0.8);
  gold.addColorStop(0, '#fff0c9');
  gold.addColorStop(0.5, '#e9c376');
  gold.addColorStop(1, '#b98a35');

  // Double keyline, like an engraved sign plate.
  ctx.strokeStyle = gold;
  ctx.lineWidth = h * 0.02;
  ctx.strokeRect(h * 0.05, h * 0.05, w - h * 0.1, h - h * 0.1);
  ctx.lineWidth = h * 0.006;
  ctx.strokeRect(h * 0.1, h * 0.1, w - h * 0.2, h - h * 0.2);

  // "EVENT" in a light weight and "GURU" in bold, set as one word.
  const spaced = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  const size = h * 0.4;
  const light = `400 ${size}px ${TITLE_FONT}`;
  const bold = `700 ${size}px ${TITLE_FONT}`;
  if ('letterSpacing' in spaced) spaced.letterSpacing = `${size * 0.1}px`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.font = light;
  const eventW = ctx.measureText('EVENT').width;
  ctx.font = bold;
  const guruW = ctx.measureText('GURU').width;
  const x = (w - eventW - guruW) / 2 + size * 0.05;
  const y = h * 0.58;
  ctx.fillStyle = gold;
  ctx.font = light;
  ctx.fillText('EVENT', x, y);
  ctx.font = bold;
  ctx.fillText('GURU', x + eventW, y);

  const small = h * 0.1;
  if ('letterSpacing' in spaced) spaced.letterSpacing = `${small * 0.5}px`;
  ctx.font = `500 ${small}px ${TITLE_FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('EVENT DESIGN & MANAGEMENT', w / 2 + small * 0.25, h * 0.8);
  if ('letterSpacing' in spaced) spaced.letterSpacing = '0px';
}

let wordmark: { canvas: HTMLCanvasElement; texture: THREE.CanvasTexture } | null = null;

/**
 * The EventGuru sign: a typeset wordmark drawn to a canvas. It is shared by the 3D sign boxes
 * and the LED walls. To use a real logo instead, draw your image in drawWordmark().
 */
export function getWordmark() {
  if (!wordmark) {
    const { canvas } = makeCanvas(1024, 1024 / LOGO_ASPECT);
    drawWordmark(canvas);
    const texture = toTexture(canvas);
    texture.anisotropy = 8;
    wordmark = { canvas, texture };
    // Redraw once the web font has arrived, so the sign is never stuck in a fallback face.
    const redraw = () => {
      drawWordmark(canvas);
      texture.needsUpdate = true;
    };
    if (typeof document !== 'undefined' && document.fonts) {
      Promise.all([document.fonts.load('400 64px Cinzel'), document.fonts.load('700 64px Cinzel')]).then(redraw, () => undefined);
    }
  }
  return wordmark;
}

/* ------------------------------------------------------------------ */
/* Static surface textures                                             */
/* ------------------------------------------------------------------ */

/** Backlit white marble with fine gold veining (gate side facets). */
export function marbleTexture() {
  const { canvas, ctx } = makeCanvas(512, 512);
  const rand = rng(11);
  const g = ctx.createLinearGradient(0, 0, 512, 512);
  g.addColorStop(0, '#fff6e2');
  g.addColorStop(1, '#f1dfbd');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  for (let v = 0; v < 16; v++) {
    let x = rand() * 512;
    let y = rand() * 512;
    let a = rand() * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let s = 0; s < 40; s++) {
      a += (rand() - 0.5) * 0.9;
      x += Math.cos(a) * 14;
      y += Math.sin(a) * 14;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(190,140,60,${0.12 + rand() * 0.25})`;
    ctx.lineWidth = 0.6 + rand() * 1.6;
    ctx.stroke();
  }
  return toTexture(canvas, true);
}

/** Black fascia with flowing gold filigree (stage and runway skirt). */
export function swirlTexture() {
  const { canvas, ctx } = makeCanvas(1024, 256);
  const rand = rng(23);
  ctx.fillStyle = '#050403';
  ctx.fillRect(0, 0, 1024, 256);
  ctx.lineCap = 'round';
  for (let i = 0; i < 46; i++) {
    const x = rand() * 1024;
    const y = 40 + rand() * 180;
    const r = 30 + rand() * 90;
    const grad = ctx.createLinearGradient(x - r, y, x + r, y);
    grad.addColorStop(0, 'rgba(120,70,10,0)');
    grad.addColorStop(0.5, `rgba(255,${180 + Math.floor(rand() * 50)},80,${0.5 + rand() * 0.4})`);
    grad.addColorStop(1, 'rgba(120,70,10,0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1 + rand() * 3.5;
    for (const dx of [-1024, 0, 1024]) {
      ctx.beginPath();
      ctx.moveTo(x - r + dx, y);
      ctx.bezierCurveTo(x - r * 0.3 + dx, y - r * 0.9, x + r * 0.3 + dx, y + r * 0.9, x + r + dx, y - r * 0.2);
      ctx.stroke();
    }
  }
  return toTexture(canvas, true);
}

/** Soft radial falloff for glow cards. */
export function glowTexture() {
  const { canvas, ctx } = makeCanvas(256, 256);
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.45)');
  g.addColorStop(0.6, 'rgba(255,255,255,0.1)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return toTexture(canvas);
}

/** Wall-washer cone rising from a floor uplight. */
export function uplightTexture() {
  const { canvas, ctx } = makeCanvas(128, 512);
  const img = ctx.createImageData(128, 512);
  for (let y = 0; y < 512; y++) {
    const up = 1 - y / 511; // 0 at floor, 1 at top
    for (let x = 0; x < 128; x++) {
      const dx = (x - 63.5) / 63.5;
      const spread = 0.18 + up * 0.75;
      const side = Math.exp(-(dx * dx) / (spread * spread));
      const a = side * Math.pow(1 - up, 1.7) * (0.25 + 0.75 * Math.min(1, up * 14));
      const i = (y * 128 + x) * 4;
      img.data[i] = 255;
      img.data[i + 1] = 196;
      img.data[i + 2] = 110;
      img.data[i + 3] = Math.round(a * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  return toTexture(canvas);
}

/* ------------------------------------------------------------------ */
/* Animated LED content                                                */
/* ------------------------------------------------------------------ */

type Painter = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, power: number, extra: number) => void;

/** A canvas-backed LED wall. Call update() from useFrame; it throttles itself. */
export class LedScreen {
  readonly texture: THREE.CanvasTexture;
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private last = -1;

  constructor(
    w: number,
    h: number,
    private paint: Painter,
    private fps = 24,
  ) {
    const c = makeCanvas(w, h);
    this.canvas = c.canvas;
    this.ctx = c.ctx;
    this.texture = toTexture(c.canvas);
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, w, h);
  }

  update(t: number, power: number, extra = 0) {
    if (Math.abs(t - this.last) < 1 / this.fps) return;
    this.last = t;
    const { ctx, canvas } = this;
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    if (power <= 0.001) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      this.paint(ctx, canvas.width, canvas.height, t, power, extra);
      if (power < 1) {
        // Power-on: the picture rises out of black behind a bright scan line.
        ctx.fillStyle = `rgba(0,0,0,${1 - power})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const y = canvas.height * (1 - power);
        const scan = ctx.createLinearGradient(0, y - 14, 0, y + 14);
        scan.addColorStop(0, 'rgba(255,230,170,0)');
        scan.addColorStop(0.5, `rgba(255,236,190,${0.9 * Math.sin(power * Math.PI)})`);
        scan.addColorStop(1, 'rgba(255,230,170,0)');
        ctx.fillStyle = scan;
        ctx.fillRect(0, y - 14, canvas.width, 28);
      }
    }
    this.texture.needsUpdate = true;
  }

  dispose() {
    this.texture.dispose();
  }
}

/** Outline of a brilliant-cut diamond, drawn-on by `progress`. */
function strokeDiamond(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  progress: number,
  rotation = 0,
) {
  const s = size;
  const pts: Record<string, [number, number]> = {
    tl: [-0.55, -0.42],
    tr: [0.55, -0.42],
    gl: [-1, -0.08],
    gr: [1, -0.08],
    c: [0, 1],
    t1: [-0.2, -0.42],
    t2: [0.2, -0.42],
    g1: [-0.45, -0.08],
    g2: [0, -0.08],
    g3: [0.45, -0.08],
  };
  const lines: [string, string][] = [
    ['tl', 'tr'], ['tr', 'gr'], ['gr', 'c'], ['c', 'gl'], ['gl', 'tl'], ['gl', 'gr'],
    ['tl', 'g1'], ['t1', 'g1'], ['t1', 'g2'], ['t2', 'g2'], ['t2', 'g3'], ['tr', 'g3'],
    ['g1', 'c'], ['g2', 'c'], ['g3', 'c'],
  ];
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  const shown = Math.ceil(lines.length * Math.min(1, Math.max(0, progress)));
  ctx.beginPath();
  for (let i = 0; i < shown; i++) {
    const [a, b] = lines[i];
    ctx.moveTo(pts[a][0] * s, pts[a][1] * s);
    ctx.lineTo(pts[b][0] * s, pts[b][1] * s);
  }
  ctx.stroke();
  ctx.restore();
}

function silk(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, bands: number) {
  for (let k = 0; k < bands; k++) {
    const y0 = (h * (k + 0.5)) / bands;
    const amp = h * (0.08 + 0.04 * Math.sin(k * 1.7));
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 16) {
      const u = x / w;
      const y =
        y0 +
        Math.sin(u * 5.2 + t * 0.55 + k * 1.3) * amp +
        Math.sin(u * 11.0 - t * 0.35 + k * 0.7) * amp * 0.35;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, y0 - amp, 0, y0 + amp * 3);
    g.addColorStop(0, 'rgba(255,226,150,0.34)');
    g.addColorStop(0.35, 'rgba(214,150,44,0.16)');
    g.addColorStop(1, 'rgba(60,34,6,0)');
    ctx.fillStyle = g;
    ctx.fill();
  }
}

function sparkles(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, count: number, seed: number) {
  const rand = rng(seed);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < count; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const phase = rand() * 6.283;
    const speed = 0.8 + rand() * 1.6;
    const a = Math.max(0, Math.sin(t * speed + phase));
    const r = (1.5 + rand() * 4) * a * a * (w / 768);
    if (r < 0.4) continue;
    ctx.fillStyle = `rgba(255,244,214,${0.85 * a})`;
    ctx.beginPath();
    ctx.moveTo(x, y - r * 3);
    ctx.quadraticCurveTo(x, y, x + r * 3, y);
    ctx.quadraticCurveTo(x, y, x, y + r * 3);
    ctx.quadraticCurveTo(x, y, x - r * 3, y);
    ctx.quadraticCurveTo(x, y, x, y - r * 3);
    ctx.fill();
  }
  ctx.restore();
}

/** Gate face: flowing gold silk, line-drawn diamonds and sparkle, as in the reference. */
export const paintGateLed: Painter = (ctx, w, h, t, power) => {
  const base = ctx.createLinearGradient(0, 0, w, h);
  base.addColorStop(0, '#f6c860');
  base.addColorStop(0.45, '#b9781a');
  base.addColorStop(1, '#f1c35a');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  silk(ctx, w, h, t, 6);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = Math.max(2, w / 300);
  ctx.shadowColor = 'rgba(255,240,200,0.9)';
  ctx.shadowBlur = 10;
  const draw = Math.min(1, power * 1.2);
  strokeDiamond(ctx, w * 0.1, h * 0.2, h * 0.13, draw, -0.2);
  strokeDiamond(ctx, w * 0.9, h * 0.17, h * 0.12, draw, 0.25);
  strokeDiamond(ctx, w * 0.86, h * 0.62, h * 0.15, draw, 0.08);
  strokeDiamond(ctx, w * 0.13, h * 0.66, h * 0.16, draw, -0.1);
  ctx.shadowBlur = 0;
  sparkles(ctx, w, h, t, 46, 5);
};

function archPath(ctx: CanvasRenderingContext2D, cx: number, base: number, width: number, height: number) {
  const r = width / 2;
  ctx.beginPath();
  ctx.moveTo(cx - r, base);
  ctx.lineTo(cx - r, base - height + r);
  ctx.arc(cx, base - height + r, r, Math.PI, 0);
  ctx.lineTo(cx + r, base);
}

/** Main stage centre screen: receding golden arches, then the EventGuru sign. */
export const paintStageCentre: Painter = (ctx, w, h, t, _power, identity) => {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#2a1403');
  bg.addColorStop(0.6, '#6e3d0a');
  bg.addColorStop(1, '#1a0c02');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Wings: slender columns of light either side of the centre bay.
  for (const side of [-1, 1]) {
    for (let k = 0; k < 5; k++) {
      const x = w / 2 + side * (w * 0.27 + k * w * 0.047);
      const pulse = 0.55 + 0.45 * Math.sin(t * 0.9 + k * 0.8 + side);
      const col = ctx.createLinearGradient(0, h, 0, h * 0.12);
      col.addColorStop(0, `rgba(255,206,120,${0.7 * pulse})`);
      col.addColorStop(1, 'rgba(255,190,90,0)');
      ctx.fillStyle = col;
      ctx.fillRect(x - w * 0.006, h * 0.08, w * 0.012, h * 0.92);
    }
    ctx.strokeStyle = 'rgba(255,214,140,0.8)';
    ctx.lineWidth = w / 380;
    archPath(ctx, w / 2 + side * w * 0.365, h, w * 0.2, h * 0.9);
    ctx.stroke();
  }

  // Centre bay: a hall of arches receding into warm light.
  const glow = ctx.createRadialGradient(w / 2, h * 0.7, 0, w / 2, h * 0.7, w * 0.3);
  glow.addColorStop(0, `rgba(255,236,190,${0.75 + 0.1 * Math.sin(t * 1.3)})`);
  glow.addColorStop(0.4, 'rgba(240,170,60,0.35)');
  glow.addColorStop(1, 'rgba(120,60,10,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  for (let k = 0; k < 6; k++) {
    const s = 1 - k * 0.135;
    ctx.strokeStyle = `rgba(255,${210 + k * 6},${130 + k * 14},${0.95 - k * 0.1})`;
    ctx.lineWidth = (w / 260) * s;
    archPath(ctx, w / 2, h, w * 0.46 * s, h * 0.97 * s);
    ctx.stroke();
  }

  // Flowing diamond motifs drifting upward across the whole wall.
  ctx.strokeStyle = 'rgba(255,236,196,0.55)';
  ctx.lineWidth = w / 900;
  const rand = rng(91);
  for (let i = 0; i < 16; i++) {
    const x = rand() * w;
    const speed = 0.02 + rand() * 0.04;
    const y = h - (((rand() + t * speed) % 1) * h * 1.2 - h * 0.1);
    strokeDiamond(ctx, x, y, h * (0.025 + rand() * 0.03), 1, Math.sin(t * 0.4 + i) * 0.3);
  }
  sparkles(ctx, w, h, t, 40, 17);

  // The EventGuru sign, framed by the innermost 3D arch standing in front of the screen.
  if (identity > 0.001) {
    ctx.save();
    ctx.globalAlpha = identity;
    const plate = ctx.createRadialGradient(w / 2, h * 0.7, 0, w / 2, h * 0.7, w * 0.16);
    plate.addColorStop(0, 'rgba(20,10,2,0.82)');
    plate.addColorStop(0.8, 'rgba(20,10,2,0.55)');
    plate.addColorStop(1, 'rgba(20,10,2,0)');
    ctx.fillStyle = plate;
    ctx.fillRect(w * 0.3, h * 0.4, w * 0.4, h * 0.6);
    const lw = w * 0.235;
    const lh = lw / LOGO_ASPECT;
    ctx.shadowColor = 'rgba(255,210,120,0.8)';
    ctx.shadowBlur = 18 * identity;
    ctx.drawImage(getWordmark().canvas, w / 2 - lw / 2, h * 0.7 - lh / 2 + (1 - identity) * 14, lw, lh);
    ctx.restore();
  }
};

/** Tall side screens: a pillared hall of light carrying the EventGuru sign. */
export const paintStageSide: Painter = (ctx, w, h, t) => {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#3a1c04');
  bg.addColorStop(0.5, '#b0680f');
  bg.addColorStop(1, '#2a1403');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  const burst = ctx.createRadialGradient(w / 2, h * 0.66, 0, w / 2, h * 0.66, w * 0.75);
  burst.addColorStop(0, `rgba(255,244,214,${0.9 + 0.08 * Math.sin(t * 1.1)})`);
  burst.addColorStop(0.35, 'rgba(255,196,96,0.55)');
  burst.addColorStop(1, 'rgba(160,80,10,0)');
  ctx.fillStyle = burst;
  ctx.fillRect(0, 0, w, h);
  for (let k = 0; k < 6; k++) {
    const x = (w * (k + 0.5)) / 6;
    ctx.fillStyle = `rgba(60,28,4,${0.3 + 0.12 * Math.sin(k * 2.1)})`;
    ctx.fillRect(x - w * 0.018, h * 0.46, w * 0.036, h * 0.54);
  }
  ctx.strokeStyle = 'rgba(255,224,160,0.85)';
  ctx.lineWidth = w / 110;
  archPath(ctx, w / 2, h * 0.5, w * 0.62, h * 0.4);
  ctx.stroke();
  const lw = w * 0.86;
  ctx.drawImage(getWordmark().canvas, (w - lw) / 2, h * 0.34, lw, lw / LOGO_ASPECT);
  sparkles(ctx, w, h, t, 26, 31);
};

/** Narrow accent screens: deep red drape shot through with gold. */
export const paintStageAccent: Painter = (ctx, w, h, t) => {
  const bg = ctx.createLinearGradient(0, 0, w, 0);
  bg.addColorStop(0, '#5a0d06');
  bg.addColorStop(0.5, '#c9781c');
  bg.addColorStop(1, '#6a1208');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  for (let k = 0; k < 7; k++) {
    const x = (w * (k + 0.5)) / 7 + Math.sin(t * 0.5 + k) * w * 0.03;
    const fold = ctx.createLinearGradient(x - w * 0.07, 0, x + w * 0.07, 0);
    fold.addColorStop(0, 'rgba(20,4,2,0.45)');
    fold.addColorStop(0.5, 'rgba(255,214,140,0.28)');
    fold.addColorStop(1, 'rgba(20,4,2,0.45)');
    ctx.fillStyle = fold;
    ctx.fillRect(x - w * 0.07, 0, w * 0.14, h);
  }
  sparkles(ctx, w, h, t, 34, 47);
};

/** Circular header ring above the stage: the sign repeated on a gold band. */
export const paintRing: Painter = (ctx, w, h, t) => {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#f3c665');
  bg.addColorStop(0.5, '#b97a1c');
  bg.addColorStop(1, '#f3c665');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  const sweepX = ((t * 0.12) % 1) * w;
  const sweep = ctx.createLinearGradient(sweepX - w * 0.08, 0, sweepX + w * 0.08, 0);
  sweep.addColorStop(0, 'rgba(255,255,255,0)');
  sweep.addColorStop(0.5, 'rgba(255,250,230,0.5)');
  sweep.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sweep;
  ctx.fillRect(0, 0, w, h);
  const lh = h * 0.66;
  const lw = lh * LOGO_ASPECT;
  const sign = getWordmark().canvas;
  for (let k = 0; k < 3; k++) ctx.drawImage(sign, (w * (k + 0.5)) / 3 - lw / 2, (h - lh) / 2, lw, lh);
};
