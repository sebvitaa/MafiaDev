// Dominio: seba. Lógica pura del audio (sin Phaser): limitador anti-spam, mapa zona → pistas, variantes.
import type { AmbientKey, MusicKey, SfxKey } from '../types/assets';
import type { Rarity } from '../types/items';

/** Nivel base de cada canal antes de los ajustes del jugador (pasada de mezcla, fase 6). */
// Recalibrado para los ajustes por defecto 80/35/60 (3.39): misma mezcla efectiva que antes, con los SFX al frente.
export const MIX = { music: 0.84, sfx: 1.0, ambient: 0.32, ui: 0.6, voice: 0.95 } as const;

/** Realce por SFX: el parry y el tercer golpe deben destacar sobre todo lo demás. */
export const SFX_GAIN: Partial<Record<SfxKey, number>> = {
  'sfx-parry': 1.25,
  'sfx-land': 0.55,
  'sfx-dash': 0.8,
  'sfx-jump': 0.7,
  'sfx-low-hp': 0.9,
  'sfx-boss-roar': 1.1,
};

/** Variantes en disco por clave: sfx-hit → sfx-hit-1..3. */
export const SFX_VARIANTS: Partial<Record<SfxKey, number>> = { 'sfx-hit': 3, 'sfx-swing': 3 };

export interface ZoneAudio { music: MusicKey; ambient: AmbientKey | null }

export const ZONE_AUDIO: Record<string, ZoneAudio> = {
  zone1: { music: 'music-zone1', ambient: 'amb-zone1' },
  zone2: { music: 'music-zone2', ambient: 'amb-zone2' },
  boss: { music: 'music-boss', ambient: null },
};

/** Zona desconocida → la de zone1 (las zonas de vicho pueden tener otros nombres). */
export function audioForZone(zone: string | undefined): ZoneAudio {
  return (zone && ZONE_AUDIO[zone]) || ZONE_AUDIO.zone1;
}

/** Elige la variante de una clave: 'sfx-swing' con combo 3 → 'sfx-swing-3'; sin índice, aleatoria. */
export function variantKey(key: SfxKey, index?: number, rand: () => number = Math.random): string {
  const n = SFX_VARIANTS[key];
  if (!n) return key;
  const i = index !== undefined ? Math.min(n, Math.max(1, index)) : 1 + Math.floor(rand() * n);
  return `${key}-${i}`;
}

/**
 * Limitador: máx. `maxVoices` instancias simultáneas por clave y `cooldownMs` entre disparos.
 * `now` en ms. Devuelve true si el sonido puede sonar (y lo registra).
 */
export function createLimiter(maxVoices = 4, cooldownMs = 40) {
  const last = new Map<string, number>();
  const live = new Map<string, number[]>(); // instantes de fin de cada instancia viva

  return {
    tryPlay(key: string, now: number, durationMs: number): boolean {
      const prev = last.get(key);
      if (prev !== undefined && now - prev < cooldownMs) return false;
      const alive = (live.get(key) ?? []).filter((end) => end > now);
      if (alive.length >= maxVoices) { live.set(key, alive); return false; }
      alive.push(now + Math.max(1, durationMs));
      live.set(key, alive);
      last.set(key, now);
      return true;
    },
    reset(): void { last.clear(); live.clear(); },
  };
}

/** Interpolación lineal de volumen para fundidos (t en 0..1). */
export const fadeAt = (from: number, to: number, t: number): number => from + (to - from) * Math.min(1, Math.max(0, t));

/** 3.22 — desafinación (cents) del sonido de recoger según la rareza. */
export const RARITY_DETUNE: Record<Rarity, number> = { common: 0, rare: 300, epic: 500, legendary: 700 };

/**
 * 3.35 / 3.36 — paneo sutil (máx. ±0.4) según la posición en la vista; null si está fuera de cámara
 * (con 24 px de margen).
 */
export function panFor(x: number, viewX: number, viewW: number, max = 0.4, margin = 24): number | null {
  if (viewW <= 0) return 0;
  if (x < viewX - margin || x > viewX + viewW + margin) return null;
  const rel = (x - (viewX + viewW / 2)) / (viewW / 2);
  return Math.round(Math.max(-1, Math.min(1, rel)) * max * 100) / 100;
}
