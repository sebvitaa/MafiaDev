import type { SwordDamageTarget, SwordDirection } from './SwordCombat';

export function selectEchoDirection(origin: SwordDirection, targets: readonly SwordDamageTarget[], range: number,
  previousId: string | undefined, fallback: SwordDirection,
  visible: (from: SwordDirection, to: SwordDirection) => boolean): SwordDirection {
  const eligible = targets.filter(t => Math.hypot(t.x - origin.x, t.y - origin.y) <= range + t.radius && visible(origin, t));
  eligible.sort((a, b) => Number(b.id === previousId) - Number(a.id === previousId)
    || Math.hypot(a.x - origin.x, a.y - origin.y) - Math.hypot(b.x - origin.x, b.y - origin.y));
  const target = eligible[0];
  if (!target) return fallback;
  const dx = target.x - origin.x, dy = target.y - origin.y, len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}
