import { describe, expect, it } from 'vitest';
import { DashMotion, horizontalSpeed } from '../../src/player/states/DashMotion';

const create = () => new DashMotion({ durationMs: 140, invulnerableMs: 100 });

describe('movilidad lateral', () => {
  it('camina, corre y se detiene usando la velocidad actual del personaje', () => {
    expect(horizontalSpeed(-1, 120, false, 1.65)).toBe(-120);
    expect(horizontalSpeed(1, 120, true, 1.65)).toBe(198);
    expect(horizontalSpeed(0, 120, true, 1.65)).toBe(0);
    expect(horizontalSpeed(1, 150, true, 1.65)).toBe(247.5);
  });
});

describe('dash lateral', () => {
  it('fija dirección, dura lo configurado y limita la invulnerabilidad', () => {
    const dash = create();
    expect(dash.tryStart(-1, 400)).toBe(true);
    expect(dash.direction).toBe(-1);
    expect(dash.active).toBe(true);
    expect(dash.invulnerable).toBe(true);
    dash.update(100);
    expect(dash.active).toBe(true);
    expect(dash.invulnerable).toBe(false);
    dash.update(40);
    expect(dash.active).toBe(false);
    expect(dash.cooldownRemainingMs).toBe(400);
  });

  it('rechaza intentos durante el dash y su recuperación sin cambiar dirección ni reiniciar tiempos', () => {
    const dash = create();
    dash.tryStart(1, 400);
    dash.update(50);
    expect(dash.tryStart(-1, 400)).toBe(false);
    expect(dash.direction).toBe(1);
    dash.update(90);
    expect(dash.tryStart(-1, 400)).toBe(false);
    dash.update(399);
    expect(dash.tryStart(-1, 400)).toBe(false);
    dash.update(1);
    expect(dash.tryStart(-1, 400)).toBe(true);
    expect(dash.direction).toBe(-1);
  });

  it('respeta el cooldown recibido desde CharacterStats y no acumula cargas', () => {
    const dash = create();
    dash.tryStart(1, 700);
    dash.update(839);
    expect(dash.tryStart(1, 700)).toBe(false);
    dash.update(10000);
    expect(dash.invulnerable).toBe(false);
    expect(dash.tryStart(1, 700)).toBe(true);
    expect(dash.tryStart(1, 700)).toBe(false);
  });

  it('la recuperación es independiente de la frecuencia de actualización', () => {
    const coarse = create();
    const fine = create();
    coarse.tryStart(1, 400);
    fine.tryStart(1, 400);
    coarse.update(200);
    for (let i = 0; i < 20; i++) fine.update(10);
    expect(coarse.active).toBe(false);
    expect(coarse.cooldownRemainingMs).toBe(340);
    expect(fine.cooldownRemainingMs).toBe(340);
  });
});
