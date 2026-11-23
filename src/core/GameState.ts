// Estado global persistente (checkpoint, salas visitadas, inventario). Único singleton permitido.
export interface SaveData {
  checkpointId: string | null;
  visitedRooms: string[];
  inventory: string[];
  equipped: { weapon: string | null };
  hp: number;
  maxHp: number;
}

const KEY = 'mafiadev.save.v1';

const defaults = (): SaveData => ({
  checkpointId: null,
  visitedRooms: [],
  inventory: [],
  equipped: { weapon: null },
  hp: 5,
  maxHp: 5,
});

export const GameState = {
  data: defaults(),

  load(): SaveData {
    try {
      const raw = globalThis.localStorage?.getItem(KEY);
      this.data = raw ? { ...defaults(), ...(JSON.parse(raw) as Partial<SaveData>) } : defaults();
    } catch {
      this.data = defaults();
    }
    return this.data;
  },

  save(): void {
    try {
      globalThis.localStorage?.setItem(KEY, JSON.stringify(this.data));
    } catch {
      /* almacenamiento bloqueado: el juego sigue sin guardar */
    }
  },

  reset(): void {
    this.data = defaults();
    try { globalThis.localStorage?.removeItem(KEY); } catch { /* idem */ }
  },
};
