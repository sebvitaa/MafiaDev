import Phaser from 'phaser';
import tuning from '../../data/tuning.json';

/** SUP-basti-20261123-111412: room-local sword pickup and visual-only combat placeholder. */
export class SwordPickup {
  readonly shadow: Phaser.GameObjects.Ellipse;
  readonly visual: Phaser.GameObjects.Container;
  collected = false;
  private readonly glow: Phaser.GameObjects.Arc;
  private readonly sword: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, private readonly x: number, private readonly y: number) {
    this.shadow = scene.add.ellipse(x, y + 16, 28, 9, 0x061018, 0.55).setDepth(y - 0.1);
    this.glow = scene.add.circle(0, 0, 24, 0x66ffe2, 0.2);
    this.sword = scene.add.graphics();
    this.sword.fillStyle(0xe8f8f4).fillPoints([
      new Phaser.Math.Vector2(-3, 4), new Phaser.Math.Vector2(3, 4),
      new Phaser.Math.Vector2(3, -14), new Phaser.Math.Vector2(0, -25),
      new Phaser.Math.Vector2(-3, -14),
    ], true);
    this.sword.fillStyle(0x51d9d0).fillRect(-8, 3, 16, 3);
    this.sword.fillStyle(0xb48359).fillRect(-2, 6, 4, 8);
    this.sword.fillStyle(0xf3d69c).fillCircle(0, 16, 3);
    this.visual = scene.add.container(x, y, [this.glow, this.sword]).setDepth(y);
    this.visual.setName('room-sword-pickup');
  }

  update(timeMs: number, playerX: number, playerY: number): boolean {
    if (this.collected) return false;
    const bob = Math.sin(timeMs / 230) * tuning.roomPrototype.swordBobAmplitude;
    this.visual.setPosition(this.x, this.y - bob).setDepth(this.y);
    this.glow.setAlpha(0.12 + (Math.sin(timeMs / 105) + 1) * 0.12);
    this.shadow.setScale(1 - Math.abs(bob) / 24);

    if (Phaser.Math.Distance.Between(playerX, playerY, this.x, this.y) > tuning.roomPrototype.swordPickupRadius) {
      return false;
    }
    this.collected = true;
    this.visual.setVisible(false);
    this.shadow.setVisible(false);
    return true;
  }
}
