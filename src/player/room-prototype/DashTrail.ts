import Phaser from 'phaser';
import tuning from '../../data/tuning.json';

/** Bounded graphics pool: snapshots use real, collision-resolved positions, never predictions. */
export class DashTrail {
  private readonly ghosts: { graphic: Phaser.GameObjects.Graphics; born: number }[];
  private next = 0;
  private lastEmission = -Infinity;
  private lastPosition = { x: Infinity, y: Infinity };

  constructor(scene: Phaser.Scene) {
    const config = tuning.roomPrototype;
    this.ghosts = Array.from({ length: Math.ceil(config.trailLifetimeMs / config.trailIntervalMs) + 1 }, () => {
      const graphic = scene.add.graphics().setName('room-dash-trail').setVisible(false);
      graphic.fillStyle(0x65e6d0).fillTriangle(-14, 0, 0, -28, 14, 0).fillCircle(0, -31, 8);
      return { graphic, born: -Infinity };
    });
  }

  update(timeMs: number, active: boolean, x: number, groundY: number, height: number): void {
    const config = tuning.roomPrototype;
    for (const ghost of this.ghosts) {
      const life = (timeMs - ghost.born) / config.trailLifetimeMs;
      ghost.graphic.setVisible(life < 1).setAlpha(Math.max(0, 1 - life) * 0.4);
    }
    if (!active || timeMs - this.lastEmission < config.trailIntervalMs
      || Math.hypot(x - this.lastPosition.x, groundY - this.lastPosition.y) < 3) return;
    const ghost = this.ghosts[this.next];
    ghost.born = timeMs;
    ghost.graphic.setPosition(x, groundY - height).setDepth(groundY - 0.5).setAlpha(0.4).setVisible(true);
    this.next = (this.next + 1) % this.ghosts.length;
    this.lastEmission = timeMs;
    this.lastPosition = { x, y: groundY };
  }
}
