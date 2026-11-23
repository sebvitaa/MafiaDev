// Dominio: vicho. Tileset de biomas dibujado pixel a pixel en runtime (128x112, 8 columnas, tiles 16x16).
// Una fila por bioma b (0..4): gid 8b+1..8b+4 suelos · 8b+5 muro top · 8b+6 muro cara · 8b+7/8b+8 terreno exterior
// (no pisable, decora alrededor del camino). Filas 5-6: decoraciones pequeñas 41-56 (ver tools/genWorld.mjs).
// shortcut: arte procedural provisorio; un PNG de artista puede reemplazarlo respetando el mismo orden de gids.
import type Phaser from 'phaser';

export const BIOME_TILES_KEY = 'world-biomes';

/** ruins = tierra muerta · forest = bosque frondoso · bright = cueva de cristal · arena = volcán · redforest = bosque rojizo. */
export type Biome = 'ruins' | 'forest' | 'bright' | 'arena' | 'redforest';
export const BIOMES: Biome[] = ['ruins', 'forest', 'bright', 'arena', 'redforest']; // fila del tileset = (gid-1)/8

/** Bioma del suelo bajo un punto del mundo, o null si es vacío. */
export function biomeAt(map: Phaser.Tilemaps.Tilemap, x: number, y: number): Biome | null {
  const tile = map.getTileAtWorldXY(x, y, false, undefined, 'ground');
  return tile ? BIOMES[Math.floor((tile.index - 1) / 8)] ?? null : null;
}

/** gid del terreno exterior (no pisable) de un bioma, variante 0|1. */
export const outerGid = (b: Biome, v: 0 | 1): number => BIOMES.indexOf(b) * 8 + 7 + v;

type Px = (x: number, y: number, c: string) => void;

/** Ruido determinista 0..1. */
export const hash = (x: number, y: number, s: number): number => {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};

/** Relleno con ruido de 3 tonos [base, claro, oscuro]. */
const fill = (px: Px, seed: number, [base, light, dark]: string[], pl = 0.12, pd = 0.12) => {
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const r = hash(x, y, seed);
    px(x, y, r < pd ? dark : r > 1 - pl ? light : base);
  }
};
const dots = (px: Px, seed: number, colors: string[], n: number, size = 1) => {
  for (let i = 0; i < n; i++) {
    const x = Math.floor(hash(i, 1, seed) * (16 - size)), y = Math.floor(hash(i, 2, seed) * (16 - size));
    const c = colors[i % colors.length];
    for (let a = 0; a < size; a++) for (let b = 0; b < size; b++) px(x + a, y + b, c);
  }
};
const blades = (px: Px, seed: number, colors: string[], n: number) => {
  for (let i = 0; i < n; i++) {
    const x = Math.floor(hash(i, 1, seed) * 15), y = 2 + Math.floor(hash(i, 2, seed) * 13), c = colors[i % colors.length];
    px(x, y, c); px(x, y - 1, c);
    if (hash(i, 3, seed) > 0.5) px(x + 1, y - 2, c);
  }
};
const crack = (px: Px, seed: number, c: string, glow?: string, len = 9) => {
  let x = 3 + Math.floor(hash(0, 0, seed) * 9), y = 3;
  for (let i = 0; i < len; i++) {
    px(x, y, c);
    if (glow && hash(i, 5, seed) > 0.6) px(x + 1, y, glow);
    y++;
    x += hash(i, 1, seed) > 0.66 ? 1 : hash(i, 2, seed) > 0.5 ? -1 : 0;
  }
};
/** Copas de hojas vistas desde arriba que llenan el tile [oscuro, medio, claro, brillo]: setos y sotobosque. */
const foliage = (px: Px, seed: number, [dark, mid, light, hi]: string[]) => {
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) px(x, y, dark);
  for (let i = 0; i < 7; i++) {
    const cx = hash(i, 1, seed) * 16, cy = hash(i, 2, seed) * 16, r = 3 + hash(i, 3, seed) * 3;
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d < r) px(x, y, d < r * 0.45 && x < cx && y < cy ? light : mid);
      if (d < r * 0.25 && x < cx && y < cy) px(x, y, hi);
    }
  }
};
const faceBand = (px: Px, rows: [number, string][]) => { for (const [y, c] of rows) for (let x = 0; x < 16; x++) px(x, y, c); };

// --- paletas ------------------------------------------------------------------
const RU = { floor: ['#3b3631', '#48423b', '#2e2a26'], top: ['#5c554d', '#776f65', '#4c463f'], face: ['#423c36', '#2c2824'], outer: ['#221f1c', '#2c2824', '#191715'] };
const FO = { floor: ['#2f6b3a', '#3d8147', '#275a30'], blade: ['#4f9a58', '#6cbf6a', '#235028'], leaf: ['#173d22', '#24592f', '#3a7f44', '#5fae5c'], outer: ['#14301b', '#1c4226', '#0f2414'] };
const CA = { floor: ['#6064b4', '#7377cc', '#5257a0'], glow: ['#7ff0ff', '#c2fbff', '#ff8af0'], top: ['#2c2758', '#3d3678', '#241f4a'], face: ['#211d44', '#161230'], outer: ['#1e1a3c', '#27224d', '#15122b'] };
const VO = { floor: ['#3d2c28', '#4d3832', '#2e2220'], ember: ['#ff6a1a', '#ffb43a'], top: ['#1e1919', '#3a2b29', '#120f0f'], face: ['#151111', '#0c0a0a'], lava: ['#ff7a1a', '#ffb43a', '#d9480f', '#fff0a0'] };
const RF = { floor: ['#5a2a1f', '#6e3424', '#47201a'], leaves: ['#d9662b', '#f2a03d', '#a8321f'], leaf: ['#4a1313', '#7a2222', '#b23a28', '#e5673b'], outer: ['#3a1212', '#4a1a16', '#2a0d0d'] };

// --- filas de tiles por bioma: [suelo x4, muro top, muro cara, exterior x2] -------
const ROWS: Record<Biome, ((px: Px) => void)[]> = {
  ruins: [
    (px) => { fill(px, 1, RU.floor); dots(px, 101, ['#57504a'], 3); },
    (px) => { fill(px, 2, RU.floor); crack(px, 2, '#211e1b'); },
    (px) => { fill(px, 3, RU.floor, 0.08, 0.2); dots(px, 103, ['#6b6258', '#2a2622'], 6); },
    (px) => fill(px, 4, ['#302c28', '#38332e', '#262320']),
    (px) => { fill(px, 5, RU.top, 0.1, 0.1); faceBand(px, [[0, RU.top[1]]]); crack(px, 5, '#3a352f', undefined, 6); },
    (px) => { fill(px, 6, [RU.face[0], '#4a433c', RU.face[1]], 0.08, 0.08); faceBand(px, [[0, RU.top[1]], [1, RU.top[0]], [2, RU.top[0]], [3, RU.top[2]], [8, RU.face[1]], [12, RU.face[1]]]); crack(px, 6, RU.face[1], undefined, 5); },
    (px) => { fill(px, 7, RU.outer, 0.1, 0.2); crack(px, 7, '#121110'); },
    (px) => { fill(px, 8, RU.outer, 0.1, 0.2); dots(px, 108, ['#8f887c'], 2); },
  ],
  forest: [
    (px) => { fill(px, 11, FO.floor); blades(px, 11, FO.blade, 7); },
    (px) => { fill(px, 12, FO.floor); blades(px, 12, FO.blade, 13); dots(px, 112, ['#f4e27a', '#ffffff'], 2); },
    (px) => { fill(px, 13, ['#4a3a24', '#5a4730', '#3a2d1c'], 0.15, 0.2); blades(px, 13, ['#3d8147'], 3); },
    (px) => { fill(px, 14, ['#2a5f33', '#33703c', '#214d29']); blades(px, 14, ['#3d8147'], 4); },
    (px) => foliage(px, 15, FO.leaf),
    (px) => { foliage(px, 16, FO.leaf); faceBand(px, [[13, '#0e2414'], [14, '#3a2a18'], [15, '#2a1d10']]); },
    (px) => foliage(px, 17, ['#0f2414', '#173d22', '#24592f', '#3a7f44']),
    (px) => { fill(px, 18, FO.outer, 0.15, 0.2); blades(px, 18, ['#24592f', '#2f6b3a'], 10); },
  ],
  bright: [
    (px) => { fill(px, 21, CA.floor); dots(px, 121, [CA.glow[0], CA.glow[1]], 3); },
    (px) => { fill(px, 22, CA.floor); crack(px, 22, '#2e2f60', CA.glow[0]); },
    (px) => { fill(px, 23, ['#6d71c4', '#8085dc', '#5d61ae']); dots(px, 123, CA.glow, 7); },
    (px) => { fill(px, 24, ['#575ba8', '#6064b4', '#4b4f96']); dots(px, 124, ['#ff8af0', '#7ff0ff'], 4); },
    (px) => { fill(px, 25, CA.top, 0.15, 0.1); faceBand(px, [[0, '#5d55a8']]); dots(px, 125, CA.glow, 4); },
    (px) => { fill(px, 26, [CA.face[0], '#2b2656', CA.face[1]], 0.1, 0.1); faceBand(px, [[0, '#5d55a8'], [1, CA.top[0]], [2, CA.top[0]], [3, CA.top[2]]]); crack(px, 26, CA.glow[0], CA.glow[1], 8); },
    (px) => { fill(px, 27, CA.outer, 0.1, 0.15); crack(px, 27, CA.glow[0], CA.glow[1]); },
    (px) => { fill(px, 28, CA.outer, 0.1, 0.15); dots(px, 128, ['#ff8af0', '#7ff0ff'], 4); },
  ],
  arena: [
    (px) => fill(px, 31, VO.floor),
    (px) => { fill(px, 32, VO.floor); crack(px, 32, VO.ember[0], VO.ember[1], 7); },
    (px) => { fill(px, 33, ['#3a2f2d', '#463936', '#2d2525']); dots(px, 133, ['#5c4a45', '#1a1414'], 6); },
    (px) => { fill(px, 34, ['#33251f', '#3d2c28', '#281c19']); dots(px, 134, ['#ff6a1a'], 1); },
    (px) => { fill(px, 35, VO.top, 0.12, 0.1); faceBand(px, [[0, '#4a3632']]); },
    (px) => { for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) px(x, y, y < 4 ? VO.top[0] : x % 5 === 0 ? VO.face[1] : VO.face[0]); faceBand(px, [[0, '#4a3632'], [15, VO.ember[0]]]); },
    (px) => { // lava
      for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
        const w = Math.sin((x + y * 0.6) * 0.8 + hash(x >> 2, y >> 2, 37) * 3);
        px(x, y, w > 0.75 ? VO.lava[3] : w > 0.2 ? VO.lava[1] : w > -0.4 ? VO.lava[0] : VO.lava[2]);
      }
    },
    (px) => { // costra de basalto sobre lava
      for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) px(x, y, hash(x >> 1, y >> 1, 38) > 0.25 ? (hash(x, y, 39) > 0.8 ? '#3a2b29' : '#1e1919') : VO.lava[0]);
    },
  ],
  redforest: [
    (px) => { fill(px, 41, RF.floor); dots(px, 141, RF.leaves, 5); },
    (px) => { fill(px, 42, RF.floor); dots(px, 142, RF.leaves, 10, 2); },
    (px) => { fill(px, 43, ['#4a2a1c', '#5a3524', '#3a2015'], 0.15, 0.2); dots(px, 143, ['#f2a03d'], 2); },
    (px) => { fill(px, 44, ['#622e21', '#783a28', '#4f241a']); dots(px, 144, RF.leaves, 3); },
    (px) => foliage(px, 45, RF.leaf),
    (px) => { foliage(px, 46, RF.leaf); faceBand(px, [[13, '#2a0808'], [14, '#3a2418'], [15, '#2a1a10']]); },
    (px) => foliage(px, 47, ['#2a0b0b', '#4a1313', '#7a2222', '#b23a28']),
    (px) => { fill(px, 48, RF.outer, 0.15, 0.2); dots(px, 148, ['#a8321f', '#d9662b'], 8); },
  ],
};

// --- decoraciones pequeñas (fondo transparente), gids 41..56 ------------------
const fern = (px: Px, outer: string, inner: string) => {
  for (let i = 0; i < 5; i++) {
    const a = -0.9 + i * 0.45;
    for (let r = 2; r < 7; r++) px(Math.round(8 + Math.sin(a) * r), Math.round(12 - Math.cos(a) * r), r > 4 ? outer : inner);
  }
};
const DECO: ((px: Px) => void)[] = [
  (px) => { for (let x = 3; x < 13; x++) px(x, 10, '#e6e0d0'); px(3, 9, '#e6e0d0'); px(3, 11, '#e6e0d0'); px(12, 9, '#e6e0d0'); px(12, 11, '#e6e0d0'); px(6, 12, '#c9c1ad'); px(9, 8, '#c9c1ad'); }, // 41 huesos
  (px) => { for (let y = 5; y < 10; y++) for (let x = 5; x < 11; x++) px(x, y, '#d9d2c0'); for (let x = 6; x < 10; x++) px(x, 10, '#bdb5a2'); px(6, 7, '#1c1416'); px(9, 7, '#1c1416'); px(7, 9, '#1c1416'); }, // 42 cráneo
  (px) => blades(px, 43, ['#7a6a4a', '#9a8a5f', '#5a4d35'], 9), // 43 matojo seco
  (px) => { for (const [x, y, c] of [[4, 8, '#ff7eb6'], [9, 6, '#ffd75e'], [12, 10, '#ffffff'], [6, 12, '#7ec8ff']] as [number, number, string][]) { px(x, y, c); px(x + 1, y, c); px(x, y + 1, c); px(x + 1, y + 1, '#fff6c8'); px(x, y + 2, '#2f7d3c'); } }, // 44 flores
  (px) => fern(px, '#6cbf6a', '#3d8147'), // 45 helecho
  (px) => { px(7, 11, '#efe6cf'); px(8, 11, '#efe6cf'); for (let x = 5; x < 11; x++) px(x, 9, '#c0392b'); for (let x = 6; x < 10; x++) px(x, 8, '#e74c3c'); px(6, 9, '#ffffff'); px(9, 8, '#ffffff'); }, // 46 hongo
  (px) => { px(7, 12, '#d8cfe8'); px(7, 11, '#d8cfe8'); for (let x = 5; x < 10; x++) px(x, 10, '#7ff0ff'); for (let x = 6; x < 9; x++) px(x, 9, '#c2fbff'); px(10, 13, '#7ff0ff'); px(11, 12, '#c2fbff'); px(11, 13, '#7ff0ff'); }, // 47 hongo brillante
  (px) => { for (let y = 5; y < 13; y++) { px(7, y, '#ff8af0'); if (y > 7) px(8, y, '#c43fb4'); } for (let y = 8; y < 13; y++) px(10, y, '#7ff0ff'); px(7, 5, '#ffd6fa'); px(10, 8, '#e6ffff'); }, // 48 cristal
  (px) => dots(px, 49, ['#7ff0ff', '#3fb6c8', '#c2fbff'], 12), // 49 musgo luminoso
  (px) => { for (let y = 8; y < 14; y++) for (let x = 4; x < 12; x++) if (Math.hypot((x - 8) / 4, (y - 11) / 3) < 1) px(x, y, '#2d2525'); px(6, 11, '#ff6a1a'); px(7, 12, '#ffb43a'); px(9, 10, '#ff6a1a'); }, // 50 roca de brasa
  (px) => { for (let y = 4; y < 14; y++) { const w = Math.max(0, 3 - Math.abs(y - 10) / 2); for (let x = Math.round(8 - w); x <= Math.round(8 + w); x++) px(x, y, x < 8 ? '#3a2d4a' : '#150f1c'); } px(7, 6, '#7a6a9a'); }, // 51 obsidiana
  (px) => dots(px, 52, ['#5a504c', '#3a3331', '#7a706a'], 14), // 52 ceniza
  (px) => dots(px, 53, ['#d9662b', '#f2a03d', '#a8321f', '#e5673b'], 14, 2), // 53 hojas caídas
  (px) => { px(7, 11, '#efe6cf'); for (let x = 5; x < 10; x++) px(x, 9, '#f2a03d'); for (let x = 6; x < 9; x++) px(x, 8, '#ffcf6a'); px(11, 12, '#efe6cf'); px(10, 11, '#d9662b'); px(11, 11, '#d9662b'); px(12, 11, '#d9662b'); }, // 54 hongos naranja
  (px) => fern(px, '#f2a03d', '#a8321f'), // 55 helecho naranja
  (px) => dots(px, 56, ['#6b645c', '#4a443e', '#8a8378'], 5, 2), // 56 guijarros
];

/** Crea la textura una vez por juego (las texturas son globales). */
export function makeBiomeTiles(scene: Phaser.Scene): void {
  if (scene.textures.exists(BIOME_TILES_KEY)) return;
  const tex = scene.textures.createCanvas(BIOME_TILES_KEY, 128, 112)!;
  const ctx = tex.getContext();
  const at = (i: number): Px => (x, y, c) => {
    if (x < 0 || y < 0 || x > 15 || y > 15) return;
    ctx.fillStyle = c;
    ctx.fillRect((i % 8) * 16 + x, Math.floor(i / 8) * 16 + y, 1, 1);
  };
  BIOMES.forEach((b, row) => ROWS[b].forEach((draw, col) => draw(at(row * 8 + col))));
  DECO.forEach((draw, k) => draw(at(40 + k)));
  tex.refresh();
}
