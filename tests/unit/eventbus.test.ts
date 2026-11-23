import { afterEach, describe, expect, it } from 'vitest';
import { bus } from '../../src/core/EventBus';

afterEach(() => bus.clear());

describe('EventBus', () => {
  it('entrega el payload tipado', () => {
    let got = 0;
    bus.on('player:hit', (e) => (got = e.hp));
    bus.emit('player:hit', { dmg: 1, hp: 4, maxHp: 5 });
    expect(got).toBe(4);
  });

  it('once se ejecuta una sola vez', () => {
    let n = 0;
    bus.once('player:died', () => n++);
    bus.emit('player:died', {});
    bus.emit('player:died', {});
    expect(n).toBe(1);
  });

  it('offContext elimina todos los listeners de una escena', () => {
    const scene = {};
    let n = 0;
    bus.on('player:jump', () => n++, scene);
    bus.on('player:land', () => n++, scene);
    bus.offContext(scene);
    bus.emit('player:jump', { air: false });
    bus.emit('player:land', { vy: 0 });
    expect(n).toBe(0);
  });
});
