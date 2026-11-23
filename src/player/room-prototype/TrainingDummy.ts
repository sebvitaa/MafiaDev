import Phaser from 'phaser';
import tuning from '../../data/tuning.json';
import { TrainingDummyHealth, type SwordDamageTarget, type SwordDirection } from './SwordCombat';
import type { FireballDamageTarget } from './FireballCombat';

/** SUP-basti-20261123-121134: room-local target with visible defeat and timed respawn. */
export class TrainingDummy implements SwordDamageTarget, FireballDamageTarget {
  readonly id = 'training-dummy';
  readonly visual: Phaser.GameObjects.Container;
  readonly healthBar: Phaser.GameObjects.Graphics;
  readonly healthLabel: Phaser.GameObjects.Text;
  readonly damageLabel: Phaser.GameObjects.Text;
  readonly defeatedLabel: Phaser.GameObjects.Text;
  hitCount = 0;
  reactionActive = false;
  private readonly health: TrainingDummyHealth;
  private readonly body: Phaser.GameObjects.Rectangle;
  private reactionId = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    readonly x: number,
    readonly y: number,
    maxHp = tuning.roomPrototype.trainingDummyHp,
    readonly radius = tuning.roomPrototype.trainingDummyRadius,
  ) {
    this.health = new TrainingDummyHealth(maxHp, tuning.roomPrototype.trainingDummyRespawnMs);
    const shadow = scene.add.ellipse(0, 0, 44, 12, 0x061018, 0.6);
    const staff = scene.add.graphics().lineStyle(5, 0x806044).lineBetween(-18, -18, 18, -18);
    this.body = scene.add.rectangle(0, -23, 30, 38, 0x718f85).setStrokeStyle(2, 0xe6c888);
    const head = scene.add.circle(0, -49, 12, 0xc5a66f).setStrokeStyle(2, 0xead29e);
    const target = scene.add.graphics().lineStyle(2, 0x623f3b).strokeCircle(0, -25, 7)
      .lineBetween(-5, -25, 5, -25).lineBetween(0, -30, 0, -20);
    const feet = scene.add.graphics().lineStyle(5, 0x806044).lineBetween(-11, -3, -5, 0)
      .lineBetween(11, -3, 5, 0);
    this.visual = scene.add.container(x, y, [shadow, staff, this.body, head, target, feet])
      .setDepth(y + 0.5).setName('training-dummy');
    this.healthBar = scene.add.graphics().setDepth(y + 20);
    this.healthLabel = scene.add.text(x, y - 85, '', {
      fontFamily: 'monospace', fontSize: '11px', color: '#f3e4c5',
    }).setOrigin(0.5).setDepth(y + 21);
    this.damageLabel = scene.add.text(x, y - 57, '', {
      fontFamily: 'monospace', fontSize: '13px', color: '#ffca8e', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(y + 22).setVisible(false);
    this.defeatedLabel = scene.add.text(x, y - 87, 'DERROTADO', {
      fontFamily: 'monospace', fontSize: '11px', color: '#ff9d85', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(y + 23).setVisible(false);
    this.renderHealth();
  }

  get hp(): number { return this.health.hp; }
  get defeated(): boolean { return this.health.defeated; }

  takeSwordDamage(damage: number, direction: SwordDirection, knockback = 0): void {
    const result = this.health.takeDamage(damage);
    if (result.applied <= 0) return;
    this.hitCount++;
    this.renderHealth();
    if (result.defeated) this.showDefeat();
    else this.showHitReaction(result.applied, direction, knockback);
  }

  /** SUP-basti-20261123-125357: local spell adapter; no shared Ability contract is involved. */
  takeFireDamage(damage: number, direction: SwordDirection): void {
    this.takeSwordDamage(damage, direction, 12);
  }

  update(dtMs: number): boolean {
    if (!this.health.update(dtMs)) return false;
    this.reactionActive = false;
    this.scene.tweens.killTweensOf(this.visual);
    this.visual.setPosition(this.x, this.y).setScale(1).setAlpha(1).setVisible(true);
    this.body.setFillStyle(0x718f85);
    this.defeatedLabel.setVisible(false);
    this.renderHealth();
    return true;
  }

  private renderHealth(): void {
    const ratio = this.health.maxHp > 0 ? this.health.hp / this.health.maxHp : 0;
    this.healthBar.clear().fillStyle(0x121c22, 0.9).fillRect(this.x - 24, this.y - 77, 48, 7)
      .fillStyle(this.health.hp > this.health.maxHp * 0.3 ? 0x71d7a1 : 0xe27969)
      .fillRect(this.x - 22, this.y - 75, 44 * ratio, 3);
    this.healthLabel.setPosition(this.x, this.y - 89)
      .setText(this.defeated ? 'MUÑECO 0 HP' : `MUÑECO ${this.health.hp}/${this.health.maxHp}`);
  }

  private showDefeat(): void {
    this.reactionActive = false;
    this.reactionId++;
    this.scene.tweens.killTweensOf(this.visual);
    this.scene.tweens.killTweensOf(this.damageLabel);
    this.visual.setPosition(this.x, this.y).setAlpha(0.55);
    this.scene.tweens.add({ targets: this.visual, scaleX: 0.82, scaleY: 0.24, duration: 160, ease: 'Cubic.In' });
    this.defeatedLabel.setPosition(this.x, this.y - 68).setVisible(true).setAlpha(1);
    this.damageLabel.setVisible(false);
  }

  private showHitReaction(damage: number, direction: SwordDirection, knockback: number): void {
    const reaction = ++this.reactionId;
    this.reactionActive = true;
    this.body.setFillStyle(0xe87568);
    this.scene.tweens.killTweensOf(this.visual);
    this.visual.setPosition(this.x, this.y);
    const shove = knockback > 0 ? knockback : 4;
    this.scene.tweens.add({
      targets: this.visual,
      x: this.x + direction.x * shove,
      y: this.y + direction.y * shove * 0.5,
      duration: knockback > 0 ? 90 : 24,
      yoyo: true,
      repeat: knockback > 0 ? 0 : 2,
      ease: 'Cubic.Out',
      onComplete: () => this.visual.setPosition(this.x, this.y),
    });
    this.scene.time.delayedCall(120, () => {
      if (this.reactionId !== reaction) return;
      this.reactionActive = false;
      if (!this.defeated) this.body.setFillStyle(0x718f85);
    });
    this.scene.tweens.killTweensOf(this.damageLabel);
    this.damageLabel.setText(`-${damage}`).setPosition(this.x, this.y - 57).setAlpha(1).setVisible(true);
    this.scene.tweens.add({
      targets: this.damageLabel,
      y: this.y - 79,
      alpha: 0,
      duration: 340,
      ease: 'Cubic.Out',
      onComplete: () => this.damageLabel.setVisible(false),
    });
  }
}
