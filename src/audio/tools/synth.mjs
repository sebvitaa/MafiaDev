#!/usr/bin/env node
// Sintetizador chiptune offline: partitura JSON → WAV estéreo 44.1 kHz. Sin dependencias.
//   node synth.mjs song  song.json  out.wav      (música; bucle sin cortes si loop !== false)
//   node synth.mjs sfx   sfx.json   outdir/     (lista de efectos → outdir/<name>.wav)
//   node synth.mjs amb   zone1|zone2 out.wav [segundos]
//   node synth.mjs stats file.wav
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SR = 44100;
const TAU = Math.PI * 2;

// ───────────────────────── utilidades ─────────────────────────
let seed = 12345;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
export function midi(n) {
  const m = /^([A-Ga-g])([#b]?)(-?\d)$/.exec(n.trim());
  if (!m) throw new Error(`nota inválida: ${n}`);
  return 12 * (Number(m[3]) + 1) + NOTE[m[1].toUpperCase()] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}
const hz = (m) => 440 * 2 ** ((m - 69) / 12);
const QUAL = {
  '': [0, 4, 7], m: [0, 3, 7], '7': [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11], dim: [0, 3, 6],
  dim7: [0, 3, 6, 9], m7b5: [0, 3, 6, 10], sus4: [0, 5, 7], sus2: [0, 2, 7], aug: [0, 4, 8], '6': [0, 4, 7, 9],
  m6: [0, 3, 7, 9], add9: [0, 4, 7, 14], m9: [0, 3, 7, 10, 14], '9': [0, 4, 7, 10, 14], '5': [0, 7],
};
export function chord(sym) {
  const m = /^([A-G])([#b]?)(.*)$/.exec(sym.trim());
  if (!m) throw new Error(`acorde inválido: ${sym}`);
  const [quality, bassName] = m[3].split('/');
  const root = NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  const iv = QUAL[quality] ?? QUAL[quality.replace(/[()]/g, '')] ?? QUAL[''];
  let bass = root;
  if (bassName) { const b = /^([A-G])([#b]?)/.exec(bassName); if (b) bass = NOTE[b[1]] + (b[2] === '#' ? 1 : b[2] === 'b' ? -1 : 0); }
  return { root: ((root % 12) + 12) % 12, iv, bass: ((bass % 12) + 12) % 12 };
}
const SCALES = {
  minor: [0, 2, 3, 5, 7, 8, 10], harmonic: [0, 2, 3, 5, 7, 8, 11], dorian: [0, 2, 3, 5, 7, 9, 10],
  major: [0, 2, 4, 5, 7, 9, 11], phrygian: [0, 1, 3, 5, 7, 8, 10], blues: [0, 3, 5, 6, 7, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
};

function polyblep(t, dt) {
  if (t < dt) { t /= dt; return t + t - t * t - 1; }
  if (t > 1 - dt) { t = (t - 1) / dt; return t * t + t + t + 1; }
  return 0;
}
/** Oscilador con estado de fase. wave: pulse|square|saw|triangle|sine|noise|metal */
function osc(wave, duty = 0.5) {
  let ph = 0, lfsr = 1, held = 0, nph = 0;
  return (f) => {
    const dt = f / SR;
    ph += dt; if (ph >= 1) ph -= 1;
    switch (wave) {
      case 'sine': return Math.sin(TAU * ph);
      case 'triangle': { // triángulo cuantizado a 4 bits, estilo NES
        const v = ph < 0.5 ? 4 * ph - 1 : 3 - 4 * ph;
        return Math.round(v * 7.5) / 7.5;
      }
      case 'saw': return 2 * ph - 1 - polyblep(ph, dt);
      case 'noise': case 'metal': {
        nph += f / SR * 8;
        while (nph >= 1) {
          nph -= 1;
          const bit = (lfsr ^ (lfsr >> (wave === 'metal' ? 6 : 1))) & 1;
          lfsr = (lfsr >> 1) | (bit << 14);
          held = (lfsr & 1) ? 1 : -1;
        }
        return held;
      }
      default: { // pulse/square
        const d = wave === 'square' ? 0.5 : duty;
        let v = ph < d ? 1 : -1;
        v += polyblep(ph, dt);
        v -= polyblep((ph - d + 1) % 1, dt);
        return v;
      }
    }
  };
}
function onePoleLP(cut) { let y = 0; const a = 1 - Math.exp(-TAU * cut / SR); return (x, c) => { if (c) { const b = 1 - Math.exp(-TAU * c / SR); y += b * (x - y); } else y += a * (x - y); return y; }; }
function onePoleHP(cut) { const lp = onePoleLP(cut); return (x) => x - lp(x); }

class Buf {
  constructor(sec) { this.L = new Float32Array(Math.ceil(sec * SR)); this.R = new Float32Array(this.L.length); }
  add(i, v, pan = 0) {
    if (i < 0 || i >= this.L.length) return;
    this.L[i] += v * Math.cos((pan + 1) * Math.PI / 4) * Math.SQRT2;
    this.R[i] += v * Math.sin((pan + 1) * Math.PI / 4) * Math.SQRT2;
  }
}

// ───────────────────────── voces ─────────────────────────
const INSTR = {
  pulse25: { wave: 'pulse', duty: 0.25, a: 0.012, d: 0.14, s: 0.6, r: 0.1, vib: 0.2, gain: 0.15, lp: 4200 },
  pulse12: { wave: 'pulse', duty: 0.125, a: 0.008, d: 0.1, s: 0.5, r: 0.09, vib: 0.18, gain: 0.12, lp: 4200 },
  pulse50: { wave: 'square', a: 0.012, d: 0.12, s: 0.6, r: 0.1, vib: 0.2, gain: 0.13, lp: 3800 },
  triangle: { wave: 'triangle', a: 0.004, d: 0.1, s: 0.85, r: 0.06, vib: 0.15, gain: 0.34 },
  saw: { wave: 'saw', a: 0.01, d: 0.15, s: 0.6, r: 0.12, vib: 0.2, gain: 0.13, lp: 2600 },
  sine: { wave: 'sine', a: 0.02, d: 0.2, s: 0.7, r: 0.2, vib: 0.25, gain: 0.3 },
  arp: { wave: 'pulse', duty: 0.125, a: 0.005, d: 0.07, s: 0.2, r: 0.07, vib: 0, gain: 0.08, lp: 5000 },
  pad: { wave: 'saw', a: 0.35, d: 0.5, s: 0.7, r: 0.5, vib: 0.05, gain: 0.045, lp: 1100, detune: 0.09 },
  bass: { wave: 'triangle', a: 0.004, d: 0.08, s: 0.9, r: 0.05, vib: 0, gain: 0.55 },
  bassSaw: { wave: 'saw', a: 0.004, d: 0.12, s: 0.6, r: 0.05, vib: 0, gain: 0.16, lp: 700 },
};

function renderNote(buf, start, dur, m, ins, { pan = 0, vel = 1, slideFrom = null } = {}) {
  const I = typeof ins === 'string' ? INSTR[ins] : ins;
  const total = dur + I.r;
  const n = Math.floor(total * SR);
  const i0 = Math.floor(start * SR);
  const voices = I.detune ? [osc(I.wave, I.duty), osc(I.wave, I.duty)] : [osc(I.wave, I.duty)];
  const lp = I.lp ? onePoleLP(I.lp) : null;
  const f0 = hz(m);
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    let env;
    if (t < I.a) env = t / I.a;
    else if (t < dur) env = I.s + (1 - I.s) * Math.exp(-(t - I.a) / Math.max(0.001, I.d));
    else {
      const atRel = dur < I.a ? dur / I.a : I.s + (1 - I.s) * Math.exp(-(dur - I.a) / Math.max(0.001, I.d));
      env = atRel * Math.max(0, 1 - (t - dur) / I.r);
    }
    let f = f0;
    if (slideFrom !== null && t < 0.05) f = hz(slideFrom + (m - slideFrom) * (t / 0.05));
    if (I.vib && t > 0.18) f *= 2 ** ((I.vib * Math.sin(TAU * 5.5 * t) * Math.min(1, (t - 0.18) * 4)) / 12);
    let v = 0;
    voices.forEach((o, j) => { v += o(f * (I.detune ? 2 ** (((j ? 1 : -1) * I.detune) / 12) : 1)); });
    v /= voices.length;
    if (lp) v = lp(v);
    buf.add(i0 + k, v * env * I.gain * vel, pan);
  }
}

const DRUM = {
  k(buf, s, vel) { // bombo
    const o = osc('sine'); const n = 0.18 * SR, i0 = Math.floor(s * SR);
    for (let k = 0; k < n; k++) { const t = k / SR; const f = 45 + 110 * Math.exp(-t * 30); buf.add(i0 + k, o(f) * Math.exp(-t * 18) * 0.55 * vel); }
  },
  s(buf, s, vel) { // caja
    const nz = osc('noise'), to = osc('triangle'), hp = onePoleHP(900); const n = 0.16 * SR, i0 = Math.floor(s * SR);
    for (let k = 0; k < n; k++) { const t = k / SR; buf.add(i0 + k, (hp(nz(9000)) * Math.exp(-t * 22) * 0.3 + to(185 * Math.exp(-t * 8)) * Math.exp(-t * 30) * 0.22) * vel, 0.05); }
  },
  h(buf, s, vel) { // charles cerrado
    const nz = osc('noise'), hp = onePoleHP(6000); const n = 0.04 * SR, i0 = Math.floor(s * SR);
    for (let k = 0; k < n; k++) { const t = k / SR; buf.add(i0 + k, hp(nz(16000)) * Math.exp(-t * 90) * 0.13 * vel, 0.25); }
  },
  o(buf, s, vel) { // charles abierto
    const nz = osc('noise'), hp = onePoleHP(5000); const n = 0.22 * SR, i0 = Math.floor(s * SR);
    for (let k = 0; k < n; k++) { const t = k / SR; buf.add(i0 + k, hp(nz(16000)) * Math.exp(-t * 14) * 0.09 * vel, 0.25); }
  },
  b(buf, s, vel) { // escobilla (jazz noir)
    const nz = osc('noise'), lp = onePoleLP(5000), hp = onePoleHP(1500); const n = 0.12 * SR, i0 = Math.floor(s * SR);
    for (let k = 0; k < n; k++) { const t = k / SR; const env = Math.min(1, t / 0.02) * Math.exp(-t * 20); buf.add(i0 + k, hp(lp(nz(12000))) * env * 0.12 * vel, -0.2); }
  },
  r(buf, s, vel) { // aro
    const to = osc('square'), hp = onePoleHP(1200); const n = 0.05 * SR, i0 = Math.floor(s * SR);
    for (let k = 0; k < n; k++) { const t = k / SR; buf.add(i0 + k, hp(to(1700)) * Math.exp(-t * 70) * 0.1 * vel, -0.1); }
  },
};

// ───────────────────────── efectos ─────────────────────────
function reverb(L, R, mix, size = 0.84) {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];
  const aps = [556, 441, 341, 225];
  const proc = (x, spread) => {
    const out = new Float32Array(x.length);
    for (const c of combs) {
      const d = c + spread, buf = new Float32Array(d); let idx = 0, filt = 0;
      for (let i = 0; i < x.length; i++) {
        const y = buf[idx]; filt = y * 0.8 + filt * 0.2; buf[idx] = x[i] * 0.015 + filt * size; idx = (idx + 1) % d; out[i] += y;
      }
    }
    for (const a of aps) {
      const d = a + spread, buf = new Float32Array(d); let idx = 0;
      for (let i = 0; i < out.length; i++) { const b = buf[idx]; const y = -out[i] + b; buf[idx] = out[i] + b * 0.5; idx = (idx + 1) % d; out[i] = y; }
    }
    return out;
  };
  const wl = proc(L, 0), wr = proc(R, 23);
  for (let i = 0; i < L.length; i++) { L[i] += wl[i] * mix; R[i] += wr[i] * mix; }
}
function delay(src, dstL, dstR, time, fb, mix) {
  const d = Math.floor(time * SR); const tmp = new Float32Array(src.L.length);
  for (let i = 0; i < tmp.length; i++) tmp[i] = (src.L[i] + src.R[i]) / 2 + (i >= d ? tmp[i - d] * fb : 0);
  for (let i = 0; i < tmp.length; i++) { const w = i >= d ? tmp[i - d] : 0; dstL[i] += w * mix * (Math.floor(i / d) % 2 ? 0.4 : 1); dstR[i] += w * mix * (Math.floor(i / d) % 2 ? 1 : 0.4); }
}

// ───────────────────────── canción ─────────────────────────
function parseLine(line, steps) {
  // "D5:4 F5:2 r:2 ..." duraciones en semicorcheas. Ajusta la suma a `steps`.
  const out = []; let pos = 0;
  for (const tok of String(line ?? '').trim().split(/\s+/).filter(Boolean)) {
    const [n, d] = tok.split(':'); const len = Math.max(1, Math.round(Number(d) || 1));
    if (pos >= steps) break;
    const l = Math.min(len, steps - pos);
    if (!/^r(est)?$/i.test(n) && n !== '-') {
      try { out.push({ pos, len: l, m: midi(n) }); } catch { /* nota rara: silencio */ }
    }
    pos += l;
  }
  return out;
}
function snap(m, scale, keyPc, chordPcs, strong) {
  const pcs = strong ? chordPcs : scale.map((s) => (s + keyPc) % 12);
  let best = m, bd = 99;
  for (let d = -2; d <= 2; d++) { const pc = (((m + d) % 12) + 12) % 12; if (pcs.includes(pc) && Math.abs(d) < bd) { bd = Math.abs(d); best = m + d; } }
  return best;
}

export function renderSong(song) {
  seed = 777;
  const spb = (song.stepsPerBar ?? 16);
  const stepDur = 60 / song.bpm / 4;
  const swing = song.swing ?? 0;
  const keyPc = chord(song.key ?? 'C').root;
  const scale = SCALES[song.mode ?? 'minor'] ?? SCALES.minor;
  const order = song.order ?? song.sections.map((s) => s.name);
  const secs = Object.fromEntries(song.sections.map((s) => [s.name, s]));
  const totalBars = order.reduce((n, name) => n + secs[name].bars.length, 0);
  const loopLen = totalBars * spb * stepDur;
  const tail = 3.0;
  const dry = new Buf(loopLen + tail), lead = new Buf(loopLen + tail), pad = new Buf(loopLen + tail);
  const t = (bar, step) => (bar * spb + step) * stepDur + (step % 2 ? swing * stepDur : 0);
  let bar = 0;
  for (const name of order) {
    const S = secs[name];
    const leadIns = S.lead ?? song.lead ?? 'pulse25';
    S.bars.forEach((B, bi) => {
      const ch = chord(B.c ?? 'C');
      const chordPcs = ch.iv.map((i) => (ch.root + i) % 12);
      const nextCh = chord((S.bars[bi + 1] ?? secs[order[(order.indexOf(name) + 1) % order.length]].bars[0]).c ?? 'C');
      // melodía (y contramelodía)
      for (const [line, ins, pan, vel] of [[B.m, leadIns, -0.15, 1], [B.m2, S.lead2 ?? 'pulse12', 0.3, 0.7]]) {
        let prev = null;
        for (const n of parseLine(line, spb)) {
          const m = song.snap === false ? n.m : snap(n.m, scale, keyPc, chordPcs, n.pos % 8 === 0);
          renderNote(lead, t(bar, n.pos), n.len * stepDur * 0.92, m, ins, { pan, vel, slideFrom: S.glide && prev !== null && Math.abs(prev - m) <= 4 ? prev : null });
          prev = m;
        }
      }
      // bajo
      const bassOct = 12 * ((S.bassOct ?? song.bassOct ?? 2) + 1);
      const root = bassOct + ch.bass, fifth = bassOct + ch.root + 7 > bassOct + 11 ? bassOct + ch.root - 5 : bassOct + ch.root + 7;
      const bassIns = S.bassIns ?? song.bassIns ?? 'bass';
      const style = S.bass ?? 'root8';
      if (style === 'line' && B.b) for (const n of parseLine(B.b, spb)) renderNote(dry, t(bar, n.pos), n.len * stepDur * 0.9, n.m, bassIns);
      else if (style === 'walking') {
        const third = bassOct + ch.root + ch.iv[1];
        const nextRoot = bassOct + nextCh.bass;
        const approach = nextRoot + (rnd() < 0.5 ? -1 : 1);
        [root, third, fifth, approach].forEach((m, q) => renderNote(dry, t(bar, q * 4), stepDur * 3.6, m, bassIns, { vel: q === 0 ? 1 : 0.85 }));
      } else if (style === 'rootfifth') {
        [root, fifth, root, fifth].forEach((m, q) => renderNote(dry, t(bar, q * 4), stepDur * 3.2, m, bassIns));
      } else if (style === 'octave') {
        for (let q = 0; q < 8; q++) renderNote(dry, t(bar, q * 2), stepDur * 1.6, q % 2 ? root + 12 : root, bassIns);
      } else if (style === 'pedal') {
        renderNote(dry, t(bar, 0), stepDur * 15, root, bassIns);
      } else if (style !== 'none') {
        for (let q = 0; q < 8; q++) renderNote(dry, t(bar, q * 2), stepDur * 1.7, root, bassIns, { vel: q % 2 ? 0.8 : 1 });
      }
      // acompañamiento
      const harmOct = 12 * ((S.harmOct ?? 4) + 1);
      const tones = ch.iv.map((i) => harmOct + ch.root + i);
      const acc = S.acc ?? 'arp8';
      if (acc === 'pad' || acc === 'padarp') for (const m of tones.slice(0, 4)) renderNote(pad, t(bar, 0), stepDur * spb * 0.98, m, 'pad');
      if (acc === 'arp8' || acc === 'arp16' || acc === 'padarp') {
        const every = acc === 'arp16' ? 1 : 2;
        const seq = [...tones, tones[1] + 12, ...tones.slice(1).reverse()];
        for (let st = 0, j = 0; st < spb; st += every, j++) renderNote(lead, t(bar, st), stepDur * every * 0.8, seq[j % seq.length], 'arp', { pan: 0.35 });
      }
      if (acc === 'stab') for (const st of [0, 6, 10]) for (const m of tones.slice(0, 3)) renderNote(dry, t(bar, st), stepDur * 1.2, m, 'arp', { pan: 0.2, vel: 1.3 });
      // batería
      const dr = S.drums ?? {};
      for (const [k, pat] of Object.entries(dr)) {
        if (!DRUM[k] || typeof pat !== 'string') continue;
        for (let st = 0; st < Math.min(spb, pat.length); st++) {
          const c = pat[st];
          if (c === 'x' || c === 'X') DRUM[k](dry, t(bar, st), c === 'X' ? 1.2 : 0.9 + rnd() * 0.15);
          else if (c === 'g') DRUM[k](dry, t(bar, st), 0.4);
        }
      }
      bar++;
    });
  }
  // mezcla y efectos
  const L = new Float32Array(dry.L.length), R = new Float32Array(dry.L.length);
  for (let i = 0; i < L.length; i++) { L[i] = dry.L[i] + lead.L[i] + pad.L[i]; R[i] = dry.R[i] + lead.R[i] + pad.R[i]; }
  const fx = song.fx ?? {};
  delay(lead, L, R, (60 / song.bpm) * 0.75, fx.delayFb ?? 0.3, fx.delay ?? 0.16);
  reverb(L, R, fx.reverb ?? 0.22);
  const lpL = onePoleLP(fx.lowpass ?? 9000), lpR = onePoleLP(fx.lowpass ?? 9000);
  for (let i = 0; i < L.length; i++) { L[i] = lpL(L[i]); R[i] = lpR(R[i]); }
  // bucle: la cola posterior al final se suma al principio → loop sin cortes
  const N = Math.round(loopLen * SR);
  if (song.loop !== false) {
    for (let i = N; i < L.length; i++) { L[i - N] += L[i]; R[i - N] += R[i]; }
    return normalize([L.subarray(0, N), R.subarray(0, N)], 0.89);
  }
  return normalize([L, R], 0.89, true);
}

function normalize([L, R], peak, trim = false) {
  let mx = 1e-9; for (let i = 0; i < L.length; i++) mx = Math.max(mx, Math.abs(L[i]), Math.abs(R[i]));
  const g = peak / mx; for (let i = 0; i < L.length; i++) { L[i] *= g; R[i] *= g; }
  if (trim) { // corta la cola por debajo de −54 dBFS y aplica un fundido de 20 ms para no dejar clic
    const th = 0.002; let e = L.length; while (e > SR * 0.05 && Math.abs(L[e - 1]) < th && Math.abs(R[e - 1]) < th) e--;
    const f = Math.min(e, Math.floor(0.02 * SR)); for (let i = 0; i < f; i++) { const g2 = i / f; L[e - 1 - i] *= g2; R[e - 1 - i] *= g2; }
    return [L.subarray(0, e), R.subarray(0, e)]; }
  return [L, R];
}

// ───────────────────────── SFX ─────────────────────────
// capa: { wave, duty, f0, f1, curve:'lin'|'exp', t, dur, a, d, s?, vib:{rate,depth}, arp:[[t,mult]], lp, lp1, hp, gain, pan, crush, dist, rep }
export function renderSfx(spec) {
  seed = 99;
  const len = Math.max(...spec.layers.map((l) => (l.t ?? 0) + l.dur)) + (spec.reverb ? 0.6 : 0.05);
  const buf = new Buf(len);
  for (const l of spec.layers) {
    const o = osc(l.wave ?? 'square', l.duty ?? 0.5);
    const hp = l.hp ? onePoleHP(l.hp) : null;
    const lp = onePoleLP(l.lp ?? 18000);
    const n = Math.floor(l.dur * SR), i0 = Math.floor((l.t ?? 0) * SR);
    const a = l.a ?? 0.002, s = l.s ?? 0, d = l.d ?? l.dur;
    for (let k = 0; k < n; k++) {
      const tt = k / SR, u = tt / l.dur;
      const tRep = l.rep ? tt % l.rep : tt, uRep = l.rep ? tRep / l.dur : u;
      let f = l.curve === 'exp' && l.f1 > 0 && l.f0 > 0 ? l.f0 * (l.f1 / l.f0) ** uRep : l.f0 + ((l.f1 ?? l.f0) - l.f0) * uRep;
      for (const [at, mult] of l.arp ?? []) if (tt >= at) f = f * mult;
      if (l.vib) f *= 1 + l.vib.depth * Math.sin(TAU * l.vib.rate * tt);
      let env = tt < a ? tt / a : s + (1 - s) * Math.exp(-(tt - a) / Math.max(0.001, d / 4));
      env *= Math.min(1, (l.dur - tt) / 0.004);
      let v = o(Math.max(1, f));
      if (hp) v = hp(v);
      v = lp(v, l.lp1 ? l.lp + (l.lp1 - l.lp) * u : 0);
      if (l.dist) v = Math.tanh(v * (1 + l.dist * 6)) / Math.tanh(1 + l.dist * 6);
      if (l.crush) v = Math.round(v * l.crush) / l.crush;
      buf.add(i0 + k, v * env * (l.gain ?? 0.7), l.pan ?? 0);
    }
  }
  if (spec.reverb) reverb(buf.L, buf.R, spec.reverb, 0.8);
  return normalize([buf.L, buf.R], spec.peak ?? 0.85, true);
}

// ───────────────────────── ambiente ─────────────────────────
export function renderAmbient(kind, sec = 24) {
  seed = kind === 'zone2' ? 4242 : 2424;
  const buf = new Buf(sec + 2);
  const N = Math.floor(sec * SR);
  const nz = osc('noise'), lp1 = onePoleLP(380), lp2 = onePoleLP(2200), hp2 = onePoleHP(900), drone = osc('saw'), dl = onePoleLP(220);
  for (let i = 0; i < buf.L.length; i++) {
    const tt = i / SR;
    const gust = 0.55 + 0.45 * Math.sin(TAU * tt / sec * 2) * Math.sin(TAU * tt / sec * 3 + 1);
    const n = nz(15000);
    let v;
    if (kind === 'zone1') { // ciudad de noche bajo lluvia: rumor grave + lluvia fina
      v = lp1(n) * 0.5 * gust + hp2(lp2(n)) * 0.12;
      v += dl(drone(55 + Math.sin(TAU * tt / sec) * 0.5)) * 0.06; // zumbido urbano lejano
    } else { // cueva/sótano: dron grave y aire
      v = lp1(n) * 0.35 * gust + dl(drone(41.2)) * 0.12 + dl(drone(61.7)) * 0.05;
    }
    buf.add(i, v, Math.sin(TAU * tt / sec) * 0.3);
  }
  // eventos puntuales: gotas (zone2) / gotas de canalón y sirena lejana muy suave (zone1)
  const events = kind === 'zone2' ? 26 : 34;
  for (let e = 0; e < events; e++) {
    const at = rnd() * sec, pan = rnd() * 1.6 - 0.8;
    const o = osc('sine'); const f0 = 900 + rnd() * 1400; const n = 0.09 * SR; const i0 = Math.floor(at * SR);
    for (let k = 0; k < n; k++) { const tt = k / SR; buf.add(i0 + k, o(f0 * (1 + 2 * Math.exp(-tt * 60))) * Math.exp(-tt * 45) * (kind === 'zone2' ? 0.12 : 0.05), pan); }
  }
  if (kind === 'zone1') {
    const o = osc('sine'); const at = sec * 0.55; const n = 5 * SR; const i0 = Math.floor(at * SR);
    for (let k = 0; k < n; k++) { const tt = k / SR; const f = 620 + 140 * Math.sin(TAU * 0.5 * tt); buf.add(i0 + k, o(f) * Math.sin(Math.PI * tt / 5) * 0.012, 0.6); }
  }
  reverb(buf.L, buf.R, kind === 'zone2' ? 0.5 : 0.25, 0.88);
  // fundido cruzado de potencia constante: el final continúa en buf[N..] y se funde con el inicio → bucle continuo
  const X = Math.floor(1.0 * SR);
  for (let i = 0; i < X; i++) {
    const w = (i / X) * Math.PI / 2;
    buf.L[i] = buf.L[i] * Math.sin(w) + buf.L[N + i] * Math.cos(w);
    buf.R[i] = buf.R[i] * Math.sin(w) + buf.R[N + i] * Math.cos(w);
  }
  return normalize([buf.L.subarray(0, N), buf.R.subarray(0, N)], 0.7);
}

// ───────────────────────── WAV ─────────────────────────
export function writeWav(file, [L, R]) {
  const n = L.length, b = Buffer.alloc(44 + n * 4);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 4, 4); b.write('WAVE', 8); b.write('fmt ', 12);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22); b.writeUInt32LE(SR, 24);
  b.writeUInt32LE(SR * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(L[i] * 32767))), 44 + i * 4);
    b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(R[i] * 32767))), 46 + i * 4);
  }
  fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  fs.writeFileSync(file, b);
}
function stats(file) {
  const b = fs.readFileSync(file); const n = (b.length - 44) / 4; let pk = 0, ss = 0, zc = 0, prev = 0;
  for (let i = 0; i < n; i++) { const v = b.readInt16LE(44 + i * 4) / 32768; pk = Math.max(pk, Math.abs(v)); ss += v * v; if ((v >= 0) !== (prev >= 0)) zc++; prev = v; }
  const rms = Math.sqrt(ss / n);
  return { dur: +(n / SR).toFixed(2), peakDb: +(20 * Math.log10(pk)).toFixed(1), rmsDb: +(20 * Math.log10(rms + 1e-9)).toFixed(1), zcrHz: Math.round(zc / 2 / (n / SR)) };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [cmd, a, b, c] = process.argv.slice(2);
  if (cmd === 'song') { const s = JSON.parse(fs.readFileSync(a, 'utf8')); writeWav(b, renderSong(s)); console.log(b, stats(b)); }
  else if (cmd === 'sfx') {
    const list = JSON.parse(fs.readFileSync(a, 'utf8')); const arr = Array.isArray(list) ? list : list.sfx;
    for (const s of arr) { const f = path.join(b, `${s.name}.wav`); try { writeWav(f, renderSfx(s)); console.log(s.name, JSON.stringify(stats(f))); } catch (e) { console.error('✖', s.name, e.message); } }
  } else if (cmd === 'amb') { writeWav(b, renderAmbient(a, Number(c ?? 24))); console.log(b, stats(b)); }
  else if (cmd === 'stats') console.log(stats(a));
  else { console.error('uso: synth.mjs song|sfx|amb|stats ...'); process.exit(1); }
}
