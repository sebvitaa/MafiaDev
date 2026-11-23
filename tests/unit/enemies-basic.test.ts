import { describe, expect, it } from 'vitest';
import definitions from '../../src/data/enemies.json';
import { Health } from '../../src/combat/Health';
import { balance, playerMaxHp, playerSwordDamage } from '../../src/combat/balance';
import { EnemyBrain } from '../../src/enemies/EnemyBrain';
import { lineClear, nextWaypoint } from '../../src/enemies/navigation';
import { DashMotion } from '../../src/player/states/DashMotion';

describe('balance de enemigos básicos', () => {
  it('usa una escala de puntos compatible con los stats actuales y los tres golpes de espada', () => {
    expect(playerMaxHp({ maxHp: 5 })).toBe(125);
    expect(playerSwordDamage({ atk: 2 })).toBe(25);
    expect([definitions.slime.hp, definitions.cobrador.hp, definitions.knight.hp]).toEqual([50, 100, 150]);
    expect([definitions.slime.dmg, definitions.cobrador.dmg, definitions.knight.dmg]).toEqual([25, 25, 50]);
    expect([definitions.slime, definitions.cobrador, definitions.knight].map((def) => Math.ceil(def.hp / 25))).toEqual([2, 4, 6]);
  });

  it('no aplica daño por frame durante protección y notifica una sola muerte', () => {
    const health = new Health(125, balance.hurtInvulnerabilityMs);
    expect(health.damage(25)).toEqual({ applied: 25, killed: false });
    for (let i = 0; i < 20; i++) { health.update(20); expect(health.damage(50).applied).toBe(0); }
    expect(health.hp).toBe(100);
    health.update(199);
    expect(health.damage(50).applied).toBe(0);
    health.update(1);
    expect(health.damage(50).applied).toBe(50);
    health.update(600);
    expect(health.damage(1000)).toEqual({ applied: 50, killed: true });
    expect(health.damage(1000)).toEqual({ applied: 0, killed: false });
    expect(health.hp).toBe(0);
  });

  it('ignora daño negativo/no finito y no da inmortalidad al enemigo entre golpes de combo', () => {
    const health = new Health(100);
    expect(health.damage(NaN).applied).toBe(0);
    expect(health.damage(-5).applied).toBe(0);
    health.damage(25); health.damage(30); health.damage(40);
    expect(health.hp).toBe(5);
  });

  it('interrumpir un dash por daño no lo reanuda ni elimina su recuperación', () => {
    const dash = new DashMotion({ durationMs: 150, invulnerableMs: 0 });
    dash.tryStart(1, 650);
    dash.update(50);
    expect(dash.cancel()).toBe(true);
    expect(dash.active).toBe(false);
    expect(dash.cooldownRemainingMs).toBe(650);
    expect(dash.tryStart(1, 650)).toBe(false);
    dash.update(650);
    expect(dash.tryStart(1, 650)).toBe(true);
  });
});

describe('IA de enemigos', () => {
  it('anticipa y fija dirección, permite un solo impacto y deja recuperación', () => {
    const brain = new EnemyBrain(definitions.slime);
    const origin = { x: 0, y: 0 };
    brain.update(16, origin, { x: 500, y: 0 }, true);
    expect(brain.state).toBe('idle');
    brain.update(16, origin, { x: 100, y: 0 }, true);
    expect(brain.state).toBe('chase');
    brain.update(16, origin, { x: 30, y: 0 }, true);
    expect(brain.state).toBe('windup');
    brain.update(349, origin, { x: -30, y: 0 }, true);
    expect(brain.state).toBe('windup');
    expect(brain.facing.x).toBe(1);
    brain.update(1, origin, { x: -30, y: 0 }, true);
    expect(brain.canStrike).toBe(true);
    brain.consumeHit();
    expect(brain.canStrike).toBe(false);
    brain.update(definitions.slime.activeMs, origin, { x: -30, y: 0 }, true);
    expect(brain.state).toBe('recovery');
    brain.update(definitions.slime.recoveryMs, origin, { x: -30, y: 0 }, true);
    expect(brain.state).toBe('chase');
  });

  it('no ataca detrás de pared; un frame largo no salta el impacto y morir es terminal', () => {
    const brain = new EnemyBrain(definitions.cobrador);
    brain.update(16, { x: 0, y: 0 }, { x: 20, y: 0 }, false);
    expect(brain.state).toBe('chase');
    brain.update(16, { x: 0, y: 0 }, { x: 20, y: 0 }, true);
    brain.update(2000, { x: 0, y: 0 }, { x: 20, y: 0 }, true);
    expect(brain.canStrike).toBe(true);
    brain.die();
    brain.update(5000, { x: 0, y: 0 }, { x: 20, y: 0 }, true);
    expect(brain.state).toBe('dead');
    expect(brain.canStrike).toBe(false);
  });

  it('el Cobrador se interrumpe con golpes; el knight conserva su ataque anticipado', () => {
    for (const def of [definitions.cobrador, definitions.knight]) {
      const brain = new EnemyBrain(def);
      brain.update(16, { x: 0, y: 0 }, { x: 20, y: 0 }, true);
      brain.hurt();
      expect(brain.state).toBe(def.armored ? 'windup' : 'hurt');
    }
  });
});

describe('navegación y obstáculos', () => {
  it('elige un rodeo visible sin atravesar el pilar y alcanza el objetivo por sus esquinas', () => {
    const solids = [{ x: 40, y: -20, width: 20, height: 40 }];
    const bounds = { x: -100, y: -100, width: 400, height: 400 };
    const target = { x: 100, y: 0 };
    let current = { x: 0, y: 0 };
    expect(lineClear(current, target, solids)).toBe(false);
    for (let i = 0; i < 6 && current !== target; i++) {
      const next = nextWaypoint(current, target, solids, bounds, 5)!;
      expect(next).not.toBeNull();
      expect(lineClear(current, next, solids, 5)).toBe(true);
      current = next;
    }
    expect(current).toBe(target);
  });
});
