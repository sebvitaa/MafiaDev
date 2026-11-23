export type TapKey = 'W' | 'A' | 'S' | 'D' | 'UP' | 'LEFT' | 'DOWN' | 'RIGHT';
const DIRECTIONS = {
  W: { x: 0, y: -1 }, A: { x: -1, y: 0 }, S: { x: 0, y: 1 }, D: { x: 1, y: 0 },
  UP: { x: 0, y: -1 }, LEFT: { x: -1, y: 0 }, DOWN: { x: 0, y: 1 }, RIGHT: { x: 1, y: 0 },
} as const;

/** A pair is consumed on detection, even if movement rejects it during cooldown. */
export class DoubleTapDash {
  private readonly lastPress = new Map<TapKey, number>();
  private readonly held = new Set<TapKey>();

  constructor(private readonly windowMs: number) {}

  press(key: TapKey, timeMs: number): { x: number; y: number } | null {
    if (this.held.has(key)) return null;
    this.held.add(key);
    const previous = this.lastPress.get(key);
    if (previous !== undefined && timeMs >= previous && timeMs - previous <= this.windowMs) {
      this.lastPress.delete(key);
      return { ...DIRECTIONS[key] };
    }
    this.lastPress.set(key, timeMs);
    return null;
  }

  release(key: TapKey): void { this.held.delete(key); }
  clear(): void { this.held.clear(); this.lastPress.clear(); }
}
