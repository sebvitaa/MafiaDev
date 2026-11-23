import type Phaser from 'phaser';
import definitions from '../data/enemies.json';
import { Enemy, type EnemyPlayer } from './Enemy';
import type { EnemyDefinition } from './EnemyBrain';
import { ObstacleSnapshot } from './ObstacleSnapshot';
import tuning from '../data/tuning.json';
import type { Rect } from '../abilities/markGeometry';

export type BasicEnemyKind = 'slime' | 'cobrador' | 'knight';

export class EnemySystem {
  readonly enemies: Enemy[] = [];
  private nextId = 1;
  private readonly colliders: Phaser.Physics.Arcade.Collider[] = [];
  private readonly bodies: Phaser.Physics.Arcade.Group;
  private readonly snapshot = new ObstacleSnapshot();
  private obstacles: readonly Rect[] = [];

  constructor(private readonly scene: Phaser.Scene, private readonly player: EnemyPlayer,
    solids: Phaser.Physics.Arcade.StaticGroup | Phaser.Tilemaps.TilemapLayer,
    extraSolids?: Phaser.Physics.Arcade.StaticGroup) {
    // SUP-alejandro-20261123-151922: one physics group uses Arcade's spatial broad phase.
    this.bodies = scene.physics.add.group({ allowGravity: false, collideWorldBounds: true });
    this.colliders.push(scene.physics.add.collider(this.bodies, solids));
    this.colliders.push(scene.physics.add.collider(this.bodies, player.anchor));
    this.colliders.push(scene.physics.add.collider(this.bodies, this.bodies));
    if (extraSolids) this.colliders.push(scene.physics.add.collider(this.bodies, extraSolids));
    scene.events.on('postupdate', this.postUpdate, this);
    scene.events.once('shutdown', () => this.destroy());
  }

  get targets(): readonly Enemy[] { return this.enemies.filter((enemy) => enemy.alive); }

  spawn(kind: BasicEnemyKind, x: number, y: number): Enemy {
    const enemy = new Enemy(this.scene, `${kind}-${this.nextId++}`, kind, definitions[kind] as EnemyDefinition,
      x, y, this.player, () => this.obstacles);
    this.bodies.add(enemy.anchor);
    this.enemies.push(enemy);
    return enemy;
  }

  update(dtMs: number): void {
    this.obstacles = this.snapshot.read(this.scene.physics.world.staticBodies);
    const view = this.scene.cameras.main.worldView;
    const wakeDistance = Math.hypot(view.width, view.height) / 2 + tuning.performance.enemyWakePadding;
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const limit = Math.max(wakeDistance, enemy.definition.aggroRange * 1.3)
        + (enemy.simulating ? tuning.performance.enemySleepMargin : 0);
      const dx = enemy.x - this.player.anchor.x, dy = enemy.y - this.player.anchor.y;
      enemy.setSimulating(dx * dx + dy * dy <= limit * limit);
      if (enemy.simulating) enemy.update(dtMs);
    }
  }

  private postUpdate(): void { for (const enemy of this.enemies) if (enemy.simulating) enemy.postUpdate(); }

  clear(): void {
    for (const enemy of this.enemies) enemy.destroy();
    this.enemies.length=0;
    // Phaser may have destroyed physics groups before this shutdown listener runs.
    if(this.bodies.children)this.bodies.clear(false,false);
  }
  private destroy():void {
    this.scene.events.off('postupdate',this.postUpdate,this);this.clear();
    for (const collider of this.colliders) if(collider.world)collider.destroy();
    this.colliders.length=0;if(this.bodies.children)this.bodies.destroy();
  }
}
