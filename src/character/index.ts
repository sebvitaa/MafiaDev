// Dominio: alejandro — stats, clases, equipo, inventario.
import type Phaser from 'phaser';
import classes from '../data/classes.json';
import { createAbilitySlots } from '../abilities';
import type { AbilitySlots, CharacterStats, ClassId } from '../types/character';

export interface Character {
  classId: ClassId;
  stats: CharacterStats;
  abilities: AbilitySlots;
}

export function installCharacter(scene: Phaser.Scene, classId: ClassId = 'luchador'): Character {
  const def = classes[classId];
  return {
    classId,
    stats: { ...def.stats },
    abilities: createAbilitySlots(scene, def.abilities),
  };
}
