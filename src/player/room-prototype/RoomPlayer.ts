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
  ) {
    this.motion = new RoomMotion(stats);
    this.attack = new SwordAttack(scene, targets);
    this.fireball = new RoomFireball(scene, targets);
    this.input = new Input(scene);
    const keyboard = scene.input.keyboard!;
    this.shift = keyboard.addKey('SHIFT');
    const jumpKeys = BINDINGS.jump;
    const dashKeys = BINDINGS.dash.filter((key) => key !== 'SHIFT');
    const jump = (event: KeyboardEvent) => { if (!event.repeat) this.jumpQueued = true; };
    const dash = (event: KeyboardEvent) => { if (!event.repeat) this.dashQueued = true; };
    const attack = (pointer: Phaser.Input.Pointer) => {
      if (pointer.button === 0 && this.hasSword && !this.motion.dash.active) {
        this.attack.beginInput(this.anchor.x, this.anchor.y, this.motion.height, this.motion.facing, this.equippedSword);
      }
    };
    const attackRelease = (pointer: Phaser.Input.Pointer) => {
      if (pointer.button === 0) {
        this.attack.releaseInput(this.anchor.x, this.anchor.y, this.motion.height, this.motion.facing, this.equippedSword);
      }
    };
    const aimDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const pointer = scene.input.activePointer;
      this.fireball.beginAim(pointer.worldX, pointer.worldY);
    };
    const aimUp = () => { this.fireball.releaseAim(); };
    const aimMove = (pointer: Phaser.Input.Pointer) => this.fireball.aimAt(pointer.worldX, pointer.worldY);
    scene.input.on(Phaser.Input.Events.POINTER_DOWN, attack);
    scene.input.on(Phaser.Input.Events.POINTER_UP, attackRelease);
    scene.input.on(Phaser.Input.Events.POINTER_MOVE, aimMove);
    keyboard.on('keydown-E', aimDown);
    keyboard.on('keyup-E', aimUp);
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
    };
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
      scene.input.off(Phaser.Input.Events.POINTER_MOVE, aimMove);
      keyboard.off('keydown-E', aimDown);
      keyboard.off('keyup-E', aimUp);
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
    this.attack.update(dtMs);
    this.fireball.update(dtMs);
    this.input.update();
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
    this.visual.setAlpha(this.motion.dash.active ? 0.8 : 1);
    this.equippedSword.setVisible(this.hasSword);
    if (this.attack.holdingInput) {
      this.attack.followChargePose(x, y, height, facing, this.equippedSword);
      this.equippedSword.setPosition(facing.x * 11 + 7, -19 + facing.y * 5)
        .setRotation(Math.atan2(facing.y, facing.x));
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
