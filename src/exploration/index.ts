// Dominio: vicho — checkpoints, respawn, cofres, zonas, niebla de guerra.
import Phaser from 'phaser';
import { bus } from '../core/EventBus';
import { installChests } from './chests';
import { installCheckpoints } from './checkpoints';
import { installFog } from './fog';
import { installPassages } from './passages';
import { installSigns } from './signs';
import { installCollectibles } from './collectibles';
import { prop } from './tiled';
import { roomAt, zoneAt, type ZoneRect } from './zones';

type Ground = Phaser.GameObjects.GameObject & { x: number; y: number };

/** V06: emite zone:changed y room:entered al cruzar los rectángulos type "zone" de Tiled. */
function installZones(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap, player: Ground): void {
  const zones: ZoneRect[] = map.filterObjects('objects', (o) => o.type === 'zone')!.map((o) => ({
    name: o.name, zone: prop(o, 'zone') ?? 'zone1', roomId: prop(o, 'roomId'),
    x: o.x!, y: o.y!, width: o.width!, height: o.height!,
  }));
  let zone: string | null = null;
  let room: string | null = null;
  const onUpdate = () => {
    const z = zoneAt(zones, player.x, player.y)?.zone ?? null;
    if (z && z !== zone) bus.emit('zone:changed', { zone: z });
    zone = z;
    const r = roomAt(zones, player.x, player.y);
    if (r?.roomId && r.roomId !== room) bus.emit('room:entered', { roomId: r.roomId, zone: r.zone });
    room = r?.roomId ?? null;
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, onUpdate);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.UPDATE, onUpdate));
}

/** Llamar desde GameScene después de crear el jugador. Devuelve la niebla para las vistas de mapa. */
export function installExploration(
  scene: Phaser.Scene,
  world: { map: Phaser.Tilemaps.Tilemap; solids: Phaser.Tilemaps.TilemapLayer; spawn: { x: number; y: number } },
  player: Ground,
): { fog: Phaser.GameObjects.Graphics } {
  const { map, spawn } = world;
  installChests(scene, map, player);
  installCheckpoints(scene, map, player, spawn);
  installZones(scene, map, player);
  installPassages(scene, map, world.solids, player);
  installSigns(scene, map, player);
  installCollectibles(scene, map, player);
  return { fog: installFog(scene, map, player) };
}

/** Escenario elegido en el título (seba): 1 inicio · 2 hub · 3 antes de la arena. PEN-vicho-20261123-114613. */
const STAGE_START: Record<number, string> = { 1: 'spawn', 2: 'cp2', 3: 'cp4' };
export function stageStart(map: Phaser.Tilemaps.Tilemap, stage: number): { x: number; y: number } | null {
  const o = map.findObject('objects', (obj) => obj.name === STAGE_START[stage]);
  return o ? { x: o.x!, y: o.y! + 10 } : null;
}
