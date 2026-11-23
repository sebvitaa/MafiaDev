// Dominio: seba — AudioDirector. Nadie llama a this.sound fuera de src/audio (AGENTS.md §2.1).
// Los demás dominios solo emiten eventos del bus; aquí se traducen a SFX, música y ambiente.
import Phaser from 'phaser';
import { bus } from '../core/EventBus';
import type { GameEventName } from '../types/events';
import type { SfxKey } from '../types/assets';
import { AudioDirector } from './AudioDirector';
import { audioForZone, panFor, RARITY_DETUNE } from './mixing';
import { preloadLazyAudio } from './manifest';

export { AudioDirector } from './AudioDirector';
export { preloadAudio } from './manifest';
export { settings } from './settings';

/** Mapa evento → SFX simple (los casos con lógica van en installAudio). */
export const SFX_BY_EVENT: Partial<Record<GameEventName, SfxKey>> = {
  'player:land': 'sfx-land',
  'player:dash': 'sfx-dash',
  'player:hit': 'sfx-hurt',
  'chest:opened': 'sfx-chest',
  'checkpoint:reached': 'sfx-checkpoint',
  'ability:ready': 'sfx-ability-ready',
};

/** Fallback si alejandro/vicho aún no emiten ability:ended / player:respawned (SUP-seba-20261123-102354). */
const SLOWMO_FALLBACK_MS = 3000;
const LOW_HP_BEAT_MS = 900;
export const PAUSE_DUCK = 0.5;
export const PAUSE_FADE_MS = 900;

/** Compatibilidad con el stub anterior. */
export function playSfx(_scene: Phaser.Scene, key: SfxKey): void {
  AudioDirector.sfx(key);
}

export function installAudio(scene: Phaser.Scene): void {
  const ctx = {};
  let zone = 'zone1';
  let inBoss = false;
  let dead = false;
  let slowTimer: Phaser.Time.TimerEvent | null = null;
  let heartbeat: Phaser.Time.TimerEvent | null = null;

  const zoneMusic = (fadeMs = 900) => {
    const a = audioForZone(inBoss ? 'boss' : zone);
    AudioDirector.playMusic(a.music, fadeMs);
    AudioDirector.playAmbient(inBoss ? null : a.ambient);
  };
  const stopHeartbeat = () => { heartbeat?.remove(); heartbeat = null; };
  const endSlow = () => { slowTimer?.remove(); slowTimer = null; AudioDirector.slowmo(false); };

  for (const [event, key] of Object.entries(SFX_BY_EVENT) as [GameEventName, SfxKey][]) {
    bus.on(event, () => AudioDirector.sfx(key), ctx);
  }

  // 3.35 / 3.36 — paneo sutil según la posición; fuera de cámara no suenan
  const spatial = (x: number): number | null => {
    const v = scene.cameras.main.worldView;
    return panFor(x, v.x, v.width);
  };
  bus.on('enemy:hit', ({ x }) => { const pan = spatial(x); if (pan !== null) AudioDirector.sfx('sfx-hit', { pan }); }, ctx);
  bus.on('enemy:killed', ({ x, kind }) => {
    if (/boss/i.test(kind)) return; // el jefe tiene su propia fanfarria
    const pan = spatial(x);
    if (pan !== null) AudioDirector.sfx('sfx-enemy-death', { pan });
  }, ctx);

  // 3.22 — más agudo y brillante cuanto más raro; loot raro baja la música (3.34)
  bus.on('item:picked', ({ rarity }) => {
    AudioDirector.sfx('sfx-pickup', { detune: RARITY_DETUNE[rarity] ?? 0, volume: rarity === 'common' ? 1 : 1.15 });
    if (rarity !== 'common') AudioDirector.duckFor(rarity === 'legendary' ? 0.3 : 0.5, rarity === 'legendary' ? 1200 : 600);
  }, ctx);

  // 3.12 — el doble salto suena más agudo
  bus.on('player:jump', ({ air }) => AudioDirector.sfx('sfx-jump', air ? { detune: 400 } : {}), ctx);

  bus.on('player:attack', ({ combo }) => AudioDirector.sfx('sfx-swing', { variant: combo, volume: combo === 3 ? 1.2 : 1 }), ctx);
  bus.on('player:parry', ({ success }) => {
    if (success) {
      // 5.45 — micro-silencio de 50 ms y la música se aparta para el campanazo
      AudioDirector.microSilence(50);
      AudioDirector.sfx('sfx-parry', { detune: 0 });
      setTimeout(() => AudioDirector.duckFor(0.55, 350, 40, 500), 60);
    }
    else AudioDirector.sfx('sfx-swing', { variant: 1, volume: 0.6, rate: 0.85 });
  }, ctx);

  bus.on('player:hit', ({ hp }) => {
    if (hp === 1 && !heartbeat) {
      AudioDirector.sfx('sfx-low-hp');
      heartbeat = scene.time.addEvent({ delay: LOW_HP_BEAT_MS, loop: true, callback: () => AudioDirector.sfx('sfx-low-hp') });
    } else if (hp > 1 || hp <= 0) stopHeartbeat();
  }, ctx);

  bus.on('zone:changed', ({ zone: z }) => { zone = z; if (!dead) zoneMusic(); }, ctx);
  bus.on('room:entered', ({ zone: z }) => {
    if (z && z !== zone) { zone = z; if (!dead && !inBoss) zoneMusic(); }
  }, ctx);

  bus.on('boss:phase', ({ phase }) => {
    if (phase !== 1 || inBoss) return;
    inBoss = true;
    preloadLazyAudio(scene);
    AudioDirector.duckFor(0.2, 1800, 80, 400);
    AudioDirector.stopMusic(500);
    AudioDirector.playAmbient(null, 500);
    scene.time.delayedCall(550, () => AudioDirector.sfx('sfx-boss-roar', { detune: 0 }));
    scene.time.delayedCall(1700, () => { if (inBoss && !dead) AudioDirector.playMusic('music-boss', 300); });
  }, ctx);

  bus.on('enemy:killed', ({ kind }) => {
    if (!/boss/i.test(kind)) return; // 'boss' o 'miniboss' (enemies.json)
    inBoss = false;
    AudioDirector.stopMusic(200);
    if (kind === 'boss') { AudioDirector.playAmbient('amb-zone1',500); return; }
    AudioDirector.sfx('sfx-fanfare', { detune: 0, volume: 1.1 });
    scene.time.delayedCall(3600, () => { if (!dead) zoneMusic(1500); });
  }, ctx);

  bus.on('ability:used', ({ id }) => {
    if (!/time|tiempo|stop/i.test(id)) return;
    AudioDirector.sfx('sfx-timestop', { detune: 0 });
    AudioDirector.slowmo(true);
    slowTimer?.remove();
    slowTimer = scene.time.delayedCall(SLOWMO_FALLBACK_MS, endSlow);
  }, ctx);
  bus.on('ability:ended', () => endSlow(), ctx);

  bus.on('player:died', () => {
    dead = true;
    inBoss = false;
    stopHeartbeat();
    endSlow();
    AudioDirector.sfx('sfx-death', { detune: 0 });
    AudioDirector.playAmbient(null, 400);
    AudioDirector.stopMusic(400);
    // 3.17 — voz TTS solo en la intro: el game over es solo el jingle corto
    scene.time.delayedCall(700, () => { if (dead) AudioDirector.playJingle('music-gameover', 0); });
    // fallback si nunca llega player:respawned
    scene.time.delayedCall(4500, () => { if (dead) { dead = false; zoneMusic(1500); } });
  }, ctx);
  bus.on('player:respawned', () => { dead = false; zoneMusic(1200); }, ctx);

  // 4.43 (nota de Seba) — en pausa la música baja al 50 % en degradado y vuelve en degradado
  bus.on('game:paused', () => AudioDirector.duck(PAUSE_DUCK, PAUSE_FADE_MS), ctx);
  bus.on('game:resumed', () => AudioDirector.duck(1, PAUSE_FADE_MS), ctx);

  zoneMusic(1200);
  preloadLazyAudio(scene);

  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    bus.offContext(ctx);
    stopHeartbeat();
    endSlow();
  });
}
export { SFX_KEYS, MUSIC_EAGER, MUSIC_LAZY, AMBIENT_KEYS, VOICE_KEYS, sfxFileKeys } from './manifest';
export { playSplashSting, playPushupTick, STING_BEATS_MS } from './splashSting';
