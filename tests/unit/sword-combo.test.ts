import { describe, expect, it } from 'vitest';
import { SwordCombo, TrainingDummyHealth } from '../../src/player/room-prototype/SwordCombat';

function combo() {
  return new SwordCombo({
    durationsMs: [220, 280, 400], damageMultipliers: [1, 1.2, 1.6],
    comboWindowMs: 500, bufferMs: 150, dashCancelAfterMs: 90,
  });
}

describe('combo de espada', () => {
  it('encadena tres golpes desde la ventana y usa 100 %, 120 % y 160 % de daño', () => {
    const state = combo();
    expect(state.press()).toBe(1);
    state.update(100);
    expect(state.press()).toBeUndefined();
    expect(state.update(120)).toBe(2);
    state.update(280);
    expect(state.press()).toBe(3);
    expect([state.damageFor(25, 1), state.damageFor(25, 2), state.damageFor(25, 3)]).toEqual([25, 30, 40]);
  });

  it('consume el buffer de 150 ms al terminar el golpe actual', () => {
    const state = combo();
    state.press();
    state.update(100);
    expect(state.press()).toBeUndefined();
    expect(state.update(120)).toBe(2);
  });

  it('reinicia al primer golpe después de vencer la ventana de combo', () => {
    const state = combo();
    expect(state.press()).toBe(1);
    state.update(220);
    state.update(501);
    expect(state.press()).toBe(1);
  });

  it('bloquea ataques simultáneos y solo permite cancelar con dash después del inicio seguro', () => {
    const state = combo();
    state.press();
    state.update(89);
    expect(state.canCancelWithDash).toBe(false);
    expect(state.cancelByDash()).toBe(false);
    expect(state.press()).toBeUndefined();
    state.update(1);
    expect(state.cancelByDash()).toBe(true);
    expect(state.active).toBe(false);
    expect(state.press()).toBe(1);
  });
});

describe('vida del muñeco', () => {
  it('entra en derrota a cero, ignora golpes y recupera toda la vida tras dos segundos', () => {
    const health = new TrainingDummyHealth(50, 2000);
    expect(health.takeDamage(30)).toEqual({ applied: 30, defeated: false });
    expect(health.takeDamage(30)).toEqual({ applied: 20, defeated: true });
    expect(health.takeDamage(10)).toEqual({ applied: 0, defeated: true });
    health.update(1999);
    expect(health.hp).toBe(0);
    health.update(1);
    expect(health.hp).toBe(50);
    expect(health.defeated).toBe(false);
  });
});
