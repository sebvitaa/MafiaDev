export class VisitedGrid {
  private readonly cells: Uint8Array;

  constructor(
    readonly cols: number,
    readonly rows: number,
    readonly cellPx: number,
  ) {
    this.cells = new Uint8Array(cols * rows);
  }

  mark(x: number, y: number): boolean {
    const cx = Math.floor(x / this.cellPx);
    const cy = Math.floor(y / this.cellPx);

    if (!this.inBounds(cx, cy)) return false;

    const index = cy * this.cols + cx;
    if (this.cells[index]) return false;

    this.cells[index] = 1;
    return true;
  }

  has(cx: number, cy: number): boolean {
    return this.inBounds(cx, cy) && this.cells[cy * this.cols + cx] === 1;
  }

  get count(): number {
    let count = 0;
    for (const cell of this.cells) count += cell;
    return count;
  }

  toKeys(): string[] {
    const keys: string[] = [];
    for (let cy = 0; cy < this.rows; cy += 1) {
      for (let cx = 0; cx < this.cols; cx += 1) {
        if (this.has(cx, cy)) keys.push(`${cx},${cy}`);
      }
    }
    return keys;
  }

  static fromKeys(cols: number, rows: number, cellPx: number, keys: readonly string[]): VisitedGrid {
    const grid = new VisitedGrid(cols, rows, cellPx);
    for (const key of keys) {
      const match = /^(\d+),(\d+)$/.exec(key);
      if (!match) continue;

      const cx = Number(match[1]);
      const cy = Number(match[2]);
      if (grid.inBounds(cx, cy)) grid.cells[cy * cols + cx] = 1;
    }
    return grid;
  }

  private inBounds(cx: number, cy: number): boolean {
    return Number.isInteger(cx) && Number.isInteger(cy) && cx >= 0 && cx < this.cols && cy >= 0 && cy < this.rows;
  }
}
