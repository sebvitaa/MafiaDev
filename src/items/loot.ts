// Lógica pura (sin Phaser): testeada en tests/unit/loot.test.ts.
import type { LootEntry } from '../types/items';

export function rollLoot(table: readonly LootEntry[], rng: () => number = Math.random): string | null {
  const total = table.reduce((s, e) => s + Math.max(0, e.w), 0);
  if (total <= 0) return null;
  let r = rng() * total;
  for (const e of table) {
    r -= Math.max(0, e.w);
    if (r < 0) return e.id;
  }
  return null;
}
