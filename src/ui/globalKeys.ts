// Dominio: seba. Teclas globales en cualquier escena con UI: M = silencio, F = pantalla completa.
import Phaser from 'phaser';
import { AudioDirector, settings } from '../audio';
import { C, reducedMotion, text } from './theme';

export function installGlobalKeys(scene: Phaser.Scene): void {
  const kb = scene.input.keyboard;
  if (!kb) return;
  const onMute = () => {
    if (!scene.scene.isActive()) return;
    const muted = AudioDirector.toggleMute();
    toast(scene, muted ? 'SONIDO: NO' : 'SONIDO: SÍ');
  };
  const onFullscreen = () => {
    if (!scene.scene.isActive()) return;
    if (scene.scale.isFullscreen) scene.scale.stopFullscreen();
    else scene.scale.startFullscreen();
  };
  kb.on('keydown-M', onMute);
  kb.on('keydown-F', onFullscreen);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    kb.off('keydown-M', onMute);
    kb.off('keydown-F', onFullscreen);
  });
}

/** Temblor visual respetando las preferencias de accesibilidad del jugador. */
export function shake(scene: Phaser.Scene, durationMs: number, intensity: number): void {
  if (!settings.get().screenShake) return;
  if (!reducedMotion(settings.get().reducedMotion)) scene.cameras.main.shake(durationMs, intensity);
}

/** Aviso breve arriba a la derecha. */
export function toast(scene: Phaser.Scene, msg: string, color: number = C.text): void {
  const t = text(scene, scene.scale.width - 6, 6, msg, { color, align: 'right', stroke: true }).setOrigin(1, 0).setDepth(2000).setScrollFactor(0);
  scene.tweens.add({ targets: t, alpha: 0, y: 0, delay: 900, duration: 300, onComplete: () => t.destroy() });
}
