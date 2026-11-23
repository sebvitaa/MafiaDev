// Dominio: alejandro — habilidades por clase (patrón Strategy).
import type Phaser from 'phaser';
import type { AbilitySlots } from '../types/character';

export interface Ability {
  id: string;
  cooldownMs: number;
  activate(scene: Phaser.Scene): void;
}

/** STUB (alejandro): sin habilidades aún. Implementar TimeStop en abilities/TimeStop.ts. */
export function createAbilitySlots(_scene: Phaser.Scene, _ids: readonly string[]): AbilitySlots {
  return {
    tryActivate: () => false,
    update: () => {},
  };
}
