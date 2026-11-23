// Dominio: seba — AudioDirector. Nadie llama a this.sound fuera de src/audio (AGENTS.md §2.1).
// Los demás dominios solo emiten eventos del bus; aquí se traducen a SFX, música y ambiente.
import Phaser from 'phaser';
import { bus } from '../core/EventBus';
import type { GameEventName } from '../types/events';
import type { SfxKey } from '../types/assets';
import { AudioDirector } from './AudioDirector';
import { audioForZone } from './mixing';
import { preloadLazyAudio } from './manifest';

export { AudioDirector } from './AudioDirector';
export { preloadAudio } from './manifest';
export { settings } from './settings';

/** Mapa evento → SFX simple (los casos con lógica van en installAudio). */
export const SFX_BY_EVENT: Partial<Record<GameEventName, SfxKey>> = {
  'player:jump': 'sfx-jump',
  'player:land': 'sfx-land',
  'player:dash': 'sfx-dash',
  'player:hit': 'sfx-hurt',
  'enemy:hit': 'sfx-hit',
  'enemy:killed': 'sfx-enemy-death',
  'item:picked': 'sfx-pickup',
  'chest:opened': 'sfx-chest',
  'checkpoint:reached': 'sfx-checkpoint',
  'ability:ready': 'sfx-ability-ready',
};

/** Fallback si alejandro/vicho aún no emiten ability:ended / player:respawned (SUP-seba-20261123-102354). */
const SLOWMO_FALLBACK_MS = 3000;
const LOW_HP_BEAT_MS = 900;

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

  bus.on('player:attack', ({ combo }) => AudioDirector.sfx('sfx-swing', { variant: combo, volume: combo === 3 ? 1.2 : 1 }), ctx);
  bus.on('player:parry', ({ success }) => {
    if (success) AudioDirector.sfx('sfx-parry', { detune: 0 });
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
    AudioDirector.stopMusic(500);
    AudioDirector.playAmbient(null, 500);
    scene.time.delayedCall(550, () => AudioDirector.sfx('sfx-boss-roar', { detune: 0 }));
    scene.time.delayedCall(1700, () => { if (inBoss && !dead) AudioDirector.playMusic('music-boss', 300); });
  }, ctx);

  bus.on('enemy:killed', ({ kind }) => {
    if (!/boss/i.test(kind)) return; // 'boss' o 'miniboss' (enemies.json)
    inBoss = false;
    AudioDirector.stopMusic(200);
    AudioDirector.sfx('sfx-fanfare', { detune: 0, volume: 1.1 });
    scene.time.delayedCall(3600, () => { if (!dead) zoneMusic(1500); });
  }, ctx);

  bus.on('ability:used', ({ id }) => {
    AudioDirector.sfx('sfx-timestop', { detune: 0 });
    if (!/time|tiempo|stop/i.test(id)) return;
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
    scene.time.delayedCall(900, () => { if (dead) { AudioDirector.playJingle('music-gameover', 0); AudioDirector.voice('vo-gameover'); } });
    // fallback si nunca llega player:respawned
    scene.time.delayedCall(4500, () => { if (dead) { dead = false; zoneMusic(1500); } });
  }, ctx);
  bus.on('player:respawned', () => { dead = false; zoneMusic(1200); }, ctx);

  bus.on('game:paused', () => AudioDirector.duck(0.3), ctx);
  bus.on('game:resumed', () => AudioDirector.duck(1), ctx);

  zoneMusic(1200);
  preloadLazyAudio(scene);

  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    bus.offContext(ctx);
    stopHeartbeat();
    endSlow();
  });
}
export { SFX_KEYS, MUSIC_EAGER, MUSIC_LAZY, AMBIENT_KEYS, VOICE_KEYS, sfxFileKeys } from './manifest';
