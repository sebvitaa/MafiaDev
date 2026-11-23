// Dominio: vicho. Jefe final provisional en la arena de fuego (objeto Tiled type "boss_arena").
// Aparece al terminar la cinemática "La Última Apuesta" (room:entered roomId 'set', ver src/ui/index.ts).
// SUP-vicho-boss: Bodoque = knight de basti con stats propios hasta que basti implemente el combate final real.
import Phaser from 'phaser';
import { bus } from '../core/EventBus';
import { Enemy, type EnemyPlayer } from '../enemies';
import type { EnemyDefinition } from '../enemies/EnemyBrain';
import definitions from '../data/enemies.json';
import { hdLayer } from '../ui/hd/HdLayer';

const BOSS = definitions.boss as EnemyDefinition; // stats en src/data/enemies.json

export interface Boss { readonly targets: readonly Enemy[] }

export function installBoss(
  scene: Phaser.Scene, player: EnemyPlayer,
  world: { map: Phaser.Tilemaps.Tilemap; solids: Phaser.Tilemaps.TilemapLayer; obstacles: Phaser.Physics.Arcade.StaticGroup },
): Boss {
  const arena = world.map.findObject('objects', (o) => o.type === 'boss_arena');
  let boss: Enemy | null = null;
  let phase = 1;

  const spawn = () => {
    if (boss || !arena) return;
    const x = arena.x! + arena.width! / 2, y = arena.y! + arena.height! / 2;
    boss = new Enemy(scene, 'boss-bodoque', 'knight', BOSS, x, y, player,
      () => [...scene.physics.world.staticBodies].filter((body) => body.enable));
    boss.visual.setScale(0.9);
    scene.physics.add.collider(boss.anchor, world.solids);
    scene.physics.add.collider(boss.anchor, world.obstacles);
    scene.physics.add.collider(boss.anchor, player.anchor);
    bus.emit('boss:phase', { phase });
  };

  // La cinemática pausa la escena: el jefe aparece al reanudar (o al momento si no hubo cinemática).
  const onRoom = ({ roomId }: { roomId: string }) => {
    if (roomId !== 'set') return;
    if (scene.scene.isPaused()) scene.events.once(Phaser.Scenes.Events.RESUME, spawn);
    else scene.time.delayedCall(0, () => { if (scene.scene.isPaused()) scene.events.once(Phaser.Scenes.Events.RESUME, spawn); else spawn(); });
  };
  bus.on('room:entered', onRoom);

  let won = false;
  const onUpdate = (_t: number, dt: number) => {
    if (!boss) return;
    boss.update(dt);
    const ratio = boss.hp / BOSS.hp;
    if (phase === 1 && ratio <= 0.5) { phase = 2; bus.emit('boss:phase', { phase }); }
    if (!boss.alive && !won) {
      won = true;
      bus.emit('enemy:killed', { id: boss.id, kind: 'boss', x: boss.x, y: boss.y });
      hdLayer(scene).text(240, 110, 'BODOQUE HA CAÍDO', { width: 300, align: 'center', depth: 60, fontSize: 20, weight: 600, color: '#ffb36b' });
      scene.time.delayedCall(3500, () => { scene.scene.pause(); scene.scene.launch('CreditsScene', { from: 'GameScene' }); });
    }
  };
  const onPost = () => boss?.postUpdate();
  scene.events.on(Phaser.Scenes.Events.UPDATE, onUpdate);
  scene.events.on(Phaser.Scenes.Events.POST_UPDATE, onPost);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    bus.off('room:entered', onRoom);
    scene.events.off(Phaser.Scenes.Events.UPDATE, onUpdate);
    scene.events.off(Phaser.Scenes.Events.POST_UPDATE, onPost);
  });
  return { get targets() { return boss?.alive ? [boss] : []; } };
}
