import Phaser from 'phaser';
import { LabScene } from './LabScene';
import { mountLabPanel } from './labPanel';

export { LabScene, mountLabPanel };

export function labMode(): boolean {
  try {
    return new URLSearchParams(globalThis.location?.search ?? '').has('lab');
  } catch {
    return false;
  }
}

export function ensureLabScene(game: Phaser.Game): void {
  if (!game.scene.keys.LabScene) game.scene.add('LabScene', LabScene, false);
}
