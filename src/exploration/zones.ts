export interface ZoneRect {
  name: string;
  zone: string;
  roomId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

function contains(rect: ZoneRect, x: number, y: number): boolean {
  return x >= rect.x && x < rect.x + rect.width && y >= rect.y && y < rect.y + rect.height;
}

function smallestAt(zones: readonly ZoneRect[], x: number, y: number): ZoneRect | null {
  let found: ZoneRect | null = null;

  for (const zone of zones) {
    if (contains(zone, x, y) && (!found || zone.width * zone.height < found.width * found.height)) {
      found = zone;
    }
  }

  return found;
}

export function zoneAt(zones: readonly ZoneRect[], x: number, y: number): ZoneRect | null {
  return smallestAt(zones, x, y);
}

export function roomAt(zones: readonly ZoneRect[], x: number, y: number): ZoneRect | null {
  return smallestAt(zones.filter((zone) => zone.roomId !== undefined), x, y);
}
