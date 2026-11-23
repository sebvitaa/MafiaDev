import { describe, expect, it } from 'vitest';
import { MarkStore, findLanding, overlaps, segmentHit } from '../../src/abilities/markGeometry';

describe('red de marcas de teletransporte', () => {
  it('mantiene las teclas 1–4 al reemplazar la marca más antigua', () => {
    const store = new MarkStore(4);
    for (let i = 0; i < 4; i++) store.add({ x: i * 50, y: 50 });
    const second = store.bySlot(1);
    const fifth = store.add({ x: 400, y: 50 }).mark;
    expect(fifth.slot).toBe(0);
    expect(store.bySlot(0)).toBe(fifth);
    expect(store.bySlot(1)).toBe(second);
    expect(store.marks.map((mark) => mark.slot).sort()).toEqual([0, 1, 2, 3]);
  });

  it('deja libre la tecla de una marca retirada y la reutiliza sin cambiar las demás', () => {
    const store = new MarkStore(4);
    for (let i = 0; i < 4; i++) store.add({ x: i * 50, y: 50 });
    const third = store.bySlot(2)!;
    store.remove(store.bySlot(1)!.id);
    expect(store.bySlot(1)).toBeUndefined();
    expect(store.bySlot(2)).toBe(third);
    const replacement = store.add({ x: 500, y: 50 }).mark;
    expect(replacement.slot).toBe(1);
    expect(store.bySlot(2)).toBe(third);
  });

  it('cuenta papeles en vuelo y reemplaza la marca más antigua al lanzar la quinta', () => {
    const store = new MarkStore(4);
    for (let i = 0; i < 4; i++) store.add({ x: i * 10, y: 50 });
    const fifth = store.add({ x: 100, y: 100 });
    expect(fifth.removed?.id).toBe(1);
    expect(store.marks.map((mark) => mark.id)).toEqual([2, 3, 4, 5]);
  });

  it('solo selecciona marcas aterrizadas cercanas y permite reutilizarlas', () => {
    const store = new MarkStore(4);
    const flying = store.add({ x: 20, y: 20 }).mark;
    const landed = store.add({ x: 30, y: 20 }).mark;
    landed.landed = true;
    expect(store.nearest(flying, 15)).toBe(landed);
    expect(store.nearest(landed, 15)).toBe(landed);
    expect(store.nearest({ x: 300, y: 20 }, 15)).toBeUndefined();
    expect(store.marks).toHaveLength(2);
  });

  it('detecta paredes finas y enemigos entre frames del proyectil', () => {
    expect(segmentHit({ x: 0, y: 10 }, { x: 100, y: 10 }, { x: 51, y: 0, width: 1, height: 20 })).toBeCloseTo(0.51);
    expect(segmentHit({ x: 0, y: 50 }, { x: 100, y: 50 }, { x: 51, y: 0, width: 1, height: 20 })).toBeNull();
    expect(segmentHit({ x: 10, y: 0 }, { x: 10, y: 100 }, { x: 0, y: 50, width: 20, height: 20 }, 4)).toBeCloseTo(0.46);
    const wall = { x: 0, y: 0, width: 20, height: 20 };
    expect(segmentHit({ x: 10, y: 24 }, { x: 40, y: 50 }, wall, 4)).toBeNull();
    expect(segmentHit({ x: 10, y: 24 }, { x: 10, y: 10 }, wall, 4)).toBe(0);
  });

  it('busca una llegada libre junto a una pared o enemigo y respeta los límites', () => {
    const wall = { x: 80, y: 40, width: 20, height: 20 };
    const size = { width: 14, height: 8 };
    const bounds = { x: 0, y: 0, width: 200, height: 100 };
    const result = findLanding({ x: 78, y: 50 }, size, bounds, [wall], 48, 4)!;
    expect(result).not.toBeNull();
    expect(overlaps({ x: result.x - 7, y: result.y - 4, ...size }, wall)).toBe(false);
    expect(findLanding({ x: 0, y: 0 }, size, bounds, [], 48, 4)).not.toBeNull();
    expect(findLanding({ x: 100, y: 50 }, size, bounds, [bounds], 48, 4)).toBeNull();
  });
});
