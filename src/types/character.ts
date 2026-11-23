// Frontera basti ↔ alejandro (SUP-seba-20261123-084248).
// Player (basti) LEE CharacterStats y DELEGA el input de habilidad en AbilitySlots (alejandro).
export type ClassId = 'luchador' | 'mago';

export interface CharacterStats {
  maxHp: number;
  atk: number;
  def: number;
  speed: number;          // px/s horizontal
  airJumps: number;       // 1 = doble salto
  dashCooldownMs: number;
}

export interface AbilitySlots {
  /** Devuelve true si la habilidad se activó (no estaba en cooldown). */
  tryActivate(slot: 0 | 1): boolean;
  update(dtMs: number): void;
}
