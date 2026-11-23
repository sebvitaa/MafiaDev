// Patrón State genérico. Sin dependencias de Phaser: testeable con Vitest.
export interface State<T> {
  enter?(owner: T, prev: string): void;
  update?(owner: T, dtMs: number): void;
  exit?(owner: T, next: string): void;
}

export class StateMachine<T> {
  private readonly states = new Map<string, State<T>>();
  current = '';
  previous = '';

  constructor(private readonly owner: T) {}

  add(name: string, state: State<T>): this {
    this.states.set(name, state);
    return this;
  }

  /** force=true re-entra en el estado actual (p. ej. siguiente golpe del combo). */
  set(name: string, force = false): void {
    if (!this.states.has(name)) throw new Error(`StateMachine: estado desconocido "${name}"`);
    if (name === this.current && !force) return;
    const prev = this.current;
    this.states.get(prev)?.exit?.(this.owner, name);
    this.previous = prev;
    this.current = name;
    this.states.get(name)?.enter?.(this.owner, prev);
  }

  update(dtMs: number): void {
    this.states.get(this.current)?.update?.(this.owner, dtMs);
  }
}
