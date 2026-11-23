export interface ItalianRainPath {
  readonly index: number;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly driftX: number;
  readonly launchDelayMs: number;
  readonly fallDurationMs: number;
  readonly impactAtMs: number;
  readonly rotation: number;
  readonly spin: number;
  readonly scale: number;
}

/** SUP-basti-20261123-141140: pure seeded trajectories staggered over 70–95% of the 600ms cast. */
export function createItalianRainPattern(
  count: number,
  seed: number,
  areaRadius: number,
  impactWindowMs: number,
): ItalianRainPath[] {
  const safeCount = Math.max(7, Math.min(10, Math.floor(count)));
  const random = seededRandom(seed);
  return Array.from({ length: safeCount }, (_, index) => {
    const angle = random() * Math.PI * 2;
    const distance = Math.sqrt(random()) * areaRadius * 0.68;
    const launchDelayMs = Math.round(((index % 3) * 0.035 + Math.floor(index / 3) * 0.012) * impactWindowMs);
    const impactAtMs = Math.round(impactWindowMs * (0.7 + 0.25 * index / Math.max(1, safeCount - 1)));
    const direction = random() < 0.5 ? -1 : 1;
    return {
      index,
      offsetX: Math.cos(angle) * distance,
      offsetY: Math.sin(angle) * distance * 0.7,
      driftX: (random() * 2 - 1) * areaRadius * 0.45,
      launchDelayMs,
      fallDurationMs: Math.max(1, impactAtMs - launchDelayMs),
      impactAtMs,
      rotation: random() * Math.PI * 2,
      spin: direction * (1 + random() * 1.4) * Math.PI * 2,
      scale: 0.66 + random() * 0.36,
    };
  });
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0 || 0x9e3779b9;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
