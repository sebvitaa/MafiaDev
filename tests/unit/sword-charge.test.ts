import { describe, expect, it } from 'vitest';
import { SwordCharge } from '../../src/player/room-prototype/SwordCombat';

function charge() { return new SwordCharge(350, 1200); }

describe('carga de espada', () => {
  it('trata una pulsación de 350 ms como ataque normal', () => {
    const state = charge();
    state.begin();
    state.update(350);
    expect(state.release()).toEqual({ kind: 'tap' });
  });

  it('carga progresivamente hasta 200 % de daño y 150 % de alcance', () => {
    const state = charge();
    state.begin();
    state.update(775);
    expect(state.isCharging).toBe(true);
    expect(state.progress).toBeCloseTo(0.5);
    expect(state.damageMultiplier).toBeCloseTo(1.5);
    expect(state.rangeMultiplier).toBeCloseTo(1.25);
    state.update(1000);
    expect(state.progress).toBe(1);
    expect(state.release()).toEqual({ kind: 'charged', progress: 1 });
    expect(state.damageMultiplier).toBe(1);
    expect(state.rangeMultiplier).toBe(1);
  });

  it('cancela al esquivar y no genera golpe al soltar después', () => {
    const state = charge();
    state.begin();
    state.update(800);
    expect(state.cancel()).toBe(true);
    expect(state.isHolding).toBe(false);
    expect(state.release()).toBeUndefined();
  });

  it('no duplica una carga si llega otro pointer down mientras ya está retenida', () => {
    const state = charge();
    expect(state.begin()).toBe(true);
    expect(state.begin()).toBe(false);
  });
});
