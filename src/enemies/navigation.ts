import { segmentHit, type Point, type Rect } from '../abilities/markGeometry';

export function lineClear(from: Point, to: Point, obstacles: readonly Rect[], padding = 0): boolean {
  const left = Math.min(from.x, to.x) - padding, right = Math.max(from.x, to.x) + padding;
  const top = Math.min(from.y, to.y) - padding, bottom = Math.max(from.y, to.y) + padding;
  for (const rect of obstacles) {
    if (rect.x > right || rect.x + rect.width < left || rect.y > bottom || rect.y + rect.height < top) continue;
    if (segmentHit(from, to, rect, padding) !== null) return false;
  }
  return true;
}

type Graph = { inflated: Rect[]; corners: Point[]; visibility: Uint8Array };
const graphs = new WeakMap<readonly Rect[], Map<string, Graph>>();

/** Inputs are immutable snapshots; a changed obstacle gets a new array and graph. */
function graphFor(obstacles: readonly Rect[], bounds: Rect, radius: number): Graph {
  const key = `${radius}:${bounds.x}:${bounds.y}:${bounds.width}:${bounds.height}`;
  let cache = graphs.get(obstacles);
  if (!cache) { cache = new Map(); graphs.set(obstacles, cache); }
  const cached = cache.get(key);
  if (cached) return cached;
  const inflated = obstacles.map((rect) => ({ x: rect.x - radius - 2, y: rect.y - radius / 2 - 2,
    width: rect.width + radius * 2 + 4, height: rect.height + radius + 4 }));
  const corners: Point[] = [];
  for (const rect of inflated) {
    for (const x of [rect.x - 1, rect.x + rect.width + 1]) {
      for (const y of [rect.y - 1, rect.y + rect.height + 1]) {
        if (x < bounds.x + radius || x > bounds.x + bounds.width - radius
          || y < bounds.y + radius || y > bounds.y + bounds.height - radius) continue;
        if (inflated.some((r) => x > r.x && x < r.x + r.width && y > r.y && y < r.y + r.height)) continue;
        corners.push({ x, y });
      }
    }
  }
  const graph = { inflated, corners, visibility: new Uint8Array(corners.length * corners.length) };
  cache.set(key, graph);
  return graph;
}

/** A* over cached corners; static visibility is computed once, not on every chase tick. */
export function nextWaypoint(from: Point, target: Point, obstacles: readonly Rect[], bounds: Rect, radius: number): Point | null {
  const { inflated, corners, visibility } = graphFor(obstacles, bounds, radius);
  for (const rect of inflated) {
    if (from.x <= rect.x || from.x >= rect.x + rect.width || from.y <= rect.y || from.y >= rect.y + rect.height) continue;
    // Salir del pequeño margen de navegación si otra colisión nos empujó hacia un pilar.
    return [
      { x: rect.x - 1, y: from.y }, { x: rect.x + rect.width + 1, y: from.y },
      { x: from.x, y: rect.y - 1 }, { x: from.x, y: rect.y + rect.height + 1 },
    ].sort((a, b) => Math.hypot(a.x - from.x, a.y - from.y) - Math.hypot(b.x - from.x, b.y - from.y))[0];
  }
  if (lineClear(from, target, inflated)) return target;
  const nodes: Point[] = [from, target, ...corners];
  const distance = nodes.map(() => Infinity), previous = nodes.map(() => -1);
  const heuristic = nodes.map((point) => Math.hypot(point.x - target.x, point.y - target.y));
  const visited = new Set<number>();
  distance[0] = 0;
  while (visited.size < nodes.length) {
    let current = -1;
    for (let i = 0; i < nodes.length; i++) {
      if (!visited.has(i) && (current < 0 || distance[i] + heuristic[i] < distance[current] + heuristic[current])) current = i;
    }
    if (current < 0 || !Number.isFinite(distance[current])) return null;
    if (current === 1) break;
    visited.add(current);
    for (let i = 0; i < nodes.length; i++) {
      if (visited.has(i) || i === current) continue;
      const candidate = distance[current] + Math.hypot(nodes[i].x - nodes[current].x, nodes[i].y - nodes[current].y);
      if (candidate >= distance[i]) continue;
      if (current >= 2 && i >= 2) {
        const a = current - 2, b = i - 2, count = corners.length;
        let visible = visibility[a * count + b];
        if (!visible) {
          visible = lineClear(nodes[current], nodes[i], inflated) ? 2 : 1;
          visibility[a * count + b] = visibility[b * count + a] = visible;
        }
        if (visible === 1) continue;
      } else if (!lineClear(nodes[current], nodes[i], inflated)) continue;
      distance[i] = candidate; previous[i] = current;
    }
  }
  let index = 1;
  while (previous[index] > 0) index = previous[index];
  return previous[index] === 0 ? nodes[index] : null;
}
