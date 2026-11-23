import Phaser from 'phaser';
import tuning from '../../data/tuning.json';
import { FireballBlast, FireballTimeline, type FireballDamageTarget } from './FireballCombat';

/** Room-only E-key fireball visuals and lifecycle; damage stays in FireballBlast. */
export class RoomFireball {
  readonly aimMarker: Phaser.GameObjects.Graphics;
  readonly projectile: Phaser.GameObjects.Container;
  readonly explosion: Phaser.GameObjects.Container;
  readonly burnMark: Phaser.GameObjects.Container;
  private readonly projectileShape: Phaser.GameObjects.Graphics;
  private readonly explosionShape: Phaser.GameObjects.Graphics;
  private readonly burnShape: Phaser.GameObjects.Graphics;
  private readonly timeline = new FireballTimeline({
    fallMs: tuning.roomPrototype.fireballFallDurationMs,
    explosionMs: tuning.roomPrototype.fireballExplosionDurationMs,
    cooldownMs: tuning.roomPrototype.fireballCooldownMs,
  });
  private readonly blast = new FireballBlast();
  private target = { x: 480, y: 400 };
  private displayedExplosionRadius = 0;
  private residueRemainingMs = 0;
  private visualTimeMs = 0;

  constructor(
    scene: Phaser.Scene,
    private readonly targets: () => readonly FireballDamageTarget[],
  ) {
    this.aimMarker = scene.add.graphics().setVisible(false).setDepth(10_000).setName('room-fireball-aim');
    this.projectileShape = scene.add.graphics();
    this.drawProjectile();
    this.projectile = scene.add.container(0, 0, [this.projectileShape])
      .setName('room-fireball-projectile').setVisible(false);
    this.explosionShape = scene.add.graphics();
    this.explosion = scene.add.container(0, 0, [this.explosionShape])
      .setName('room-fireball-explosion').setVisible(false);
    this.burnShape = scene.add.graphics();
    this.drawBurnMark();
    this.burnMark = scene.add.container(0, 0, [this.burnShape])
      .setName('room-fireball-burn-mark').setVisible(false);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  get phase(): string { return this.timeline.phase; }
  get cooldownRemainingMs(): number { return this.timeline.cooldownRemainingMs; }
  get aiming(): boolean { return this.timeline.phase === 'aiming'; }
  get explosionRadius(): number { return this.displayedExplosionRadius; }
  get aimPoint(): { x: number; y: number } { return { ...this.target }; }

  beginAim(x: number, y: number): boolean {
    if (!this.timeline.beginAim()) return false;
    this.aimAt(x, y);
    this.projectile.setVisible(false);
    return true;
  }

  aimAt(x: number, y: number): void {
    if (!this.aiming) return;
    this.target = { x, y };
    this.drawAimMarker();
  }

  releaseAim(): boolean {
    if (!this.timeline.releaseAim()) return false;
    this.aimMarker.setVisible(false);
    this.blast.reset();
    this.displayedExplosionRadius = 0;
    this.explosion.setVisible(false);
    this.projectile.setPosition(this.target.x, this.target.y - tuning.roomPrototype.fireballDropHeight)
      .setRotation(0).setScale(1).setVisible(true).setDepth(this.target.y + 200);
    return true;
  }

  cancelAim(): boolean {
    if (!this.timeline.cancelAim()) return false;
    this.aimMarker.setVisible(false);
    return true;
  }

  update(dtMs: number): void {
    this.visualTimeMs += dtMs;
    const impact = this.timeline.update(dtMs);
    if (impact) {
      this.projectile.setVisible(false);
      this.explosion.setPosition(this.target.x, this.target.y)
        .setDepth(this.target.y + 100).setVisible(true);
      this.burnMark.setPosition(this.target.x, this.target.y + 3)
        .setDepth(this.target.y - 0.5).setAlpha(0.92).setVisible(true);
      this.residueRemainingMs = tuning.roomPrototype.fireballResidueDurationMs;
      this.blast.apply(
        this.target,
        this.targets(),
        tuning.roomPrototype.fireballExplosionRadius,
        tuning.roomPrototype.swordAttackDamage * tuning.roomPrototype.fireballDamageMultiplier,
      );
    }

    if (this.aiming) this.drawAimMarker();
    if (this.timeline.phase === 'falling') {
      const progress = this.timeline.fallProgress;
      const y = this.target.y - tuning.roomPrototype.fireballDropHeight * (1 - progress);
      this.projectile.setPosition(this.target.x, y).setRotation(Math.sin(progress * 12) * 0.09)
        .setScale(0.9 + 0.12 * Math.sin(progress * Math.PI)).setVisible(true);
    }
    if (this.timeline.phase === 'exploding') this.drawExplosion();
    else if (this.timeline.phase === 'idle') {
      this.projectile.setVisible(false);
      this.explosion.setVisible(false);
      this.displayedExplosionRadius = 0;
    }

    if (this.residueRemainingMs > 0) {
      this.residueRemainingMs = Math.max(0, this.residueRemainingMs - dtMs);
      const fadeStart = tuning.roomPrototype.fireballResidueDurationMs * 0.55;
      const fade = this.residueRemainingMs < fadeStart ? this.residueRemainingMs / fadeStart : 1;
      this.burnMark.setAlpha(0.92 * fade);
      if (this.residueRemainingMs === 0) this.burnMark.setVisible(false);
    }
  }

  /** Destroy persistent Phaser objects and any visible transient effect on scene shutdown. */
  destroy(): void {
    this.aimMarker.destroy();
    this.projectile.destroy(true);
    this.explosion.destroy(true);
    this.burnMark.destroy(true);
  }

  private drawAimMarker(): void {
    const radius = tuning.roomPrototype.fireballExplosionRadius;
    const pulse = 0.94 + Math.sin(this.visualTimeMs / 115) * 0.06;
    const outer = radius * pulse;
    this.aimMarker.clear()
      .fillStyle(0xb982ff, 0.12).fillCircle(this.target.x, this.target.y, outer)
      .lineStyle(5, 0x783be0, 0.18).strokeCircle(this.target.x, this.target.y, outer + 2)
      .lineStyle(2, 0xe6c9ff, 0.92).strokeCircle(this.target.x, this.target.y, outer)
      .lineStyle(1, 0xffffff, 0.48).strokeCircle(this.target.x, this.target.y, outer - 5)
      .lineStyle(2, 0xe6c9ff, 0.75)
      .lineBetween(this.target.x - 8, this.target.y, this.target.x + 8, this.target.y)
      .lineBetween(this.target.x, this.target.y - 8, this.target.x, this.target.y + 8)
      .setVisible(true);
  }

  private drawProjectile(): void {
    // Tapered violet tail above the core, plus layered flame tongues and a bright heart.
    this.projectileShape.fillStyle(0x7738d5, 0.2).fillEllipse(0, 4, 38, 61)
      .fillStyle(0x9b4dff, 0.32).fillPoints([
        new Phaser.Math.Vector2(0, -48), new Phaser.Math.Vector2(15, -17),
        new Phaser.Math.Vector2(9, 2), new Phaser.Math.Vector2(-9, 2), new Phaser.Math.Vector2(-15, -17),
      ], true)
      .fillStyle(0x6425bf, 0.85).fillPoints([
        new Phaser.Math.Vector2(0, -36), new Phaser.Math.Vector2(10, -10),
        new Phaser.Math.Vector2(7, 7), new Phaser.Math.Vector2(-7, 7), new Phaser.Math.Vector2(-10, -10),
      ], true)
      .fillStyle(0xb96bff, 0.98).fillEllipse(0, 0, 25, 32)
      .fillStyle(0xf0d9ff, 0.96).fillEllipse(-2, 1, 12, 19)
      .fillStyle(0xffffff, 0.9).fillCircle(-4, -4, 3)
      .lineStyle(2, 0xe7c9ff, 0.95).strokeEllipse(0, 0, 25, 32);
    for (const [x, y, radius] of [[-15, -24, 2], [12, -35, 1.5], [17, -11, 1.2]] as const) {
      this.projectileShape.fillStyle(0xe8baff, 0.86).fillCircle(x, y, radius);
    }
  }

  private drawExplosion(): void {
    const progress = this.timeline.explosionProgress;
    const maxRadius = tuning.roomPrototype.fireballExplosionRadius;
    const easeOut = 1 - (1 - progress) * (1 - progress);
    const radius = Math.max(5, maxRadius * easeOut);
    const alpha = 1 - progress;
    this.displayedExplosionRadius = Math.min(maxRadius, radius);
    this.explosionShape.clear()
      .fillStyle(0x7627ce, 0.25 * alpha).fillCircle(0, 0, radius * 1.22)
      .fillStyle(0x8e42eb, 0.55 * alpha).fillCircle(0, 0, radius)
      .fillStyle(0xbe78ff, 0.62 * alpha).fillCircle(0, 0, radius * 0.68)
      .fillStyle(0xf0d8ff, 0.78 * alpha).fillCircle(0, 0, radius * 0.28)
      .lineStyle(5, 0x7936d3, 0.55 * alpha).strokeCircle(0, 0, radius * 1.08)
      .lineStyle(2, 0xe5c8ff, 0.95 * alpha).strokeCircle(0, 0, radius)
      .lineStyle(1, 0xffffff, 0.8 * alpha).strokeCircle(0, 0, radius * 0.82);
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const inner = radius * 0.77;
      const outer = radius * (1.12 + (i % 2) * 0.14);
      this.explosionShape.lineStyle(3, 0xc997ff, 0.75 * alpha).lineBetween(
        Math.cos(angle) * inner, Math.sin(angle) * inner,
        Math.cos(angle) * outer, Math.sin(angle) * outer,
      );
    }
    this.explosion.setVisible(true);
  }

  private drawBurnMark(): void {
    this.burnShape.fillStyle(0x170d24, 0.7).fillEllipse(0, 0, 74, 25)
      .fillStyle(0x351849, 0.88).fillEllipse(0, -1, 55, 17)
      .fillStyle(0x54277a, 0.78).fillEllipse(0, -1, 38, 11)
      .lineStyle(2, 0x9b5cce, 0.75).strokeEllipse(0, -1, 43, 13)
      .lineStyle(1, 0xd3a5ff, 0.72)
      .lineBetween(-13, -1, 0, -6).lineBetween(0, -6, 13, -1)
      .lineBetween(13, -1, 0, 5).lineBetween(0, 5, -13, -1)
      .fillStyle(0xd3a5ff, 0.85).fillCircle(0, -1, 2);
  }
}
