// Dominio: seba. Sonidos de la apertura sintetizados en vivo con WebAudio (0 KB, fase 2 · 2.48).
// Sting «digital» al aparecer la marca de Codex: barrido de ruido → ráfaga de datos → latido grave + acorde de cristal.
import Phaser from 'phaser';
import { effectiveVolume, settings } from './settings';

/** Instantes (ms desde el inicio del sting) de los dos latidos, para sincronizar la animación. */
export const STING_BEATS_MS = [380, 980] as const;

function ctxOf(game: Phaser.Game): AudioContext | null {
  const sm = game.sound as Phaser.Sound.WebAudioSoundManager;
  const ctx = (sm as unknown as { context?: AudioContext }).context;
  if (!ctx || game.sound.locked || ctx.state !== 'running') return null;
  return ctx;
}

function out(ctx: AudioContext, vol: number): GainNode {
  const g = ctx.createGain();
  g.gain.value = vol;
  g.connect(ctx.destination);
  return g;
}

function noiseBuffer(ctx: AudioContext, sec: number): AudioBuffer {
  const b = ctx.createBuffer(1, Math.ceil(sec * ctx.sampleRate), ctx.sampleRate);
  const d = b.getChannelData(0);
  let s = 1234567;
  for (let i = 0; i < d.length; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; d[i] = (s / 0x3fffffff) - 1; }
  return b;
}

function env(p: AudioParam, t0: number, a: number, peak: number, d: number): void {
  p.setValueAtTime(0.0001, t0);
  p.exponentialRampToValueAtTime(peak, t0 + a);
  p.exponentialRampToValueAtTime(0.0001, t0 + a + d);
}

function thump(ctx: AudioContext, dst: AudioNode, t: number, level: number): void {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(110, t);
  o.frequency.exponentialRampToValueAtTime(38, t + 0.35);
  env(g.gain, t, 0.006, level, 0.6);
  o.connect(g).connect(dst);
  o.start(t);
  o.stop(t + 0.7);
}

/** Devuelve false si el audio aún está bloqueado por el navegador (no suena nada). */
export function playSplashSting(game: Phaser.Game): boolean {
  const ctx = ctxOf(game);
  if (!ctx) return false;
  const vol = effectiveVolume(settings.get(), 'sfx', 0.9);
  if (vol <= 0) return true;
  const t0 = ctx.currentTime + 0.02;
  const master = out(ctx, vol);

  // eco estéreo corto para el brillo final
  const dl = ctx.createDelay(1);
  dl.delayTime.value = 0.19;
  const fb = ctx.createGain();
  fb.gain.value = 0.38;
  const wet = ctx.createGain();
  wet.gain.value = 0.35;
  dl.connect(fb).connect(dl);
  dl.connect(wet).connect(master);

  // 1) barrido de ruido (riser) 0 → 0.36 s
  const nz = ctx.createBufferSource();
  nz.buffer = noiseBuffer(ctx, 0.5);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 6;
  bp.frequency.setValueAtTime(300, t0);
  bp.frequency.exponentialRampToValueAtTime(7000, t0 + 0.36);
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.0001, t0);
  ng.gain.exponentialRampToValueAtTime(0.5, t0 + 0.3);
  ng.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.4);
  nz.connect(bp).connect(ng).connect(master);
  nz.start(t0);

  // 2) ráfaga de datos: blips cuadrados en pentatónica aguda
  const penta = [1760, 1975.5, 2349.3, 2637, 2960, 3520];
  for (let i = 0; i < 9; i++) {
    const t = t0 + 0.04 + i * 0.034;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'square';
    o.frequency.value = penta[(i * 7 + 3) % penta.length];
    env(g.gain, t, 0.002, 0.07, 0.03);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.06);
  }

  // 3) latidos graves sincronizados con la animación
  thump(ctx, master, t0 + STING_BEATS_MS[0] / 1000, 0.9);
  thump(ctx, master, t0 + STING_BEATS_MS[1] / 1000, 0.55);

  // 4) acorde de cristal FM (La add9) en el primer latido, con cola
  const tc = t0 + STING_BEATS_MS[0] / 1000;
  [440, 554.4, 659.3, 987.8, 1318.5].forEach((f, i) => {
    const car = ctx.createOscillator();
    const mod = ctx.createOscillator();
    const mg = ctx.createGain();
    const g = ctx.createGain();
    car.frequency.value = f * (1 + (i % 2 ? 0.002 : -0.002));
    mod.frequency.value = f * 3.5;
    mg.gain.setValueAtTime(f * 1.2, tc);
    mg.gain.exponentialRampToValueAtTime(1, tc + 0.9);
    mod.connect(mg).connect(car.frequency);
    env(g.gain, tc, 0.004, 0.11 - i * 0.012, 1.9);
    car.connect(g);
    g.connect(master);
    g.connect(dl);
    car.start(tc); mod.start(tc);
    car.stop(tc + 2.1); mod.stop(tc + 2.1);
  });
  return true;
}

/** «Tic» orgánico de cada flexión: golpe sordo de ropa contra el suelo + clic del contador. */
export function playPushupTick(game: Phaser.Game, count: number): void {
  const ctx = ctxOf(game);
  if (!ctx) return;
  const vol = effectiveVolume(settings.get(), 'ui', 0.8);
  if (vol <= 0) return;
  const t = ctx.currentTime + 0.01;
  const master = out(ctx, vol);
  const nz = ctx.createBufferSource();
  nz.buffer = noiseBuffer(ctx, 0.12);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 380;
  const g = ctx.createGain();
  env(g.gain, t, 0.004, 0.8, 0.09);
  nz.connect(lp).connect(g).connect(master);
  nz.start(t);
  // clic del contador: sube un poco cada 10 flexiones
  const o = ctx.createOscillator();
  const og = ctx.createGain();
  o.type = 'triangle';
  o.frequency.value = 880 * 2 ** (Math.min(12, Math.floor(count / 10) * 2) / 12);
  env(og.gain, t + 0.05, 0.002, 0.12, 0.05);
  o.connect(og).connect(master);
  o.start(t + 0.05);
  o.stop(t + 0.15);
}
