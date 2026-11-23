import type Phaser from 'phaser';

/** Basti puede registrar enemigos/jefes sin acoplar sus clases a Teleport. */
export function registerTeleportTarget(target: Phaser.GameObjects.GameObject): () => void {
  target.setData('teleportTarget', true);
  return () => { if (target.scene) target.setData('teleportTarget', false); };
}
