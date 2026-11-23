/** Pure dash timing: recovery starts after the active movement, never on landing. */
export class DashMotion {
  direction = 1;
  private remainingMs = 0;
  private recoveryMs = 0;

  constructor(private readonly config: { durationMs: number; invulnerableMs: number }) {}

  get active(): boolean { return this.remainingMs > 0; }
  get cooldownRemainingMs(): number { return Math.max(0, this.recoveryMs - this.remainingMs); }
  get invulnerable(): boolean {
    return this.active && this.config.durationMs - this.remainingMs < this.config.invulnerableMs;
  }

  tryStart(direction: number, cooldownMs: number): boolean {
    if (this.active || this.recoveryMs > 0) return false;
    this.direction = direction < 0 ? -1 : 1;
    this.remainingMs = this.config.durationMs;
    this.recoveryMs = this.config.durationMs + Math.max(0, cooldownMs);
    return true;
  }

  update(dtMs: number): void {
    const elapsed = Math.max(0, dtMs);
    this.remainingMs = Math.max(0, this.remainingMs - elapsed);
    this.recoveryMs = Math.max(0, this.recoveryMs - elapsed);
  }
}

export function horizontalSpeed(direction: number, speed: number, running: boolean, multiplier: number): number {
  return direction * speed * (running ? multiplier : 1);
}
