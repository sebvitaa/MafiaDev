import { describe, expect, it } from 'vitest';
import { RoomMotion, type RoomInput } from '../../src/player/room-prototype/RoomMotion';

const idle: RoomInput = { x: 0, y: 0, run: false, jumpPressed: false, jumpHeld: true, dashPressed: false };
const make = () => new RoomMotion({ speed: 120, airJumps: 1, dashCooldownMs: 400 });

describe('movilidad de sala independiente', () => {
  it.each([[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]])(
    'normaliza (%s,%s) sin ventaja diagonal y conserva orientación al parar', (x, y) => {
      const motion = make();
      motion.update({ ...idle, x, y }, 100);
      expect(Math.hypot(motion.velocity.x, motion.velocity.y)).toBeCloseTo(150);
      const facing = { ...motion.facing };
      motion.update(idle, 100);
      expect(motion.velocity).toEqual({ x: 0, y: 0 });
      expect(motion.facing).toEqual(facing);
    },
  );

  it('Shift aumenta la rapidez también en diagonal y soltarlo recupera caminar', () => {
    const motion = make();
    motion.update({ ...idle, x: 1, y: 1, run: true }, 150);
    expect(Math.hypot(motion.velocity.x, motion.velocity.y)).toBeCloseTo(247.5);
    motion.update({ ...idle, x: 1 }, 200);
    expect(motion.velocity).toEqual({ x: 150, y: 0 });
  });

  it('dash fija dirección y velocidad sin permitir repetir durante recuperación', () => {
    const motion = make();
    expect(motion.update({ ...idle, x: 1, y: -1, dashPressed: true }, 0).dashed).toBe(true);
    expect(Math.hypot(motion.velocity.x, motion.velocity.y)).toBeCloseTo(540);
    motion.update({ ...idle, x: -1, dashPressed: true }, 100);
    expect(motion.velocity.x).toBeGreaterThan(0);
    expect(motion.velocity.y).toBeLessThan(0);
    motion.update(idle, 50);
    expect(motion.dash.active).toBe(false);
    expect(motion.update({ ...idle, dashPressed: true }, 649).dashed).toBe(false);
    expect(motion.update({ ...idle, dashPressed: true }, 1).dashed).toBe(true);
  });

  it('dash sin dirección usa la última orientación', () => {
    const motion = make();
    motion.update({ ...idle, y: -1 }, 16);
    motion.update({ ...idle, dashPressed: true }, 0);
    expect(motion.velocity).toEqual({ x: 0, y: -540 });
  });

  it('altura balística y velocidad sobre el suelo son independientes', () => {
    const motion = make();
    expect(motion.update({ ...idle, x: 1, y: 1, jumpPressed: true }, 100).jump).toBe('ground');
    expect(motion.height).toBeCloseTo(25.5);
    expect(motion.verticalVelocity).toBeCloseTo(210);
    expect(Math.hypot(motion.velocity.x, motion.velocity.y)).toBeCloseTo(150);
  });

  it('acelera en pocos frames, frena y cambia de dirección sin saltar de velocidad', () => {
    const motion = make();
    motion.update({ ...idle, x: 1 }, 10);
    expect(motion.velocity.x).toBeCloseTo(24);
    motion.update({ ...idle, x: 1 }, 90);
    expect(motion.velocity.x).toBe(150);
    motion.update({ ...idle, x: -1 }, 10);
    expect(motion.velocity.x).toBeCloseTo(120);
    motion.update({ ...idle, x: -1 }, 100);
    expect(motion.velocity.x).toBe(-150);
    motion.update(idle, 10);
    expect(motion.velocity.x).toBeCloseTo(-120);
    motion.update(idle, 50);
    expect(motion.velocity.x).toBe(0);
  });

  it('dash seleccionado por doble tap tiene prioridad y no deja inercia extra al terminar', () => {
    const motion = make();
    const events = motion.update({ ...idle, x: -1, dashPressed: true, dashDirection: { x: 0, y: -1 } }, 0);
    expect(events.dashed).toBe(true);
    expect(motion.state).toBe('dash');
    expect(motion.velocity).toEqual({ x: 0, y: -540 });
    motion.update(idle, 150);
    expect(motion.velocity).toEqual({ x: 0, y: 0 });
    expect(motion.state).toBe('idle');
    expect(motion.dash.cooldownRemainingMs).toBe(650);
  });

  it('permite doble salto, rechaza el tercero y recupera saltos al aterrizar', () => {
    const motion = make();
    motion.update({ ...idle, jumpPressed: true }, 0);
    expect(motion.update({ ...idle, jumpPressed: true }, 0).jump).toBe('air');
    expect(motion.airJumpsRemaining).toBe(0);
    expect(motion.update({ ...idle, jumpPressed: true }, 0).jump).toBeNull();
    expect(motion.update(idle, 1000).landed).toBe(true);
    expect(motion.height).toBe(0);
    expect(motion.airJumpsRemaining).toBe(1);
    motion.update(idle, 1000);
    expect(motion.height).toBe(0);
  });

  it('conserva salto pulsado cerca del aterrizaje y descarta buffers vencidos', () => {
    const buffered = make();
    buffered.update({ ...idle, jumpPressed: true }, 0);
    buffered.update({ ...idle, jumpPressed: true }, 500);
    const events = buffered.update({ ...idle, jumpPressed: true }, 100);
    expect(events.landed).toBe(true);
    expect(events.jump).toBe('ground');
    expect(buffered.height).toBeGreaterThan(0);
    const expired = make();
    expired.update({ ...idle, jumpPressed: true }, 0);
    expired.update({ ...idle, jumpPressed: true }, 0);
    expired.update({ ...idle, jumpPressed: true }, 1000);
    expect(expired.height).toBe(0);
  });

  it('altura no depende de los FPS y soltar acorta el salto una sola vez', () => {
    const coarse = make();
    const fine = make();
    coarse.update({ ...idle, jumpPressed: true }, 100);
    fine.update({ ...idle, jumpPressed: true }, 0);
    for (let i = 0; i < 10; i++) fine.update(idle, 10);
    expect(fine.height).toBeCloseTo(coarse.height);
    coarse.update({ ...idle, jumpHeld: false }, 0);
    expect(coarse.verticalVelocity).toBeCloseTo(178.5);
    coarse.update({ ...idle, jumpHeld: false }, 0);
    expect(coarse.verticalVelocity).toBeCloseTo(178.5);
  });
});
