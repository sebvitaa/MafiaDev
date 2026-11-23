import { describe, expect, it } from 'vitest';
import { createTutorial, formatStep, TUTORIAL_STEPS } from '../../src/ui/tutorial/steps';
import type { Action } from '../../src/core/Input';

// Copia local: src/core/Input importa Phaser y los unit tests no lo cargan (AGENTS.md §1).
const BINDINGS: Record<Action, string[]> = {
  left: ['LEFT'], right: ['RIGHT'], up: ['UP'], down: ['DOWN'], jump: ['SPACE'], attack: ['X'],
  dash: ['C'], parry: ['V'], ability: ['Q'], pause: ['ESC'],
};

describe('tutorial', () => {
  it('solo enseña acciones implementadas en el jugador cenital', () => {
    expect(TUTORIAL_STEPS.map(s => s.id)).toEqual(['move', 'jump', 'attack', 'dash', 'rain', 'ability']);
    expect(TUTORIAL_STEPS.some(s => /bloque|parry|contraata/i.test(s.text))).toBe(false);
    expect(TUTORIAL_STEPS.find(s => s.id === 'attack')!.text).toContain('CLIC IZQUIERDO');
  });
  it('recorre los pasos con eventos y tiempo de input', () => {
    const t = createTutorial();
    expect(t.start().id).toBe('move');
    expect(t.onHeld(['right'], 300)).toBe(false);
    expect(t.onHeld(['left'], 250)).toBe(true);
    expect(t.current?.id).toBe('jump');
    expect(t.onEvent('player:jump', { air: true })).toBe(false); // primero desde el suelo
    expect(t.onEvent('player:jump', { air: false })).toBe(false);
    expect(t.onEvent('player:jump', { air: true })).toBe(true);
    expect(t.onEvent('player:attack', { combo: 2 })).toBe(false);
    expect(t.onEvent('player:attack', { combo: 3 })).toBe(true);
    expect(t.onEvent('player:dash', {})).toBe(true);
    expect(t.onEvent('player:parry', { success: false })).toBe(false);
    expect(t.onEvent('player:parry', { success: true })).toBe(false);
    expect(t.onEvent('ability:used', { id: 'italian_rain' })).toBe(true);
    expect(t.onEvent('ability:used', { id: 'time_stop' })).toBe(true);
    expect(t.status).toBe('done');
    expect(t.current).toBeNull();
  });

  it('ignora eventos de otros pasos y se puede saltar', () => {
    const t = createTutorial();
    t.start();
    expect(t.onEvent('player:dash', {})).toBe(false);
    t.skip();
    expect(t.status).toBe('done');
  });

  it('muestra las teclas reales de BINDINGS', () => {
    expect(formatStep(TUTORIAL_STEPS[2].text, BINDINGS)).toBe('[CLIC IZQUIERDO] Atacar · encadena 3 golpes');
    expect(formatStep('{left}{right}', BINDINGS)).toBe('[←][→]');
  });
});
