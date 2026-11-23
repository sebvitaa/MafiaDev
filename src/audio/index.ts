// Dominio: seba — AudioDirector. Nadie llama a this.sound fuera de src/audio (AGENTS.md §2.1).
import Phaser from 'phaser';
import { bus } from '../core/EventBus';
import type { GameEventName } from '../types/events';
import type { MusicKey, SfxKey } from '../types/assets';

/** Mapa evento → SFX. Si el asset no está cargado, se ignora sin error. */
export const SFX_BY_EVENT: Partial<Record<GameEventName, SfxKey>> = {
  'player:jump': 'sfx-jump',
  'player:land': 'sfx-land',
  'player:dash': 'sfx-dash',
  'player:attack': 'sfx-swing',
  'player:parry': 'sfx-parry',
  'player:hit': 'sfx-hurt',
  'enemy:hit': 'sfx-hit',
  'enemy:killed': 'sfx-enemy-death',
  'item:picked': 'sfx-pickup',
  'chest:opened': 'sfx-chest',
  'checkpoint:reached': 'sfx-checkpoint',
  'ability:used': 'sfx-timestop',
};

export function playSfx(scene: Phaser.Scene, key: SfxKey, volume = 0.6): void {
  if (!scene.cache.audio.exists(key)) return;
  scene.sound.play(key, { volume, detune: Phaser.Math.Between(-100, 100) });
}

export function playMusic(scene: Phaser.Scene, key: MusicKey, volume = 0.4): void {
  if (!scene.cache.audio.exists(key)) return;
  scene.sound.stopByKey(key);
  scene.sound.play(key, { loop: true, volume });
}

export function installAudio(scene: Phaser.Scene): void {
  const ctx = {};
  for (const [event, key] of Object.entries(SFX_BY_EVENT) as [GameEventName, SfxKey][]) {
    bus.on(event, () => playSfx(scene, key), ctx);
  }
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => bus.offContext(ctx));
}
