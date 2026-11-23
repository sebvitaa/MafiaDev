import tuning from '../../data/tuning.json';
import type { CharacterStats } from '../../types/character';
import { DashMotion } from '../states/DashMotion';

export interface RoomInput {
  x: number; y: number; run: boolean;
  jumpPressed: boolean; jumpHeld: boolean; dashPressed: boolean;
  dashDirection?: { x: number; y: number };
}

export interface RoomEvents {
  jump: 'ground' | 'air' | null;
  landed: boolean;
  dashed: boolean;
}

/** Independent ground-plane movement. Height never changes Arcade's X/Y coordinates.
 * SUP-basti-20261123-105329: prototype-local acceleration and dash tuning.
 */
export class RoomMotion {
  velocity = { x: 0, y: 0 };
  facing = { x: 0, y: 1 };
  height = 0;
  verticalVelocity = 0;
  airJumpsRemaining: number;
  readonly dash = new DashMotion({ durationMs: tuning.roomPrototype.dashDurationMs, invulnerableMs: 0 });
  private dashVector = { x: 0, y: 1 };
  private jumpBufferMs = 0;
  private wasJumpHeld = false;

  constructor(private readonly stats: Pick<CharacterStats, 'speed' | 'airJumps' | 'dashCooldownMs'>) {
    this.airJumpsRemaining = stats.airJumps;
  }

  /** Local state for future combat arbitration; jump height remains independent. */
  get state(): 'dash' | 'move' | 'idle' {
    return this.dash.active ? 'dash' : Math.hypot(this.velocity.x, this.velocity.y) > 0 ? 'move' : 'idle';
  }

  update(input: RoomInput, dtMs: number): RoomEvents {
    const events: RoomEvents = { jump: null, landed: false, dashed: false };
    const elapsedMs = Math.max(0, dtMs);
    const wasDashing = this.dash.active;
    this.dash.update(elapsedMs);
    const length = Math.hypot(input.x, input.y);
    const direction = length > 0 ? { x: input.x / length, y: input.y / length } : { x: 0, y: 0 };
    if (!this.dash.active && length > 0) this.facing = { ...direction };
    if (input.dashPressed && this.dash.tryStart(1, tuning.roomPrototype.dashCooldownMs)) {
      const selected = input.dashDirection ?? this.facing;
      const dashLength = Math.hypot(selected.x, selected.y);
      this.dashVector = dashLength > 0
        ? { x: selected.x / dashLength, y: selected.y / dashLength } : { ...this.facing };
      this.facing = { ...this.dashVector };
      events.dashed = true;
    }
    const speed = this.stats.speed * tuning.roomPrototype.speedMultiplier * (input.run ? tuning.player.runMultiplier : 1);
    const target = { x: direction.x * speed, y: direction.y * speed };
    if (this.dash.active) {
      this.velocity = { x: this.dashVector.x * tuning.roomPrototype.dashSpeed, y: this.dashVector.y * tuning.roomPrototype.dashSpeed };
    } else if (wasDashing) {
      // End the slide at its duration instead of decelerating from dash speed for extra frames.
      this.velocity = target;
    } else {
      const dx = target.x - this.velocity.x;
      const dy = target.y - this.velocity.y;
      const distance = Math.hypot(dx, dy);
      const turning = this.velocity.x * target.x + this.velocity.y * target.y < 0;
      const acceleration = length === 0 ? tuning.roomPrototype.deceleration
        : turning ? tuning.roomPrototype.turnAcceleration : tuning.roomPrototype.acceleration;
      const amount = acceleration * elapsedMs / 1000;
      this.velocity = distance <= amount || distance === 0 ? target : {
        x: this.velocity.x + dx / distance * amount,
        y: this.velocity.y + dy / distance * amount,
      };
    }

    if (input.jumpPressed) {
      if (this.height === 0 && this.verticalVelocity === 0) this.jump(false, events);
      else if (this.airJumpsRemaining > 0) this.jump(true, events);
      else this.jumpBufferMs = tuning.player.jumpBufferMs;
    }
    if (!input.jumpHeld && this.wasJumpHeld && this.verticalVelocity > 0) {
      this.verticalVelocity *= tuning.player.jumpCutDamping;
    }
    this.wasJumpHeld = input.jumpHeld;

    let remaining = elapsedMs / 1000;
    while (remaining > 0 && (this.height > 0 || this.verticalVelocity > 0)) {
      const landingTime = (this.verticalVelocity + Math.sqrt(
        this.verticalVelocity ** 2 + 2 * tuning.gravity * this.height,
      )) / tuning.gravity;
      const dt = Math.min(remaining, landingTime);
      this.height += this.verticalVelocity * dt - tuning.gravity * dt ** 2 / 2;
      this.verticalVelocity -= tuning.gravity * dt;
      this.jumpBufferMs = Math.max(0, this.jumpBufferMs - dt * 1000);
      remaining = Math.max(0, remaining - dt);
      if (dt >= landingTime) {
        this.height = 0;
        this.verticalVelocity = 0;
        this.airJumpsRemaining = this.stats.airJumps;
        events.landed = true;
        if (this.jumpBufferMs > 0) this.jump(false, events);
      }
    }
    return events;
  }

  private jump(air: boolean, events: RoomEvents): void {
    if (air) this.airJumpsRemaining--;
    this.verticalVelocity = tuning.player.jumpVelocity * (air ? tuning.player.airJumpMultiplier : 1);
    this.jumpBufferMs = 0;
    events.jump = air ? 'air' : 'ground';
  }
}
