// Patrón Observer tipado. Sin dependencias de Phaser: testeable con Vitest.
// Regla: los dominios se comunican SOLO por aquí (AGENTS.md §2.1).
import type { GameEventName, GameEvents } from '../types/events';

type Handler<K extends GameEventName> = (payload: GameEvents[K]) => void;
type AnyHandler = (payload: unknown) => void;
interface Listener { fn: AnyHandler; ctx: unknown; once: boolean }

const listeners = new Map<GameEventName, Listener[]>();

function add<K extends GameEventName>(event: K, fn: Handler<K>, ctx: unknown, once: boolean): void {
  const list = listeners.get(event) ?? [];
  list.push({ fn: fn as AnyHandler, ctx, once });
  listeners.set(event, list);
}

export const bus = {
  on<K extends GameEventName>(event: K, fn: Handler<K>, ctx?: unknown): void {
    add(event, fn, ctx, false);
  },
  once<K extends GameEventName>(event: K, fn: Handler<K>, ctx?: unknown): void {
    add(event, fn, ctx, true);
  },
  off<K extends GameEventName>(event: K, fn: Handler<K>, ctx?: unknown): void {
    const list = listeners.get(event);
    if (!list) return;
    listeners.set(event, list.filter((l) => !(l.fn === fn && (ctx === undefined || l.ctx === ctx))));
  },
  /** Quita todos los listeners registrados con ese contexto. Usar en el evento SHUTDOWN de la escena. */
  offContext(ctx: unknown): void {
    for (const [event, list] of listeners) listeners.set(event, list.filter((l) => l.ctx !== ctx));
  },
  emit<K extends GameEventName>(event: K, payload: GameEvents[K]): void {
    const list = listeners.get(event);
    if (!list) return;
    for (const l of [...list]) {
      if (l.once) bus.off(event, l.fn as Handler<K>, l.ctx);
      l.fn.call(l.ctx, payload);
    }
  },
  /** Solo para tests. */
  clear(): void {
    listeners.clear();
  },
};
