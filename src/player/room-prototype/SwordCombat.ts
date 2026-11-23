export interface SwordDirection {
  x: number;
  y: number;
}

/** SUP-basti-20261123-115553: local adapter; production enemies can implement without shared changes. */
export interface SwordDamageTarget {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  addDebtMark?(): void;
  takeSwordDamage(damage: number, direction: SwordDirection, knockback?: number): void;
  /** Optional prototype-local status adapter; real enemies may implement it later. */
  addDebtMark?(): void;
}

export type ComboAttack = 1 | 2 | 3;

/** Pure mouse hold state; charge reaches its cap at a total press duration of maxMs. */
export class SwordCharge {
  private heldMs = 0;
  private holding = false;

  constructor(
    private readonly thresholdMs: number,
    private readonly maxMs: number,
    private readonly maxRangeMultiplier = 1.5,
    private readonly maxDamageMultiplier = 2,
  ) {}

  get isHolding(): boolean { return this.holding; }
  get isCharging(): boolean { return this.holding && this.heldMs > this.thresholdMs; }
  get progress(): number {
    return this.isCharging
      ? Math.max(0, Math.min(1, (this.heldMs - this.thresholdMs) / (this.maxMs - this.thresholdMs)))
      : 0;
  }
  get damageMultiplier(): number { return 1 + (this.maxDamageMultiplier - 1) * this.progress; }
  get rangeMultiplier(): number { return 1 + (this.maxRangeMultiplier - 1) * this.progress; }

  begin(): boolean {
    if (this.holding) return false;
    this.heldMs = 0;
    this.holding = true;
    return true;
  }

  update(dtMs: number): void {
    if (this.holding) this.heldMs = Math.min(this.maxMs, this.heldMs + Math.max(0, dtMs));
  }

  release(): { kind: 'tap' } | { kind: 'charged'; progress: number } | undefined {
    if (!this.holding) return undefined;
    const result = this.isCharging ? { kind: 'charged' as const, progress: this.progress } : { kind: 'tap' as const };
    this.reset();
    return result;
  }

  cancel(): boolean {
    if (!this.holding) return false;
    this.reset();
    return true;
  }

  private reset(): void {
    this.heldMs = 0;
    this.holding = false;
  }
}

export interface SwordComboConfig {
  durationsMs: [number, number, number];
  damageMultipliers: [number, number, number];
  comboWindowMs: number;
  bufferMs: number;
  dashCancelAfterMs: number;
}

/** Pure combo timing so its input rules can be tested without Phaser. */
export class SwordCombo {
  private timeMs = 0;
  private elapsedMs = 0;
  private comboIndex: ComboAttack | 0 = 0;
  private comboDeadlineMs = 0;
  private bufferDeadlineMs = 0;
  private buffered = false;
  active = false;

  constructor(private readonly config: SwordComboConfig) {}

  get hasBufferedAttack(): boolean { return this.buffered; }
  get currentAttack(): ComboAttack | 0 { return this.comboIndex; }
  get canCancelWithDash(): boolean {
    return this.active && this.elapsedMs >= this.config.dashCancelAfterMs;
  }

  press(): ComboAttack | undefined {
    if (this.active) {
      const duration = this.config.durationsMs[this.comboIndex - 1];
      if (this.comboIndex < 3 && this.elapsedMs >= Math.max(0, duration - this.config.bufferMs)
        && this.elapsedMs <= duration) {
        this.buffered = true;
        this.bufferDeadlineMs = this.timeMs + this.config.bufferMs;
      }
      return undefined;
    }
    if (this.comboIndex !== 0 && this.timeMs > this.comboDeadlineMs) this.comboIndex = 0;
    if (this.comboIndex === 3) this.comboIndex = 0;
    return this.begin((this.comboIndex + 1) as ComboAttack);
  }

  update(dtMs: number): ComboAttack | undefined {
    const elapsed = Math.max(0, dtMs);
    this.timeMs += elapsed;
    if (!this.active) {
      if (this.comboIndex !== 0 && this.timeMs > this.comboDeadlineMs) this.comboIndex = 0;
      return undefined;
    }
    this.elapsedMs += elapsed;
    const duration = this.config.durationsMs[this.comboIndex - 1];
    if (this.buffered && this.timeMs <= this.bufferDeadlineMs && this.elapsedMs >= duration) {
      this.buffered = false;
      return this.begin((this.comboIndex + 1) as ComboAttack);
    }
    if (this.timeMs > this.bufferDeadlineMs) this.buffered = false;
    if (this.elapsedMs >= duration) {
      this.active = false;
      this.comboDeadlineMs = this.timeMs + this.config.comboWindowMs;
      if (this.comboIndex === 3) {
        this.comboIndex = 0;
        this.comboDeadlineMs = this.timeMs;
      }
    }
    return undefined;
  }

  cancelByDash(): boolean {
    if (!this.canCancelWithDash) return false;
    this.active = false;
    this.comboIndex = 0;
    this.buffered = false;
    return true;
  }

  reset(): void {
    this.active = false;
    this.elapsedMs = 0;
    this.comboIndex = 0;
    this.comboDeadlineMs = this.timeMs;
    this.buffered = false;
  }

  damageFor(baseDamage: number, attack: ComboAttack): number {
    return Math.round(baseDamage * this.config.damageMultipliers[attack - 1]);
  }

  private begin(attack: ComboAttack): ComboAttack {
    this.comboIndex = attack;
    this.elapsedMs = 0;
    this.active = true;
    this.buffered = false;
    return attack;
  }
}

/** Simple pure health/respawn state for the prototype target. */
export class TrainingDummyHealth {
  hp: number;
  defeated = false;
  private respawnRemainingMs = 0;

  constructor(readonly maxHp: number, private readonly respawnDelayMs: number) {
    this.hp = maxHp;
  }

  takeDamage(amount: number): { applied: number; defeated: boolean } {
    if (this.defeated) return { applied: 0, defeated: true };
    const applied = Math.min(this.hp, Math.max(0, amount));
    this.hp -= applied;
    if (this.hp === 0) {
      this.defeated = true;
      this.respawnRemainingMs = this.respawnDelayMs;
    }
    return { applied, defeated: this.defeated };
  }

  update(dtMs: number): boolean {
    if (!this.defeated) return false;
    this.respawnRemainingMs -= Math.max(0, dtMs);
    if (this.respawnRemainingMs > 0) return false;
    this.defeated = false;
    this.hp = this.maxHp;
    return true;
  }
}

/** Tracks targets already struck during one attack animation. */
export class SwordHitTracker {
  private readonly hitIds = new Set<string>();

  beginSwing(): void { this.hitIds.clear(); }

  apply(
    origin: SwordDirection,
    direction: SwordDirection,
    targets: readonly SwordDamageTarget[],
    range: number,
    halfAngleDeg: number,
    damage: number,
    knockback = 0,
  ): string[] {
    const length = Math.hypot(direction.x, direction.y);
    const facing = length > 0 ? { x: direction.x / length, y: direction.y / length } : { x: 1, y: 0 };
    const hit: string[] = [];
    for (const target of targets) {
      if (this.hitIds.has(target.id)
        || !intersectsSector(origin, facing, target, range, halfAngleDeg)) continue;
      this.hitIds.add(target.id);
      target.takeSwordDamage(damage, facing, knockback);
      target.addDebtMark?.();
      hit.push(target.id);
    }
    return hit;
  }
}

export function intersectsSector(
  origin: SwordDirection,
  direction: SwordDirection,
  target: Pick<SwordDamageTarget, 'x' | 'y' | 'radius'>,
  range: number,
  halfAngleDeg: number,
): boolean {
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const distance = Math.hypot(dx, dy);
  if (distance > range + target.radius) return false;
  if (distance <= target.radius) return true;

  const forward = dx * direction.x + dy * direction.y;
  if (forward < -target.radius || forward > range + target.radius) return false;
  const lateral = Math.abs(dx * direction.y - dy * direction.x);
  const halfAngle = Math.max(0, Math.min(89, halfAngleDeg)) * Math.PI / 180;
  return lateral <= Math.max(0, forward) * Math.tan(halfAngle) + target.radius;
}
