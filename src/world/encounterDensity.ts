import type { BasicEnemyKind } from '../enemies';

export type EncounterBiome = 'ruins' | 'forest' | 'redforest' | 'bright' | 'arena';

/** SUP-vicho-20261123-172300: pacing density by biome; the arena reserves combat for its boss. */
export const ENCOUNTER_DENSITY: Readonly<Record<EncounterBiome, readonly BasicEnemyKind[]>> = {
  ruins: ['slime', 'cobrador'],
  forest: ['slime'],
  redforest: ['cobrador', 'knight'],
  bright: ['slime'],
  arena: [],
};

export function kindsForBiome(biome: EncounterBiome): readonly BasicEnemyKind[] {
  return ENCOUNTER_DENSITY[biome];
}

/** Deterministic selection lets Tiled spawns remain stable across regenerated variants. */
export function pickEncounterKind(biome: EncounterBiome, seed: number): BasicEnemyKind | null {
  const kinds = kindsForBiome(biome);
  return kinds.length ? kinds[seed % kinds.length]! : null;
}
