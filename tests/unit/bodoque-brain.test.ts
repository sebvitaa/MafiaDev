import { describe, expect, it } from 'vitest';
import { BodoqueBrain, isPointInBodoqueAttack, type BodoqueConfig } from '../../src/enemies/BodoqueBrain';
import { SwordHitTracker } from '../../src/player/room-prototype/SwordCombat';
import { FireballBlast } from '../../src/player/room-prototype/FireballCombat';

const config: BodoqueConfig = {
  hp: 600,
  radius: 28,
  idleMs: 100,
  phaseThresholds: [0.66, 0.33],
  heart: { hp: 100, openingMs: 1200, defeatMs: 1600, criticalHp: 23, captionMs: 5500 },
  attacks: {
    microphoneMallet: { windupMs: 500, activeMs: 100, recoveryMs: 200, damage: 10, range: 80, halfAngleDeg: 35, parryable: true },
    cameraFlash: { windupMs: 300, activeMs: 60, recoveryMs: 200, damage: 15, range: 160, halfAngleDeg: 45, parryable: false },
    lastHour: { windupMs: 400, activeMs: 250, recoveryMs: 300, damage: 20, range: 240, halfWidth: 24, distance: 220, parryable: false },
  },
};

describe('BodoqueBrain', () => {
  it('cycles through the three phase-one attacks with telegraph, active and recovery states', () => {
    const brain = new BodoqueBrain(config);
    brain.activate();
    brain.update(100, { x: 100, y: 0 }, { x: 0, y: 0 });
    expect(brain.state).toBe('telegraph');
    expect(brain.currentAttack?.id).toBe('microphoneMallet');
    expect(brain.currentAttack?.parryable).toBe(true);
    brain.update(500, { x: 100, y: 0 }, { x: 0, y: 0 });
    expect(brain.state).toBe('active');
    expect(brain.consumePlayerHit()).toBe(true);
    expect(brain.consumePlayerHit()).toBe(false);
    brain.update(100, { x: 100, y: 0 }, { x: 0, y: 0 });
    expect(brain.state).toBe('recovery');
    brain.update(300, { x: 100, y: 0 }, { x: 0, y: 0 });
    expect(brain.currentAttack?.id).toBe('cameraFlash');
  });

  it('aims the charge at its telegraphed line and exposes phase one without inventing later patterns', () => {
    const brain = new BodoqueBrain(config);
    brain.activate();
    for (let i = 0; i < 2; i++) {
      brain.update(100, { x: 100, y: 0 }, { x: 0, y: 0 });
      brain.update(brain.currentAttack!.config.windupMs, { x: 100, y: 0 }, { x: 0, y: 0 });
      brain.update(brain.currentAttack!.config.activeMs, { x: 100, y: 0 }, { x: 0, y: 0 });
      brain.update(brain.currentAttack!.config.recoveryMs, { x: 100, y: 0 }, { x: 0, y: 0 });
    }
    brain.update(100, { x: 100, y: 0 }, { x: 0, y: 0 });
    expect(brain.currentAttack?.id).toBe('lastHour');
    expect(brain.currentAttack?.destination).toEqual({ x: 220, y: 0 });
    expect(brain.phase).toBe(1);
  });

  it('prepares thresholds at 66% and 33%, then defeats exactly once at zero HP', () => {
    const brain = new BodoqueBrain(config);
    expect(brain.maxHp).toBe(600);
    expect(brain.takeDamage(204).preparedPhases).toEqual([2]);
    expect(brain.takeDamage(198).preparedPhases).toEqual([3]);
    expect(brain.phase).toBe(1);
    expect(brain.takeDamage(198)).toMatchObject({ applied: 98, defeated: false });
    expect(brain.state).toBe('opening');
    expect(brain.phase).toBe(3);
    expect(brain.takeDamage(500, 'heart').applied).toBe(0);
    brain.update(1200, { x: 0, y: 0 }, { x: 0, y: 0 });
    expect(brain.takeDamage(500).applied).toBe(0);
    expect(brain.takeDamage(500, 'heart').applied).toBe(100);
    expect(brain.state).toBe('dying');
    expect(brain.consumeVictory()).toBe(false);
    brain.update(5499, { x: 0, y: 0 }, { x: 0, y: 0 });
    expect(brain.captionVisible).toBe(true);
    expect(brain.state).toBe('dying');
    expect(brain.finalProgress).toBeCloseTo(1, 2);
    brain.update(1, { x: 0, y: 0 }, { x: 0, y: 0 });
    expect(brain.captionVisible).toBe(false);
    expect(brain.state).toBe('defeated');
    expect(brain.consumeVictory()).toBe(true);
    brain.update(10000, { x: 0, y: 0 }, { x: 0, y: 0 });
    expect(brain.consumeVictory()).toBe(false);
    expect(brain.takeDamage(50, 'heart')).toMatchObject({ applied: 0, defeated: true });
  });

  it('clamps overkill at 100, ignores residual damage during opening and triggers ERROR 23 once without immunity', () => {
    const brain = new BodoqueBrain(config);
    brain.activate();
    brain.update(100, { x: 100, y: 0 }, { x: 0, y: 0 });
    expect(brain.takeDamage(10000).applied).toBe(500);
    expect(brain.hp).toBe(100);
    expect(brain.currentAttack).toBeUndefined();
    expect(brain.consumePlayerHit()).toBe(false);
    brain.update(1199, { x: 0, y: 0 }, { x: 0, y: 0 });
    expect(brain.takeDamage(500, 'heart').applied).toBe(0);
    brain.update(1, { x: 0, y: 0 }, { x: 0, y: 0 });
    expect(brain.takeDamage(76, 'heart').criticalTriggered).toBe(false);
    expect(brain.hp).toBe(24);
    expect(brain.takeDamage(1, 'heart').criticalTriggered).toBe(true);
    expect(brain.takeDamage(1, 'heart').criticalTriggered).toBe(false);
    expect(brain.hp).toBe(22);
    brain.update(5500, { x: 0, y: 0 }, { x: 0, y: 0 });
    expect(brain.captionVisible).toBe(false);
    expect(brain.takeDamage(99, 'heart').applied).toBe(22);
    expect(brain.hp).toBe(0);
    brain.update(1599, { x: 0, y: 0 }, { x: 0, y: 0 });
    expect(brain.state).toBe('dying');
    brain.update(1, { x: 0, y: 0 }, { x: 0, y: 0 });
    expect(brain.state).toBe('defeated');
  });

  it('uses sector geometry for the flash and a capsule for the charge path', () => {
    expect(isPointInBodoqueAttack('cameraFlash', { x: 80, y: 0 }, 8, config.attacks.cameraFlash, { x: 0, y: 0 }, { x: 1, y: 0 })).toBe(true);
    expect(isPointInBodoqueAttack('cameraFlash', { x: 40, y: 120 }, 8, config.attacks.cameraFlash, { x: 0, y: 0 }, { x: 1, y: 0 })).toBe(false);
    expect(isPointInBodoqueAttack('lastHour', { x: 110, y: 10 }, 8, config.attacks.lastHour, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 220, y: 0 })).toBe(true);
    expect(isPointInBodoqueAttack('lastHour', { x: 110, y: 60 }, 8, config.attacks.lastHour, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 220, y: 0 })).toBe(false);
  });

  it('requires real core range and deduplicates sword/echo and Italian blast impacts', () => {
    const brain = new BodoqueBrain(config);
    brain.activate();
    brain.takeDamage(9999);
    brain.update(1200, { x: 0, y: 0 }, { x: 0, y: 0 });
    const core = { id: 'bodoque', x: 148, y: 82, radius: 16,
      takeSwordDamage: (damage: number) => { brain.takeDamage(damage, 'heart'); },
      takeFireDamage: (damage: number) => { brain.takeDamage(damage, 'heart'); } };
    const sword = new SwordHitTracker();
    sword.beginSwing();
    sword.apply({ x: 10, y: 82 }, { x: 1, y: 0 }, [core], 72, 40, 25);
    expect(brain.hp).toBe(100);
    sword.apply({ x: 80, y: 82 }, { x: 1, y: 0 }, [core], 72, 40, 25);
    sword.apply({ x: 80, y: 82 }, { x: 1, y: 0 }, [core], 72, 40, 25);
    expect(brain.hp).toBe(75);
    const blast = new FireballBlast();
    blast.apply({ x: 250, y: 82 }, [core], 55, 50);
    expect(brain.hp).toBe(75);
    blast.apply({ x: 148, y: 82 }, [core], 55, 50);
    blast.apply({ x: 148, y: 82 }, [core], 55, 50);
    expect(brain.hp).toBe(25);
  });
});
