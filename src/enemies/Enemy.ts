import Phaser from 'phaser';
import { Health } from '../combat/Health';
import { bus } from '../core/EventBus';
import { registerTeleportTarget } from '../abilities';
import { EnemyBrain, type EnemyDefinition } from './EnemyBrain';
import { nextWaypoint } from './navigation';
import { intersectsSector, type SwordDamageTarget, type SwordDirection } from '../player/room-prototype/SwordCombat';
import type { FireballDamageTarget } from '../player/room-prototype/FireballCombat';
import type { Point, Rect } from '../abilities/markGeometry';
import tuning from '../data/tuning.json';
import { DebtMarkLedger } from '../player/room-prototype/EchoDebtCombat';
import { combatLineClear } from '../combat/visibility';

export interface EnemyPlayer {
  anchor: Phaser.GameObjects.Rectangle;
  readonly alive: boolean;
  readonly radius: number;
  takeEnemyDamage(damage: number, direction: Point): boolean;
}

export class Enemy implements SwordDamageTarget, FireballDamageTarget {
  readonly anchor: Phaser.GameObjects.Rectangle;
  readonly body: Phaser.Physics.Arcade.Body;
  readonly brain: EnemyBrain;
  readonly health: Health;
  readonly visual: Phaser.GameObjects.Container;
  private readonly shape: Phaser.GameObjects.Graphics;
  private readonly label: Phaser.GameObjects.Text;
  private readonly bar: Phaser.GameObjects.Graphics;
  private readonly warning: Phaser.GameObjects.Graphics;
  private readonly unregister: () => void;
  private waypoint: Point | null = null;
  private thinkMs = 0;
  private flashMs = 0;
  private knockbackMs = 0;
  private knockback: Point = { x: 0, y: 0 };
  private destroyed = false;
  private readonly debt = new DebtMarkLedger(tuning.roomPrototype.debtMarkMax, tuning.roomPrototype.debtMarkDurationMs);
  private awake = true;
  private drawnShape = '';
  private drawnHp = -1;
  private drawnWarning = '';

  constructor(
    private readonly scene: Phaser.Scene,
    readonly id: string,
    readonly kind: string,
    readonly definition: EnemyDefinition,
    x: number, y: number,
    private readonly player: EnemyPlayer,
    private readonly obstacles: () => readonly Rect[],
  ) {
    this.health = new Health(definition.hp);
    this.brain = new EnemyBrain(definition);
    this.anchor = scene.add.rectangle(x, y, definition.radius * 2, definition.radius, 0xffffff, 0).setName(`enemy-body-${id}`);
    scene.physics.add.existing(this.anchor);
    this.body = this.anchor.body as Phaser.Physics.Arcade.Body;
    this.body.setAllowGravity(false).setCollideWorldBounds(true);
    this.unregister = registerTeleportTarget(this.anchor);
    this.warning = scene.add.graphics().setDepth(y - 0.5);
    const shadow = scene.add.ellipse(0, 0, definition.radius * 2.8, definition.radius, 0x030c14, 0.55);
    this.shape = scene.add.graphics();
    this.bar = scene.add.graphics();
    this.label = scene.add.text(0, -definition.radius * 3.2, definition.name, {
      fontFamily: 'monospace', fontSize: '10px', color: '#f0e6cd', align: 'center',
    }).setOrigin(0.5);
    this.visual = scene.add.container(x, y, [shadow, this.shape, this.bar, this.label]).setName(`enemy-${id}`);
    this.draw();
  }

  get x(): number { return this.anchor.x; }
  get y(): number { return this.anchor.y; }
  get radius(): number { return this.definition.radius; }
  get hp(): number { return this.health.hp; }
  get alive(): boolean { return this.health.alive; }
  get state(): string { return this.brain.state; }
  get simulating(): boolean { return this.awake; }

  setSimulating(value: boolean): void {
    if (!this.alive || value === this.awake) return;
    this.awake = value;
    this.body.stop();
    this.body.enable = value;
    this.visual.setVisible(value);
    this.warning.setVisible(value);
    if (value) { this.waypoint = null; this.thinkMs = 0; }
  }

  update(dtMs: number): void {
    this.debt.update(dtMs);
    if (!this.alive || !this.awake) return;
    if (Number(this.scene.registry.get('timeStopRemaining')??0)>0) {this.body.stop();return;}
    this.flashMs = Math.max(0, this.flashMs - dtMs);
    this.knockbackMs = Math.max(0, this.knockbackMs - dtMs);
    this.thinkMs -= dtMs;
    const target = this.player.alive ? this.player.anchor : null;
    // Visibility matters only within striking range. Distant idle enemies do no geometry work.
    const inRange = target && Math.hypot(target.x - this.x, target.y - this.y) <= this.definition.attackRange;
    this.brain.update(dtMs, this.anchor, target, !!inRange && combatLineClear(this.scene, this.anchor, target!));
    let velocity: Point = { x: 0, y: 0 };
    if (this.knockbackMs > 0) velocity = this.knockback;
    else if (this.state === 'chase' && target) {
      if (this.thinkMs <= 0) {
        this.waypoint = nextWaypoint(this.anchor, target, this.obstacles(), this.scene.physics.world.bounds, this.radius);
        this.thinkMs = tuning.combat.balance.navigationIntervalMs;
      }
      if (this.waypoint) {
        const dx = this.waypoint.x - this.x, dy = this.waypoint.y - this.y, length = Math.hypot(dx, dy);
        if (length > 3) velocity = { x: dx / length * this.definition.speed, y: dy / length * this.definition.speed };
      }
    } else if (this.state === 'attack') {
      velocity = { x: this.brain.facing.x * this.definition.lungeSpeed, y: this.brain.facing.y * this.definition.lungeSpeed };
    }
    this.body.setVelocity(velocity.x, velocity.y);
  }

  /** Después de física: resolver la ventana sobre posiciones reales, no las del dibujo. */
  postUpdate(): void {
    if (!this.alive || !this.awake || Number(this.scene.registry.get('timeStopRemaining')??0)>0) return;
    if (this.brain.canStrike && this.player.alive
      && intersectsSector(this.anchor, this.brain.facing, { x: this.player.anchor.x, y: this.player.anchor.y, radius: this.player.radius },
        this.definition.attackRange, this.definition.halfAngleDeg)
      && combatLineClear(this.scene, this.anchor, this.player.anchor)) {
      this.brain.consumeHit();
      this.player.takeEnemyDamage(this.definition.dmg, this.brain.facing);
    }
    this.draw();
  }

  takeSwordDamage(damage: number, direction: SwordDirection, knockback = 0): void {
    const result = this.health.damage(damage);
    if (result.applied === 0) return;
    bus.emit('enemy:hit', { id: this.id, dmg: result.applied, x: this.x, y: this.y });
    this.flashMs = tuning.combat.balance.hitFlashMs;
    if (result.killed) {
      this.brain.die();
      this.body.stop();
      this.body.enable = false;
      this.unregister();
      this.warning.clear();
      this.draw();
      bus.emit('enemy:killed', { id: this.id, kind: this.kind, x: this.x, y: this.y });
      this.scene.tweens.add({ targets: this.visual, alpha: 0, scaleY: 0.3,
        duration: tuning.combat.balance.deathFadeMs, onComplete: () => this.visual.setVisible(false) });
      return;
    }
    this.brain.hurt();
    if (!this.definition.armored && knockback > 0) {
      this.knockbackMs = tuning.combat.balance.knockbackMs;
      this.knockback = { x: direction.x * knockback * tuning.combat.balance.knockbackScale,
        y: direction.y * knockback * tuning.combat.balance.knockbackScale };
    }
  }

  addDebtMark(): void { if (this.alive) this.debt.add(this.id); }
  consumeDebtMarks(): number { return this.debt.consume(this.id); }
  get debtMarkCount(): number { return this.debt.count(this.id); }
  onDebtDetonated(): void { this.flashMs = 260; }

  takeFireDamage(damage: number, direction: SwordDirection): void { this.takeSwordDamage(damage, direction); }

  private draw(): void {
    const r = this.radius;
    const color = this.flashMs > 0 ? 0xffffff : this.definition.color;
    const angle = Math.atan2(this.brain.facing.y, this.brain.facing.x);
    const direction = Math.round(angle * 8 / Math.PI);
    const shapeKey = `${color}:${this.state === 'windup'}:${direction}:${this.debtMarkCount}`;
    if (shapeKey !== this.drawnShape) {
      this.drawnShape = shapeKey;
      const g = this.shape.clear();
      if (this.kind === 'slime') {
        const pulse = this.state === 'windup' ? 0.65 : 1;
        g.fillStyle(color).fillEllipse(0, -r * 0.5, r * 2, r * 1.5 * pulse);
        g.fillStyle(0x9bffe1, 0.8).fillEllipse(-r * 0.3, -r * 0.7, r * 0.5, r * 0.3);
      } else {
        g.fillStyle(color).fillRoundedRect(-r * 0.75, -r * 2.1, r * 1.5, r * 2, 4);
        g.fillStyle(this.definition.armored ? 0x9cafc9 : 0xdab977).fillRect(-r * 0.7, -r * 2.3, r * 1.4, r * 0.65);
        g.fillStyle(0x112033).fillRect(-r * 0.45, -r * 2.1, r * 0.9, 3);
        g.lineStyle(this.definition.armored ? 5 : 3, 0xe7d8a8)
          .lineBetween(r * 0.6, -r, r * 1.5, -r * 2.1);
        if (this.definition.armored) g.fillStyle(0x567192).fillRect(-r * 1.1, -r * 1.4, r * 0.6, r);
      }
      for(let i=0;i<this.debtMarkCount;i++)g.fillStyle(0xd779ff).fillCircle((i-1)*7,-r*3.8,2.5);
      g.fillStyle(0xffeea2).fillCircle(Math.cos(direction * Math.PI / 8) * r * 0.45,
        -r * 1.2 + Math.sin(direction * Math.PI / 8) * r * 0.25, 2);
    }
    if (this.hp !== this.drawnHp) {
      this.drawnHp = this.hp;
      this.bar.clear().fillStyle(0x10151d).fillRect(-r, -r * 2.7, r * 2, 4)
        .fillStyle(0xe87575).fillRect(-r, -r * 2.7, r * 2 * this.hp / this.health.maxHp, 4);
      this.label.setText(`${this.definition.name} ${this.hp}/${this.health.maxHp}`);
    }
    this.visual.setPosition(this.x, this.y);
    if (this.visual.depth !== this.y) this.visual.setDepth(this.y);
    this.warning.setPosition(this.x, this.y);
    if (this.warning.depth !== this.y - 0.5) this.warning.setDepth(this.y - 0.5);
    const warningKey = this.state === 'windup' || this.state === 'attack' ? `${this.state}:${angle}` : '';
    if (warningKey === this.drawnWarning) return;
    this.drawnWarning = warningKey;
    this.warning.clear();
    if (this.state === 'windup' || this.state === 'attack') {
      const a = Math.atan2(this.brain.facing.y, this.brain.facing.x);
      const half = this.definition.halfAngleDeg * Math.PI / 180;
      this.warning.fillStyle(this.state === 'attack' ? 0xff4d63 : 0xffc765, this.state === 'attack' ? 0.55 : 0.3)
        .slice(0, 0, this.definition.attackRange, a - half, a + half, false).fillPath();
    }
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.unregister();
    this.scene.tweens.killTweensOf(this.visual);
    this.visual.destroy();
    this.warning.destroy();
    this.anchor.destroy();
  }
}
