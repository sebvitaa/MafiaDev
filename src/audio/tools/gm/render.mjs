#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const FLUIDSYNTH = '/opt/homebrew/bin/fluidsynth';
const FFMPEG = '/opt/homebrew/bin/ffmpeg';
const SAMPLE_RATE = 48000;
const PPQ = 480;
const RENDER_TAIL_SECONDS = 5.5;

function fail(message, code = 1) {
  console.error(message);
  process.exitCode = code;
}

function usage() {
  console.log(`Uso:
  node src/audio/tools/gm/render.mjs <score.json> <out.wav> --sf <file.sf2> [--sso <orchestra.sf2>] [--mid out.mid] [--stems dir] [--lufs -16] [--mono]
  node src/audio/tools/gm/render.mjs --validate <score.json>`);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function numberIn(value, min, max) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function integerIn(value, min, max) {
  return Number.isInteger(value) && value >= min && value <= max;
}

function pitchToMidi(value) {
  if (Number.isInteger(value)) return value >= 0 && value <= 127 ? value : null;
  if (typeof value !== 'string') return null;
  const match = /^([A-Ga-g])([#b]?)(-?\d+)$/.exec(value);
  if (!match) return null;
  const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[match[1].toUpperCase()];
  const accidental = match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0;
  const midi = (Number(match[3]) + 1) * 12 + base + accidental;
  return midi >= 0 && midi <= 127 ? midi : null;
}

function validateScore(score) {
  const errors = [];
  if (!isObject(score)) return ['El score debe ser un objeto JSON.'];
  if (typeof score.name !== 'string' || !score.name.trim()) errors.push('name: se requiere un texto no vacío.');
  if (!numberIn(score.bpm, 20, 300)) errors.push('bpm: debe ser un número entre 20 y 300.');
  if (!integerIn(score.beatsPerBar, 1, 16)) errors.push('beatsPerBar: debe ser un entero entre 1 y 16.');
  if (!integerIn(score.bars, 1, 512)) errors.push('bars: debe ser un entero entre 1 y 512.');
  if (typeof score.loop !== 'boolean') errors.push('loop: debe ser boolean.');
  if (!numberIn(score.swing, 0, 0.33)) errors.push('swing: debe estar entre 0 y 0.33.');
  if (score.space !== undefined && !numberIn(score.space, 0, 1)) errors.push('space: debe estar entre 0 y 1.');
  if (!Array.isArray(score.tracks)) errors.push('tracks: debe ser un arreglo.');
  if (Array.isArray(score.tracks)) {
    const melodic = score.tracks.filter((t) => isObject(t) && t.drums !== true).length;
    const drums = score.tracks.filter((t) => isObject(t) && t.drums === true).length;
    if (melodic > 12) errors.push(`tracks: máximo 12 pistas melódicas (se encontraron ${melodic}).`);
    if (drums > 1) errors.push(`tracks: máximo 1 pista de batería (se encontraron ${drums}).`);
    if (score.tracks.length > 13) errors.push('tracks: máximo 13 pistas en total.');
  }
  if (!integerIn(score.beatsPerBar, 1, 16) || !integerIn(score.bars, 1, 512)) return errors;
  const totalBeats = score.beatsPerBar * score.bars;
  let expandedCount = 0;
  for (const [trackIndex, track] of (Array.isArray(score.tracks) ? score.tracks : []).entries()) {
    const prefix = `tracks[${trackIndex}]`;
    if (!isObject(track)) {
      errors.push(`${prefix}: debe ser un objeto.`);
      continue;
    }
    if (typeof track.name !== 'string' || !track.name.trim()) errors.push(`${prefix}.name: se requiere un texto no vacío.`);
    if (track.drums !== undefined && typeof track.drums !== 'boolean') errors.push(`${prefix}.drums: debe ser boolean.`);
    if (track.sso !== undefined && track.sso !== false && !integerIn(track.sso, 0, 43)) errors.push(`${prefix}.sso: debe ser false o un preset SSO entre 0 y 43.`);
    const isDrum = track.drums === true;
    if (!isDrum && !integerIn(track.program, 0, 127)) errors.push(`${prefix}.program: debe ser un entero GM entre 0 y 127.`);
    if (isDrum && track.kit !== undefined && !integerIn(track.kit, 0, 127)) errors.push(`${prefix}.kit: debe ser un entero entre 0 y 127.`);
    for (const [key, min, max] of [['volume', 0, 127], ['pan', -64, 63], ['reverb', 0, 127], ['chorus', 0, 127]]) {
      if (track[key] !== undefined && !integerIn(track[key], min, max)) errors.push(`${prefix}.${key}: fuera de rango (${min}..${max}).`);
    }
    if (track.humanize !== undefined) {
      if (!isObject(track.humanize)) errors.push(`${prefix}.humanize: debe ser un objeto.`);
      else {
        if (track.humanize.timeMs !== undefined && !numberIn(track.humanize.timeMs, 0, 100)) errors.push(`${prefix}.humanize.timeMs: debe estar entre 0 y 100.`);
        if (track.humanize.vel !== undefined && !integerIn(track.humanize.vel, 0, 40)) errors.push(`${prefix}.humanize.vel: debe ser un entero entre 0 y 40.`);
      }
    }
    const items = [];
    if (track.notes !== undefined && !Array.isArray(track.notes)) errors.push(`${prefix}.notes: debe ser un arreglo.`);
    if (Array.isArray(track.notes)) {
      track.notes.forEach((note, noteIndex) => {
        const where = `${prefix}.notes[${noteIndex}]`;
        if (!Array.isArray(note) || note.length !== 4) {
          errors.push(`${where}: debe tener [startBeat, durationBeats, pitch, velocity].`);
          return;
        }
        const [start, duration, pitch, velocity] = note;
        if (!numberIn(start, 0, totalBeats) || !numberIn(duration, Number.EPSILON, totalBeats)) errors.push(`${where}: inicio o duración fuera de rango.`);
        if (pitchToMidi(pitch) === null) errors.push(`${where}: pitch inválido (${String(pitch)}); usa MIDI 0..127 o nota como C#4/Eb3.`);
        if (!integerIn(velocity, 1, 127)) errors.push(`${where}: velocity debe ser entero 1..127.`);
        if (numberIn(start, 0, totalBeats) && numberIn(duration, Number.EPSILON, totalBeats)) {
          if (start + duration > totalBeats + 1e-9) errors.push(`${where}: la nota termina después de ${totalBeats} beats.`);
          else items.push({ start, duration, pitch, velocity, source: noteIndex });
        }
      });
    }
    if (track.patterns !== undefined && !Array.isArray(track.patterns)) errors.push(`${prefix}.patterns: debe ser un arreglo.`);
    if (Array.isArray(track.patterns)) {
      track.patterns.forEach((pattern, patternIndex) => {
        const where = `${prefix}.patterns[${patternIndex}]`;
        if (!isObject(pattern)) {
          errors.push(`${where}: debe ser un objeto.`);
          return;
        }
        if (!numberIn(pattern.start, 0, totalBeats)) errors.push(`${where}.start: fuera del rango del score.`);
        if (!numberIn(pattern.everyBeats, Number.EPSILON, totalBeats)) errors.push(`${where}.everyBeats: debe ser positivo y finito.`);
        if (!integerIn(pattern.times, 1, 100000)) errors.push(`${where}.times: debe ser un entero 1..100000.`);
        if (!Array.isArray(pattern.notes)) errors.push(`${where}.notes: debe ser un arreglo.`);
        if (!Array.isArray(pattern.notes) || !numberIn(pattern.start, 0, totalBeats) || !numberIn(pattern.everyBeats, Number.EPSILON, totalBeats) || !integerIn(pattern.times, 1, 100000)) return;
        pattern.notes.forEach((note, noteIndex) => {
          const noteWhere = `${where}.notes[${noteIndex}]`;
          if (!Array.isArray(note) || note.length !== 4) {
            errors.push(`${noteWhere}: debe tener [startBeat, durationBeats, pitch, velocity].`);
            return;
          }
          const [relativeStart, duration, pitch, velocity] = note;
          if (!numberIn(relativeStart, 0, totalBeats) || !numberIn(duration, Number.EPSILON, totalBeats)) errors.push(`${noteWhere}: inicio o duración fuera de rango.`);
          if (pitchToMidi(pitch) === null) errors.push(`${noteWhere}: pitch inválido (${String(pitch)}); usa MIDI 0..127 o nota como C#4/Eb3.`);
          if (!integerIn(velocity, 1, 127)) errors.push(`${noteWhere}: velocity debe ser entero 1..127.`);
          if (!numberIn(relativeStart, 0, totalBeats) || !numberIn(duration, Number.EPSILON, totalBeats)) return;
          for (let repeat = 0; repeat < pattern.times; repeat += 1) {
            const start = pattern.start + repeat * pattern.everyBeats + relativeStart;
            if (start + duration > totalBeats + 1e-9) {
              errors.push(`${noteWhere}: expansión ${repeat + 1} termina después de ${totalBeats} beats.`);
              break;
            }
            if (pitchToMidi(pitch) !== null && integerIn(velocity, 1, 127)) items.push({ start, duration, pitch, velocity, source: `p${patternIndex}n${noteIndex}r${repeat}` });
            expandedCount += 1;
            if (expandedCount > 1000000) {
              errors.push('patterns: expansión máxima de 1,000,000 notas excedida.');
              return;
            }
          }
        });
      });
    }
    if (track.notes === undefined && track.patterns === undefined) errors.push(`${prefix}: se requiere notes o patterns.`);
    if (track.cc !== undefined && !Array.isArray(track.cc)) errors.push(`${prefix}.cc: debe ser un arreglo.`);
    if (Array.isArray(track.cc)) {
      const seen = new Set();
      track.cc.forEach((point, ccIndex) => {
        const where = `${prefix}.cc[${ccIndex}]`;
        if (!Array.isArray(point) || point.length !== 3) {
          errors.push(`${where}: debe tener [beat, controller, value].`);
          return;
        }
        const [beat, controller, value] = point;
        if (!numberIn(beat, 0, totalBeats)) errors.push(`${where}: beat fuera del score.`);
        if (!integerIn(controller, 0, 127)) errors.push(`${where}: controller debe ser entero 0..127.`);
        if (!integerIn(value, 0, 127)) errors.push(`${where}: value debe ser entero 0..127.`);
        if (numberIn(beat, 0, totalBeats) && integerIn(controller, 0, 127)) {
          const key = `${beat}:${controller}`;
          if (seen.has(key)) errors.push(`${where}: punto CC duplicado en el mismo beat.`);
          seen.add(key);
        }
      });
    }
  }
  return errors;
}

function hashSeed(text) {
  let seed = 2166136261;
  for (const char of text) {
    seed ^= char.codePointAt(0);
    seed = Math.imul(seed, 16777619);
  }
  return seed >>> 0 || 1;
}

function makeRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function swungBeat(beat, swing) {
  const floor = Math.floor(beat);
  if (Math.abs(beat - (floor + 0.5)) < 1e-7) return beat + swing * 0.5;
  return beat;
}

function varLen(value) {
  let v = Math.max(0, Math.floor(value));
  const bytes = [v & 0x7f];
  while ((v >>= 7) > 0) bytes.unshift((v & 0x7f) | 0x80);
  return Buffer.from(bytes);
}

function meta(type, data) {
  return Buffer.concat([Buffer.from([0xff, type]), varLen(data.length), data]);
}

function tickForBeat(beat, bpm) {
  return Math.max(0, Math.round(beat * PPQ));
}

function eventsToTrack(events, endTick) {
  events.sort((a, b) => a.tick - b.tick || a.order - b.order || a.serial - b.serial);
  const chunks = [];
  let previous = 0;
  for (const event of events) {
    chunks.push(varLen(event.tick - previous), event.bytes);
    previous = event.tick;
  }
  const finalTick = Math.max(previous, endTick);
  chunks.push(varLen(finalTick - previous), Buffer.from([0xff, 0x2f, 0x00]));
  const body = Buffer.concat(chunks);
  const header = Buffer.alloc(8);
  header.write('MTrk', 0, 4, 'ascii');
  header.writeUInt32BE(body.length, 4);
  return Buffer.concat([header, body]);
}

function midiEvent(tick, order, bytes, serial) {
  return { tick, order, bytes: Buffer.from(bytes), serial };
}

function expandedNotes(track) {
  const result = [];
  for (const [index, note] of (track.notes ?? []).entries()) result.push({ start: note[0], duration: note[1], pitch: note[2], velocity: note[3], source: `n${index}` });
  for (const [patternIndex, pattern] of (track.patterns ?? []).entries()) {
    for (let repeat = 0; repeat < pattern.times; repeat += 1) {
      for (const [noteIndex, note] of pattern.notes.entries()) {
        result.push({ start: pattern.start + repeat * pattern.everyBeats + note[0], duration: note[1], pitch: note[2], velocity: note[3], source: `p${patternIndex}n${noteIndex}r${repeat}` });
      }
    }
  }
  return result;
}

function interpolateExpression(cc, totalBeats) {
  const points = cc.filter((point) => point[1] === 11).map(([beat, , value]) => [beat, value]).sort((a, b) => a[0] - b[0]);
  if (points.length < 2) return points.map(([beat, value]) => [beat, 11, value]);
  const output = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const [start, from] = points[i];
    const [end, to] = points[i + 1];
    for (let beat = start; beat < end - 1e-9; beat += 0.125) {
      const t = (beat - start) / (end - start);
      output.push([beat, 11, Math.round(from + (to - from) * t)]);
    }
  }
  const [lastBeat, lastValue] = points.at(-1);
  output.push([lastBeat, 11, lastValue]);
  return output.filter(([beat]) => beat <= totalBeats);
}

function writeMidi(score, parts) {
  const totalBeats = score.beatsPerBar * score.bars;
  const repetitions = score.loop ? 2 : 1;
  const musicBeats = totalBeats * repetitions;
  const tailBeats = RENDER_TAIL_SECONDS * score.bpm / 60;
  const endTick = tickForBeat(musicBeats + tailBeats, score.bpm);
  const tempo = Math.round(60000000 / score.bpm);
  const conductor = [
    midiEvent(0, 0, meta(0x03, Buffer.from(score.name.slice(0, 127), 'utf8')), 0),
    midiEvent(0, 1, meta(0x51, Buffer.from([tempo >> 16 & 255, tempo >> 8 & 255, tempo & 255])), 1),
  ];
  conductor.push(midiEvent(0, 2, meta(0x58, Buffer.from([score.beatsPerBar, 2, 24, 8])), 2));
  const tracks = [eventsToTrack(conductor, endTick)];
  const melodicChannels = Array.from({ length: 16 }, (_, index) => index).filter((channel) => channel !== 9);
  let melodicIndex = 0;
  let serial = 10;
  for (const part of parts) {
    const track = part.track;
    const channel = part.drums ? 9 : melodicChannels[melodicIndex++];
    const events = [midiEvent(0, 0, meta(0x03, Buffer.from(part.name.slice(0, 127), 'utf8')), serial++)];
    const controller = (beat, cc, value, order = 3) => {
      const tick = tickForBeat(swungBeat(beat, score.swing), score.bpm);
      for (let repeat = 0; repeat < repetitions; repeat += 1) {
        events.push(midiEvent(tick + repeat * tickForBeat(totalBeats, score.bpm), order, [0xb0 | channel, cc, value], serial++));
      }
    };
    const program = part.drums ? (track.kit ?? 0) : part.program;
    events.push(midiEvent(0, 1, [0xc0 | channel, program], serial++));
    controller(0, 7, track.volume ?? 100);
    controller(0, 10, part.pan + 64);
    controller(0, 91, 0);
    controller(0, 93, 0);
    const cc = track.cc ?? [];
    const ccs = [...cc.filter((point) => point[1] !== 11), ...interpolateExpression(cc, totalBeats)];
    for (const [beat, number, value] of ccs) controller(beat, number, value);
    for (const note of part.notes) {
      const startTick = tickForBeat(note.start, score.bpm);
      const endTick = Math.max(startTick + 1, tickForBeat(note.end, score.bpm));
      for (let repeat = 0; repeat < repetitions; repeat += 1) {
        const shift = repeat * tickForBeat(totalBeats, score.bpm);
        events.push(midiEvent(startTick + shift, 6, [0x90 | channel, note.pitch, note.velocity], serial++));
        events.push(midiEvent(endTick + shift, 5, [0x80 | channel, note.pitch, 0], serial++));
      }
    }
    tracks.push(eventsToTrack(events, endTick));
  }
  const header = Buffer.alloc(14);
  header.write('MThd', 0, 4, 'ascii');
  header.writeUInt32BE(6, 4);
  header.writeUInt16BE(1, 8);
  header.writeUInt16BE(tracks.length, 10);
  header.writeUInt16BE(PPQ, 12);
  return Buffer.concat([header, ...tracks]);
}

const SSO_PROGRAMS = new Map([
  [0, 0], [1, 0], [46, 1], [40, 2], [41, 6], [42, 8], [43, 10], [47, 40],
  [52, 35], [53, 35], [54, 35], [56, 27], [57, 32], [58, 34], [60, 30],
  [68, 16], [69, 19], [70, 23], [71, 20], [72, 18], [73, 14], [9, 39],
  [13, 42], [14, 43], [112, 39],
]);
const FLUTE_PRESETS = new Set([14, 15, 18, 26]);
const SEATING_PAN = new Map([
  [0, 0], [1, -40], [2, -35], [3, -35], [4, -15], [5, -15], [6, 10], [7, 10],
  [8, 25], [9, 25], [10, 35], [11, 35], [12, -35], [13, 25], [14, -10], [15, -10],
  [16, 10], [17, 10], [18, -10], [19, 10], [20, -10], [21, -10], [22, -10],
  [23, 10], [24, 10], [25, 25], [26, -10], [27, 10], [28, 10], [29, -20],
  [30, -20], [31, 25], [32, 25], [33, 25], [34, 30], [35, 0], [40, 5],
]);

function hasChords(notes) {
  const counts = new Map();
  for (const note of notes) {
    const start = note.sourceStart ?? note.start;
    counts.set(start, (counts.get(start) ?? 0) + 1);
  }
  return [...counts.values()].some((count) => count >= 2);
}

function ensemblePreset(program, pitch) {
  const band = pitch >= 67 ? 0 : pitch >= 60 ? 1 : pitch >= 48 ? 2 : pitch >= 36 ? 3 : 4;
  if (program === 45) return [3, 5, 7, 9, 11][band];
  return [2, 4, 6, 8, 10][band];
}

function autoSsoPreset(track, notes) {
  if (track.sso !== undefined) return track.sso === false ? null : track.sso;
  if ([44, 48, 49, 50].includes(track.program)) return 'divisi';
  if (track.program === 45) return 'pizz-divisi';
  if (track.program === 61) return 'brass-divisi';
  const preset = SSO_PROGRAMS.get(track.program);
  if (preset === undefined) return null;
  if (track.program === 40 && /solo/i.test(track.name)) return 12;
  if (track.program === 42 && /solo/i.test(track.name)) return 13;
  if (track.program === 60 && /solo/i.test(track.name)) return 29;
  if (track.program === 56 && hasChords(notes)) return 28;
  if (track.program === 73 && hasChords(notes)) return 15;
  return preset;
}

function partPan(track, preset, drums = false) {
  if (drums) return track.pan ?? 0;
  return track.pan ? track.pan : (SEATING_PAN.get(preset) ?? 0);
}

function prepareTrackNotes(score, track, trackIndex) {
  const random = makeRandom(hashSeed(`${score.name}\0${track.name}\0${trackIndex}`));
  const humanize = track.humanize ?? {};
  const jitterRange = (humanize.timeMs ?? 0) * score.bpm / 60000;
  const velocityRange = humanize.vel ?? 0;
  return expandedNotes(track).map((note) => {
    const midiPitch = pitchToMidi(note.pitch);
    const jitterStart = (random() * 2 - 1) * jitterRange;
    const jitterEnd = (random() * 2 - 1) * jitterRange;
    const velocityJitter = Math.round((random() * 2 - 1) * velocityRange);
    const start = Math.max(0, Math.min(score.beatsPerBar * score.bars, swungBeat(note.start, score.swing) + jitterStart));
    const end = Math.max(start + 1 / PPQ, Math.min(score.beatsPerBar * score.bars, swungBeat(note.start + note.duration, score.swing) + jitterEnd));
    return { start, end, sourceStart: note.start, pitch: midiPitch, velocity: Math.max(1, Math.min(127, note.velocity + velocityJitter)) };
  });
}

function makeParts(score, hybrid) {
  const gm = [];
  const sso = [];
  score.tracks.forEach((track, trackIndex) => {
    const notes = prepareTrackNotes(score, track, trackIndex);
    if (track.drums) {
      if (notes.length) gm.push({ name: track.name, track, trackIndex, drums: true, program: track.kit ?? 0, pan: partPan(track, null, true), notes });
      return;
    }
    const routing = hybrid ? autoSsoPreset(track, notes) : null;
    if (routing === null || !hybrid) {
      if (notes.length) gm.push({ name: track.name, track, trackIndex, drums: false, program: track.program, pan: track.pan ?? 0, notes });
      return;
    }
    const groups = new Map();
    for (const note of notes) {
      let preset = routing;
      if (routing === 'divisi' || routing === 'pizz-divisi') preset = ensemblePreset(track.program, note.pitch);
      else if (routing === 'brass-divisi') preset = note.pitch >= 65 ? 28 : note.pitch >= 53 ? 30 : note.pitch >= 41 ? 32 : 34;
      if (FLUTE_PRESETS.has(preset)) note.pitch = Math.max(0, note.pitch - 12);
      if (!groups.has(preset)) groups.set(preset, []);
      groups.get(preset).push(note);
    }
    for (const [preset, partNotes] of groups) {
      const label = routing === 'divisi' || routing === 'pizz-divisi' || routing === 'brass-divisi' ? `${track.name} · SSO ${preset}` : track.name;
      sso.push({ name: label, track, trackIndex, drums: false, program: preset, pan: partPan(track, preset), notes: partNotes });
    }
  });
  return { gm, sso };
}

function makeBatches(parts, drums = []) {
  const batches = [];
  for (let index = 0; index < parts.length; index += 15) batches.push(parts.slice(index, index + 15));
  if (batches.length === 0 && drums.length) batches.push([]);
  if (drums.length) batches[0].push(...drums);
  return batches;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${path.basename(command)} terminó con código ${result.status}.\n${result.stderr || result.stdout || ''}`);
  return result;
}

function lastLoudnormJson(output) {
  const matches = [...output.matchAll(/\{[\s\S]*?\}/g)];
  for (const match of matches.reverse()) {
    try {
      const parsed = JSON.parse(match[0]);
      if ('input_i' in parsed && 'input_tp' in parsed) return parsed;
    } catch { /* Other ffmpeg log braces are not loudnorm reports. */ }
  }
  throw new Error('ffmpeg no devolvió el análisis JSON de loudnorm.');
}

function finiteMeasurement(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function readWavFloat(filename) {
  const buffer = fs.readFileSync(filename);
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') throw new Error('ffmpeg no produjo WAV válido.');
  let offset = 12;
  let format;
  let channels;
  let sampleRate;
  let bits;
  let data;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (id === 'fmt ') {
      format = buffer.readUInt16LE(start);
      channels = buffer.readUInt16LE(start + 2);
      sampleRate = buffer.readUInt32LE(start + 4);
      bits = buffer.readUInt16LE(start + 14);
    } else if (id === 'data') data = buffer.subarray(start, start + size);
    offset = start + size + (size & 1);
  }
  if (format !== 3 || bits !== 32 || !data || sampleRate !== SAMPLE_RATE || ![1, 2].includes(channels)) throw new Error('WAV temporal debe ser float32 a 48 kHz mono/estéreo.');
  const samples = new Float32Array(data.length / 4);
  for (let i = 0; i < samples.length; i += 1) samples[i] = data.readFloatLE(i * 4);
  return { samples, channels, sampleRate, frames: samples.length / channels };
}

function wav16(samples, channels, sampleRate) {
  const dataLength = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataLength);
  buffer.write('RIFF', 0, 4, 'ascii');
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8, 4, 'ascii');
  buffer.write('fmt ', 12, 4, 'ascii');
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channels * 2, 28);
  buffer.writeUInt16LE(channels * 2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36, 4, 'ascii');
  buffer.writeUInt32LE(dataLength, 40);
  for (let i = 0; i < samples.length; i += 1) {
    const clipped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clipped < 0 ? clipped * 32768 : clipped * 32767), 44 + i * 2);
  }
  return buffer;
}

function wavFloat(samples, channels, sampleRate) {
  const dataLength = samples.length * 4;
  const buffer = Buffer.alloc(44 + dataLength);
  buffer.write('RIFF', 0, 4, 'ascii');
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8, 4, 'ascii');
  buffer.write('fmt ', 12, 4, 'ascii');
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(3, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channels * 4, 28);
  buffer.writeUInt16LE(channels * 4, 32);
  buffer.writeUInt16LE(32, 34);
  buffer.write('data', 36, 4, 'ascii');
  buffer.writeUInt32LE(dataLength, 40);
  for (let index = 0; index < samples.length; index += 1) buffer.writeFloatLE(samples[index], 44 + index * 4);
  return buffer;
}

function writeHallImpulse(filename) {
  const frames = Math.round(2.4 * SAMPLE_RATE);
  const samples = new Float32Array(frames * 2);
  const predelay = Math.round(0.018 * SAMPLE_RATE);
  const reflections = [
    [0, 0.34, 0.25], [0.008, 0.18, 0.10], [0.019, 0.08, 0.16],
    [0.033, 0.11, 0.06], [0.047, 0.04, 0.09], [0.061, 0.06, 0.03],
  ];
  for (const [delay, left, right] of reflections) {
    const frame = predelay + Math.round(delay * SAMPLE_RATE);
    if (frame < frames) {
      samples[frame * 2] += left;
      samples[frame * 2 + 1] += right;
    }
  }
  const randomLeft = makeRandom(0x5eeda11);
  const randomRight = makeRandom(0x5eeda12);
  let filteredLeft = 0;
  let filteredRight = 0;
  for (let frame = predelay; frame < frames; frame += 1) {
    const elapsed = (frame - predelay) / SAMPLE_RATE;
    const progress = elapsed / 2.4;
    const cutoff = 10500 * Math.pow(1050 / 10500, progress);
    const coefficient = 1 - Math.exp(-2 * Math.PI * cutoff / SAMPLE_RATE);
    filteredLeft += coefficient * (randomLeft() * 2 - 1 - filteredLeft);
    filteredRight += coefficient * (randomRight() * 2 - 1 - filteredRight);
    const decay = Math.exp(-6.90775527898 * elapsed / 2.4);
    const hfDamping = Math.pow(1 - 0.62 * progress, 1.7);
    samples[frame * 2] += filteredLeft * decay * hfDamping * 0.006;
    samples[frame * 2 + 1] += filteredRight * decay * hfDamping * 0.006;
  }
  fs.writeFileSync(filename, wavFloat(samples, 2, SAMPLE_RATE));
}

function mixFiles(inputs, output) {
  if (!inputs.length) throw new Error('No hay stems de audio para mezclar.');
  if (inputs.length === 1) {
    run(FFMPEG, ['-hide_banner', '-nostats', '-i', inputs[0], '-ar', String(SAMPLE_RATE), '-ac', '2', '-c:a', 'pcm_f32le', output]);
    return;
  }
  const filter = `${inputs.map((_, index) => `[${index}:a]asetpts=PTS-STARTPTS[a${index}]`).join(';')};${inputs.map((_, index) => `[a${index}]`).join('')}amix=inputs=${inputs.length}:duration=longest:dropout_transition=0:normalize=0[out]`;
  const args = ['-hide_banner', '-nostats'];
  for (const input of inputs) args.push('-i', input);
  args.push('-filter_complex', filter, '-map', '[out]', '-ar', String(SAMPLE_RATE), '-ac', '2', '-c:a', 'pcm_f32le', output);
  run(FFMPEG, args);
}

function convolve(input, impulse, output, wet) {
  const dry = 1 - wet;
  const filter = `[0:a]asetpts=PTS-STARTPTS[dry];[1:a]asetpts=PTS-STARTPTS[ir];[dry][ir]afir=dry=${dry}:wet=${wet}:gtype=none:irnorm=0[wet]`;
  run(FFMPEG, [
    '-hide_banner', '-nostats', '-i', input, '-i', impulse,
    '-filter_complex', filter, '-map', '[wet]', '-ar', String(SAMPLE_RATE), '-ac', '2', '-c:a', 'pcm_f32le', output,
  ]);
}

function renderBatch(score, parts, sfPath, midiPath, audioPath) {
  fs.writeFileSync(midiPath, writeMidi(score, parts));
  run(FLUIDSYNTH, [
    '-ni', '-q', '-F', audioPath, '-r', String(SAMPLE_RATE), '-g', '0.5',
    '-o', 'synth.reverb.active=0', '-o', 'synth.chorus.active=0',
    '-o', 'synth.polyphony=512', sfPath, midiPath,
  ]);
}

function finalizeAudio(masterWav, outWav, score, mono) {
  const audio = readWavFloat(masterWav);
  let startFrame = 0;
  let endFrame = audio.frames;
  if (score.loop) {
    const loopFrames = Math.round(score.bars * score.beatsPerBar * 60 / score.bpm * SAMPLE_RATE);
    startFrame = loopFrames;
    endFrame = startFrame + loopFrames;
    if (endFrame > audio.frames) throw new Error(`Render corto: se esperaban ${endFrame} frames y llegaron ${audio.frames}.`);
  } else {
    let last = -1;
    for (let frame = audio.frames - 1; frame >= 0; frame -= 1) {
      let peak = 0;
      for (let channel = 0; channel < audio.channels; channel += 1) peak = Math.max(peak, Math.abs(audio.samples[frame * audio.channels + channel]));
      if (peak >= 0.001) { last = frame; break; }
    }
    endFrame = Math.max(1, last + 1);
  }
  const output = audio.samples.slice(startFrame * audio.channels, endFrame * audio.channels);
  if (!score.loop) {
    const fadeFrames = Math.min(Math.round(0.03 * SAMPLE_RATE), Math.floor(output.length / audio.channels));
    const outputFrames = output.length / audio.channels;
    for (let frame = outputFrames - fadeFrames; frame < outputFrames; frame += 1) {
      const gain = fadeFrames <= 1 ? 0 : (outputFrames - 1 - frame) / (fadeFrames - 1);
      for (let channel = 0; channel < audio.channels; channel += 1) output[frame * audio.channels + channel] *= gain;
    }
  }
  fs.writeFileSync(outWav, wav16(output, audio.channels, SAMPLE_RATE));
  let peak = 0;
  for (const sample of output) {
    const clipped = Math.max(-1, Math.min(1, sample));
    const quantized = Math.round(clipped < 0 ? clipped * 32768 : clipped * 32767);
    peak = Math.max(peak, Math.abs(quantized) / 32768);
  }
  const peakDb = peak === 0 ? -Infinity : 20 * Math.log10(peak);
  const seconds = output.length / audio.channels / SAMPLE_RATE;
  let seam = null;
  if (score.loop && output.length >= audio.channels * 2) {
    let peakDelta = 0;
    let sumSquares = 0;
    for (let channel = 0; channel < audio.channels; channel += 1) {
      const first = output[channel];
      const last = output[output.length - audio.channels + channel];
      const firstQ = Math.round(Math.max(-1, Math.min(1, first)) * (first < 0 ? 32768 : 32767)) / 32768;
      const lastQ = Math.round(Math.max(-1, Math.min(1, last)) * (last < 0 ? 32768 : 32767)) / 32768;
      const delta = firstQ - lastQ;
      peakDelta = Math.max(peakDelta, Math.abs(delta));
      sumSquares += delta * delta;
    }
    const rmsDelta = Math.sqrt(sumSquares / audio.channels);
    seam = {
      peakDelta,
      rmsDelta,
      peakDeltaDbfs: peakDelta === 0 ? -Infinity : 20 * Math.log10(peakDelta),
      rmsDeltaDbfs: rmsDelta === 0 ? -Infinity : 20 * Math.log10(rmsDelta),
    };
  }
  return { seconds, peakDb, seam };
}

function measureLufs(filename, target) {
  const measured = run(FFMPEG, [
    '-hide_banner', '-nostats', '-i', filename,
    '-af', `loudnorm=I=${target}:TP=-1.5:LRA=11:print_format=json`, '-f', 'null', '-',
  ]);
  const report = lastLoudnormJson(`${measured.stdout}\n${measured.stderr}`);
  return finiteMeasurement(report.input_i, Number.NaN);
}

function render(scorePath, outPath, sfPath, ssoPath, midPath, stemsDir, lufs, mono) {
  if (!fs.existsSync(FLUIDSYNTH)) throw new Error(`No se encontró FluidSynth en ${FLUIDSYNTH}.`);
  if (!fs.existsSync(FFMPEG)) throw new Error(`No se encontró ffmpeg en ${FFMPEG}.`);
  if (!path.isAbsolute(sfPath)) throw new Error('--sf debe ser una ruta absoluta al SoundFont.');
  if (!fs.statSync(sfPath).isFile()) throw new Error(`SoundFont inválido: ${sfPath}`);
  if (ssoPath && (!path.isAbsolute(ssoPath) || !fs.statSync(ssoPath).isFile())) throw new Error('--sso debe ser una ruta absoluta a un SoundFont SSO existente.');
  const score = JSON.parse(fs.readFileSync(scorePath, 'utf8'));
  const errors = validateScore(score);
  if (errors.length) throw new Error(`Score inválido:\n${errors.map((error) => `- ${error}`).join('\n')}`);
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'gm-render-'));
  try {
    fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
    if (stemsDir) fs.mkdirSync(path.resolve(stemsDir), { recursive: true });
    const { gm, sso } = makeParts(score, Boolean(ssoPath));
    const jobs = [];
    const addJobs = (bank, role, parts, soundFont) => {
      const batches = makeBatches(parts);
      batches.forEach((batch, index) => jobs.push({ bank, role, batch, soundFont, index }));
    };
    addJobs('gm', 'melodic', gm.filter((part) => !part.drums), sfPath);
    addJobs('gm', 'drums', gm.filter((part) => part.drums), sfPath);
    if (ssoPath) addJobs('sso', 'orchestra', sso, ssoPath);
    const midBase = midPath ? path.resolve(midPath) : null;
    if (midBase) fs.mkdirSync(path.dirname(midBase), { recursive: true });
    const midiPathFor = (job) => {
      if (!midBase) return path.join(temporary, `${job.bank}-${job.role}-${job.index + 1}.mid`);
      if (jobs.length === 1) return midBase;
      const extension = path.extname(midBase) || '.mid';
      const stem = path.basename(midBase, path.extname(midBase));
      return path.join(path.dirname(midBase), `${stem}-${job.bank}-${job.role}-${String(job.index + 1).padStart(2, '0')}${extension}`);
    };
    const impulse = path.join(temporary, 'synthetic-concert-hall.wav');
    writeHallImpulse(impulse);
    const rawByRole = new Map();
    for (const job of jobs) {
      const rawPath = path.join(temporary, `${job.bank}-${job.role}-${String(job.index + 1).padStart(2, '0')}.wav`);
      renderBatch(score, job.batch, job.soundFont, midiPathFor(job), rawPath);
      if (!rawByRole.has(`${job.bank}:${job.role}`)) rawByRole.set(`${job.bank}:${job.role}`, []);
      rawByRole.get(`${job.bank}:${job.role}`).push(rawPath);
    }
    const wetByBank = new Map();
    const space = score.space ?? 1;
    for (const [key, rawFiles] of rawByRole) {
      const [bank, role] = key.split(':');
      const dryRolePath = path.join(temporary, `${bank}-${role}-dry.wav`);
      const wetRolePath = path.join(temporary, `${bank}-${role}-space.wav`);
      mixFiles(rawFiles, dryRolePath);
      const amount = (bank === 'sso' ? 0.32 : role === 'drums' ? 0.15 : 0.22) * space;
      convolve(dryRolePath, impulse, wetRolePath, amount);
      if (!wetByBank.has(bank)) wetByBank.set(bank, []);
      wetByBank.get(bank).push(wetRolePath);
    }
    const bankFiles = [];
    for (const [bank, inputs] of wetByBank) {
      const bankPath = path.join(temporary, `${bank}-stem-float.wav`);
      mixFiles(inputs, bankPath);
      bankFiles.push({ bank, path: bankPath });
      if (stemsDir) {
        const outputBase = path.basename(outPath, path.extname(outPath));
        const stemPath = path.join(path.resolve(stemsDir), `${outputBase}-${bank}.wav`);
        finalizeAudio(bankPath, stemPath, score, false);
      }
    }
    const rawWav = path.join(temporary, 'hybrid-dry-master-input.wav');
    mixFiles(bankFiles.map((entry) => entry.path), rawWav);
    const masterWav = path.join(temporary, 'master-float.wav');
    const channelFilter = mono ? 'pan=mono|c0=0.5*c0+0.5*c1,' : '';
    const baseFilters = `${channelFilter}highpass=f=28,equalizer=f=300:t=q:w=1:g=-1.5,highshelf=f=10000:t=q:w=0.7:g=1.5,acompressor=threshold=-18dB:ratio=2:attack=20:release=250`;
    const analysis = run(FFMPEG, ['-hide_banner', '-nostats', '-i', rawWav, '-af', `${baseFilters},loudnorm=I=${lufs}:TP=-1.5:LRA=11:print_format=json`, '-f', 'null', '-']);
    const report = lastLoudnormJson(`${analysis.stdout}\n${analysis.stderr}`);
    const measuredI = finiteMeasurement(report.input_i, lufs);
    const measuredTp = finiteMeasurement(report.input_tp, -3);
    const measuredLra = finiteMeasurement(report.input_lra, 7);
    const measuredThresh = finiteMeasurement(report.input_thresh, measuredI - 10);
    const offset = finiteMeasurement(report.target_offset, 0);
    const loudnormFilter = `loudnorm=I=${lufs}:TP=-1.5:LRA=11:measured_I=${measuredI}:measured_TP=${measuredTp}:measured_LRA=${measuredLra}:measured_thresh=${measuredThresh}:offset=${offset}:linear=true:print_format=json`;
    run(FFMPEG, ['-hide_banner', '-nostats', '-i', rawWav, '-af', `${baseFilters},${loudnormFilter}`, '-ar', String(SAMPLE_RATE), '-ac', mono ? '1' : '2', '-c:a', 'pcm_f32le', masterWav]);
    const summary = finalizeAudio(masterWav, path.resolve(outPath), score, mono);
    summary.lufs = measureLufs(path.resolve(outPath), lufs);
    console.log(JSON.stringify({
      name: score.name,
      seconds: Number(summary.seconds.toFixed(3)),
      lufs: Number.isFinite(summary.lufs) ? Number(summary.lufs.toFixed(2)) : null,
      peakDb: Number.isFinite(summary.peakDb) ? Number(summary.peakDb.toFixed(2)) : null,
      seam: summary.seam && {
        peakDelta: Number(summary.seam.peakDelta.toFixed(6)),
        rmsDelta: Number(summary.seam.rmsDelta.toFixed(6)),
        peakDeltaDbfs: Number.isFinite(summary.seam.peakDeltaDbfs) ? Number(summary.seam.peakDeltaDbfs.toFixed(2)) : null,
        rmsDeltaDbfs: Number.isFinite(summary.seam.rmsDeltaDbfs) ? Number(summary.seam.rmsDeltaDbfs.toFixed(2)) : null,
      },
      banks: bankFiles.map(({ bank }) => bank),
      midiBatches: jobs.length,
    }));
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

function parseArgs(args) {
  if (args[0] === '--validate') return { validate: true, scorePath: args[1] };
  const result = { validate: false, scorePath: args[0], outPath: args[1], sfPath: null, ssoPath: null, midPath: null, stemsDir: null, lufs: -16, mono: false };
  for (let i = 2; i < args.length; i += 1) {
    if (args[i] === '--sf') result.sfPath = args[++i];
    else if (args[i] === '--sso') result.ssoPath = args[++i];
    else if (args[i] === '--mid') result.midPath = args[++i];
    else if (args[i] === '--stems') result.stemsDir = args[++i];
    else if (args[i] === '--lufs') result.lufs = Number(args[++i]);
    else if (args[i] === '--mono') result.mono = true;
    else throw new Error(`Opción desconocida: ${args[i]}`);
  }
  if (!result.scorePath || !result.outPath || !result.sfPath) throw new Error('Faltan argumentos obligatorios.');
  if (!numberIn(result.lufs, -36, -5)) throw new Error('--lufs debe estar entre -36 y -5 LUFS.');
  return result;
}

try {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    usage();
  } else {
    const options = parseArgs(args);
    let score;
    try { score = JSON.parse(fs.readFileSync(options.scorePath, 'utf8')); }
    catch (error) { throw new Error(`No se pudo leer/parsear ${options.scorePath}: ${error.message}`); }
    const errors = validateScore(score);
    if (options.validate) {
      if (errors.length) {
        for (const error of errors) console.error(error);
        process.exitCode = 1;
      } else console.log(`Válido: ${score.name}`);
    } else if (errors.length) throw new Error(`Score inválido:\n${errors.map((error) => `- ${error}`).join('\n')}`);
    else render(options.scorePath, options.outPath, options.sfPath, options.ssoPath, options.midPath, options.stemsDir, options.lufs, options.mono);
  }
} catch (error) {
  fail(error.message);
}
