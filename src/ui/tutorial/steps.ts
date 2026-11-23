// Dominio: seba. Máquina de pasos del tutorial contextual. Lógica pura: sin Phaser.
import type { Action } from '../../core/Input';
import type { GameEventName, GameEvents } from '../../types/events';

export interface TutorialStep {
  id: string;
  /** Texto con marcadores {acción} que se sustituyen por las teclas de BINDINGS. */
  text: string;
  /** Acciones cuyas teclas se muestran. */
  actions: Action[];
  /** Evento que completa (o hace avanzar) el paso; null = se completa por tiempo de input (`holdMs`). */
  event: GameEventName | null;
  /** Condición sobre el payload; cuántas veces debe cumplirse (por defecto 1). */
  match?: (payload: unknown, progress: number) => boolean;
  times?: number;
  holdMs?: number;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  { id: 'move', text: '{left}{right} Moverte', actions: ['left', 'right', 'up', 'down'], event: null, holdMs: 500 },
  {
    id: 'jump', text: '{jump} Saltar · otra vez en el aire', actions: ['jump'], event: 'player:jump', times: 2,
    // primero un salto desde el suelo, después uno en el aire
    match: (p, n) => (p as GameEvents['player:jump']).air === (n === 1),
  },
  { id: 'attack', text: '[CLIC IZQUIERDO] Atacar · encadena 3 golpes', actions: [], event: 'player:attack', match: (p) => (p as GameEvents['player:attack']).combo === 3 },
  { id: 'dash', text: '{dash} Esquivar', actions: ['dash'], event: 'player:dash' },
  { id: 'rain', text: '[R] Mantén, apunta y suelta Lluvia Italiana', actions: [], event: 'ability:used', match: p => (p as GameEvents['ability:used']).id === 'italian_rain' },
  { id: 'ability', text: '[I] Usa tu habilidad de clase', actions: [], event: 'ability:used', match: p => ['time_stop','soul_bolt'].includes((p as GameEvents['ability:used']).id) },
];

export type TutorialStatus = 'idle' | 'running' | 'done';

/** Recorre los pasos; la escena le pasa eventos del bus y tiempo de input. */
export function createTutorial(steps: TutorialStep[] = TUTORIAL_STEPS) {
  let index = 0;
  let progress = 0;
  let held = 0;
  let status: TutorialStatus = 'idle';

  const advance = (): TutorialStep | null => {
    index++;
    progress = 0;
    held = 0;
    if (index >= steps.length) { status = 'done'; return null; }
    return steps[index];
  };

  return {
    get status() { return status; },
    get current(): TutorialStep | null { return status === 'running' ? steps[index] : null; },
    get index() { return index; },
    start(): TutorialStep { status = 'running'; index = 0; progress = 0; held = 0; return steps[0]; },
    skip(): void { status = 'done'; },
    /** Devuelve true si el evento completó el paso actual. */
    onEvent(name: GameEventName, payload: unknown): boolean {
      const s = status === 'running' ? steps[index] : null;
      if (!s || s.event !== name) return false;
      if (s.match && !s.match(payload, progress)) return false;
      progress++;
      if (progress < (s.times ?? 1)) return false;
      advance();
      return true;
    },
    /** Para pasos sin evento: acumula ms con alguna de sus acciones pulsada. */
    onHeld(actionsHeld: Action[], deltaMs: number): boolean {
      const s = status === 'running' ? steps[index] : null;
      if (!s || s.event !== null) return false;
      if (s.actions.some((a) => actionsHeld.includes(a))) held += deltaMs;
      if (held < (s.holdMs ?? 0)) return false;
      advance();
      return true;
    },
  };
}

/** Sustituye {acción} por la primera tecla de BINDINGS en formato [TECLA]. */
export function formatStep(text: string, bindings: Record<Action, string[]>): string {
  const pretty: Record<string, string> = { LEFT: '←', RIGHT: '→', UP: '↑', DOWN: '↓', SPACE: 'ESPACIO', SHIFT: 'SHIFT', ESC: 'ESC' };
  return text.replace(/\{(\w+)\}/g, (_, a: string) => {
    const k = bindings[a as Action]?.[0];
    return k ? `[${pretty[k] ?? k}]` : `[${a}]`;
  });
}
