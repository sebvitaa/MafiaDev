import { describe, expect, it } from 'vitest';
import { VisitedGrid } from '../../src/exploration/visited';

describe('VisitedGrid', () => {
  it('marks a cell only once', () => {
    const grid = new VisitedGrid(3, 2, 10);
    expect(grid.mark(15, 5)).toBe(true);
    expect(grid.mark(15, 5)).toBe(false);
    expect(grid.has(1, 0)).toBe(true);
    expect(grid.count).toBe(1);
  });

  it('ignores pixels outside the grid', () => {
    const grid = new VisitedGrid(2, 2, 10);
    expect(grid.mark(-1, 0)).toBe(false);
    expect(grid.mark(20, 0)).toBe(false);
    expect(grid.count).toBe(0);
  });

  it('round-trips visited keys', () => {
    const grid = new VisitedGrid(3, 2, 10);
    grid.mark(0, 0);
    grid.mark(29, 19);

    const restored = VisitedGrid.fromKeys(3, 2, 10, grid.toKeys());
    expect(restored.toKeys()).toEqual(['0,0', '2,1']);
  });

  it('ignores invalid keys', () => {
    const grid = VisitedGrid.fromKeys(2, 2, 10, ['0,0', '2,0', '-1,0', 'nope', '1,1,1']);
    expect(grid.toKeys()).toEqual(['0,0']);
  });
});
