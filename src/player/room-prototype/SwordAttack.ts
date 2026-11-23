import Phaser from 'phaser';
import tuning from '../../data/tuning.json';
import {
  SwordCharge,
  SwordCombo,
  SwordHitTracker,
  type ComboAttack,
  type SwordDamageTarget,
} from './SwordCombat';

/** SUP-basti-20261123-123408: charge timing, 50% reach bonus and release animation. */
export class SwordAttack {
  readonly slash: Phaser.GameObjects.Container;
  private readonly slashShape: Phaser.GameObjects.Graphics;
  private readonly chargeShape: Phaser.GameObjects.Graphics;
  private readonly chargeEffect: Phaser.GameObjects.Container;
  private readonly combo = new SwordCombo({
    durationsMs: tuning.roomPrototype.swordComboDurationsMs as [number, number, number],
    damageMultipliers: tuning.roomPrototype.swordAttackDamageMultipliers as [number, number, number],
    comboWindowMs: tuning.roomPrototype.swordComboWindowMs,
    bufferMs: tuning.roomPrototype.swordAttackBufferMs,
    dashCancelAfterMs: tuning.roomPrototype.swordDashCancelAfterMs,
  });
  private readonly charge = new SwordCharge(
    tuning.roomPrototype.swordChargeThresholdMs,
    tuning.roomPrototype.swordChargeMaxMs,
    tuning.roomPrototype.swordChargeRangeMultiplier,
    tuning.roomPrototype.swordChargeDamageMultiplier,
  );
  private readonly hitTracker = new SwordHitTracker();
  private hitRemainingMs = 0;
  private hitDamage = 0;
  private hitRange = 0;
  private hitAngle = 0;
  private hitKnockback = 0;
  private swingDurationMs = 1;
  private swingElapsedMs = 0;
  private swingTravel = 0;
  private swingEase: 'Cubic.Out' | 'Cubic.In' = 'Cubic.Out';
  private origin = { x: 0, y: 0 };
  private facing = { x: 1, y: 0 };
  private height = 0;
  private weapon?: Phaser.GameObjects.Graphics;
  private inputHeld = false;
  private chargeEnabled = false;
  private chargedRemainingMs = 0;
  private chargedElapsedMs = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly targets: () => readonly SwordDamageTarget[] = () => [],
  ) {
    this.slashShape = scene.add.graphics();
    this.slash = scene.add.container(0, 0, [this.slashShape]).setVisible(false);
    this.slash.setName('room-sword-slash');
    this.chargeShape = scene.add.graphics();
    this.chargeEffect = scene.add.container(0, 0, [this.chargeShape]).setDepth(10_000).setVisible(false);
    this.chargeEffect.setName('room-sword-charge');
  }

  get active(): boolean { return this.combo.active || this.charge.isHolding || this.chargedRemainingMs > 0; }
  get currentAttack(): ComboAttack | 0 { return this.combo.currentAttack; }
  get canCancelWithDash(): boolean {
    return this.charge.isHolding || this.combo.canCancelWithDash
      || (this.chargedRemainingMs > 0 && this.chargedElapsedMs >= tuning.roomPrototype.swordDashCancelAfterMs);
  }
  get buffered(): boolean { return this.combo.hasBufferedAttack; }
  get chargeProgress(): number { return this.charge.progress; }
  get holdingInput(): boolean { return this.charge.isHolding; }

  /** Begin a mouse gesture; its release decides between combo tap and charge. */
  beginInput(
    x: number,
    y: number,
    height: number,
    facing: { x: number; y: number },
    weapon: Phaser.GameObjects.Graphics,
  ): boolean {
    if (this.inputHeld || this.chargedRemainingMs > 0) return false;
    this.inputHeld = true;
    this.savePose(x, y, height, facing, weapon);
    this.chargeEnabled = this.charge.begin();
    return true;
  }

  /** Release becomes either a tap in the existing combo or one charged swing. */
  releaseInput(x: number, y: number, height: number, facing: { x: number; y: number },
    weapon: Phaser.GameObjects.Graphics): boolean {
    if (!this.inputHeld) return false;
    this.savePose(x, y, height, facing, weapon);
    this.inputHeld = false;
    if (this.chargeEnabled) {
      const result = this.charge.release();
      this.chargeEnabled = false;
      this.chargeEffect.setVisible(false);
      if (result?.kind === 'charged') {
        this.playCharged(result.progress);
        return true;
      }
    }
    return this.start(this.origin.x, this.origin.y, this.height, this.facing, this.weapon!);
  }

  /** Called on window blur so a lost mouseup cannot leave a charge held. */
  cancelInput(): void {
    this.inputHeld = false;
    this.chargeEnabled = false;
    this.charge.cancel();
    this.chargeEffect.setVisible(false);
  }

  /** Called after Arcade resolves movement so held sword and charge FX match the player pose. */
  followChargePose(x: number, y: number, height: number, facing: { x: number; y: number },
    weapon: Phaser.GameObjects.Graphics): void {
    if (!this.charge.isHolding) return;
    this.savePose(x, y, height, facing, weapon);
    if (this.charge.isCharging) this.drawChargeEffect();
  }

  /** Kept as a direct tap entry point for the prototype's local callers. */
  start(
    x: number,
    y: number,
    height: number,
    facing: { x: number; y: number },
    weapon: Phaser.GameObjects.Graphics,
  ): boolean {
    if (this.chargedRemainingMs > 0) return false;
    this.savePose(x, y, height, facing, weapon);
    const attack = this.combo.press();
    if (attack === undefined) return false;
    this.play(attack);
    return true;
  }

  update(dtMs: number): void {
    const elapsed = Math.max(0, dtMs);
    this.charge.update(elapsed);
    if (this.charge.isCharging && this.combo.active) this.interruptComboForCharge();
    if (this.charge.isCharging) this.drawChargeEffect();
    else this.chargeEffect.setVisible(false);

    const nextAttack = this.combo.update(elapsed);
    if (nextAttack !== undefined) {
      this.play(nextAttack);
      return;
    }
    if (this.chargedRemainingMs > 0) {
      this.swingElapsedMs += elapsed;
      if (this.hitRemainingMs > 0) {
        this.applyHitbox();
        this.hitRemainingMs = Math.max(0, this.hitRemainingMs - elapsed);
      }
      this.chargedElapsedMs += elapsed;
      this.chargedRemainingMs = Math.max(0, this.chargedRemainingMs - elapsed);
    } else if (this.combo.active && this.hitRemainingMs > 0) {
      this.swingElapsedMs += elapsed;
      this.applyHitbox();
      this.hitRemainingMs = Math.max(0, this.hitRemainingMs - elapsed);
    } else if (this.combo.active) {
      this.swingElapsedMs += elapsed;
    }
    if (!this.combo.active && this.chargedRemainingMs === 0 && this.slash.visible) {
      this.scene.tweens.killTweensOf(this.slash);
      this.slash.setVisible(false);
    }
  }

  cancelByDash(): boolean {
    const chargeCancelled = this.charge.cancel();
    const chargedSwingCancelled = this.chargedRemainingMs > 0
      && this.chargedElapsedMs >= tuning.roomPrototype.swordDashCancelAfterMs;
    const comboCancelled = this.combo.cancelByDash();
    if (!chargeCancelled && !chargedSwingCancelled && !comboCancelled) return false;
    this.inputHeld = false;
    this.chargeEnabled = false;
    this.chargedRemainingMs = 0;
    this.hitRemainingMs = 0;
    this.combo.reset();
    this.chargeEffect.setVisible(false);
    this.scene.tweens.killTweensOf(this.slash);
    if (this.weapon) this.scene.tweens.killTweensOf(this.weapon);
    this.slash.setVisible(false);
    return true;
  }

  private savePose(x: number, y: number, height: number, facing: { x: number; y: number },
    weapon: Phaser.GameObjects.Graphics): void {
    this.origin = { x, y };
    const length = Math.hypot(facing.x, facing.y);
    this.facing = length > 0 ? { x: facing.x / length, y: facing.y / length } : { x: 1, y: 0 };
    this.height = height;
    this.weapon = weapon;
  }

  private play(attack: ComboAttack): void {
    const config = tuning.roomPrototype;
    const duration = (config.swordComboDurationsMs as [number, number, number])[attack - 1];
    const hitWindow = (config.swordAttackHitWindowsMs as [number, number, number])[attack - 1];
    const range = (config.swordAttackRanges as [number, number, number])[attack - 1];
    const halfAngle = (config.swordAttackHalfAnglesDeg as [number, number, number])[attack - 1];
    this.hitDamage = this.combo.damageFor(config.swordAttackDamage, attack);
    this.hitRange = range;
    this.hitAngle = halfAngle;
    this.hitKnockback = attack === 3 ? config.swordFinisherKnockback : 0;
    this.swingDurationMs = duration;
    this.swingElapsedMs = 0;
    this.swingTravel = attack === 3 ? 21 : attack === 2 ? 13 : 7;
    this.swingEase = attack === 3 ? 'Cubic.In' : 'Cubic.Out';
    this.hitRemainingMs = hitWindow;
    this.hitTracker.beginSwing();
    this.drawSlash(attack, range, halfAngle);
    this.applyHitbox();
    this.animateWeapon(attack, duration, false);
    this.animateSlash(attack, duration, false);
  }

  private playCharged(progress: number): void {
    const config = tuning.roomPrototype;
    const baseRange = (config.swordAttackRanges as [number, number, number])[0];
    this.combo.reset();
    this.chargedElapsedMs = 0;
    this.chargedRemainingMs = config.swordChargeDurationMs;
    this.hitRemainingMs = config.swordChargeHitWindowMs;
    this.hitDamage = Math.round(config.swordAttackDamage * (1
      + (config.swordChargeDamageMultiplier - 1) * progress));
    this.hitRange = baseRange * (1 + (config.swordChargeRangeMultiplier - 1) * progress);
    this.hitAngle = config.swordChargeHalfAngleDeg;
    this.hitKnockback = 0;
    this.swingDurationMs = config.swordChargeDurationMs;
    this.swingElapsedMs = 0;
    this.swingTravel = 32;
    this.swingEase = 'Cubic.Out';
    this.hitTracker.beginSwing();
    this.drawSlash(3, this.hitRange, this.hitAngle, true);
    this.applyHitbox();
    this.animateWeapon(3, config.swordChargeDurationMs, true);
    this.animateSlash(3, config.swordChargeDurationMs, true);
  }

  private drawSlash(attack: ComboAttack, range: number, halfAngle: number, charged = false): void {
    const angle = Math.atan2(this.facing.y, this.facing.x);
    const halfRadians = halfAngle * Math.PI / 180;
    const outer = this.arcPoints(range, -halfRadians, halfRadians, charged ? 20 : attack === 2 ? 18 : 12);
    const inner = this.arcPoints(range * (charged ? 0.24 : 0.32), halfRadians, -halfRadians, charged ? 20 : attack === 2 ? 18 : 12);
    const color = charged ? 0xffb94f : [0x54e6d5, 0x9ee8d3, 0xffcb76][attack - 1];
    this.slashShape.clear().fillStyle(color, charged ? 0.58 : attack === 3 ? 0.48 : 0.34)
      .fillPoints([...outer, ...inner], true)
      .lineStyle(charged || attack === 3 ? 5 : 3, charged ? 0xffefb0 : 0xffe7a8, 0.98)
      .beginPath();
    outer.forEach((point, index) => index === 0
      ? this.slashShape.moveTo(point.x, point.y)
      : this.slashShape.lineTo(point.x, point.y));
    this.slashShape.strokePath();
    this.slash.setPosition(this.origin.x, this.origin.y - this.height)
      .setRotation(angle).setDepth(this.origin.y + this.facing.y * range * 0.42)
      .setScale(charged ? 1 : attack === 2 ? 0.78 : attack === 3 ? 0.94 : 0.85)
      .setAlpha(1).setVisible(true);
  }

  private animateWeapon(attack: ComboAttack, duration: number, charged: boolean): void {
    const angle = Math.atan2(this.facing.y, this.facing.x);
    const handX = this.facing.x * 11 + 7;
    const handY = -19 + this.facing.y * 5;
    const sign = this.facing.y >= 0 ? 1 : -1;
    const weaponRotation = charged ? 1.75 * sign : attack === 1 ? 0.55 : attack === 2 ? 1.2 * sign : -0.38 * sign;
    const weaponTravel = charged ? 40 : attack === 3 ? 25 : attack === 2 ? 14 : 8;
    if (!this.weapon) return;
    this.scene.tweens.killTweensOf(this.weapon);
    this.weapon.setPosition(handX, handY).setRotation(angle - weaponRotation * 0.55);
    this.scene.tweens.add({
      targets: this.weapon,
      x: handX + this.facing.x * weaponTravel,
      y: handY + this.facing.y * weaponTravel,
      rotation: angle + weaponRotation,
      duration: Math.max(60, duration * (charged ? 0.7 : attack === 1 ? 0.5 : attack === 2 ? 0.78 : 0.42)),
      yoyo: true,
      ease: charged ? 'Back.Out' : attack === 3 ? 'Cubic.In' : attack === 2 ? 'Cubic.Out' : 'Quad.Out',
    });
  }

  private animateSlash(attack: ComboAttack, duration: number, charged: boolean): void {
    const angle = Math.atan2(this.facing.y, this.facing.x);
    const startX = this.origin.x;
    const startY = this.origin.y - this.height;
    const sign = this.facing.y >= 0 ? 1 : -1;
    this.scene.tweens.killTweensOf(this.slash);
    this.scene.tweens.add({
      targets: this.slash,
      x: startX + this.facing.x * this.swingTravel,
      y: startY + this.facing.y * this.swingTravel,
      rotation: angle + (charged ? 1.1 * sign : attack === 2 ? 0.72 * sign : attack === 3 ? -0.28 * sign : 0.38 * sign),
      scaleX: charged ? 1.35 : attack === 2 ? 1.18 : attack === 3 ? 1.22 : 1.04,
      scaleY: charged ? 1.2 : attack === 2 ? 1.08 : attack === 3 ? 0.84 : 1,
      alpha: 0,
      duration,
      ease: this.swingEase,
      onComplete: () => this.slash.setVisible(false),
    });
  }

  private drawChargeEffect(): void {
    const progress = this.charge.progress;
    const cx = 0;
    const cy = 0;
    const radius = 13 + progress * 20;
    this.chargeShape.clear()
      .fillStyle(0xffc86f, 0.08 + progress * 0.1).fillCircle(cx, cy, radius + 5)
      .lineStyle(2 + progress * 2, 0xffd18a, 0.65 + progress * 0.3).strokeCircle(cx, cy, radius)
      .fillStyle(0xffedbd, 0.55 + progress * 0.4).fillCircle(cx, cy, 2 + progress * 3);
    this.chargeEffect.setPosition(this.origin.x, this.origin.y - this.height - 18)
      .setVisible(true).setDepth(this.origin.y + 50);
  }

  private applyHitbox(): void {
    const t = Math.max(0, Math.min(1, this.swingElapsedMs / this.swingDurationMs));
    const eased = this.swingEase === 'Cubic.In' ? t ** 3 : 1 - (1 - t) ** 3;
    const hitOrigin = {
      x: this.origin.x + this.facing.x * this.swingTravel * eased,
      y: this.origin.y + this.facing.y * this.swingTravel * eased,
    };
    this.hitTracker.apply(hitOrigin, this.facing, this.targets(), this.hitRange,
      this.hitAngle, this.hitDamage, this.hitKnockback);
  }

  private interruptComboForCharge(): void {
    this.combo.reset();
    this.hitRemainingMs = 0;
    this.scene.tweens.killTweensOf(this.slash);
    if (this.weapon) this.scene.tweens.killTweensOf(this.weapon);
    this.slash.setVisible(false);
  }

  private arcPoints(radius: number, start: number, end: number, steps: number): Phaser.Math.Vector2[] {
    return Array.from({ length: steps + 1 }, (_, i) => {
      const angle = start + (end - start) * i / steps;
      return new Phaser.Math.Vector2(Math.cos(angle) * radius, Math.sin(angle) * radius);
    });
  }
}
