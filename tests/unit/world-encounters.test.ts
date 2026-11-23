import { describe, expect, it } from 'vitest';
import { kindsForBiome, pickEncounterKind } from '../../src/world/encounterDensity';

describe('encounter density by biome', () => {
  it('reserves the boss arena and keeps bright a low-pressure slime-only respite', () => {
    expect(kindsForBiome('arena')).toEqual([]);
    expect(kindsForBiome('bright')).toEqual(['slime']);
  });

  it('uses the intended biome enemy pools deterministically', () => {
    expect(kindsForBiome('ruins')).toEqual(['slime', 'cobrador']);
    expect(kindsForBiome('forest')).toEqual(['slime']);
    expect(kindsForBiome('redforest')).toEqual(['cobrador', 'knight']);
    expect(pickEncounterKind('redforest', 0)).toBe('cobrador');
    expect(pickEncounterKind('redforest', 1)).toBe('knight');
    expect(pickEncounterKind('arena', 99)).toBeNull();
  });
});
