export type BodoqueAttackId = 'microphoneMallet' | 'cameraFlash' | 'lastHour';
export type BodoqueState = 'inactive' | 'idle' | 'telegraph' | 'active' | 'recovery' | 'opening' | 'heart' | 'dying' | 'defeated';

export interface BodoqueAttackConfig {
  windupMs: number;
  activeMs: number;
  recoveryMs: number;
  damage: number;
  range: number;
  halfAngleDeg?: number;
  halfWidth?: number;
  distance?: number;
  parryable: boolean;
}

export interface BodoqueConfig {
  hp: number;
  radius: number;
  idleMs: number;
  phaseThresholds: [number, number];
  heart: { hp: number; openingMs: number; defeatMs: number; criticalHp: number };
  bounds?: { left: number; right: number; top: number; bottom: number };
  attacks: Record<BodoqueAttackId, BodoqueAttackConfig>;
}

export interface BodoquePoint { x: number; y: number }

export interface BodoqueAttackIntent {
  id: BodoqueAttackId;
  config: BodoqueAttackConfig;
  origin: BodoquePoint;
  direction: BodoquePoint;
  destination: BodoquePoint;
  parryable: boolean;
}

export interface BodoqueDamageResult {
  applied: number;
  defeated: boolean;
  preparedPhases: number[];
  criticalTriggered?: boolean;
}

/** Phaser-free boss state, attack sequencing, health and per-execution hit guard. */
export class BodoqueBrain {
  state: BodoqueState = 'inactive';
  phase = 1;
  hp: number;
  critical = false;
  private elapsedMs = 0;
  private attackIndex = -1;
  private attackHitSpent = false;
  private victoryConsumed = false;
  private readonly prepared = new Set<number>();
  private intent?: BodoqueAttackIntent;

  constructor(readonly config: BodoqueConfig) {
    this.hp = config.hp;
  }

  get maxHp(): number { return this.config.hp; }
  get active(): boolean { return this.state !== 'inactive' && this.state !== 'defeated'; }
  get currentAttack(): BodoqueAttackIntent | undefined { return this.intent; }
  get finalProgress(): number {
    const duration = this.state === 'opening' ? this.config.heart.openingMs : this.config.heart.defeatMs;
    return Math.min(1, this.elapsedMs / duration);
  }
  get attackProgress(): number {
    const intent = this.intent;
    if (!intent || (this.state !== 'telegraph' && this.state !== 'active' && this.state !== 'recovery')) return 0;
    const duration = this.state === 'telegraph' ? intent.config.windupMs
      : this.state === 'active' ? intent.config.activeMs : intent.config.recoveryMs;
    return duration <= 0 ? 1 : Math.min(1, this.elapsedMs / duration);
  }

  activate(): boolean {
    if (this.state !== 'inactive') return false;
    this.state = 'idle';
    this.elapsedMs = 0;
    return true;
  }

  /** Advances every state boundary while retaining any frame time left over. */
  update(dtMs: number, player: BodoquePoint, boss: BodoquePoint): void {
    if (this.state === 'opening' || this.state === 'dying') {
      this.elapsedMs += Math.max(0, dtMs);
      const duration = this.state === 'opening' ? this.config.heart.openingMs : this.config.heart.defeatMs;
      if (this.elapsedMs >= duration) {
        this.state = this.state === 'opening' ? 'heart' : 'defeated';
        this.elapsedMs = 0;
      }
      return;
    }
    if (this.state === 'heart') return;
    let remaining = Math.max(0, dtMs);
    let transitions = 0;
    while (this.active && transitions++ < 12) {
      const duration = this.durationForState();
      const untilNext = Math.max(0, duration - this.elapsedMs);
      if (remaining < untilNext) {
        this.elapsedMs += remaining;
        break;
      }
      remaining -= untilNext;
      this.elapsedMs = 0;
      this.transition(player, boss);
      if (remaining === 0) break;
    }
  }

  /** Returns the next phase thresholds once; phase-two/three behavior stays unimplemented. */
  takeDamage(amount: number, target: 'body' | 'heart' = 'body'): BodoqueDamageResult {
    if (this.state === 'defeated') return { applied: 0, defeated: true, preparedPhases: [] };
    if (!Number.isFinite(amount) || amount <= 0 || this.state === 'opening' || this.state === 'dying'
      || (this.state === 'heart' ? target !== 'heart' : target !== 'body')) {
      return { applied: 0, defeated: false, preparedPhases: [], criticalTriggered: false };
    }
    const floor = this.state === 'heart' ? 0 : this.config.heart.hp;
    const applied = Math.min(Math.max(0, this.hp - floor), amount);
    this.hp -= applied;
    const ratio = this.hp / this.maxHp;
    const preparedPhases: number[] = [];
    this.config.phaseThresholds.forEach((threshold, index) => {
      const phase = index + 2;
      if (!this.prepared.has(phase) && ratio <= threshold) {
        this.prepared.add(phase);
        preparedPhases.push(phase);
      }
    });
    let criticalTriggered = false;
    if (this.state !== 'heart' && this.hp === this.config.heart.hp) {
      this.state = 'opening';
      this.phase = 3;
      this.intent = undefined;
      this.elapsedMs = 0;
    } else if (this.state === 'heart') {
      if (this.hp <= this.config.heart.criticalHp && !this.critical) {
        this.critical = true;
        criticalTriggered = true;
      }
      if (this.hp === 0) this.state = 'dying';
      this.elapsedMs = 0;
    }
    return { applied, defeated: false, preparedPhases, criticalTriggered };
  }

  /** One impact per attack execution, regardless of how many active frames overlap the player. */
  consumePlayerHit(): boolean {
    if (this.state !== 'active' || this.attackHitSpent) return false;
    this.attackHitSpent = true;
    return true;
  }

  /** Integration hook may be dispatched only once, after the death animation has completed. */
  consumeVictory(): boolean {
    if (this.state !== 'defeated' || this.victoryConsumed) return false;
    this.victoryConsumed = true;
    return true;
  }

  private durationForState(): number {
    if (this.state === 'idle') return this.config.idleMs;
    if (!this.intent) return Number.POSITIVE_INFINITY;
    if (this.state === 'telegraph') return this.intent.config.windupMs;
    if (this.state === 'active') return this.intent.config.activeMs;
    if (this.state === 'recovery') return this.intent.config.recoveryMs;
    return Number.POSITIVE_INFINITY;
  }

  private transition(player: BodoquePoint, boss: BodoquePoint): void {
    if (this.state === 'idle') {
      this.beginAttack(player, boss);
    } else if (this.state === 'telegraph') {
      this.state = 'active';
      this.elapsedMs = 0;
      this.attackHitSpent = false;
    } else if (this.state === 'active') {
      this.state = 'recovery';
      this.elapsedMs = 0;
    } else if (this.state === 'recovery') {
      this.state = 'idle';
      this.elapsedMs = 0;
    }
  }

  private beginAttack(player: BodoquePoint, boss: BodoquePoint): void {
    const ids = Object.keys(this.config.attacks) as BodoqueAttackId[];
    this.attackIndex = (this.attackIndex + 1) % ids.length;
    const id = ids[this.attackIndex];
    const config = this.config.attacks[id];
    const dx = player.x - boss.x;
    const dy = player.y - boss.y;
    const distance = Math.hypot(dx, dy) || 1;
    const direction = { x: dx / distance, y: dy / distance };
    const chargeDistance = id === 'lastHour' ? config.distance ?? config.range : 0;
    const destination = { x: boss.x + direction.x * chargeDistance, y: boss.y + direction.y * chargeDistance };
    if (this.config.bounds) {
      destination.x = Math.max(this.config.bounds.left, Math.min(this.config.bounds.right, destination.x));
      destination.y = Math.max(this.config.bounds.top, Math.min(this.config.bounds.bottom, destination.y));
    }
    this.intent = {
      id,
      config,
      origin: { ...boss },
      direction,
      destination,
      parryable: config.parryable,
    };
    this.state = 'telegraph';
    this.elapsedMs = 0;
    this.attackHitSpent = false;
  }
}

export function isPointInBodoqueAttack(
  id: BodoqueAttackId,
  point: BodoquePoint,
  pointRadius: number,
  config: BodoqueAttackConfig,
  origin: BodoquePoint,
  direction: BodoquePoint,
  destination: BodoquePoint = origin,
): boolean {
  if (id === 'lastHour') {
    const dx = destination.x - origin.x;
    const dy = destination.y - origin.y;
    const lengthSq = dx * dx + dy * dy;
    const t = lengthSq === 0 ? 0 : Math.max(0, Math.min(1,
      ((point.x - origin.x) * dx + (point.y - origin.y) * dy) / lengthSq));
    const nearestX = origin.x + t * dx;
    const nearestY = origin.y + t * dy;
    return Math.hypot(point.x - nearestX, point.y - nearestY) <= (config.halfWidth ?? 20) + pointRadius;
  }

  const dx = point.x - origin.x;
  const dy = point.y - origin.y;
  const distance = Math.hypot(dx, dy);
  if (distance > config.range + pointRadius) return false;
  if (distance <= pointRadius) return true;
  const forward = dx * direction.x + dy * direction.y;
  if (forward < -pointRadius) return false;
  const lateral = Math.abs(dx * direction.y - dy * direction.x);
  const angle = Math.max(0, Math.min(89, config.halfAngleDeg ?? 45)) * Math.PI / 180;
  return lateral <= Math.max(0, forward) * Math.tan(angle) + pointRadius;
}
