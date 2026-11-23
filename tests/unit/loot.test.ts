import { describe, expect, it } from 'vitest';
import { rollLoot } from '../../src/items/loot';
import loot from '../../src/data/loot.json';
import items from '../../src/data/items.json';

describe('rollLoot', () => {
  const table = [{ id: null, w: 50 }, { id: 'a', w: 30 }, { id: 'b', w: 20 }];

  it('respeta los límites de cada peso', () => {
    expect(rollLoot(table, () => 0)).toBeNull();
    expect(rollLoot(table, () => 0.49)).toBeNull();
    expect(rollLoot(table, () => 0.5)).toBe('a');
    expect(rollLoot(table, () => 0.79)).toBe('a');
    expect(rollLoot(table, () => 0.8)).toBe('b');
    expect(rollLoot(table, () => 0.999)).toBe('b');
  });

  it('tabla vacía o sin peso devuelve null', () => {
    expect(rollLoot([])).toBeNull();
    expect(rollLoot([{ id: 'x', w: 0 }])).toBeNull();
  });

  it('todas las tablas de data/loot.json referencian items existentes', () => {
    const ids = new Set(items.map((i) => i.id));
    for (const [name, entries] of Object.entries(loot)) {
      for (const e of entries) if (e.id !== null) expect(ids.has(e.id), `${name} → ${e.id}`).toBe(true);
    }
  });
});
