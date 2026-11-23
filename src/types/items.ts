// Contrato compartido (congelado tras H1). Dueño de la implementación: alejandro.
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type ItemType = 'consumable' | 'equipment' | 'buff' | 'heart';

export interface ItemDef {
  id: string;
  name: string;
  rarity: Rarity;
  type: ItemType;
  heal?: number;
  maxHp?: number;
  slot?: 'weapon';
  stats?: Partial<{ atk: number; def: number; speed: number }>;
  durationMs?: number;
}

/** Entrada de tabla de loot. id null = no suelta nada. */
export interface LootEntry {
  id: string | null;
  w: number;
}
