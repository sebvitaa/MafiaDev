// Dominio: seba. Ajustes del jugador (volúmenes, accesibilidad, tutorial). Lógica pura: sin Phaser.
// Se guardan aparte de GameState (shared) para no tocar el save de partida.
export type Channel = 'music' | 'sfx' | 'ambient' | 'ui';

export interface Settings {
  master: number;
  music: number;
  sfx: number;
  ambient: number;
  ui: number;
  muted: boolean;
  reducedMotion: boolean;
  screenShake: boolean;
  tutorialDone: boolean;
}

export const SETTINGS_KEY = 'mafiadev.settings.v1';

/** Mezcla base (fase 6). Los sliders del jugador escalan sobre estos valores. */
export const DEFAULT_SETTINGS: Readonly<Settings> = {
  master: 0.8,
  music: 0.35,
  sfx: 0.6,
  ambient: 0.6,
  ui: 0.7,
  muted: false,
  reducedMotion: false,
  screenShake: true,
  tutorialDone: false,
};

type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem'>;

const clamp01 = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : fallback;

/** Normaliza datos de origen dudoso (localStorage editado, versiones viejas). */
export function sanitize(raw: unknown): Settings {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Record<keyof Settings, unknown>>;
  const d = DEFAULT_SETTINGS;
  return {
    master: clamp01(r.master, d.master),
    music: clamp01(r.music, d.music),
    sfx: clamp01(r.sfx, d.sfx),
    ambient: clamp01(r.ambient, d.ambient),
    ui: clamp01(r.ui, d.ui),
    muted: typeof r.muted === 'boolean' ? r.muted : d.muted,
    reducedMotion: typeof r.reducedMotion === 'boolean' ? r.reducedMotion : d.reducedMotion,
    screenShake: typeof r.screenShake === 'boolean' ? r.screenShake : d.screenShake,
    tutorialDone: typeof r.tutorialDone === 'boolean' ? r.tutorialDone : d.tutorialDone,
  };
}

/** Ajusta un volumen en pasos de 5 %, acotado a 0–100 %. */
export function stepVolume(v: number, dir: -1 | 1): number {
  const base = Number.isFinite(v) ? v : 0;
  return Math.min(1, Math.max(0, Math.round((base + dir * 0.05) * 100) / 100));
}

/** Volumen efectivo de un canal: canal × master, 0 si está en silencio. */
export function effectiveVolume(s: Settings, channel: Channel, base = 1): number {
  if (s.muted) return 0;
  return clamp01(base * s[channel] * s.master, 0);
}

type Listener = (s: Settings) => void;

export function createSettingsStore(storage: Storage | undefined) {
  let current = load();
  const listeners = new Set<Listener>();

  function load(): Settings {
    try {
      const raw = storage?.getItem(SETTINGS_KEY);
      return sanitize(raw ? JSON.parse(raw) : {});
    } catch {
      return sanitize({});
    }
  }

  return {
    get(): Settings {
      return current;
    },
    set(patch: Partial<Settings>): Settings {
      current = sanitize({ ...current, ...patch });
      try {
        storage?.setItem(SETTINGS_KEY, JSON.stringify(current));
      } catch {
        /* almacenamiento bloqueado: los ajustes duran la sesión */
      }
      for (const l of listeners) l(current);
      return current;
    },
    reload(): Settings {
      current = load();
      return current;
    },
    reset(): Settings {
      return this.set({ ...DEFAULT_SETTINGS, tutorialDone: current.tutorialDone });
    },
    /** Devuelve la función para desuscribirse. */
    subscribe(fn: Listener): () => void {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

export type SettingsStore = ReturnType<typeof createSettingsStore>;

const browserStorage = (): Storage | undefined => {
  try {
    return globalThis.localStorage ?? undefined;
  } catch {
    return undefined;
  }
};

/** Instancia única del juego. */
export const settings = createSettingsStore(browserStorage());
