import Phaser from 'phaser';
import { bus } from '../core/EventBus';
import { BodoqueBoss } from '../enemies';
import type { RoomPlayer } from '../player/room-prototype/RoomPlayer';
import type { World } from './index';

export interface Boss { readonly ending: boolean; readonly targets: BodoqueBoss['damageTargets'] }

export function installBoss(scene: Phaser.Scene, hero: RoomPlayer, world: World): Boss {
  const arena = world.map.findObject('objects', object => object.type === 'boss_arena');
  let encounter: BodoqueBoss | undefined;
  let entered = false;
  const ctx = {};
  bus.on('room:entered', ({ roomId }) => { if (roomId === 'set') entered = true; }, ctx);

  // La entrada se confirma al salir del vídeo. El reloj del mundo no avanza durante la cinemática.
  const update = (_time: number, delta: number) => {
    if (!arena || !entered || !hero.alive || !scene.registry.get('setCinematicSeen')) return;
    if (!encounter) {
      const x = arena.x! + arena.width! / 2, y = arena.y! + arena.height! / 2;
      encounter = new BodoqueBoss(scene, x, y - 48, {
        onPhase: event => bus.emit('boss:phase', event),
        onHit: event => bus.emit('enemy:hit', event),
        onKilled: event => bus.emit('enemy:killed', event),
        onPlayerHit: damage => {
          const direction = new Phaser.Math.Vector2(hero.anchor.x - encounter!.x, hero.anchor.y - encounter!.y).normalize();
          hero.takeEnemyDamage(damage, direction);
        },
      }, { left: arena.x! + 48, right: arena.x! + arena.width! - 64,
        top: arena.y! + 48, bottom: arena.y! + arena.height! - 48 });
      encounter.activate();
    }
    encounter.update(delta, hero.anchor, hero.motion.height);
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, update);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    bus.offContext(ctx);
    scene.events.off(Phaser.Scenes.Events.UPDATE, update);
  });
  return {
    get ending() { return encounter?.state === 'dying' || encounter?.state === 'defeated'; },
    get targets() { return encounter?.damageTargets ?? []; },
  };
}
