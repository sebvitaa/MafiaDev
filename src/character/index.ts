// Dominio: alejandro — stats, clases, equipo, inventario.
import type Phaser from 'phaser';
import classes from '../data/classes.json';
import { bus } from '../core/EventBus';
import definitions from '../data/abilities.json';
import { createAbilitySlots } from '../abilities';
import type { AbilitySlots, CharacterStats, ClassId } from '../types/character';

export interface Character {
  classId: ClassId;
  stats: CharacterStats;
  abilities: AbilitySlots;
}

export function installCharacter(scene: Phaser.Scene, classId: ClassId = 'luchador'): Character {
  const def = classes[classId];
  scene.registry.set('souls',definitions.soul_bolt.startingSouls);
  bus.on('enemy:killed',()=>scene.registry.set('souls',Number(scene.registry.get('souls')??0)+1),scene);
  scene.events.once('shutdown',()=>{bus.offContext(scene);scene.registry.set('timeStopRemaining',0);});
  return {
    classId,
    stats: { ...def.stats },
    abilities: createAbilitySlots(scene, def.abilities),
  };
}
