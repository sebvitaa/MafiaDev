import { describe, expect, it } from 'vitest';
import { audioForZone, createLimiter, fadeAt, variantKey } from '../../src/audio/mixing';

describe('limitador de SFX', () => {
  it('aplica el enfriamiento por clave', () => {
    const l = createLimiter(4, 40);
    expect(l.tryPlay('hit', 0, 100)).toBe(true);
    expect(l.tryPlay('hit', 20, 100)).toBe(false);
    expect(l.tryPlay('jump', 20, 100)).toBe(true);
    expect(l.tryPlay('hit', 41, 100)).toBe(true);
  });

  it('no supera el máximo de voces vivas y libera las terminadas', () => {
    const l = createLimiter(2, 0);
    expect(l.tryPlay('x', 0, 500)).toBe(true);
    expect(l.tryPlay('x', 1, 500)).toBe(true);
    expect(l.tryPlay('x', 2, 500)).toBe(false);
    expect(l.tryPlay('x', 501, 500)).toBe(true);
  });
});

describe('mapa de audio', () => {
  it('zona → música y ambiente; zona desconocida cae en zone1', () => {
    expect(audioForZone('zone2')).toEqual({ music: 'music-zone2', ambient: 'amb-zone2' });
    expect(audioForZone('boss').ambient).toBeNull();
    expect(audioForZone('sotano-raro').music).toBe('music-zone1');
    expect(audioForZone(undefined).music).toBe('music-zone1');
  });

  it('variantes: índice explícito acotado o aleatorio', () => {
    expect(variantKey('sfx-swing', 3)).toBe('sfx-swing-3');
    expect(variantKey('sfx-swing', 9)).toBe('sfx-swing-3');
    expect(variantKey('sfx-hit', undefined, () => 0.99)).toBe('sfx-hit-3');
    expect(variantKey('sfx-jump')).toBe('sfx-jump');
  });

  it('fundido lineal acotado', () => {
    expect(fadeAt(0, 1, 0.5)).toBe(0.5);
    expect(fadeAt(1, 0, 2)).toBe(0);
  });
});
