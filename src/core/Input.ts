// Patrón Command: el juego consulta ACCIONES, nunca teclas. Rebind y mando se añaden aquí.
import Phaser from 'phaser';

export type Action = 'left' | 'right' | 'up' | 'down' | 'jump' | 'attack' | 'dash' | 'parry' | 'ability' | 'pause';

export const BINDINGS: Record<Action, string[]> = {
  left: ['LEFT', 'A'],
  right: ['RIGHT', 'D'],
  up: ['UP', 'W'],
  down: ['DOWN', 'S'],
  jump: ['SPACE', 'Z'],
  attack: ['X', 'J'],
  dash: ['C', 'SHIFT', 'K'],
  parry: ['V', 'L'],
  ability: ['Q', 'I'],
  pause: ['ESC', 'P'],
};

export class Input {
  private readonly keys = new Map<Action, Phaser.Input.Keyboard.Key[]>();
  private prev = new Set<Action>();
  private now = new Set<Action>();

  constructor(scene: Phaser.Scene) {
    const kb = scene.input.keyboard;
    if (!kb) throw new Error('Input: teclado no disponible');
    for (const action of Object.keys(BINDINGS) as Action[]) {
      this.keys.set(action, BINDINGS[action].map((code) => kb.addKey(code)));
    }
  }

  /** Llamar una vez por frame ANTES de leer acciones. */
  update(): void {
    this.prev = this.now;
    this.now = new Set();
    for (const [action, keys] of this.keys) if (keys.some((k) => k.isDown)) this.now.add(action);
  }

  held(a: Action): boolean { return this.now.has(a); }
  pressed(a: Action): boolean { return this.now.has(a) && !this.prev.has(a); }
  released(a: Action): boolean { return !this.now.has(a) && this.prev.has(a); }
  get axisX(): number { return (this.held('right') ? 1 : 0) - (this.held('left') ? 1 : 0); }
}
