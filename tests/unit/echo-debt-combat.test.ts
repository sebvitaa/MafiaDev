import { describe, expect, it } from 'vitest';
import { DebtMarkLedger, EchoReplayWindow, type EchoableSwordSwing } from '../../src/player/room-prototype/EchoDebtCombat';
import { FireballBlast, type FireballDamageTarget } from '../../src/player/room-prototype/FireballCombat';

describe('eco del reverso', () => {
  it('repite una vez el mismo ataque desde el inicio del dash con retraso y daño escalado', () => {
    const echo = new EchoReplayWindow(800, 120, 0.35);
    echo.startDash({ x: 30, y: 45, height: 6 });
    const swing = swordSwing({ attack: 2, damage: 30 });
    expect(echo.recordSwing(swing)).toBe(true);
    expect(echo.recordSwing(swordSwing({ attack: 3 }))).toBe(false);
    expect(echo.update(119)).toBeUndefined();
    expect(echo.update(1)).toEqual({ ...swing, origin: { x: 30, y: 45, height: 6 }, damage: 11 });
    expect(echo.recordSwing(swing)).toBe(false);
  });

  it('solo acepta ataques durante los 800 ms, pero completa el retraso ya activado', () => {
    const echo = new EchoReplayWindow(800, 120, 0.35);
    echo.startDash({ x: 4, y: 5, height: 0 });
    echo.update(770);
    expect(echo.visible).toBe(true);
    expect(echo.recordSwing(swordSwing())).toBe(true);
    expect(echo.update(30)).toBeUndefined();
    expect(echo.visible).toBe(false);
    expect(echo.update(120)?.origin).toEqual({ x: 4, y: 5, height: 0 });
    expect(echo.recordSwing(swordSwing())).toBe(false);
  });

  it('conserva tipo, dirección, alcance y ventana de un golpe cargado', () => {
    const echo = new EchoReplayWindow(800, 120, 0.35);
    echo.startDash({ x: 12, y: 18, height: 0 });
    const charged = swordSwing({ attack: 'charged', range: 108, halfAngleDeg: 46,
      durationMs: 480, hitWindowMs: 190, travel: 32, damage: 50 });
    echo.recordSwing(charged);
    const replay = echo.update(120)!;
    expect(replay).toMatchObject({ attack: 'charged', range: 108, halfAngleDeg: 46,
      durationMs: 480, hitWindowMs: 190, travel: 32, damage: 18,
      direction: { x: 1, y: 0 }, origin: { x: 12, y: 18, height: 0 } });
  });
});

describe('marcas de deuda', () => {
  it('limita marcas a tres por objetivo, expira cada una a los cuatro segundos y permite consumirlas', () => {
    const ledger = new DebtMarkLedger(3, 4000);
    expect(ledger.add('dummy')).toBe(true);
    ledger.update(1000);
    expect(ledger.add('dummy')).toBe(true);
    expect(ledger.add('dummy')).toBe(true);
    expect(ledger.add('dummy')).toBe(false);
    expect(ledger.count('dummy')).toBe(3);
    expect(ledger.count('other')).toBe(0);
    ledger.update(3000);
    expect(ledger.count('dummy')).toBe(2);
    expect(ledger.consume('dummy')).toBe(2);
    expect(ledger.count('dummy')).toBe(0);
  });

  it('consume marcas solo del objetivo alcanzado y suma bonus al daño en un solo impacto', () => {
    const blast = new FireballBlast();
    const marked = markedTarget('marked', 15, 20, 5, 2);
    const outside = markedTarget('outside', 100, 20, 5, 3);
    expect(blast.apply({ x: 0, y: 0 }, [marked.value, outside.value], 55, 50, 10))
      .toEqual(['marked']);
    expect(marked.damage).toEqual([70]);
    expect(marked.remaining).toBe(0);
    expect(marked.detonations).toEqual([2]);
    expect(outside.remaining).toBe(3);
    expect(outside.damage).toEqual([]);
  });
});

function swordSwing(overrides: Partial<EchoableSwordSwing> = {}): EchoableSwordSwing {
  return {
    attack: 1, origin: { x: 99, y: 99, height: 0 }, direction: { x: 1, y: 0 },
    damage: 25, range: 72, halfAngleDeg: 32, knockback: 0, durationMs: 220,
    hitWindowMs: 90, travel: 7, ease: 'Cubic.Out',
    ...overrides,
  };
}

function markedTarget(id: string, x: number, y: number, radius: number, initialMarks: number) {
  let remaining = initialMarks;
  const damage: number[] = [];
  const detonations: number[] = [];
  const value: FireballDamageTarget = {
    id, x, y, radius,
    consumeDebtMarks: () => { const used = remaining; remaining = 0; return used; },
    onDebtDetonated: (stacks) => detonations.push(stacks),
    takeFireDamage: (amount) => damage.push(amount),
  };
  return { value, damage, detonations, get remaining() { return remaining; } };
}
