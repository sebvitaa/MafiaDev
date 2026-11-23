import Phaser from 'phaser';
import tuning from '../../data/tuning.json';
import { combatLineClear } from '../../combat/visibility';
import { selectEchoDirection } from './echoTarget';
import { EchoReplayWindow, type EchoSwordReplay, type EchoableSwordSwing } from './EchoDebtCombat';
import { SwordHitTracker, intersectsSector, type SwordDamageTarget } from './SwordCombat';

/** Phaser presentation and local hitbox adapter for the room-only Reversal Echo. */
export class RoomEcho {
  readonly ghost: Phaser.GameObjects.Container;
  readonly slash: Phaser.GameObjects.Container;
  private readonly ghostShape: Phaser.GameObjects.Graphics;
  private readonly slashShape: Phaser.GameObjects.Graphics;
  private readonly replayWindow = new EchoReplayWindow(
    tuning.roomPrototype.echoLifetimeMs,
    tuning.roomPrototype.echoDelayMs,
    tuning.roomPrototype.echoDamageMultiplier,
  );
  private readonly hitTracker = new SwordHitTracker();
  private replay?: EchoSwordReplay;
  private replayElapsedMs = 0;
  private previousTargetId?: string;

  constructor(private readonly scene: Phaser.Scene, private readonly targets: () => readonly SwordDamageTarget[]) {
    this.ghostShape = scene.add.graphics();
    this.drawGhost();
    this.ghost = scene.add.container(0, 0, [this.ghostShape])
      .setName('room-reversal-echo').setAlpha(0.62).setVisible(false);
    this.slashShape = scene.add.graphics();
    this.slash = scene.add.container(0, 0, [this.slashShape])
      .setName('room-reversal-echo-slash').setVisible(false);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  get visible(): boolean { return this.replayWindow.visible; }
  get remainingMs(): number { return this.replayWindow.remainingMs; }
  get replayPending(): boolean { return this.replayWindow.replayPending; }
  get replayUsed(): boolean { return this.replayWindow.replayUsed; }

  startDash(origin: { x: number; y: number; height: number }): void {
    this.replayWindow.startDash(origin);
    this.ghost.setPosition(origin.x, origin.y - origin.height).setDepth(origin.y - 0.5)
      .setAlpha(0.62).setVisible(true);
  }

  recordSwing(swing: EchoableSwordSwing): boolean {
    const candidates = this.targets().filter(t => intersectsSector(swing.origin, swing.direction, t, swing.range, swing.halfAngleDeg)
      && combatLineClear(this.scene, swing.origin, t));
    candidates.sort((a,b) => Math.hypot(a.x-swing.origin.x,a.y-swing.origin.y)-Math.hypot(b.x-swing.origin.x,b.y-swing.origin.y));
    if (candidates[0]) this.previousTargetId = candidates[0].id;
    return this.replayWindow.recordSwing(swing);
  }

  update(dtMs: number): void {
    const elapsed = Math.max(0, dtMs);
    const replay = this.replayWindow.update(elapsed);
    this.ghost.setVisible(this.replayWindow.visible);
    if (this.replayWindow.visible && this.remainingMs < 260) {
      this.ghost.setAlpha(0.62 * this.remainingMs / 260);
    }

    if (replay) {
      this.beginReplay(replay);
      return;
    }
    if (!this.replay) return;

    this.replayElapsedMs += elapsed;
    if (this.replayElapsedMs <= this.replay.hitWindowMs) this.applyReplayHitbox();
    const progress = Math.min(1, this.replayElapsedMs / this.replay.durationMs);
    this.slash.setPosition(
      this.replay.origin.x + this.replay.direction.x * this.replay.travel * ease(progress, this.replay.ease),
      this.replay.origin.y - this.replay.origin.height
        + this.replay.direction.y * this.replay.travel * ease(progress, this.replay.ease),
    ).setAlpha(0.92 * (1 - progress)).setScale(0.88 + 0.18 * progress);
    if (this.replayElapsedMs >= this.replay.durationMs) {
      this.replay = undefined;
      this.slash.setVisible(false);
    }
  }

  cancel(): void {
    this.replayWindow.clear(); this.replay = undefined;
    this.ghost.setVisible(false); this.slash.setVisible(false);
  }

  destroy(): void {
    this.ghost.destroy(true);
    this.slash.destroy(true);
  }

  private beginReplay(replay: EchoSwordReplay): void {
    replay.direction = selectEchoDirection(replay.origin, this.targets(), replay.range, this.previousTargetId,
      replay.direction, (from, to) => combatLineClear(this.scene, from, to));
    this.replay = replay;
    this.replayElapsedMs = 0;
    this.hitTracker.beginSwing();
    this.drawSlash(replay);
    this.slash.setPosition(replay.origin.x, replay.origin.y - replay.origin.height)
      .setRotation(Math.atan2(replay.direction.y, replay.direction.x))
      .setDepth(replay.origin.y + replay.direction.y * replay.range * 0.4)
      .setAlpha(0.92).setVisible(true);
    this.applyReplayHitbox();
  }

  private applyReplayHitbox(): void {
    if (!this.replay) return;
    const progress = Math.min(1, this.replayElapsedMs / this.replay.durationMs);
    const travel = this.replay.travel * ease(progress, this.replay.ease);
    const origin = {
      x: this.replay.origin.x + this.replay.direction.x * travel,
      y: this.replay.origin.y + this.replay.direction.y * travel,
    };
    this.hitTracker.apply(
      origin, this.replay.direction, this.targets().filter(target => combatLineClear(this.scene, origin, target)), this.replay.range,
      this.replay.halfAngleDeg, this.replay.damage, this.replay.knockback,
    );
  }

  private drawGhost(): void {
    this.ghostShape.fillStyle(0x24163a, 0.26).fillEllipse(0, 0, 34, 12)
      .fillStyle(0x7038aa, 0.82).fillPoints([
        new Phaser.Math.Vector2(-10, -25), new Phaser.Math.Vector2(10, -25),
        new Phaser.Math.Vector2(16, 0), new Phaser.Math.Vector2(-16, 0),
      ], true)
      .fillStyle(0xb77aff, 0.92).fillCircle(0, -31, 9)
      .lineStyle(2, 0xe0c0ff, 0.95).strokePoints([
        new Phaser.Math.Vector2(-10, -25), new Phaser.Math.Vector2(10, -25),
        new Phaser.Math.Vector2(16, 0), new Phaser.Math.Vector2(-16, 0),
      ], true)
      .lineStyle(1, 0xf0ddff, 0.85).strokeCircle(0, -31, 9)
      .lineStyle(3, 0xd9b3ff, 0.9).lineBetween(9, -21, 25, -18);
  }

  private drawSlash(replay: EchoSwordReplay): void {
    const charged = replay.attack === 'charged';
    const color = replay.attack === 'charged' ? 0xd09aff : [0x9a63d1, 0xb978f2, 0x7e42bd][replay.attack - 1];
    const halfAngle = replay.halfAngleDeg * Math.PI / 180;
    const points = Array.from({ length: 19 }, (_, index) => {
      const angle = -halfAngle + (halfAngle * 2 * index) / 18;
      return new Phaser.Math.Vector2(Math.cos(angle) * replay.range, Math.sin(angle) * replay.range);
    });
    const inner = replay.range * 0.32;
    this.slashShape.clear()
      .fillStyle(color, charged ? 0.52 : replay.attack === 3 ? 0.46 : 0.36)
      .fillPoints([...points, new Phaser.Math.Vector2(Math.cos(halfAngle) * inner,
        Math.sin(halfAngle) * inner), new Phaser.Math.Vector2(inner, 0),
      new Phaser.Math.Vector2(Math.cos(-halfAngle) * inner, Math.sin(-halfAngle) * inner)], true)
      .lineStyle(charged || replay.attack === 3 ? 5 : 3, 0xe7cbff, 0.96).beginPath();
    points.forEach((point, index) => index === 0
      ? this.slashShape.moveTo(point.x, point.y) : this.slashShape.lineTo(point.x, point.y));
    this.slashShape.strokePath();
  }
}

function ease(progress: number, curve: 'Cubic.Out' | 'Cubic.In'): number {
  return curve === 'Cubic.In' ? progress ** 3 : 1 - (1 - progress) ** 3;
}
