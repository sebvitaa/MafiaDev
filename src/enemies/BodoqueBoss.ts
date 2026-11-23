import Phaser from 'phaser';
import enemyData from '../data/enemies.json';
import tuning from '../data/tuning.json';
import type { GameEvents } from '../types/events';
import { BodoqueFinale } from './BodoqueFinale';
import type { SwordDamageTarget } from '../player/room-prototype/SwordCombat';
import type { FireballDamageTarget } from '../player/room-prototype/FireballCombat';
import {
  BodoqueBrain,
  isPointInBodoqueAttack,
  type BodoqueAttackId,
  type BodoqueConfig,
  type BodoquePoint,
  type BodoqueState,
} from './BodoqueBrain';

// SUP-basti-20261123-143619: provisional Phase 1 combat timings, damage, room activation and test-player HP.
const config = enemyData.bodoque as BodoqueConfig;
const markLimit = tuning.roomPrototype.debtMarkMax;
const markLifetimeMs = tuning.roomPrototype.debtMarkDurationMs;

export interface BodoqueBossHooks {
  onPhase?: (event: GameEvents['boss:phase']) => void;
  onHit?: (event: GameEvents['enemy:hit']) => void;
  onKilled?: (event: GameEvents['enemy:killed']) => void;
  onPlayerHit?: (damage: number, attack: BodoqueAttackId) => void;
}

/** Phaser presentation and local combat adapters for Juan Carlos Bodoque. */
export class BodoqueBoss {
  readonly id = 'bodoque';
  readonly radius = config.radius;
  readonly brain: BodoqueBrain;
  readonly visual: Phaser.GameObjects.Container;
  readonly healthBar: Phaser.GameObjects.Graphics;
  readonly telegraph: Phaser.GameObjects.Graphics;
  readonly attackLabel: Phaser.GameObjects.Text;
  readonly nameLabel: Phaser.GameObjects.Text;
  readonly healthText: Phaser.GameObjects.Text;
  readonly victoryLabel: Phaser.GameObjects.Text;
  readonly debtMarksVisual: Phaser.GameObjects.Graphics;
  readonly finale: BodoqueFinale;
  readonly heartTarget: SwordDamageTarget & FireballDamageTarget;
  private reporter?: Phaser.GameObjects.Image;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly body: Phaser.GameObjects.Container;
  private readonly damageLabel: Phaser.GameObjects.Text;
  private readonly hitFlash: Phaser.GameObjects.Graphics;
  private readonly marksRemaining: number[] = [];
  private damageLabelRemainingMs = 0;
  private debtBurstRemainingMs = 0;
  private readonly hooks: BodoqueBossHooks;

  constructor(
    private readonly scene: Phaser.Scene,
    x: number,
    y: number,
    hooks: BodoqueBossHooks = {},
    private readonly arenaBounds?: BodoqueConfig['bounds'],
  ) {
    this.hooks = hooks;
    this.brain = new BodoqueBrain({ ...config, bounds: arenaBounds ?? config.bounds });
    this.finale = new BodoqueFinale(scene, arenaBounds ? { x, y } : undefined);
    const boss = this;
    // Stable ID across body/core keeps an ongoing hit tracker from hitting both on transition.
    this.heartTarget = {
      id: this.id,
      get x() { return boss.x + 48; },
      get y() { return boss.y - 18; },
      radius: 16,
      takeSwordDamage: (damage, direction, knockback = 0) => this.applyDamage(damage, direction, knockback, 'heart'),
      takeFireDamage: (damage, direction) => this.applyDamage(damage, direction, 10, 'heart'),
      addDebtMark: () => this.addDebtMark(),
      consumeDebtMarks: () => this.consumeDebtMarks(),
      onDebtDetonated: (stacks) => this.onDebtDetonated(stacks),
    };
    this.shadow = scene.add.ellipse(x, y + 3, 58, 20, 0x070b12, 0.75).setDepth(y - 0.3)
      .setName('room-bodoque-shadow').setVisible(false);
    this.body = this.createReporterVisual();
    this.visual = scene.add.container(x, y, [this.body]).setDepth(y + 0.5)
      .setName('room-bodoque-visual').setVisible(false);
    this.hitFlash = scene.add.graphics().setName('room-bodoque-hit-flash').setVisible(false);
    this.damageLabel = scene.add.text(x, y - 58, '', {
      fontFamily: 'monospace', fontSize: '15px', color: '#ffb5a8', stroke: '#17131a', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(y + 40).setName('room-bodoque-damage').setVisible(false);
    this.telegraph = scene.add.graphics().setDepth(y - 1).setName('room-bodoque-telegraph').setVisible(false);
    this.attackLabel = scene.add.text(x, y - 70, '', {
      fontFamily: 'monospace', fontSize: '12px', color: '#ffdc9c', stroke: '#10141a', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(y + 50).setName('room-bodoque-attack-label').setVisible(false);
    this.debtMarksVisual = scene.add.graphics().setName('room-bodoque-debt-marks').setVisible(false);

    const hud = scene.add.container(0, 0).setScrollFactor(0).setDepth(12_000)
      .setName('room-bodoque-hud').setVisible(false);
    this.nameLabel = scene.add.text(480, 10, 'JUAN CARLOS BODOQUE', {
      fontFamily: 'monospace', fontSize: '14px', color: '#f0dfc7', stroke: '#0a0f18', strokeThickness: 3,
    }).setOrigin(0.5, 0).setName('room-bodoque-name');
    this.healthText = scene.add.text(480, 30, 'EL ÚLTIMO TITULAR  ·  FASE 1: LA NOTA', {
      fontFamily: 'monospace', fontSize: '9px', color: '#c6a0ba', stroke: '#0a0f18', strokeThickness: 2,
    }).setOrigin(0.5, 0).setName('room-bodoque-health-text');
    this.healthBar = scene.add.graphics().setName('room-bodoque-health-bar');
    this.healthBar.setPosition(180, 44);
    hud.add([this.nameLabel, this.healthText, this.healthBar]);
    this.victoryLabel = scene.add.text(480, 128, 'VICTORIA\nBODOQUE DERROTADO', {
      fontFamily: 'monospace', fontSize: '21px', color: '#f4d9a2', align: 'center',
      stroke: '#11131c', strokeThickness: 5,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(12_010).setName('room-bodoque-victory').setVisible(false);

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  get x(): number { return this.visual.x; }
  get y(): number { return this.visual.y; }
  get hp(): number { return this.brain.hp; }
  get maxHp(): number { return this.brain.maxHp; }
  get state(): BodoqueState { return this.brain.state; }
  get active(): boolean { return this.brain.active; }
  get defeated(): boolean { return this.brain.state === 'defeated'; }
  get debtMarkCount(): number { return this.marksRemaining.length; }
  get damageTargets(): readonly (SwordDamageTarget & FireballDamageTarget)[] {
    if (this.state === 'heart') return [this.heartTarget];
    if (['inactive', 'opening', 'dying', 'defeated'].includes(this.state)) return [];
    return [this];
  }

  activate(): boolean {
    if (!this.brain.activate()) return false;
    this.visual.setVisible(true);
    this.shadow.setVisible(true);
    this.telegraph.setVisible(false);
    this.nameLabel.parentContainer?.setVisible(!this.arenaBounds);
    this.victoryLabel.setVisible(false);
    this.drawHealth();
    this.hooks.onPhase?.({ phase: 1 });
    return true;
  }

  update(dtMs: number, player: BodoquePoint, playerHeight = 0): void {
    this.updateDebtMarks(dtMs);
    this.updateDamageLabel(dtMs);
    if (!this.active) return;

    const previousState = this.brain.state;
    this.brain.update(dtMs, player, { x: this.x, y: this.y });
    this.finale.update(dtMs, this.brain, this, this.heartTarget);
    if (['opening', 'heart', 'dying', 'defeated'].includes(this.state)) {
      this.telegraph.setVisible(false);
      this.attackLabel.setVisible(false);
      if (this.state === 'opening') this.body.setRotation(Math.sin(this.brain.finalProgress * 30) * 0.12);
      else this.body.setRotation(0);
      if (this.state === 'dying' || this.defeated) {
        const progress = this.defeated ? 1 : this.brain.finalProgress;
        if (this.arenaBounds) {
          // Keep the reporter behind the breaking seal until the film takes the close-up.
          this.body.setScale(1, 1 - 0.18 * progress).setY(3 * progress).setAlpha(1);
        } else {
          this.body.setScale(1, 0.62).setY(8 - Math.max(0, progress - 0.4) * 110).setAlpha(1 - progress);
        }
        if (this.brain.consumeVictory()) {
          this.victoryLabel.setVisible(!this.arenaBounds);
          this.hooks.onKilled?.({ id: this.id, kind: 'boss', x: this.x, y: this.y });
        }
      }
      this.drawHealth();
      return;
    }
    const intent = this.brain.currentAttack;
    if (intent?.id === 'lastHour') {
      if (this.brain.state === 'active') {
        const t = this.brain.attackProgress;
        this.visual.setPosition(
          intent.origin.x + (intent.destination.x - intent.origin.x) * t,
          intent.origin.y + (intent.destination.y - intent.origin.y) * t,
        );
      } else if (this.brain.state === 'recovery') {
        this.visual.setPosition(intent.destination.x, intent.destination.y);
      } else if (this.brain.state === 'telegraph' && previousState === 'recovery') {
        this.visual.setPosition(intent.origin.x, intent.origin.y);
      }
    }

    if (this.reporter) {
      const pose = intent?.id === 'microphoneMallet' && this.state === 'telegraph' ? 'mazo'
        : this.state === 'active' ? 'impacto' : 'reportero';
      this.reporter.setTexture('bodoque-' + pose).setFlipX(player.x < this.x);
    }
    this.updatePresentation();
    if (this.brain.state !== 'active' || !intent || playerHeight > 18) return;
    const currentEnd = intent.id === 'lastHour' ? { x: this.x, y: this.y } : intent.destination;
    if (isPointInBodoqueAttack(
      intent.id, player, 8, intent.config, intent.origin, intent.direction, currentEnd,
    ) && this.brain.consumePlayerHit()) {
      this.hooks.onPlayerHit?.(intent.config.damage, intent.id);
    }
  }

  /** Shared shape used by the local sword, combo, charge and echo adapters. */
  takeSwordDamage(damage: number, direction: BodoquePoint, knockback = 0): void {
    this.applyDamage(damage, direction, knockback);
  }

  /** The local Italian Rain blast calls one radial damage path per target. */
  takeFireDamage(damage: number, direction: BodoquePoint): void {
    this.applyDamage(damage, direction, 10);
  }

  addDebtMark(): void {
    if (!this.damageTargets.length || this.marksRemaining.length >= markLimit) return;
    this.marksRemaining.push(markLifetimeMs);
    this.drawDebtMarks();
  }

  consumeDebtMarks(): number {
    const consumed = this.marksRemaining.length;
    this.marksRemaining.length = 0;
    this.drawDebtMarks();
    return consumed;
  }

  onDebtDetonated(stacks: number): void {
    if (stacks <= 0) return;
    this.debtBurstRemainingMs = 420;
    this.hitFlash.clear().fillStyle(0xb35aff, 0.72).fillCircle(0, -23, 35)
      .setPosition(this.x, this.y).setDepth(this.y + 22).setAlpha(1).setVisible(true);
    this.scene.tweens.killTweensOf(this.hitFlash);
    this.scene.tweens.add({ targets: this.hitFlash, alpha: 0, duration: 420,
      onComplete: () => this.hitFlash.setVisible(false) });
  }

  private applyDamage(damage: number, direction: BodoquePoint, knockback: number, target: 'body' | 'heart' = 'body'): void {
    if (this.state === 'inactive' || this.defeated) return;
    const result = this.brain.takeDamage(damage, target);
    if (result.applied <= 0) return;
    if (target === 'heart') this.finale.showHit();
    this.damageLabel.setText(`-${result.applied}`).setPosition(this.x, this.y - 58).setAlpha(1).setVisible(true);
    this.damageLabelRemainingMs = 720;
    this.scene.tweens.killTweensOf(this.body);
    const reactionScale = 1.08 + Math.min(Math.max(0, knockback), 20) * 0.001;
    this.body.setScale(reactionScale).setRotation(Math.atan2(direction.y, direction.x) * 0.06).setAlpha(0.35);
    this.scene.tweens.add({ targets: this.body, scale: 1, alpha: 1, rotation: 0, duration: 150, ease: 'Quad.Out' });
    this.hooks.onHit?.({ id: this.id, dmg: result.applied, x: this.x, y: this.y });
    result.preparedPhases.forEach((phase) => this.hooks.onPhase?.({ phase }));
    if (result.criticalTriggered) this.finale.startCritical();
    if (this.state === 'opening') {
      this.scene.tweens.killTweensOf(this.body);
      this.body.setAlpha(1).setScale(1);
      this.telegraph.setVisible(false);
      this.attackLabel.setVisible(false);
    }
    this.finale.update(0, this.brain, this, this.heartTarget);
    this.drawHealth();
  }

  private updatePresentation(): void {
    const intent = this.brain.currentAttack;
    this.visual.setDepth(this.y + 0.5);
    this.shadow.setPosition(this.x, this.y + 3).setDepth(this.y - 0.3);
    this.damageLabel.setDepth(this.y + 40);
    this.debtMarksVisual.setPosition(this.x, this.y - 54).setDepth(this.y + 45);
    if (!intent || (this.brain.state !== 'telegraph' && this.brain.state !== 'active')) {
      this.telegraph.setVisible(false);
      this.attackLabel.setVisible(false);
      return;
    }

    const isTell = this.brain.state === 'telegraph';
    const isMallet = intent.id === 'microphoneMallet';
    const color = intent.id === 'cameraFlash' ? 0xc457ff : isMallet ? 0xffbd66 : 0xf0646e;
    this.telegraph.clear().setPosition(intent.origin.x, intent.origin.y).setDepth(intent.origin.y + 0.1);
    if (intent.id === 'lastHour') {
      const length = Math.hypot(intent.destination.x - intent.origin.x, intent.destination.y - intent.origin.y);
      this.telegraph.lineStyle(isTell ? 3 : 9, color, isTell ? 0.82 : 0.42)
        .lineBetween(0, 0, intent.direction.x * length, intent.direction.y * length)
        .lineStyle(2, 0xfff2d8, isTell ? 0.75 : 0.55)
        .lineBetween(-intent.direction.y * 8, 0, intent.direction.y * 8, -intent.direction.x * 8);
    } else {
      const angle = Math.atan2(intent.direction.y, intent.direction.x);
      const halfAngle = (intent.config.halfAngleDeg ?? 40) * Math.PI / 180;
      const points = [new Phaser.Math.Vector2(0, 0)];
      const steps = 20;
      for (let i = 0; i <= steps; i++) {
        const theta = angle - halfAngle + (halfAngle * 2 * i) / steps;
        points.push(new Phaser.Math.Vector2(Math.cos(theta) * intent.config.range, Math.sin(theta) * intent.config.range));
      }
      this.telegraph.fillStyle(color, isTell ? 0.16 : 0.42).fillPoints(points, true);
      this.telegraph.lineStyle(isTell ? 2 : 4, color, isTell ? 0.85 : 0.95)
        .strokePoints(points.slice(1), false);
      if (isMallet) {
        this.telegraph.lineStyle(5, 0xffedbd, isTell ? 0.9 : 0.98)
          .lineBetween(intent.direction.x * 18, intent.direction.y * 18,
            intent.direction.x * 60, intent.direction.y * 60);
      }
    }
    this.telegraph.setVisible(true);
    const label = intent.id === 'microphoneMallet' ? 'MICRÓFONO-MAZO · PARRYABLE'
      : intent.id === 'cameraFlash' ? 'FLASH DE CÁMARA · SAL DE LA ZONA'
        : 'ÚLTIMA HORA · TRAYECTORIA ANUNCIADA';
    this.attackLabel.setText(isTell ? label : intent.id === 'lastHour' ? '¡ÚLTIMA HORA!' : '¡IMPACTO!')
      .setPosition(this.x, this.y - 70).setDepth(this.y + 50).setVisible(true)
      .setColor(isTell ? '#ffdc9c' : '#fff1d5');
  }

  private drawHealth(): void {
    const ratio = Math.max(0, this.hp / this.maxHp);
    this.healthBar.clear()
      .fillStyle(0x160f1a, 0.92).fillRoundedRect(0, 0, 600, 13, 5)
      .fillStyle(0x663247, 1).fillRoundedRect(2, 2, 596, 9, 4)
      .fillStyle(0xc13f67, 1).fillRoundedRect(2, 2, 596 * ratio, 9, 4)
      .lineStyle(1, 0xe5c38e, 0.9).strokeRoundedRect(0, 0, 600, 13, 5);
    this.healthText.setText(this.brain.phase === 3 && this.hp <= config.heart.hp
      ? `CORAZÓN CODEX · ${this.hp} / ${this.maxHp}${this.brain.critical ? ' · ERROR 23' : ''}`
      : `EL ÚLTIMO TITULAR  ·  FASE 1: LA NOTA  ·  ${this.hp} / ${this.maxHp}`);
  }

  private drawDebtMarks(): void {
    this.debtMarksVisual.clear();
    this.marksRemaining.forEach((_remaining, index) => this.debtMarksVisual
      .fillStyle(0xb65aff, 0.96).fillCircle((index - (this.marksRemaining.length - 1) / 2) * 10, 0, 3.5)
      .lineStyle(1, 0xf3dcff, 0.9).strokeCircle((index - (this.marksRemaining.length - 1) / 2) * 10, 0, 3.5));
    this.debtMarksVisual.setVisible(this.marksRemaining.length > 0 && this.active);
  }

  private updateDebtMarks(dtMs: number): void {
    for (let index = this.marksRemaining.length - 1; index >= 0; index--) {
      this.marksRemaining[index] -= dtMs;
      if (this.marksRemaining[index] <= 0) this.marksRemaining.splice(index, 1);
    }
    this.drawDebtMarks();
    if (this.debtBurstRemainingMs > 0) {
      this.debtBurstRemainingMs = Math.max(0, this.debtBurstRemainingMs - dtMs);
      if (this.debtBurstRemainingMs === 0) this.hitFlash.setVisible(false);
    }
  }

  private updateDamageLabel(dtMs: number): void {
    if (this.damageLabelRemainingMs <= 0) return;
    this.damageLabelRemainingMs = Math.max(0, this.damageLabelRemainingMs - dtMs);
    this.damageLabel.setY(this.damageLabel.y - dtMs * 0.025)
      .setAlpha(this.damageLabelRemainingMs / 720);
    if (this.damageLabelRemainingMs === 0) this.damageLabel.setVisible(false);
  }

  private createReporterVisual(): Phaser.GameObjects.Container {
    if (this.scene.textures.exists('bodoque-reportero')) {
      this.reporter = this.scene.add.image(0, 0, 'bodoque-reportero').setOrigin(0.5, 1).setScale(0.72);
      return this.scene.add.container(0, 0, [this.reporter]);
    }
    const g = this.scene.add.graphics();
    // Placeholder: recognizable red rabbit reporter silhouette, fedora and vintage mic.
    g.fillStyle(0x871f35).fillEllipse(0, -18, 38, 38);
    g.fillStyle(0x4c2730).fillPoints([
      new Phaser.Math.Vector2(-19, -23), new Phaser.Math.Vector2(19, -23),
      new Phaser.Math.Vector2(15, 5), new Phaser.Math.Vector2(-15, 5),
    ], true);
    g.fillStyle(0xc79661).fillRect(-12, -9, 24, 3);
    g.fillStyle(0x55202b).fillPoints([
      new Phaser.Math.Vector2(-12, -8), new Phaser.Math.Vector2(12, -8),
      new Phaser.Math.Vector2(18, 9), new Phaser.Math.Vector2(-18, 9),
    ], true);
    g.fillStyle(0xc8464c).fillCircle(0, -42, 13);
    g.fillStyle(0x932535).fillPoints([
      new Phaser.Math.Vector2(-10, -48), new Phaser.Math.Vector2(-13, -68),
      new Phaser.Math.Vector2(-4, -54), new Phaser.Math.Vector2(2, -53),
      new Phaser.Math.Vector2(10, -69), new Phaser.Math.Vector2(9, -47),
    ], true);
    g.fillStyle(0xede1c9).fillEllipse(0, -39, 14, 8);
    g.fillStyle(0x2b1720).fillCircle(-5, -43, 1.6).fillCircle(5, -43, 1.6);
    g.fillStyle(0xe0ba7e).fillRect(-14, -56, 28, 4).fillRect(-10, -62, 20, 8);
    g.fillStyle(0x2b2527).fillRect(19, -25, 4, 32).fillCircle(21, -30, 7);
    g.lineStyle(2, 0xd2b17b).strokeCircle(21, -30, 7);
    g.fillStyle(0xd3b274).fillRect(5, -3, 7, 9);
    g.fillStyle(0x292330).fillCircle(8.5, 0, 1.8);
    const badge = this.scene.add.text(2, -4, 'JC', {
      fontFamily: 'monospace', fontSize: '6px', color: '#fff0ca', fontStyle: 'bold',
    }).setOrigin(0.5);
    return this.scene.add.container(0, 0, [g, badge]);
  }

  private destroy(): void {
    this.finale.destroy();
    this.scene.tweens.killTweensOf(this.body);
    this.scene.tweens.killTweensOf(this.hitFlash);
    this.shadow.destroy();
    this.visual.destroy(true);
    this.healthBar.parentContainer?.destroy(true);
    this.telegraph.destroy();
    this.attackLabel.destroy();
    this.damageLabel.destroy();
    this.hitFlash.destroy();
    this.debtMarksVisual.destroy();
    this.victoryLabel.destroy();
  }
}
