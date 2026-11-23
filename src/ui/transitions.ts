// Dominio: seba. Transiciones de cámara reutilizables (250 ms por defecto).
import Phaser from 'phaser';

export function fadeOut(scene: Phaser.Scene, ms = 250, color = 0x13111c): Promise<void> {
  return new Promise((resolve) => {
    const cam = scene.cameras.main;
    const r = (color >> 16) & 255, g = (color >> 8) & 255, b = color & 255;
    cam.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => resolve());
    cam.fadeOut(ms, r, g, b);
  });
}

export function fadeIn(scene: Phaser.Scene, ms = 250, color = 0x13111c): void {
  const r = (color >> 16) & 255, g = (color >> 8) & 255, b = color & 255;
  scene.cameras.main.fadeIn(ms, r, g, b);
}

/** Cambia de escena con fundido a negro. */
export async function goTo(scene: Phaser.Scene, key: string, data?: object, ms = 400): Promise<void> {
  scene.input.keyboard?.removeAllListeners();
  await fadeOut(scene, ms);
  scene.scene.start(key, data);
}

/** 4.29 — destello blanco + fundido a negro (al empezar a jugar). */
export async function flashTo(scene: Phaser.Scene, key: string, data?: object, ms = 250): Promise<void> {
  scene.input.keyboard?.removeAllListeners();
  scene.cameras.main.flash(160, 255, 255, 255);
  await new Promise<void>((r) => scene.time.delayedCall(120, () => r()));
  await fadeOut(scene, ms, 0x000000);
  scene.scene.start(key, data);
}
