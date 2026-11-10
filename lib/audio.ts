import { AUDIO_URL } from './assets';

/**
 * Optional sound. Plays public/audio/eventguru.mp3 when present; otherwise a quiet
 * synthesised pad (Web Audio) so the sound control works without any audio asset.
 * Audio only ever starts from a user gesture (the sound button).
 */
class Ambience {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private element: HTMLAudioElement | null = null;
  private mode: 'none' | 'file' | 'synth' = 'none';

  private async init() {
    if (this.mode !== 'none') return;
    try {
      const head = await fetch(AUDIO_URL, { method: 'HEAD' });
      const type = head.headers.get('content-type') ?? '';
      if (head.ok && type.startsWith('audio')) {
        const el = new Audio(AUDIO_URL);
        el.loop = true;
        el.volume = 0;
        this.element = el;
        this.mode = 'file';
        return;
      }
    } catch {
      /* fall through to the synthesised pad */
    }
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    filter.Q.value = 0.6;
    filter.connect(master).connect(ctx.destination);
    // D major add9, voiced wide, each note slightly detuned for a slow shimmer.
    [73.42, 110, 146.83, 220, 277.18, 329.63].forEach((freq, i) => {
      for (const detune of [-6, 7]) {
        const osc = ctx.createOscillator();
        osc.type = i < 2 ? 'sine' : 'triangle';
        osc.frequency.value = freq;
        osc.detune.value = detune;
        const gain = ctx.createGain();
        gain.gain.value = 0.05 / (1 + i * 0.35);
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.05 + i * 0.013;
        const depth = ctx.createGain();
        depth.gain.value = gain.gain.value * 0.6;
        lfo.connect(depth).connect(gain.gain);
        osc.connect(gain).connect(filter);
        osc.start();
        lfo.start();
      }
    });
    this.ctx = ctx;
    this.master = master;
    this.mode = 'synth';
  }

  async setEnabled(on: boolean) {
    if (on) await this.init();
    if (this.mode === 'file' && this.element) {
      const el = this.element;
      if (on) await el.play().catch(() => undefined);
      const target = on ? 0.6 : 0;
      const start = el.volume;
      const t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / 900);
        el.volume = start + (target - start) * k;
        if (k < 1) requestAnimationFrame(step);
        else if (!on) el.pause();
      };
      requestAnimationFrame(step);
    } else if (this.mode === 'synth' && this.ctx && this.master) {
      if (on) await this.ctx.resume();
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(on ? 0.5 : 0, now, 0.5);
    }
  }
}

export const ambience = new Ambience();
