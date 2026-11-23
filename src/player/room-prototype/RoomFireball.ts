import Phaser from 'phaser';
import tuning from '../../data/tuning.json';
import { FireballBlast, FireballTimeline, type FireballDamageTarget } from './FireballCombat';
import { createItalianRainPattern, type ItalianRainPath } from './ItalianRain';

interface ItalianImpactVisual {
  readonly actor: Phaser.GameObjects.Container;
  readonly shadow: Phaser.GameObjects.Ellipse;
  readonly trail: Phaser.GameObjects.Graphics;
  readonly food: Phaser.GameObjects.Graphics;
  readonly splash: Phaser.GameObjects.Graphics;
  readonly residue: Phaser.GameObjects.Graphics;
  path?: ItalianRainPath;
  landed: boolean;
  burstRemainingMs: number;
  residueRemainingMs: number;
}

/** Prototype E skill: Italian complete rain presentation with one unchanged radial damage event. */
export class RoomFireball {
  readonly aimMarker: Phaser.GameObjects.Graphics;
  readonly projectiles: Phaser.GameObjects.Container[] = [];
  readonly explosion: Phaser.GameObjects.Container;
  readonly burnMark: Phaser.GameObjects.Container;
  private readonly scene: Phaser.Scene;
  private readonly explosionShape: Phaser.GameObjects.Graphics;
  private readonly burnShape: Phaser.GameObjects.Graphics;
  private readonly rainVisuals: ItalianImpactVisual[] = [];
  private readonly timeline = new FireballTimeline({
    fallMs: tuning.roomPrototype.fireballFallDurationMs,
    explosionMs: tuning.roomPrototype.fireballExplosionDurationMs,
    cooldownMs: tuning.roomPrototype.fireballCooldownMs,
  });
  private readonly blast = new FireballBlast();
  private target = { x: 480, y: 400 };
  private pattern: ItalianRainPath[] = [];
  private rainElapsedMs = 0;
  private displayedExplosionRadius = 0;
  private residueRemainingMs = 0;
  private visualTimeMs = 0;

  constructor(
    scene: Phaser.Scene,
    private readonly targets: () => readonly FireballDamageTarget[],
  ) {
    this.scene = scene;
    this.aimMarker = scene.add.graphics().setVisible(false).setDepth(10_000).setName('room-fireball-aim');
    this.createItalianProjectiles();
    this.explosionShape = scene.add.graphics();
    this.explosion = scene.add.container(0, 0, [this.explosionShape])
      .setName('room-fireball-explosion').setVisible(false);
    this.burnShape = scene.add.graphics();
    this.drawItalianResidue(this.burnShape);
    this.burnMark = scene.add.container(0, 0, [this.burnShape])
      .setName('room-fireball-burn-mark').setVisible(false);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  /** Compatibility alias for tests/inspectors that used to read the single falling object. */
  get projectile(): Phaser.GameObjects.Container { return this.projectiles[0]; }
  get phase(): string { return this.timeline.phase; }
  get cooldownRemainingMs(): number { return this.timeline.cooldownRemainingMs; }
  get aiming(): boolean { return this.timeline.phase === 'aiming'; }
  get explosionRadius(): number { return this.displayedExplosionRadius; }
  get aimPoint(): { x: number; y: number } { return { ...this.target }; }
  get isItalianRain(): boolean { return true; }
  get activeProjectileCount(): number { return this.pattern.length; }
  get visibleProjectileCount(): number {
    return this.rainVisuals.filter((visual) => visual.path && !visual.landed && visual.actor.visible).length;
  }
  get landedCount(): number { return this.rainVisuals.filter((visual) => visual.path && visual.landed).length; }
  get visibleSplashCount(): number { return this.rainVisuals.filter((visual) => visual.splash.visible).length; }

  beginAim(x: number, y: number): boolean {
    if (!this.timeline.beginAim()) return false;
    this.aimAt(x, y);
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
    this.burnMark.setVisible(false);
    this.residueRemainingMs = 0;
    this.rainElapsedMs = 0;
    const count = Phaser.Math.Between(
      tuning.roomPrototype.italianRainMinCount,
      tuning.roomPrototype.italianRainMaxCount,
    );
    const seed = Math.floor(this.scene.time.now + this.target.x * 17 + this.target.y * 31);
    this.pattern = createItalianRainPattern(
      count,
      seed,
      tuning.roomPrototype.fireballExplosionRadius,
      tuning.roomPrototype.fireballFallDurationMs,
    );
    this.rainVisuals.forEach((visual, index) => {
      visual.path = this.pattern[index];
      visual.landed = false;
      visual.burstRemainingMs = 0;
      visual.residueRemainingMs = 0;
      visual.actor.setVisible(false);
      visual.shadow.setVisible(false);
      visual.splash.setVisible(false);
      visual.residue.setVisible(false);
    });
    return true;
  }

  cancelAim(): boolean {
    if (!this.timeline.cancelAim()) return false;
    this.aimMarker.setVisible(false);
    return true;
  }

  update(dtMs: number): void {
    const elapsed = Math.max(0, dtMs);
    this.visualTimeMs += elapsed;
    if (this.aiming) this.drawAimMarker();

    if (this.timeline.phase === 'falling') {
      this.rainElapsedMs += elapsed;
      this.updateRain();
    }

    const impact = this.timeline.update(elapsed);
    if (impact) this.impactAbilityOnce();
    if (this.timeline.phase === 'exploding') this.drawFinalImpact();
    else if (this.timeline.phase === 'idle') {
      this.explosion.setVisible(false);
      this.displayedExplosionRadius = 0;
    }

    this.updateResidues(elapsed);
  }

  /** All pooled rain objects are owned here and removed with the prototype scene. */
  destroy(): void {
    this.aimMarker.destroy();
    for (const visual of this.rainVisuals) {
      visual.actor.destroy(true);
      visual.shadow.destroy();
      visual.splash.destroy();
      visual.residue.destroy();
    }
    this.explosion.destroy(true);
    this.burnMark.destroy(true);
  }

  private createItalianProjectiles(): void {
    for (let index = 0; index < tuning.roomPrototype.italianRainMaxCount; index++) {
      const shadow = this.scene.add.ellipse(0, 0, 29, 11, 0x071018, 0.65)
        .setName(`room-italian-shadow-${index}`).setVisible(false);
      const trail = this.scene.add.graphics();
      const food = this.scene.add.graphics();
      this.drawComplete(food);
      const actor = this.scene.add.container(0, 0, [trail, food])
        .setName(`room-italian-completo-${index}`).setVisible(false);
      const splash = this.scene.add.graphics().setName(`room-italian-impact-${index}`).setVisible(false);
      const residue = this.scene.add.graphics().setName(`room-italian-crumbs-${index}`).setVisible(false);
      this.projectiles.push(actor);
      this.rainVisuals.push({ actor, shadow, trail, food, splash, residue,
        landed: false, burstRemainingMs: 0, residueRemainingMs: 0 });
    }
  }

  private updateRain(): void {
    for (const visual of this.rainVisuals) {
      const path = visual.path;
      if (!path || visual.landed) continue;
      const localElapsed = this.rainElapsedMs - path.launchDelayMs;
      if (localElapsed < 0) continue;
      const progress = Math.min(1, localElapsed / path.fallDurationMs);
      const groundX = this.target.x + path.offsetX;
      const groundY = this.target.y + path.offsetY;
      if (progress >= 1) {
        this.landComplete(visual, groundX, groundY);
        continue;
      }

      const height = tuning.roomPrototype.italianRainFallHeight * (1 - progress);
      const x = groundX + path.driftX * (1 - progress);
      const y = groundY - height;
      visual.actor.setPosition(x, y).setRotation(path.rotation + path.spin * progress)
        .setScale(path.scale * (0.54 + 0.46 * progress)).setDepth(groundY + 140).setVisible(true);
      visual.trail.clear()
        .lineStyle(8, 0xfff5d6, 0.16).lineBetween(-path.driftX * (1 - progress) * 0.35, 2, 0, -42)
        .lineStyle(3, 0xffe7ae, 0.6).lineBetween(-path.driftX * (1 - progress) * 0.35, 2, 0, -42);
      visual.shadow.setPosition(groundX, groundY + 3).setDepth(groundY - 0.2)
        .setScale(0.28 + progress * 0.65).setAlpha(0.08 + progress * 0.24).setVisible(true);
    }
  }

  private landComplete(visual: ItalianImpactVisual, x: number, y: number): void {
    visual.landed = true;
    visual.actor.setVisible(false);
    visual.shadow.setPosition(x, y + 3).setScale(0.8).setAlpha(0.28).setVisible(true);
    this.drawItalianSplash(visual.splash);
    visual.splash.setPosition(x, y - 1).setDepth(y + 20).setScale(0.32).setAlpha(0.96).setVisible(true);
    this.drawItalianResidue(visual.residue);
    visual.residue.setPosition(x, y + 2).setDepth(y + 0.1).setAlpha(0.82).setVisible(true);
    visual.burstRemainingMs = tuning.roomPrototype.italianRainImpactFlashMs;
    visual.residueRemainingMs = tuning.roomPrototype.fireballResidueDurationMs;
  }

  private updateResidues(dtMs: number): void {
    for (const visual of this.rainVisuals) {
      if (visual.burstRemainingMs > 0) {
        visual.burstRemainingMs = Math.max(0, visual.burstRemainingMs - dtMs);
        const progress = 1 - visual.burstRemainingMs / tuning.roomPrototype.italianRainImpactFlashMs;
        visual.splash.setScale(0.32 + progress * 0.78).setAlpha(0.96 * (1 - progress));
        if (visual.burstRemainingMs === 0) visual.splash.setVisible(false);
      }
      if (visual.residueRemainingMs > 0) {
        visual.residueRemainingMs = Math.max(0, visual.residueRemainingMs - dtMs);
        const fade = Math.min(1, visual.residueRemainingMs / (tuning.roomPrototype.fireballResidueDurationMs * 0.55));
        visual.residue.setAlpha(0.82 * fade);
        visual.shadow.setAlpha(0.28 * fade);
        if (visual.residueRemainingMs === 0) {
          visual.residue.setVisible(false);
          visual.shadow.setVisible(false);
        }
      }
    }

    if (this.residueRemainingMs > 0) {
      this.residueRemainingMs = Math.max(0, this.residueRemainingMs - dtMs);
      const fade = Math.min(1, this.residueRemainingMs / (tuning.roomPrototype.fireballResidueDurationMs * 0.55));
      this.burnMark.setAlpha(0.92 * fade);
      if (this.residueRemainingMs === 0) this.burnMark.setVisible(false);
    }
  }

  private impactAbilityOnce(): void {
    // Only this final area event calls damage; individual completos are visual-only.
    this.explosion.setPosition(this.target.x, this.target.y).setDepth(this.target.y + 100).setVisible(true);
    this.burnMark.setPosition(this.target.x, this.target.y + 3)
      .setDepth(this.target.y - 0.5).setAlpha(0.92).setVisible(true);
    this.residueRemainingMs = tuning.roomPrototype.fireballResidueDurationMs;
    this.blast.apply(
      this.target,
      this.targets(),
      tuning.roomPrototype.fireballExplosionRadius,
      tuning.roomPrototype.swordAttackDamage * tuning.roomPrototype.fireballDamageMultiplier,
      tuning.roomPrototype.debtBonusDamagePerMark,
    );
  }

  private drawAimMarker(): void {
    const radius = tuning.roomPrototype.fireballExplosionRadius;
    const pulse = 0.94 + Math.sin(this.visualTimeMs / 115) * 0.06;
    const outer = radius * pulse;
    this.aimMarker.clear()
      .fillStyle(0xb982ff, 0.12).fillCircle(this.target.x, this.target.y, outer)
      .lineStyle(6, 0x783be0, 0.18).strokeCircle(this.target.x, this.target.y, outer + 2)
      .lineStyle(2, 0xe6c9ff, 0.96).strokeCircle(this.target.x, this.target.y, outer)
      .lineStyle(1, 0xffffff, 0.48).strokeCircle(this.target.x, this.target.y, outer - 5);
    const flag = [0x2eac64, 0xffffff, 0xe34e4e];
    flag.forEach((color, index) => {
      const angle = -Math.PI / 2 + (index - 1) * 0.13;
      this.aimMarker.lineStyle(4, color, 0.98).lineBetween(
        this.target.x + Math.cos(angle) * (outer - 6), this.target.y + Math.sin(angle) * (outer - 6),
        this.target.x + Math.cos(angle) * (outer + 4), this.target.y + Math.sin(angle) * (outer + 4),
      );
    });
    this.aimMarker.lineStyle(2, 0xe6c9ff, 0.75)
      .lineBetween(this.target.x - 8, this.target.y, this.target.x + 8, this.target.y)
      .lineBetween(this.target.x, this.target.y - 8, this.target.x, this.target.y + 8)
      .setVisible(true);
  }

  private drawComplete(g: Phaser.GameObjects.Graphics): void {
    // Pan, vienesa, palta, tomato and mayo are deliberately distinct at prototype scale.
    g.fillStyle(0x7f4928, 0.9).fillEllipse(0, -7, 36, 16)
      .fillStyle(0xe3ad62, 1).fillEllipse(0, -8, 31, 13)
      .lineStyle(1, 0xffdf9a, 0.95).strokeEllipse(0, -8, 31, 13)
      .fillStyle(0x923f32, 1).fillEllipse(0, -7, 23, 7)
      .fillStyle(0xb94e42, 1).fillEllipse(0, -8, 20, 5)
      .fillStyle(0x4b9a55, 1).fillEllipse(-7, -10, 10, 6)
      .fillEllipse(2, -11, 10, 6).fillEllipse(9, -9, 7, 5)
      .lineStyle(1, 0x9cdb82, 0.95).lineBetween(-10, -10, -5, -9).lineBetween(-1, -11, 4, -10)
      .fillStyle(0xe34a42, 0.98).fillCircle(-5, -6, 2.2).fillCircle(5, -6, 2.1)
      .fillStyle(0xffb0a0, 0.9).fillCircle(-5.5, -6.5, 0.8).fillCircle(4.5, -6.5, 0.8)
      .lineStyle(1.7, 0xfff5dc, 0.98).beginPath()
      .moveTo(-10, -12).lineTo(-6, -9).lineTo(-2, -12).lineTo(2, -9).lineTo(6, -12).lineTo(10, -9)
      .strokePath();
  }

  private drawItalianSplash(g: Phaser.GameObjects.Graphics): void {
    g.clear().fillStyle(0xf1dfb1, 0.72).fillCircle(0, 0, 15)
      .fillStyle(0xc83e38, 0.9).fillEllipse(-7, -2, 16, 9).fillEllipse(8, 3, 13, 8)
      .fillStyle(0x4c9e58, 0.96).fillPoints([
        new Phaser.Math.Vector2(-2, -13), new Phaser.Math.Vector2(2, -5),
        new Phaser.Math.Vector2(9, -8), new Phaser.Math.Vector2(5, -1),
        new Phaser.Math.Vector2(11, 4), new Phaser.Math.Vector2(2, 3),
        new Phaser.Math.Vector2(-2, 12), new Phaser.Math.Vector2(-4, 3),
        new Phaser.Math.Vector2(-12, 5), new Phaser.Math.Vector2(-6, -1),
        new Phaser.Math.Vector2(-11, -8), new Phaser.Math.Vector2(-3, -5),
      ], true)
      .fillStyle(0xfff9e8, 0.98).fillCircle(0, 0, 5)
      .fillStyle(0xe85145, 0.98).fillCircle(-18, -7, 2).fillCircle(17, -9, 1.6)
      .fillStyle(0x70bc70, 0.98).fillCircle(18, 8, 2).fillCircle(-15, 11, 1.4)
      .fillStyle(0xfff3d4, 0.95).fillCircle(9, -17, 1.5);
  }

  private drawItalianResidue(g: Phaser.GameObjects.Graphics): void {
    g.clear().fillStyle(0x281735, 0.18).fillEllipse(0, 0, 52, 24)
      .lineStyle(1.5, 0x9863bd, 0.8).strokeEllipse(0, 0, 45, 20)
      .lineStyle(1, 0xc6a2de, 0.75).lineBetween(-7, -1, 0, -7).lineBetween(0, -7, 7, -1)
      .lineBetween(7, -1, 0, 5).lineBetween(0, 5, -7, -1)
      .fillStyle(0xc7433b, 0.95).fillEllipse(-9, 2, 11, 5).fillCircle(15, -4, 2)
      .fillStyle(0x65a75d, 0.95).fillEllipse(6, -4, 7, 3)
      .fillStyle(0xf4e5c0, 0.95).fillCircle(-17, -5, 1.4).fillCircle(11, 7, 1.2)
      .lineStyle(1.3, 0xfff3d8, 0.92).lineBetween(-5, 1, -1, 3).lineBetween(0, 3, 4, 1);
  }

  private drawFinalImpact(): void {
    const progress = this.timeline.explosionProgress;
    const maxRadius = tuning.roomPrototype.fireballExplosionRadius;
    const radius = Math.max(5, maxRadius * (1 - (1 - progress) ** 2));
    const alpha = 1 - progress;
    this.displayedExplosionRadius = Math.min(maxRadius, radius);
    this.explosionShape.clear()
      .fillStyle(0x742fc2, 0.18 * alpha).fillCircle(0, 0, radius * 1.3)
      .fillStyle(0xd5443a, 0.28 * alpha).fillCircle(0, 0, radius)
      .fillStyle(0x4ca45b, 0.22 * alpha).fillCircle(0, 0, radius * 0.78)
      .fillStyle(0xfff3d2, 0.6 * alpha).fillCircle(0, 0, radius * 0.48)
      .lineStyle(5, 0x8e4bd4, 0.7 * alpha).strokeCircle(0, 0, radius * 1.12)
      .lineStyle(3, 0xfff7df, 0.9 * alpha).strokeCircle(0, 0, radius * 0.8)
      .lineStyle(2, 0xe64d43, 0.92 * alpha);
    for (let index = 0; index < 9; index++) {
      const angle = (Math.PI * 2 * index) / 9;
      this.explosionShape.lineBetween(Math.cos(angle) * radius * 0.68, Math.sin(angle) * radius * 0.68,
        Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    this.explosion.setVisible(true);
  }
}
