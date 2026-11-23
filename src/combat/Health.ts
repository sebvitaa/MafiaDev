/** Vida en puntos de combate. El HUD puede representarla como corazones. */
export class Health {
  readonly maxHp: number;
  hp: number;
  private protectedMs = 0;

  constructor(maxHp: number, private readonly invulnerabilityMs = 0) {
    this.maxHp = Math.max(1, Math.round(maxHp));
    this.hp = this.maxHp;
  }

  get alive(): boolean { return this.hp > 0; }
  get invulnerable(): boolean { return this.protectedMs > 0; }

  damage(amount: number): { applied: number; killed: boolean } {
    if (!this.alive || this.invulnerable || !Number.isFinite(amount)) return { applied: 0, killed: false };
    const applied = Math.min(this.hp, Math.max(0, Math.round(amount)));
    this.hp -= applied;
    if (applied > 0) this.protectedMs = this.invulnerabilityMs;
    return { applied, killed: applied > 0 && !this.alive };
  }

  update(dtMs: number): void {
    this.protectedMs = Math.max(0, this.protectedMs - Math.max(0, Number.isFinite(dtMs) ? dtMs : 0));
  }
}
