import type { Rect } from '../abilities/markGeometry';

/** Immutable geometry shared by every enemy. Keep its identity while nothing changes. */
export class ObstacleSnapshot {
  private rectangles: readonly Rect[] = [];

  read(bodies: Iterable<Rect & { enable: boolean }>): readonly Rect[] {
    let index = 0;
    let next: Rect[] | undefined;
    for (const body of bodies) {
      if (!body.enable) continue;
      const old = this.rectangles[index];
      if (!next && (!old || old.x !== body.x || old.y !== body.y
        || old.width !== body.width || old.height !== body.height)) {
        next = this.rectangles.slice(0, index);
      }
      if (next) next.push({ x: body.x, y: body.y, width: body.width, height: body.height });
      index++;
    }
    if (next) this.rectangles = next;
    else if (index !== this.rectangles.length) this.rectangles = this.rectangles.slice(0, index);
    return this.rectangles;
  }
}
