import type Phaser from 'phaser';
import sheetUrl from './assets/corazon-codex-juego.png';

export const HEART_TEXTURE = 'bodoque-corazon-codex';
export const HEART_LAST_FRAME = 47;
// The wide shot hands off to the same fracture in close-up in cine3.
export const HEART_CUT_FRAME = 14;
export const HEART_FILM_CUT_SECONDS = 0.82;

export function preloadCodexHeart(scene: Phaser.Scene): void {
  if (scene.textures.exists(HEART_TEXTURE)) return;
  scene.load.spritesheet(HEART_TEXTURE, sheetUrl, { frameWidth: 48, frameHeight: 48 });
}
