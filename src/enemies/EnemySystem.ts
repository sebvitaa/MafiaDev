import type Phaser from 'phaser';
import definitions from '../data/enemies.json';
import { Enemy, type EnemyPlayer } from './Enemy';
import type { EnemyDefinition } from './EnemyBrain';

export type BasicEnemyKind = 'slime' | 'cobrador' | 'knight';

export class EnemySystem {
  readonly enemies: Enemy[] = [];
  private nextId = 1;
  private readonly colliders: Phaser.Physics.Arcade.Collider[] = [];

  constructor(private readonly scene: Phaser.Scene, private readonly player: EnemyPlayer,
    private readonly solids: Phaser.Physics.Arcade.StaticGroup) {
    scene.events.on('postupdate', this.postUpdate, this);
    scene.events.once('shutdown', () => this.destroy());
  }

  get targets(): readonly Enemy[] { return this.enemies.filter((enemy) => enemy.alive); }

  spawn(kind: BasicEnemyKind, x: number, y: number): Enemy {
    const enemy = new Enemy(this.scene, `${kind}-${this.nextId++}`, kind, definitions[kind] as EnemyDefinition,
      x, y, this.player, () => [...this.scene.physics.world.staticBodies].filter((body) => body.enable));
    this.colliders.push(this.scene.physics.add.collider(enemy.anchor, this.solids));
    this.colliders.push(this.scene.physics.add.collider(enemy.anchor, this.player.anchor));
    for (const other of this.enemies) {
      if (other.alive) this.colliders.push(this.scene.physics.add.collider(enemy.anchor, other.anchor));
    }
    this.enemies.push(enemy);
    return enemy;
  }

  update(dtMs: number): void { for (const enemy of this.enemies) enemy.update(dtMs); }

  private postUpdate(): void { for (const enemy of this.enemies) enemy.postUpdate(); }

  clear(): void {
    for (const collider of this.colliders) if (collider.world) collider.destroy();
    for (const enemy of this.enemies) enemy.destroy();
    this.enemies.length = 0;this.colliders.length=0;
  }

  private destroy():void {this.scene.events.off('postupdate',this.postUpdate,this);this.clear();}
}
