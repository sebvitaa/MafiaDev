// Dominio: vicho. Cámara cenital: sigue al jugador, se adelanta hacia donde se mueve (estilo Titan Souls)
// y se aleja en combate según la amenaza (combate < minijefe < jefe) para mostrar más arena.
import Phaser from 'phaser';
import { bus } from '../core/EventBus';
import config from './config.json';
import { approach, lookaheadTarget, type CombatTier } from './cameraMath';

export type { CombatTier };

const C = config.camera;
const setters = new WeakMap<Phaser.Scene, (tier: CombatTier) => void>();

/** Para enemigos/jefes (basti): `setCombatTier(scene, 'miniboss')` al entrar en combate, `'explore'` al salir. */
export function setCombatTier(scene: Phaser.Scene, tier: CombatTier): void {
  setters.get(scene)?.(tier);
}

type Target = Phaser.GameObjects.GameObject & { x: number; y: number; body?: { velocity: { x: number; y: number } } | null };

export function installCamera(scene: Phaser.Scene, target: Target): void {
  const cam = scene.cameras.main;
  cam.startFollow(target, true, C.followLerp, C.followLerp);
  let tier: CombatTier = 'explore';
  let ox = 0;
  let oy = 0;
  setters.set(scene, (t) => { tier = t; });

  const onUpdate = (_t: number, dt: number) => {
    const v = target.body?.velocity ?? { x: 0, y: 0 };
    const goal = lookaheadTarget(v.x, v.y, C.lookaheadPx, C.minSpeed);
    ox = approach(ox, goal.x, dt, C.lookaheadMs);
    oy = approach(oy, goal.y, dt, C.lookaheadMs);
    cam.setFollowOffset(-ox, -oy); // Phaser resta el offset: negativo = la cámara se adelanta
    cam.setZoom(approach(cam.zoom, Number(scene.registry.get('heartCameraUntil')??0)>scene.time.now ? 1.05 : C.zoom[tier], dt, C.zoomMs));
  };
  // Hasta que basti llame setCombatTier: el jefe aleja la cámara y salir de su zona la restaura.
  const onBoss = () => { tier = 'boss'; };
  const onZone = ({ zone }: { zone: string }) => { if (zone !== 'boss' && tier === 'boss') tier = 'explore'; };

  scene.events.on(Phaser.Scenes.Events.UPDATE, onUpdate);
  bus.on('boss:phase', onBoss, cam);
  bus.on('zone:changed', onZone, cam);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.events.off(Phaser.Scenes.Events.UPDATE, onUpdate);
    bus.offContext(cam);
    setters.delete(scene);
  });
}
