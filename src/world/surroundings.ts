// Dominio: vicho. Alrededores decorados (estilo Minecraft Dungeons): el vacío cercano al camino se rellena con
// el terreno del bioma más cercano (sotobosque, lava, roca de cristal...) y con objetos grandes sin colisión.
// Lo pisable no cambia: todo esto queda fuera del área jugable, debajo del suelo o sobre el vacío.
import Phaser from 'phaser';
import { BIOMES, hash, outerGid, type Biome } from './biomeTiles';
import { GLOW_KEY, makeProps, type PropDef } from './props';

const REACH = 12; // tiles de vacío decorados alrededor del camino

/** Bioma más cercano y distancia (en tiles) desde cada tile vacío a lo pisable, por BFS multi-origen. */
export function nearestBiome(ground: number[], w: number, h: number, reach: number): { biome: Int8Array; dist: Uint8Array } {
  const biome = new Int8Array(w * h).fill(-1);
  const dist = new Uint8Array(w * h).fill(255);
  const queue: number[] = [];
  for (let i = 0; i < ground.length; i++) if (ground[i] > 0) { biome[i] = Math.floor((ground[i] - 1) / 8); dist[i] = 0; queue.push(i); }
  for (let q = 0; q < queue.length; q++) {
    const i = queue[q], x = i % w, y = (i / w) | 0;
    if (dist[i] >= reach) continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, n = ny * w + nx;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h || dist[n] !== 255) continue;
      dist[n] = dist[i] + 1;
      biome[n] = biome[i];
      queue.push(n);
    }
  }
  return { biome, dist };
}

const pick = (defs: PropDef[], r: number): PropDef => {
  const total = defs.reduce((s, d) => s + d.weight, 0);
  let acc = r * total;
  for (const d of defs) { acc -= d.weight; if (acc < 0) return d; }
  return defs[defs.length - 1];
};

export function installSurroundings(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap, tiles: Phaser.Tilemaps.Tileset): void {
  const W = map.width, H = map.height;
  const ground = map.getLayer('ground')!.data.flat().map((t) => t.index);
  const { biome, dist } = nearestBiome(ground, W, H, REACH);

  const outer = map.createBlankLayer('outer', tiles)!.setDepth(-1);
  const props = makeProps(scene);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, d = dist[i];
    if (d === 0 || d === 255) continue;
    const b: Biome = BIOMES[biome[i]];
    // Variante por manchas grandes (lava/costra, sotobosque/hierba...) para que no se vea a cuadros.
    outer.putTileAt(outerGid(b, hash(x >> 2, y >> 2, 91) > 0.5 ? 1 : 0), x, y);
    // Objetos: más densos junto al camino, más ralos lejos; un tile de cada dos para que no se amontonen.
    if ((x + y) % 2 || hash(x, y, 92) > (d <= 3 ? 0.3 : d <= 7 ? 0.18 : 0.1)) continue;
    const def = pick(props[b], hash(x, y, 93));
    const px = x * 16 + 8 + (hash(x, y, 94) - 0.5) * 10, py = y * 16 + 14 + (hash(x, y, 95) - 0.5) * 6;
    scene.add.image(px, py, def.key).setOrigin(0.5, 1).setDepth(py).setFlipX(hash(x, y, 96) > 0.5);
    if (def.glow) {
      scene.add.image(px, py - def.h * 0.5, GLOW_KEY).setTint(def.glow).setBlendMode(Phaser.BlendModes.ADD)
        .setScale(def.w / 12).setAlpha(0.45).setDepth(py - 1);
    }
  }
}
