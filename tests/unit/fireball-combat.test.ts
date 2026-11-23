import { describe, expect, it } from 'vitest';
import { FireballBlast, FireballTimeline, type FireballDamageTarget } from '../../src/player/room-prototype/FireballCombat';

describe('trayectoria y cooldown de bola de fuego', () => {
  it('impacta exactamente a los 600 ms y no vuelve a emitir impacto durante la explosión', () => {
    const fireball = new FireballTimeline({ fallMs: 600, explosionMs: 300, cooldownMs: 7000 });
    expect(fireball.beginAim()).toBe(true);
    expect(fireball.releaseAim()).toBe(true);
    expect(fireball.update(599)).toBe(false);
    expect(fireball.phase).toBe('falling');
    expect(fireball.update(1)).toBe(true);
    expect(fireball.phase).toBe('exploding');
    expect(fireball.update(300)).toBe(false);
    expect(fireball.phase).toBe('idle');
  });

  it('bloquea nuevos apuntados hasta completar los 7 segundos de cooldown', () => {
    const fireball = new FireballTimeline({ fallMs: 600, explosionMs: 300, cooldownMs: 7000 });
    fireball.beginAim();
    fireball.releaseAim();
    fireball.update(900);
    expect(fireball.cooldownRemainingMs).toBe(6100);
    expect(fireball.beginAim()).toBe(false);
    fireball.update(6099);
    expect(fireball.beginAim()).toBe(false);
    fireball.update(1);
    expect(fireball.cooldownRemainingMs).toBe(0);
    expect(fireball.beginAim()).toBe(true);
  });
});

describe('explosión de bola de fuego', () => {
  it('aplica 2× de daño solo a blancos alcanzados y una vez por objetivo', () => {
    const blast = new FireballBlast();
    const hit = makeTarget('hit', 50, 0, 8);
    const edge = makeTarget('edge', 64, 0, 8);
    const outside = makeTarget('outside', 70, 0, 8);
    const targets = [hit.value, edge.value, outside.value];

    expect(blast.apply({ x: 0, y: 0 }, targets, 55, 50)).toEqual(['hit']);
    expect(blast.apply({ x: 0, y: 0 }, targets, 55, 50)).toEqual([]);
    expect([hit.damage, edge.damage, outside.damage]).toEqual([50, 0, 0]);
    expect(hit.direction).toEqual({ x: 1, y: 0 });
  });
});

function makeTarget(id: string, x: number, y: number, radius: number) {
  let damage = 0;
  let direction = { x: 0, y: 0 };
  const value: FireballDamageTarget = {
    id, x, y, radius,
    takeFireDamage: (amount, fromBlast) => { damage += amount; direction = fromBlast; },
  };
  return { value, get damage() { return damage; }, get direction() { return direction; } };
}
