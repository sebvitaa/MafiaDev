import { describe, expect, it } from 'vitest';
import { ObstacleSnapshot } from '../../src/enemies/ObstacleSnapshot';
import { lineClear, nextWaypoint } from '../../src/enemies/navigation';

describe('shared navigation geometry', () => {
  it('reuses unchanged geometry but invalidates moved, resized, disabled and removed obstacles', () => {
    const snapshot = new ObstacleSnapshot();
    const bodies = [{ x: 40, y: -20, width: 20, height: 40, enable: true }];
    const first = snapshot.read(bodies);
    expect(snapshot.read(bodies)).toBe(first);
    bodies[0].x = 50;
    const moved = snapshot.read(bodies);
    expect(moved).not.toBe(first);
    expect(first[0].x).toBe(40);
    bodies[0].width = 30;
    const resized = snapshot.read(bodies);
    expect(resized[0].width).toBe(30);
    expect(resized).not.toBe(moved);
    bodies[0].enable = false;
    expect(snapshot.read(bodies)).toEqual([]);
    bodies[0].enable = true;
    expect(snapshot.read(bodies)).toHaveLength(1);
    bodies.length = 0;
    expect(snapshot.read(bodies)).toEqual([]);
  });

  it('keeps cached routes safe and rebuilds them when a passage changes', () => {
    const snapshot = new ObstacleSnapshot();
    const bodies = [{ x: 40, y: -20, width: 20, height: 40, enable: true }];
    const bounds = { x: -100, y: -100, width: 400, height: 400 };
    const target = { x: 100, y: 0 };
    const obstacles = snapshot.read(bodies);
    for (let run = 0; run < 3; run++) {
      let current = { x: 0, y: 0 };
      for (let step = 0; step < 8 && current !== target; step++) {
        const next = nextWaypoint(current, target, obstacles, bounds, 5);
        expect(next).not.toBeNull();
        expect(lineClear(current, next!, obstacles, 5)).toBe(true);
        current = next!;
      }
      expect(current).toBe(target);
    }
    bodies[0].enable = false;
    expect(nextWaypoint({ x: 0, y: 0 }, target, snapshot.read(bodies), bounds, 5)).toBe(target);
  });

  it('rejects a sealed route and checks segment boundaries with padding', () => {
    const bounds = { x: 0, y: 0, width: 200, height: 200 };
    const wall = [{ x: 90, y: 0, width: 20, height: 200 }];
    expect(nextWaypoint({ x: 40, y: 100 }, { x: 160, y: 100 }, wall, bounds, 5)).toBeNull();
    expect(lineClear({ x: 0, y: -3 }, { x: 100, y: -3 }, [{ x: 40, y: 0, width: 20, height: 20 }], 5)).toBe(false);
  });
});
