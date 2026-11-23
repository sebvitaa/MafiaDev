import { describe, expect, it } from 'vitest';
import { createItalianRainPattern } from '../../src/player/room-prototype/ItalianRain';

describe('plan de lluvia italiana', () => {
  it('genera de siete a diez trayectorias deterministas dentro del radio y el tiempo de la habilidad', () => {
    for (const count of [7, 8, 9, 10]) {
      const pattern = createItalianRainPattern(count, 12345, 55, 600);
      expect(pattern).toHaveLength(count);
      expect(pattern.every((item) => Math.hypot(item.offsetX, item.offsetY / 0.7) <= 55)).toBe(true);
      expect(pattern.every((item) => item.launchDelayMs >= 0 && item.fallDurationMs > 0
        && item.impactAtMs <= 600)).toBe(true);
      expect(pattern).toEqual(createItalianRainPattern(count, 12345, 55, 600));
    }
  });

  it('varía altura, deriva, rotación, escala y tiempo de llegada para formar oleadas', () => {
    const pattern = createItalianRainPattern(9, 9876, 55, 600);
    expect(new Set(pattern.map((item) => item.impactAtMs)).size).toBeGreaterThan(5);
    expect(new Set(pattern.map((item) => item.rotation)).size).toBe(9);
    expect(new Set(pattern.map((item) => item.offsetX)).size).toBeGreaterThan(5);
    expect(pattern.map((item) => item.launchDelayMs).some((delay) => delay > 0)).toBe(true);
  });
});
