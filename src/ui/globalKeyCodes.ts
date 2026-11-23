// Dominio: seba. Lógica pura (sin Phaser) de las teclas globales; ver globalKeys.ts.
// En el juego, M (mapa grande) y F (viaje rápido) son de vicho, así que ahí solo el 0 silencia.

export interface GlobalKeyCodes {
  mute: string[];
  fullscreen: string[];
}

export function globalKeyCodes(inGame: boolean): GlobalKeyCodes {
  return inGame
    ? { mute: ['ZERO', 'NUMPAD_ZERO'], fullscreen: [] }
    : { mute: ['ZERO', 'NUMPAD_ZERO', 'M'], fullscreen: ['F'] };
}
