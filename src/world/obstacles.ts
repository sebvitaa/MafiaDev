// Dominio: vicho. Obstáculos colocados por el generador dentro de salas transitables.
import Phaser from 'phaser';
import { makeProps, type PropDef } from './props';
import type { Biome } from './biomeTiles';

type ObstacleObject = Phaser.Types.Tilemaps.TiledObject & { properties?: { name: string; value: unknown }[] };
type Layout = { biome: Biome; kind: string; x: number; y: number };

// Salas amplias y rutas verificadas del mapa base; los objetos Tiled reemplazan este fallback al existir.
const FALLBACK_LAYOUT: Layout[] = [
  { biome: 'forest', kind: 'tree', x: 25 * 16 + 8, y: 38 * 16 + 8 },
  { biome: 'forest', kind: 'rock', x: 116 * 16 + 8, y: 29 * 16 + 8 },
  { biome: 'ruins', kind: 'tomb', x: 58 * 16 + 8, y: 84 * 16 + 8 },
  { biome: 'ruins', kind: 'rubble', x: 76 * 16 + 8, y: 132 * 16 + 8 },
  { biome: 'bright', kind: 'crystalC', x: 196 * 16 + 8, y: 24 * 16 + 8 },
  { biome: 'bright', kind: 'geode', x: 213 * 16 + 8, y: 31 * 16 + 8 },
  { biome: 'arena', kind: 'lavaPool', x: 197 * 16 + 8, y: 145 * 16 + 8 },
  { biome: 'arena', kind: 'basalt', x: 211 * 16 + 8, y: 156 * 16 + 8 },
  { biome: 'redforest', kind: 'emberlog', x: 28 * 16 + 8, y: 133 * 16 + 8 },
  { biome: 'redforest', kind: 'rtree', x: 206 * 16 + 8, y: 84 * 16 + 8 },
];

function property(object: ObstacleObject, name: string): string | undefined {
  const value = object.properties?.find((p: { name: string; value: unknown }) => p.name === name)?.value;
  return typeof value === 'string' ? value : undefined;
}

function propFor(catalog: Record<Biome, PropDef[]>, biome: Biome, kind: string, variant: number): PropDef | undefined {
  const matches = catalog[biome].filter((prop) => prop.key.startsWith(`prop-${kind}-`));
  return matches[variant % matches.length];
}

/** Cuerpos estáticos: el jugador colisiona y Teleport los considera zonas no aterrizables. */
export function installObstacles(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap): Phaser.Physics.Arcade.StaticGroup {
  const group = scene.physics.add.staticGroup();
  const catalog = makeProps(scene);
  const objects = map.filterObjects('objects', (object) => object.type === 'obstacle') as ObstacleObject[] | null;
  const placed = (objects?.length ? objects.map((object) => ({
    biome: property(object, 'biome') as Biome | undefined,
    kind: property(object, 'kind'), x: object.x, y: object.y, variant: object.id ?? 0,
  })) : FALLBACK_LAYOUT.map((entry, variant) => ({ ...entry, variant })));
  for (const object of placed) {
    const biome = object.biome;
    const kind = object.kind;
    if (!biome || !kind || object.x === undefined || object.y === undefined) continue;
    const def = propFor(catalog, biome, kind, object.variant);
    if (!def) continue;
    const image = group.create(object.x, object.y, def.key).setOrigin(0.5, 1).setDepth(object.y);
    image.refreshBody();
  }
  return group;
}
