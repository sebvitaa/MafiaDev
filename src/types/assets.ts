// Claves de assets compartidas. Añadir una clave = commit aparte sin otros cambios (AGENTS.md §2.1).
export type AnimKey =
  | 'player-idle' | 'player-run' | 'player-jump' | 'player-fall'
  | 'player-attack1' | 'player-attack2' | 'player-attack3'
  | 'player-dash' | 'player-hurt' | 'player-death';

export type SfxKey =
  | 'sfx-jump' | 'sfx-land' | 'sfx-dash' | 'sfx-swing' | 'sfx-hit' | 'sfx-parry'
  | 'sfx-hurt' | 'sfx-enemy-death' | 'sfx-pickup' | 'sfx-chest' | 'sfx-checkpoint'
  | 'sfx-timestop' | 'sfx-ui-select' | 'sfx-ui-back';

export type MusicKey = 'music-title' | 'music-zone1' | 'music-zone2' | 'music-boss';

/** Texturas placeholder generadas en PreloadScene hasta que existan sprites reales. */
export type PlaceholderKey = 'ph-player' | 'ph-enemy' | 'ph-tile';
