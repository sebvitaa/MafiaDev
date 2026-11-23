import Phaser from 'phaser';
import { BINDINGS, Input } from '../../core/Input';
import type { CharacterStats } from '../../types/character';
import { RoomMotion } from './RoomMotion';
import { DoubleTapDash, type TapKey } from './DoubleTapDash';
import { DashTrail } from './DashTrail';
import { SwordAttack } from './SwordAttack';
import type { SwordDamageTarget } from './SwordCombat';
import { RoomFireball } from './RoomFireball';
import type { FireballDamageTarget } from './FireballCombat';
import tuning from '../../data/tuning.json';
import { createAbilitySlots } from '../../abilities';
import { Health, balance, playerMaxHp, playerSwordDamage } from '../../combat';
import { bus } from '../../core/EventBus';

/** Prototype-local adapter; does not replace the lateral Player or publish gameplay events. */
export class RoomPlayer {
  readonly anchor: Phaser.GameObjects.Rectangle;
  readonly body: Phaser.Physics.Arcade.Body;
  readonly shadow: Phaser.GameObjects.Ellipse;
  readonly visual: Phaser.GameObjects.Container;
  readonly equippedSword: Phaser.GameObjects.Graphics;
  readonly motion: RoomMotion;
  readonly attack: SwordAttack;
  readonly fireball: RoomFireball;
  readonly health: Health;
  readonly radius = 8;
  private readonly abilities: ReturnType<typeof createAbilitySlots>;
  private readonly abilityModifier: Phaser.Input.Keyboard.Key;
  private readonly abilityKeys: Phaser.Input.Keyboard.Key[];
  private hurtMs = 0;
  private hurtDirection = { x: 0, y: 0 };
  private suppressAttackRelease = false;
  hasSword = false;
  private readonly input: Input;
  private readonly shift: Phaser.Input.Keyboard.Key;
  private readonly pointer: Phaser.GameObjects.Triangle;
  private readonly eyes: Phaser.GameObjects.Rectangle;
  private readonly reporter?: Phaser.GameObjects.Image;
  private jumpQueued = false;
  private dashQueued = false;
  private dashDirection?: { x: number; y: number };
  private readonly trail: DashTrail;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    stats: CharacterStats,
    targets: () => readonly (SwordDamageTarget & FireballDamageTarget)[] = () => [],
    // GameScene pasa los slots del personaje: crear otros duplicaba Teleport (dos papeles y dos TP por clic).
    abilities?: ReturnType<typeof createAbilitySlots>,
  ) {
    this.motion = new RoomMotion(stats);
    this.health = new Health(playerMaxHp(stats), balance.hurtInvulnerabilityMs);
    this.attack = new SwordAttack(scene, targets, playerSwordDamage(stats));
    this.fireball = new RoomFireball(scene, targets);
    this.input = new Input(scene);
    const keyboard = scene.input.keyboard!;
    this.abilities = abilities ?? createAbilitySlots(scene, ['teleport']);
    this.abilityModifier = keyboard.addKey('Q');
    this.abilityKeys = ['Q', 'ONE', 'TWO', 'THREE', 'FOUR'].map((code) => {
      const key = keyboard.addKey(code);
      key.enabled = true;
      return key;
    });
    this.shift = keyboard.addKey('SHIFT');
    const jumpKeys = BINDINGS.jump;
    const dashKeys = BINDINGS.dash.filter((key) => key !== 'SHIFT');
    const jump = (event: KeyboardEvent) => { if (!event.repeat) this.jumpQueued = true; };
    const dash = (event: KeyboardEvent) => { if (!event.repeat) this.dashQueued = true; };
    const attack = (pointer: Phaser.Input.Pointer) => {
      if (pointer.button === 0) this.suppressAttackRelease = this.abilityModifier.isDown || !this.alive;
      if (pointer.button === 0 && !this.suppressAttackRelease && this.hasSword && !this.motion.dash.active && this.hurtMs === 0) {
        this.attack.beginInput(this.anchor.x, this.anchor.y, this.motion.height, this.aim(), this.equippedSword);
      }
    };
    const attackRelease = (pointer: Phaser.Input.Pointer) => {
      if (pointer.button === 0 && this.abilityModifier.isDown) this.suppressAttackRelease = true;
      if (pointer.button === 0 && !this.suppressAttackRelease && this.alive) {
        this.attack.releaseInput(this.anchor.x, this.anchor.y, this.motion.height, this.aim(), this.equippedSword);
      }
    };
    // Ulti (bola): mantener clic derecho apunta al cursor, soltar la lanza. Q + derecho es del papel de TP (abilities).
    const aimDown = (pointer: Phaser.Input.Pointer) => {
      if (pointer.button !== 2 || this.abilityModifier.isDown || !this.alive || this.hurtMs > 0) return;
      const p = this.cursor();
      this.fireball.beginAim(p.x, p.y);
    };
    const aimUp = (pointer: Phaser.Input.Pointer) => { if (pointer.button === 2) this.fireball.releaseAim(); };
    scene.input.on(Phaser.Input.Events.POINTER_DOWN, attack);
    scene.input.on(Phaser.Input.Events.POINTER_UP, attackRelease);
    scene.input.on(Phaser.Input.Events.POINTER_DOWN, aimDown);
    scene.input.on(Phaser.Input.Events.POINTER_UP, aimUp);
    // SUP-basti-20261123-110158: give physical double taps a forgiving 350 ms window.
    const taps = new DoubleTapDash(tuning.roomPrototype.doubleTapWindowMs);
    const tapListeners = (['W', 'A', 'S', 'D', 'UP', 'LEFT', 'DOWN', 'RIGHT'] as TapKey[]).map((key) => {
      const down = (event: KeyboardEvent) => {
        if (event.repeat) return;
        const direction = taps.press(key, event.timeStamp);
        if (direction) { this.dashQueued = true; this.dashDirection = direction; }
      };
      const up = () => taps.release(key);
      keyboard.on(`keydown-${key}`, down);
      keyboard.on(`keyup-${key}`, up);
      return { key, down, up };
    });
    const clear = () => {
      this.jumpQueued = false; this.dashQueued = false; this.dashDirection = undefined; taps.clear();
      this.attack.cancelInput();
      this.fireball.cancelAim();
      this.suppressAttackRelease = true;
    };
    const enterAbilityMode = () => { this.suppressAttackRelease = true; this.attack.cancelInput(); };
    keyboard.on('keydown-Q', enterAbilityMode);
    for (const key of jumpKeys) keyboard.on(`keydown-${key}`, jump);
    for (const key of dashKeys) keyboard.on(`keydown-${key}`, dash);
    scene.game.events.on(Phaser.Core.Events.BLUR, clear);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      for (const key of jumpKeys) keyboard.off(`keydown-${key}`, jump);
      for (const key of dashKeys) keyboard.off(`keydown-${key}`, dash);
      for (const { key, down, up } of tapListeners) {
        keyboard.off(`keydown-${key}`, down);
        keyboard.off(`keyup-${key}`, up);
      }
      scene.game.events.off(Phaser.Core.Events.BLUR, clear);
      scene.input.off(Phaser.Input.Events.POINTER_DOWN, attack);
      scene.input.off(Phaser.Input.Events.POINTER_UP, attackRelease);
      scene.input.off(Phaser.Input.Events.POINTER_DOWN, aimDown);
      scene.input.off(Phaser.Input.Events.POINTER_UP, aimUp);
      keyboard.off('keydown-Q', enterAbilityMode);
    });

    this.anchor = scene.add.rectangle(x, y, 14, 8, 0xffffff, 0);
    scene.physics.add.existing(this.anchor);
    this.body = this.anchor.body as Phaser.Physics.Arcade.Body;
    this.body.setAllowGravity(false).setCollideWorldBounds(true);
    this.shadow = scene.add.ellipse(x, y, 34, 12, 0x050b13, 0.7);
    const cloak = scene.add.graphics();
    cloak.fillStyle(0x287779).fillPoints([
      new Phaser.Math.Vector2(-10, -25), new Phaser.Math.Vector2(10, -25),
      new Phaser.Math.Vector2(16, 0), new Phaser.Math.Vector2(-16, 0),
    ], true);
    cloak.fillStyle(0x4dc7b8).fillTriangle(-10, -25, 0, -27, -5, 0);
    const belt = scene.add.rectangle(0, -11, 20, 3, 0xc69e66);
    const hood = scene.add.circle(0, -31, 9, 0x61d2bd);
    const face = scene.add.ellipse(0, -30, 11, 10, 0x172c37);
    this.equippedSword = scene.add.graphics().setVisible(false);
    this.equippedSword.fillStyle(0xeafbf6).fillPoints([
      new Phaser.Math.Vector2(0, -3), new Phaser.Math.Vector2(17, -2),
      new Phaser.Math.Vector2(25, 0), new Phaser.Math.Vector2(17, 2),
      new Phaser.Math.Vector2(0, 3),
    ], true);
    this.equippedSword.fillStyle(0xe0bd79).fillRect(-7, -2, 9, 4);
    this.equippedSword.lineStyle(3, 0xd7a75e).lineBetween(1, -7, 1, 7);
    this.equippedSword.fillStyle(0x9c6748).fillRect(-12, -2, 6, 4);
    this.eyes = scene.add.rectangle(0, -30, 7, 2, 0xf9db98);
    this.pointer = scene.add.triangle(0, 0, -4, -3, 5, 0, -4, 3, 0xf9db98);
    this.visual = scene.add.container(x, y, [cloak, belt, hood, face, this.equippedSword, this.eyes, this.pointer]);
    if (scene.textures.exists('rios')) {
      for (const part of [cloak, belt, hood, face, this.eyes]) part.setVisible(false);
      this.reporter = scene.add.image(0, 0, 'rios').setOrigin(0.5, 1).setDisplaySize(22, 40);
      this.visual.addAt(this.reporter, 4);
    }
    this.trail = new DashTrail(scene);
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.updateTrail, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.updateTrail, this);
    });
    this.sync();
  }

  update(dtMs: number): void {
    this.health.update(dtMs);
    this.hurtMs = Math.max(0, this.hurtMs - dtMs);
    this.input.update();
    this.abilities.update(dtMs);
    if (!this.alive) { this.body.setVelocity(0, 0); return; }
    this.attack.update(dtMs);
    if (this.fireball.aiming) { const p = this.cursor(); this.fireball.aimAt(p.x, p.y); } // la cámara se mueve aunque el ratón no
    this.fireball.update(dtMs);
    if (this.hurtMs > 0) {
      this.motion.update({ x: 0, y: 0, run: false, jumpHeld: false,
        jumpPressed: false, dashPressed: false }, dtMs);
      this.body.setVelocity(this.hurtDirection.x * balance.playerKnockbackSpeed,
        this.hurtDirection.y * balance.playerKnockbackSpeed);
      this.jumpQueued = false; this.dashQueued = false; this.dashDirection = undefined;
      return;
    }
    const events = this.motion.update({
      x: this.input.axisX,
      y: Number(this.input.held('down')) - Number(this.input.held('up')),
      run: this.shift.isDown,
      jumpHeld: this.input.held('jump'),
      jumpPressed: this.jumpQueued,
      dashPressed: this.dashQueued && (!this.attack.active || this.attack.canCancelWithDash),
      dashDirection: this.dashDirection,
    }, dtMs);
    if (events.dashed) this.attack.cancelByDash();
    this.jumpQueued = false;
    this.dashQueued = false;
    this.dashDirection = undefined;
    this.body.setVelocity(this.motion.velocity.x, this.motion.velocity.y);
  }

  equipSword(): void { this.hasSword = true; }

  /** El golpe va hacia el cursor (no hacia donde se mueve). Recalcula con la cámara actual: worldX queda viejo si la cámara se mueve sin mover el ratón. */
  private cursor(): Phaser.Math.Vector2 {
    const scene = this.anchor.scene;
    return scene.input.activePointer.positionToCamera(scene.cameras.main) as Phaser.Math.Vector2;
  }

  private aim(): { x: number; y: number } {
    const p = this.cursor();
    const dx = p.x - this.anchor.x, dy = p.y - (this.anchor.y - this.motion.height - 17);
    return Math.hypot(dx, dy) > 1 ? { x: dx, y: dy } : this.motion.facing;
  }

  get alive(): boolean { return this.health.alive; }
  get hp(): number { return this.health.hp; }
  get maxHp(): number { return this.health.maxHp; }

  takeEnemyDamage(damage: number, direction: { x: number; y: number }): boolean {
    const result = this.health.damage(damage);
    if (result.applied === 0) return false;
    this.attack.interrupt();
    this.motion.dash.cancel();
    this.fireball.cancelAim();
    this.suppressAttackRelease = true;
    this.hurtMs = balance.hurtLockMs;
    this.hurtDirection = { ...direction };
    this.motion.velocity = { x: 0, y: 0 };
    bus.emit('player:hit', { dmg: result.applied / balance.pointsPerHeart,
      hp: Math.ceil(this.hp / balance.pointsPerHeart), maxHp: this.maxHp / balance.pointsPerHeart });
    if (result.killed) {
      this.motion.height = 0;
      this.motion.verticalVelocity = 0;
      for (const key of this.abilityKeys) { key.reset(); key.enabled = false; }
      this.body.setVelocity(0, 0);
      this.body.enable = false;
      bus.emit('player:died', {});
    }
    return true;
  }

  private updateTrail(): void {
    const scene = this.anchor.scene;
    this.trail.update(scene.time.now, this.motion.dash.active, this.anchor.x, this.anchor.y, this.motion.height);
  }

  /** Synchronize after Arcade updates the ground anchor, never from visual height. */
  sync(): void {
    const { x, y } = this.anchor;
    const { height, facing } = this.motion;
    this.shadow.setPosition(x, y).setDepth(y - 0.25);
    this.shadow.setScale(1 / (1 + height / 180)).setAlpha(0.7 / (1 + height / 120));
    this.visual.setPosition(x, y - height).setDepth(y);
    this.visual.setAlpha(!this.alive ? 0.3 : this.health.invulnerable
      ? Math.floor(this.anchor.scene.time.now / 70) % 2 === 0 ? 0.4 : 1
      : this.motion.dash.active ? 0.8 : 1);
    this.equippedSword.setVisible(this.hasSword);
    if (this.attack.holdingInput) {
      const raw = this.aim(), len = Math.hypot(raw.x, raw.y) || 1, aim = { x: raw.x / len, y: raw.y / len }; // la carga sigue al cursor
      this.attack.followChargePose(x, y, height, aim, this.equippedSword);
      this.equippedSword.setPosition(aim.x * 11 + 7, -19 + aim.y * 5)
        .setRotation(Math.atan2(aim.y, aim.x));
    } else if (!this.attack.active) {
      this.equippedSword.setPosition(facing.x * 11 + 7, -19 + facing.y * 5)
        .setRotation(Math.atan2(facing.y, facing.x));
    }
    this.pointer.setPosition(facing.x * 22, -17 + facing.y * 16)
      .setRotation(Math.atan2(facing.y, facing.x));
    this.eyes.setPosition(facing.x * 3, -30 + facing.y * 3);
    if (facing.x !== 0) this.reporter?.setFlipX(facing.x < 0);
  }
}
