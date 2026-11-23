import type { BodoqueAttackIntent, BodoquePoint } from './BodoqueBrain';

export type BossZone = { x: number; y: number; width: number; height: number; circle?: boolean };
/** Locked telegraphs shared by drawing and damage. The centre lane is dangerous; the top lane is safe. */
export function patternZones(intent: BodoqueAttackIntent): BossZone[] {
  const p = intent.aimPoint;
  if (intent.id === 'spectralRace') return [-1, 0, 1].filter(i => i !== -1)
    .map(i => ({ x: p.x - intent.config.range, y: p.y + i * 58 - 16, width: intent.config.range * 2, height: 32 }));
  if (intent.id === 'betTickets') return [[0,0],[-46,0],[46,0],[0,-46],[0,46]].map(([x,y]) =>
    ({ x: p.x + x - 18, y: p.y + y - 18, width: 36, height: 36, circle: true }));
  return [];
}

export function hitsPattern(point: BodoquePoint, radius: number, zones: readonly BossZone[]): boolean {
  return zones.some(z => z.circle
    ? Math.hypot(point.x - z.x - z.width / 2, point.y - z.y - z.height / 2) <= z.width / 2 + radius
    : point.x + radius >= z.x && point.x - radius <= z.x + z.width
      && point.y + radius >= z.y && point.y - radius <= z.y + z.height);
}
