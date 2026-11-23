// Dominio: seba. Teclas globales en cualquier escena con UI: M = silencio, F = pantalla completa.
import Phaser from 'phaser';
import { AudioDirector } from '../audio';
import { C, text } from './theme';

export function installGlobalKeys(scene: Phaser.Scene): void {
  const kb = scene.input.keyboard;
  if (!kb) return;
  kb.on('keydown-M', () => {
    const muted = AudioDirector.toggleMute();
    toast(scene, muted ? 'SONIDO: NO' : 'SONIDO: SI');
  });
  kb.on('keydown-F', () => {
    if (scene.scale.isFullscreen) scene.scale.stopFullscreen();
    else scene.scale.startFullscreen();
  });
}

/** Aviso breve arriba a la derecha. */
export function toast(scene: Phaser.Scene, msg: string, color: number = C.text): void {
  const t = text(scene, scene.scale.width - 6, 6, msg, { color, align: 'right', stroke: true }).setOrigin(1, 0).setDepth(2000).setScrollFactor(0);
  scene.tweens.add({ targets: t, alpha: 0, y: 0, delay: 900, duration: 300, onComplete: () => t.destroy() });
}
