// Dominio: alejandro — items, rareza, loot, consumibles, buffs.
import items from '../data/items.json';
import loot from '../data/loot.json';
import type { ItemDef, LootEntry } from '../types/items';
import { rollLoot } from './loot';

export { rollLoot };

const ITEMS = new Map((items as ItemDef[]).map((i) => [i.id, i]));
const TABLES = loot as Record<string, LootEntry[]>;

export function getItem(id: string): ItemDef | undefined {
  return ITEMS.get(id);
}

export function rollTable(tableId: string, rng?: () => number): ItemDef | null {
  const table = TABLES[tableId];
  if (!table) throw new Error(`loot: tabla desconocida "${tableId}"`);
  const id = rollLoot(table, rng);
  return id ? (ITEMS.get(id) ?? null) : null;
}

export const RARITY_COLOR = {
  common: 0xbdb8cc,
  rare: 0x5aa8ff,
  epic: 0xb874ff,
  legendary: 0xffb347,
} as const;
