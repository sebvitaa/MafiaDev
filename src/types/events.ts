// Contrato de eventos del bus (AGENTS.md §2.2). Congelado tras H1: añadir/cambiar = cambio en shared.
import type { Rarity } from './items';

type Empty = Record<string, never>;

export type GameEvents = {
  'player:jump': { air: boolean };
  'player:land': { vy: number };
  'player:dash': Empty;
  'player:attack': { combo: 1 | 2 | 3 };
  'player:parry': { success: boolean };
  'player:hit': { dmg: number; hp: number; maxHp: number };
  'player:died': Empty;
  'enemy:hit': { id: string; dmg: number; x: number; y: number };
  'enemy:killed': { id: string; kind: string; x: number; y: number };
  'boss:phase': { phase: number };
  'ability:used': { id: string };
  'ability:ready': { id: string };
  'item:picked': { itemId: string; rarity: Rarity };
  'chest:opened': { id: string; hidden: boolean };
  'checkpoint:reached': { id: string };
  'room:entered': { roomId: string; zone: string };
  'zone:changed': { zone: string };
  'game:paused': Empty;
  'game:resumed': Empty;
};

export type GameEventName = keyof GameEvents;
