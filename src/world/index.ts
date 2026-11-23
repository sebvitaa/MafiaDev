// Dominio: vicho — mundo abierto cenital (SUP-vicho-20261123-105154): mapa Tiled, cámara, ambientación.
import Phaser from 'phaser';
import { installExploration } from '../exploration';

export { installCamera, setCombatTier, type CombatTier } from './camera';

export const WORLD_MAP_KEY = 'world';
const TILES_KEY = 'world-tiles';

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

// shortcut: tileset provisorio generado en runtime (suelo, muro, suelo luminoso, arena); reemplazar por PNG real en V19.
function makePlaceholderTiles(scene: Phaser.Scene): void {
  if (scene.textures.exists(TILES_KEY)) return;
  const g = scene.add.graphics();
  const tile = (i: number, base: number, edge: number) => {
    g.fillStyle(base).fillRect(i * 16, 0, 16, 16);
    g.fillStyle(edge).fillRect(i * 16, 0, 16, 1).fillRect(i * 16, 0, 1, 16);
  };
  tile(0, 0x1d1b26, 0x24212f); // suelo
  tile(1, 0x4a4458, 0x6b6380); // muro (borde claro = cara superior)
  tile(2, 0x3f7d5c, 0x56a07a); // zona luminosa
  tile(3, 0x2e2224, 0x3a2b2e); // arena del jefe
  g.generateTexture(TILES_KEY, 64, 16);
  g.destroy();
}

export function installWorld(scene: Phaser.Scene): World {
  // SUP-vicho-20261123-105154: vista cenital, sin gravedad de mundo (el salto lo resuelve basti).
  scene.physics.world.gravity.y = 0;
  makePlaceholderTiles(scene);

  const map = scene.make.tilemap({ key: WORLD_MAP_KEY });
  const tiles = map.addTilesetImage('placeholder', TILES_KEY)!;
  map.createLayer('ground', tiles, 0, 0);
  const solids = map.createLayer('walls', tiles, 0, 0) as Phaser.Tilemaps.TilemapLayer; // sin gpu=true: capa clásica con colisión
  solids.setCollisionByExclusion([-1, 0]);

  const bounds = new Phaser.Geom.Rectangle(0, 0, map.widthInPixels, map.heightInPixels);
  scene.physics.world.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
  scene.cameras.main.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);

  const spawnObj = map.findObject('objects', (o) => o.type === 'spawn');
  const spawn = { x: spawnObj?.x ?? 32, y: spawnObj?.y ?? 32 };

  installExploration(scene);
  return { solids, bounds, spawn, map };
}
