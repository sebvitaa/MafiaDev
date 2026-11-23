import Phaser from 'phaser';
import { bus } from '../core/EventBus';
import { EnemySystem, type BasicEnemyKind } from '../enemies';
import { prop } from '../exploration/tiled';

const ACTIVATE_DISTANCE = 480;
const ENEMY_SCALE = 0.6;

type Spawn = { id: number; kind: BasicEnemyKind; x: number; y: number };
type EnemyHero = ConstructorParameters<typeof EnemySystem>[1];

function enemySpawns(map: Phaser.Tilemaps.Tilemap): Spawn[] {
  return (map.filterObjects('objects', (object) => object.type === 'enemy_spawn') ?? []).flatMap((object) => {
    const kind = prop<BasicEnemyKind>(object, 'kind');
    return kind === 'slime' || kind === 'cobrador' || kind === 'knight'
      ? [{ id: object.id, kind, x: object.x!, y: object.y! }]
      : [];
  });
}

/** Instala encuentros perezosos: solo materializa los spawns a una pantalla y media de la cámara. */
export function installEncounters(
  scene: Phaser.Scene,
  hero: EnemyHero,
  world: { map: Phaser.Tilemaps.Tilemap; solids: Phaser.Tilemaps.TilemapLayer; obstacles: Phaser.Physics.Arcade.StaticGroup },
): EnemySystem | undefined {
  if (new URLSearchParams(location.search).get('noEnemies') === '1') return undefined;
  const enemies = new EnemySystem(scene, hero, world.solids as unknown as Phaser.Physics.Arcade.StaticGroup);
  const pending = enemySpawns(world.map);
  const spawned = new Set<number>();
  const activate = () => {
    const camera = scene.cameras.main;
    for (const spawn of pending) {
      if (spawned.has(spawn.id) || Phaser.Math.Distance.Between(camera.worldView.centerX, camera.worldView.centerY, spawn.x, spawn.y) > ACTIVATE_DISTANCE) continue;
      const enemy = enemies.spawn(spawn.kind, spawn.x, spawn.y);
      enemy.visual.setScale(ENEMY_SCALE);
      scene.physics.add.collider(enemy.anchor, world.obstacles);
      spawned.add(spawn.id);
    }
  };
  const reset=()=>{enemies.clear();spawned.clear();activate();};
  bus.on('player:respawned',reset,enemies);
  scene.events.once('shutdown',()=>bus.offContext(enemies));
  scene.events.on(Phaser.Scenes.Events.UPDATE, activate);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.UPDATE, activate));
  activate();
  return enemies;
}
