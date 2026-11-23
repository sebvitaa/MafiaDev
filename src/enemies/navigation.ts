import { segmentHit, type Point, type Rect } from '../abilities/markGeometry';

export function lineClear(from: Point, to: Point, obstacles: readonly Rect[], padding = 0): boolean {
  return obstacles.every((rect) => segmentHit(from, to, rect, padding) === null);
}

/** Grafo de visibilidad pequeño: rodea las huellas estáticas del laboratorio. */
export function nextWaypoint(from: Point, target: Point, obstacles: readonly Rect[], bounds: Rect, radius: number): Point | null {
  // Huella del cuerpo: ancho 2r, alto r. No confundirla con la altura del dibujo.
  const inflated = obstacles.map((rect) => ({ x: rect.x - radius - 2, y: rect.y - radius / 2 - 2,
    width: rect.width + radius * 2 + 4, height: rect.height + radius + 4 }));
  for (const rect of inflated) {
    if (from.x <= rect.x || from.x >= rect.x + rect.width || from.y <= rect.y || from.y >= rect.y + rect.height) continue;
    // Salir del pequeño margen de navegación si otra colisión nos empujó hacia un pilar.
    return [
      { x: rect.x - 1, y: from.y }, { x: rect.x + rect.width + 1, y: from.y },
      { x: from.x, y: rect.y - 1 }, { x: from.x, y: rect.y + rect.height + 1 },
    ].sort((a, b) => Math.hypot(a.x - from.x, a.y - from.y) - Math.hypot(b.x - from.x, b.y - from.y))[0];
  }
  if (lineClear(from, target, inflated)) return target;
  const nodes: Point[] = [from, target];
  for (const rect of inflated) {
    for (const x of [rect.x - 1, rect.x + rect.width + 1]) {
      for (const y of [rect.y - 1, rect.y + rect.height + 1]) {
        if (x < bounds.x + radius || x > bounds.x + bounds.width - radius
          || y < bounds.y + radius || y > bounds.y + bounds.height - radius) continue;
        if (inflated.some((r) => x > r.x && x < r.x + r.width && y > r.y && y < r.y + r.height)) continue;
        nodes.push({ x, y });
      }
    }
  }
  const distance = nodes.map(() => Infinity), previous = nodes.map(() => -1);
  const visited = new Set<number>();
  distance[0] = 0;
  while (visited.size < nodes.length) {
    let current = -1;
    for (let i = 0; i < nodes.length; i++) {
      if (!visited.has(i) && (current < 0 || distance[i] < distance[current])) current = i;
    }
    if (current < 0 || !Number.isFinite(distance[current])) return null;
    if (current === 1) break;
    visited.add(current);
    for (let i = 0; i < nodes.length; i++) {
      if (visited.has(i) || i === current || !lineClear(nodes[current], nodes[i], inflated)) continue;
      const candidate = distance[current] + Math.hypot(nodes[i].x - nodes[current].x, nodes[i].y - nodes[current].y);
      if (candidate < distance[i]) { distance[i] = candidate; previous[i] = current; }
    }
  }
  let index = 1;
  while (previous[index] > 0) index = previous[index];
  return previous[index] === 0 ? nodes[index] : null;
}
