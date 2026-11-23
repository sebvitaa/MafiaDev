import { describe, expect, it } from 'vitest';
import { SwordHitTracker, type SwordDamageTarget } from '../../src/player/room-prototype/SwordCombat';

function target(id: string, x: number, y: number, radius = 8) {
  let hp = 100;
  let hitCount = 0;
  const value: SwordDamageTarget = {
    id, x, y, radius,
    takeSwordDamage: (damage) => { hp -= damage; hitCount++; },
  };
  return { value, get hp() { return hp; }, get hitCount() { return hitCount; } };
}

describe('hitbox direccional de espada', () => {
  it('daña solo objetivos dentro del alcance y sector frontal', () => {
    const tracker = new SwordHitTracker();
    const front = target('front', 52, 0);
    const behind = target('behind', -15, 0);
    const side = target('side', 25, 40);
    const far = target('far', 100, 0);
    tracker.beginSwing();

    expect(tracker.apply({ x: 0, y: 0 }, { x: 1, y: 0 },
      [front.value, behind.value, side.value, far.value], 72, 38, 25)).toEqual(['front']);
    expect([front.hp, behind.hp, side.hp, far.hp]).toEqual([75, 100, 100, 100]);
  });

  it('cada objetivo recibe como máximo un impacto durante el mismo ataque', () => {
    const tracker = new SwordHitTracker();
    const dummy = target('dummy', 40, 0);
    const args = [{ x: 0, y: 0 }, { x: 1, y: 0 }, [dummy.value], 72, 38, 25] as const;
    tracker.beginSwing();
    expect(tracker.apply(...args)).toEqual(['dummy']);
    expect(tracker.apply(...args)).toEqual([]);
    expect(dummy.hitCount).toBe(1);
    tracker.beginSwing();
    expect(tracker.apply(...args)).toEqual(['dummy']);
    expect(dummy.hitCount).toBe(2);
  });

  it('normaliza la dirección y admite un objetivo tocando el borde del alcance', () => {
    const tracker = new SwordHitTracker();
    const boundary = target('boundary', 80, 0, 8);
    tracker.beginSwing();
    expect(tracker.apply({ x: 0, y: 0 }, { x: 4, y: 0 }, [boundary.value], 72, 38, 10))
      .toEqual(['boundary']);
  });
});
