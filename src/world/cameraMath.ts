// Dominio: vicho. Lógica pura de la cámara (sin Phaser) para testearla con Vitest.

export type CombatTier = 'explore' | 'combat' | 'miniboss' | 'boss';

/** Fracción a recorrer hacia el objetivo en dtMs, independiente del framerate. */
export const smoothing = (dtMs: number, tauMs: number): number => 1 - Math.exp(-dtMs / tauMs);

/** Desplazamiento objetivo: lookaheadPx en la dirección de la velocidad, 0 si va casi quieto. */
export function lookaheadTarget(vx: number, vy: number, lookaheadPx: number, minSpeed: number): { x: number; y: number } {
  const speed = Math.hypot(vx, vy);
  if (speed < minSpeed) return { x: 0, y: 0 };
  return { x: (vx / speed) * lookaheadPx, y: (vy / speed) * lookaheadPx };
}

/** Acerca `current` a `target` suavemente. */
export const approach = (current: number, target: number, dtMs: number, tauMs: number): number =>
  current + (target - current) * smoothing(dtMs, tauMs);
