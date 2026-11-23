import { describe, expect, it } from 'vitest';
import { approach, lookaheadTarget, smoothing } from '../../src/world/cameraMath';

describe('cámara (vicho)', () => {
  it('sin movimiento no hay lookahead', () => {
    expect(lookaheadTarget(0, 0, 40, 10)).toEqual({ x: 0, y: 0 });
    expect(lookaheadTarget(5, 5, 40, 10)).toEqual({ x: 0, y: 0 });
  });

  it('el lookahead mide lookaheadPx en la dirección del movimiento', () => {
    const t = lookaheadTarget(100, 0, 40, 10);
    expect(t.x).toBeCloseTo(40);
    expect(t.y).toBeCloseTo(0);
    const d = lookaheadTarget(-60, 60, 40, 10);
    expect(Math.hypot(d.x, d.y)).toBeCloseTo(40);
    expect(d.x).toBeLessThan(0);
    expect(d.y).toBeGreaterThan(0);
  });

  it('el suavizado no depende del framerate', () => {
    let a = 0;
    for (let i = 0; i < 4; i++) a = approach(a, 1, 16, 250);
    const b = approach(0, 1, 64, 250);
    expect(a).toBeCloseTo(b, 10);
    expect(smoothing(0, 250)).toBe(0);
  });
});
