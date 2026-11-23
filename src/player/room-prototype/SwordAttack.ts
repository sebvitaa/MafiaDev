import Phaser from 'phaser';
import tuning from '../../data/tuning.json';

/** SUP-basti-20261123-112929: animate sword swing and crescent slash; no damage target yet. */
export class SwordAttack {
  readonly slash: Phaser.GameObjects.Container;
  private remainingMs = 0;

  constructor(private readonly scene: Phaser.Scene) {
    const shape = scene.add.graphics();
    const outer = this.arcPoints(46, -0.95, 0.95, 12);
    const inner = this.arcPoints(27, 0.95, -0.95, 12);
    shape.fillStyle(0x54e6d5, 0.32).fillPoints([...outer, ...inner], true);
    shape.lineStyle(3, 0xffe7a8, 0.96).beginPath();
    outer.forEach((point, index) => index === 0 ? shape.moveTo(point.x, point.y) : shape.lineTo(point.x, point.y));
    shape.strokePath();
    this.slash = scene.add.container(0, 0, [shape]).setVisible(false);
    this.slash.setName('room-sword-slash');
  }

  get active(): boolean { return this.remainingMs > 0; }

  start(
    x: number,
    y: number,
    height: number,
    facing: { x: number; y: number },
    weapon: Phaser.GameObjects.Graphics,
  ): boolean {
    if (this.active) return false;
    const angle = Math.atan2(facing.y, facing.x);
    const reach = tuning.roomPrototype.swordAttackRange / 2;
    const startX = x + facing.x * reach;
    const startY = y + facing.y * reach - height;
    const handX = facing.x * 11 + 7;
    const handY = -19 + facing.y * 5;
    weapon.setPosition(handX, handY).setRotation(angle);
    this.scene.tweens.add({
      targets: weapon,
      x: handX + facing.x * 8,
      y: handY + facing.y * 8,
      rotation: angle + 0.8,
      duration: tuning.roomPrototype.swordAttackDurationMs / 2,
      yoyo: true,
      ease: 'Cubic.Out',
    });
    this.slash.setPosition(startX, startY).setRotation(angle - 0.62)
      .setDepth(y + facing.y * reach).setScale(0.86).setAlpha(0.95).setVisible(true);
    this.remainingMs = tuning.roomPrototype.swordAttackDurationMs;
    this.scene.tweens.add({
      targets: this.slash,
      x: startX + facing.x * 10,
      y: startY + facing.y * 10,
      rotation: angle + 0.48,
      scaleX: 1.08,
      scaleY: 1.08,
      alpha: 0,
      duration: tuning.roomPrototype.swordAttackDurationMs,
      ease: 'Cubic.Out',
      onComplete: () => this.slash.setVisible(false),
    });
    return true;
  }

  update(dtMs: number): void {
    if (!this.active) return;
    this.remainingMs = Math.max(0, this.remainingMs - Math.max(0, dtMs));
    if (!this.active) {
      this.scene.tweens.killTweensOf(this.slash);
      this.slash.setVisible(false);
    }
  }

  private arcPoints(radius: number, start: number, end: number, steps: number): Phaser.Math.Vector2[] {
    return Array.from({ length: steps + 1 }, (_, i) => {
      const angle = start + (end - start) * i / steps;
      return new Phaser.Math.Vector2(Math.cos(angle) * radius, Math.sin(angle) * radius);
    });
  }
}
