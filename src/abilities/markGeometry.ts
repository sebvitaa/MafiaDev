// Lógica pura: selección de marcas, barrido de proyectiles y destinos seguros.
export interface Point { x: number; y: number }
export interface Rect extends Point { width: number; height: number }
export interface Mark extends Point { id: number; slot: number; landed: boolean }

export class MarkStore {
  readonly marks: Mark[] = [];
  private nextId = 1;

  constructor(private readonly capacity: number) {}

  add(position: Point): { mark: Mark; removed?: Mark } {
    const removed = this.marks.length >= this.capacity ? this.marks.shift() : undefined;
    // SUP-alejandro-20261123-123733: el número no cambia al retirar otras marcas.
    const slot = removed?.slot ?? Array.from({ length: this.capacity }, (_, index) => index)
      .find((index) => !this.marks.some((mark) => mark.slot === index))!;
    const mark = { ...position, id: this.nextId++, slot, landed: false };
    this.marks.push(mark);
    return { mark, removed };
  }

  remove(id: number): void {
    const index = this.marks.findIndex((mark) => mark.id === id);
    if (index >= 0) this.marks.splice(index, 1);
  }

  bySlot(slot: number): Mark | undefined {
    return this.marks.find((mark) => mark.slot === slot);
  }

  nearest(point: Point, radius: number): Mark | undefined {
    let result: Mark | undefined;
    let distance = radius;
    for (const mark of this.marks) {
      const next = Math.hypot(mark.x - point.x, mark.y - point.y);
      if (mark.landed && next <= distance) { result = mark; distance = next; }
    }
    return result;
  }
}

/** Segmento contra AABB expandida: evita saltarse un enemigo/pared con un frame largo. */
export function segmentHit(from: Point, to: Point, rect: Rect, padding = 0): number | null {
  let enter = 0;
  let leave = 1;
  for (const axis of ['x', 'y'] as const) {
    const delta = to[axis] - from[axis];
    const min = rect[axis] - padding;
    const max = rect[axis] + (axis === 'x' ? rect.width : rect.height) + padding;
    if (Math.abs(delta) < 1e-9) {
      if (from[axis] < min || from[axis] > max) return null;
      continue;
    }
    const a = (min - from[axis]) / delta;
    const b = (max - from[axis]) / delta;
    enter = Math.max(enter, Math.min(a, b));
    leave = Math.min(leave, Math.max(a, b));
    if (enter > leave) return null;
  }
  // Un papel en contacto que se aleja del sólido debe poder salir, no quedarse pegado.
  return leave <= 1e-9 ? null : enter;
}

export function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x
    && a.y < b.y + b.height && a.y + a.height > b.y;
}

/** Devuelve el centro del cuerpo, nunca una posición incrustada en un sólido. */
export function findLanding(
  desired: Point, size: { width: number; height: number }, bounds: Rect,
  obstacles: readonly Rect[], searchRadius: number, step: number,
): Point | null {
  const valid = (point: Point) => {
    const body = { x: point.x - size.width / 2, y: point.y - size.height / 2, width: size.width, height: size.height };
    return body.x >= bounds.x && body.y >= bounds.y
      && body.x + body.width <= bounds.x + bounds.width
      && body.y + body.height <= bounds.y + bounds.height
      && !obstacles.some((obstacle) => overlaps(body, obstacle));
  };
  if (valid(desired)) return { ...desired };
  for (let radius = step; radius <= searchRadius; radius += step) {
    for (let side = 0; side < 8; side++) {
      const angle = side * Math.PI / 4;
      const point = { x: desired.x + Math.cos(angle) * radius, y: desired.y + Math.sin(angle) * radius };
      if (valid(point)) return point;
    }
  }
  return null;
}
