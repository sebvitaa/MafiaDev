// Dominio: vicho — mundo abierto cenital (SUP-vicho-20261123-105154): mapa Tiled, cámara, ambientación.
import Phaser from 'phaser';
import { BIOME_TILES_KEY, makeBiomeTiles } from './biomeTiles';

export { installCamera, setCombatTier, type CombatTier } from './camera';
export { installMapViews } from './bigMap';
export { installAmbience } from './ambience';
export { installAreaTitles } from './areaTitle';

export const WORLD_MAP_KEY = 'world';

export interface World {
  solids: Phaser.Tilemaps.TilemapLayer;
  bounds: Phaser.Geom.Rectangle;
  spawn: { x: number; y: number };
  map: Phaser.Tilemaps.Tilemap;
}

/** Llamar desde GameScene.preload. */
export function preloadWorld(scene: Phaser.Scene): void {
  scene.load.tilemapTiledJSON(WORLD_MAP_KEY, 'assets/maps/world.json');
}

export function installWorld(scene: Phaser.Scene): World {
  // SUP-vicho-20261123-105154: vista cenital, sin gravedad de mundo (el salto lo resuelve basti).
  scene.physics.world.gravity.y = 0;
  makeBiomeTiles(scene);

  const map = scene.make.tilemap({ key: WORLD_MAP_KEY });
  const tiles = map.addTilesetImage('biomes', BIOME_TILES_KEY)!;
  map.createLayer('ground', tiles, 0, 0);
  map.createLayer('deco', tiles, 0, 0);
  const solids = map.createLayer('walls', tiles, 0, 0) as Phaser.Tilemaps.TilemapLayer; // sin gpu=true: capa clásica con colisión
  solids.setCollisionByExclusion([-1, 0]);

  const bounds = new Phaser.Geom.Rectangle(0, 0, map.widthInPixels, map.heightInPixels);
  scene.physics.world.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
  scene.cameras.main.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);

  const spawnObj = map.findObject('objects', (o) => o.type === 'spawn');
  const spawn = { x: spawnObj?.x ?? 32, y: spawnObj?.y ?? 32 };

  return { solids, bounds, spawn, map };
}
