export interface CombatPoint {
  x: number;
  y: number;
  height: number;
}

export interface EchoableSwordSwing {
  attack: 1 | 2 | 3 | 'charged';
  origin: CombatPoint;
  direction: { x: number; y: number };
  damage: number;
  range: number;
  halfAngleDeg: number;
  knockback: number;
  durationMs: number;
  hitWindowMs: number;
  travel: number;
  ease: 'Cubic.Out' | 'Cubic.In';
}

export interface EchoSwordReplay extends EchoableSwordSwing {
  origin: CombatPoint;
}

/** Pure one-replay-per-dash window; an accepted replay survives the visual echo expiry. */
export class EchoReplayWindow {
  private dashOrigin?: CombatPoint;
  private lifeRemainingMs = 0;
  private replayRemainingMs = 0;
  private pendingSwing?: EchoableSwordSwing;
  private used = false;

  constructor(
    private readonly lifetimeMs: number,
    private readonly delayMs: number,
    private readonly damageMultiplier: number,
  ) {}

  clear(): void { this.pendingSwing = undefined; this.dashOrigin = undefined; this.lifeRemainingMs = 0; this.used = false; }

  get visible(): boolean { return this.lifeRemainingMs > 0; }
  get remainingMs(): number { return Math.max(0, this.lifeRemainingMs); }
  get replayPending(): boolean { return this.pendingSwing !== undefined; }
  get replayUsed(): boolean { return this.used; }
  get origin(): CombatPoint | undefined { return this.dashOrigin && { ...this.dashOrigin }; }

  startDash(origin: CombatPoint): void {
    this.dashOrigin = { ...origin };
    this.lifeRemainingMs = this.lifetimeMs;
    this.pendingSwing = undefined;
    this.replayRemainingMs = 0;
    this.used = false;
  }

  recordSwing(swing: EchoableSwordSwing): boolean {
    if (!this.visible || !this.dashOrigin || this.used) return false;
    this.pendingSwing = {
      ...swing,
      origin: { ...swing.origin },
      direction: { ...swing.direction },
    };
    this.replayRemainingMs = this.delayMs;
    this.used = true;
    return true;
  }

  update(dtMs: number): EchoSwordReplay | undefined {
    const elapsed = Math.max(0, dtMs);
    this.lifeRemainingMs = Math.max(0, this.lifeRemainingMs - elapsed);
    if (!this.pendingSwing) return undefined;
    this.replayRemainingMs -= elapsed;
    if (this.replayRemainingMs > 0) return undefined;

    const swing = this.pendingSwing;
    this.pendingSwing = undefined;
    return {
      ...swing,
      origin: { ...this.dashOrigin! },
      direction: { ...swing.direction },
      damage: Math.round(swing.damage * this.damageMultiplier),
    };
  }
}

/** SUP-basti-20261123-133012: independently expiring marks; capped and not refreshed by overflow. */
export class DebtMarkLedger {
  private readonly marks = new Map<string, number[]>();

  constructor(private readonly maxMarks: number, private readonly durationMs: number) {}

  count(targetId: string): number { return this.marks.get(targetId)?.length ?? 0; }

  add(targetId: string): boolean {
    const current = this.marks.get(targetId) ?? [];
    if (current.length >= this.maxMarks) return false;
    current.push(this.durationMs);
    this.marks.set(targetId, current);
    return true;
  }

  update(dtMs: number): void {
    const elapsed = Math.max(0, dtMs);
    for (const [targetId, marks] of this.marks) {
      const active = marks.map((remaining) => remaining - elapsed).filter((remaining) => remaining > 0);
      if (active.length) this.marks.set(targetId, active);
      else this.marks.delete(targetId);
    }
  }

  consume(targetId: string): number {
    const count = this.count(targetId);
    this.marks.delete(targetId);
    return count;
  }

  clear(targetId: string): void { this.marks.delete(targetId); }
}
