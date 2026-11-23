export interface FireballDamageTarget {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  takeFireDamage(damage: number, direction: { x: number; y: number }): void;
  /** Optional local adapter for the modular debt-mark effect. */
  consumeDebtMarks?(): number;
  onDebtDetonated?(stacks: number): void;
}

export interface FireballTiming {
  fallMs: number;
  explosionMs: number;
  cooldownMs: number;
}

export type FireballPhase = 'idle' | 'aiming' | 'falling' | 'exploding';

/** Phaser-independent phase and cooldown timing for the local prototype spell. */
export class FireballTimeline {
  phase: FireballPhase = 'idle';
  private fallElapsedMs = 0;
  private explosionElapsedMs = 0;
  private cooldownMs = 0;

  constructor(private readonly timing: FireballTiming) {}

  get cooldownRemainingMs(): number { return Math.max(0, this.cooldownMs); }
  get fallProgress(): number { return Math.max(0, Math.min(1, this.fallElapsedMs / this.timing.fallMs)); }
  get explosionProgress(): number {
    return Math.max(0, Math.min(1, this.explosionElapsedMs / this.timing.explosionMs));
  }

  beginAim(): boolean {
    if (this.phase !== 'idle' || this.cooldownMs > 0) return false;
    this.phase = 'aiming';
    return true;
  }

  releaseAim(): boolean {
    if (this.phase !== 'aiming') return false;
    this.phase = 'falling';
    this.fallElapsedMs = 0;
    this.cooldownMs = this.timing.cooldownMs;
    return true;
  }

  cancelAim(): boolean {
    if (this.phase !== 'aiming') return false;
    this.phase = 'idle';
    return true;
  }

  /** Returns true once, on the frame the projectile lands. */
  update(dtMs: number): boolean {
    const elapsed = Math.max(0, dtMs);
    this.cooldownMs = Math.max(0, this.cooldownMs - elapsed);
    if (this.phase === 'falling') {
      this.fallElapsedMs += elapsed;
      if (this.fallElapsedMs >= this.timing.fallMs) {
        this.phase = 'exploding';
        this.explosionElapsedMs = 0;
        return true;
      }
    } else if (this.phase === 'exploding') {
      this.explosionElapsedMs += elapsed;
      if (this.explosionElapsedMs >= this.timing.explosionMs) this.phase = 'idle';
    }
    return false;
  }
}

/** Applies one radial impact per target ID for this single explosion. */
export class FireballBlast {
  private readonly hitIds = new Set<string>();

  reset(): void { this.hitIds.clear(); }

  apply(
    origin: { x: number; y: number },
    targets: readonly FireballDamageTarget[],
    radius: number,
    damage: number,
    debtBonusPerMark = 0,
  ): string[] {
    const hit: string[] = [];
    for (const target of targets) {
      if (this.hitIds.has(target.id)) continue;
      const dx = target.x - origin.x;
      const dy = target.y - origin.y;
      if (Math.hypot(dx, dy) > radius + target.radius) continue;
      const distance = Math.hypot(dx, dy);
      const direction = distance === 0 ? { x: 0, y: -1 } : { x: dx / distance, y: dy / distance };
      this.hitIds.add(target.id);
      const debtMarks = Math.max(0, target.consumeDebtMarks?.() ?? 0);
      target.takeFireDamage(damage + debtMarks * debtBonusPerMark, direction);
      if (debtMarks > 0) target.onDebtDetonated?.(debtMarks);
      hit.push(target.id);
    }
    return hit;
  }
}
