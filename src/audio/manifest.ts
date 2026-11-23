// Dominio: seba. Inventario de audio en disco. Cada clave tiene .ogg (Opus) y .mp3 (Safari antiguo).
// Fuentes reproducibles: src/audio/tools/ (sintetizador + partituras JSON). Licencias: public/assets/audio/CREDITS.md
import Phaser from 'phaser';
import type { AmbientKey, MusicKey, SfxKey, VoiceKey } from '../types/assets';
import { SFX_VARIANTS } from './mixing';

const BASE = 'assets/audio';

export const SFX_KEYS: SfxKey[] = [
  'sfx-jump', 'sfx-land', 'sfx-dash', 'sfx-swing', 'sfx-hit', 'sfx-parry', 'sfx-hurt', 'sfx-enemy-death',
  'sfx-pickup', 'sfx-chest', 'sfx-checkpoint', 'sfx-timestop', 'sfx-ui-select', 'sfx-ui-back', 'sfx-ui-move',
  'sfx-title-sting', 'sfx-boss-roar', 'sfx-death', 'sfx-ability-ready', 'sfx-low-hp', 'sfx-tutorial-ok', 'sfx-fanfare',
];
/** Se cargan en Preload: título y menús necesitan sonar en cuanto se pulsa una tecla. */
export const MUSIC_EAGER: MusicKey[] = ['music-title', 'music-zone1', 'music-gameover', 'music-boss'];
/** Carga diferida (en segundo plano al entrar al juego) para no alargar la pantalla de carga. */
export const MUSIC_LAZY: MusicKey[] = ['music-zone2'];
export const AMBIENT_KEYS: AmbientKey[] = ['amb-zone1', 'amb-zone2'];
export const VOICE_KEYS: VoiceKey[] = ['vo-title', 'vo-gameover'];

const files = (dir: string, name: string) => [`${BASE}/${dir}/${name}.ogg`, `${BASE}/${dir}/${name}.mp3`];

export function sfxFileKeys(): string[] {
  return SFX_KEYS.flatMap((k) => {
    const n = SFX_VARIANTS[k];
    return n ? Array.from({ length: n }, (_, i) => `${k}-${i + 1}`) : [k];
  });
}

export function preloadAudio(scene: Phaser.Scene): void {
  for (const k of sfxFileKeys()) scene.load.audio(k, files('sfx', k));
  for (const k of MUSIC_EAGER) scene.load.audio(k, files('music', k));
  for (const k of AMBIENT_KEYS) scene.load.audio(k, files('amb', k));
  for (const k of VOICE_KEYS) scene.load.audio(k, files('vo', k));
}

/** Carga en segundo plano las pistas pesadas. Seguro de llamar varias veces. */
export function preloadLazyAudio(scene: Phaser.Scene): void {
  const missing = MUSIC_LAZY.filter((k) => !scene.cache.audio.exists(k));
  if (!missing.length) return;
  for (const k of missing) scene.load.audio(k, files('music', k));
  scene.load.start();
}
