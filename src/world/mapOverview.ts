import type Phaser from 'phaser';
import { BIOME_TILES_KEY } from './biomeTiles';

/** One small texture for map cameras, instead of rendering thousands of world objects twice. */
export function makeMapOverview(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap): {
  image: Phaser.GameObjects.Image; refresh: () => void;
} {
  const key = `overview-${scene.sys.settings.key}`;
  const pixels = 2;
  const texture = scene.textures.createCanvas(key, map.width * pixels, map.height * pixels)!;
  const context = texture.context;
  const source = scene.textures.get(BIOME_TILES_KEY).getSourceImage() as CanvasImageSource;
  const refresh = () => {
    context.clearRect(0, 0, texture.width, texture.height);
    context.imageSmoothingEnabled = false;
    for (const name of ['outer', 'ground', 'deco', 'walls']) {
      const layer = map.getLayer(name);
      if (!layer) continue;
      for (const row of layer.data) for (const tile of row) {
        if (!tile || tile.index <= 0) continue;
        const index = tile.index - 1;
        context.drawImage(source, index % 8 * map.tileWidth, Math.floor(index / 8) * map.tileHeight,
          map.tileWidth, map.tileHeight, tile.x * pixels, tile.y * pixels, pixels, pixels);
      }
    }
    const colors: Record<string, string> = { chest: '#e9b85c', checkpoint: '#ff9147', sword: '#e6f3ef', boss_arena: '#ec5968' };
    for (const object of map.getObjectLayer('objects')?.objects ?? []) {
      if (!colors[object.type]) continue;
      context.fillStyle = colors[object.type];
      context.fillRect((object.x ?? 0) / map.tileWidth * pixels - 1,
        (object.y ?? 0) / map.tileHeight * pixels - 1, 3, 3);
    }
    texture.refresh();
  };
  refresh();
  const image = scene.add.image(0, 0, key).setOrigin(0).setDisplaySize(map.widthInPixels, map.heightInPixels)
    .setDepth(-2).setName('map-overview');
  scene.events.once('shutdown', () => scene.textures.remove(key));
  return { image, refresh };
}
