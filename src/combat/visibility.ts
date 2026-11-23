import Phaser from 'phaser';
import { lineClear } from '../enemies/navigation';
import type { Point, Rect } from '../abilities/markGeometry';

/** Include tile collisions as well as prop footprints; never use the visual sprite as a wall. */
export function combatLineClear(scene: Phaser.Scene, from: Point, to: Point): boolean {
  const walls: Rect[] = [...scene.physics.world.staticBodies].filter(body => body.enable);
  const x = Math.min(from.x, to.x) - 1, y = Math.min(from.y, to.y) - 1;
  for (const child of scene.children.list) {
    if (!(child instanceof Phaser.Tilemaps.TilemapLayer)) continue;
    for (const tile of child.getTilesWithinWorldXY(x, y, Math.abs(to.x - from.x) + 2,
      Math.abs(to.y - from.y) + 2, { isColliding: true })) {
      walls.push({ x: tile.pixelX + child.x, y: tile.pixelY + child.y, width: tile.width, height: tile.height });
    }
  }
  return lineClear(from, to, walls);
}
