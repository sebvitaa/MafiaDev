// Dominio: vicho. Tileset de biomas dibujado pixel a pixel en runtime (128x96, 8 columnas, tiles 16x16).
// Gids (firstgid 1): suelo ruinas 1-4 · bosque 9-12 · luminosa 17-20 · arena 25-28 ·
// muros top/cara: ruinas 33/34 · bosque 35/36 · luminosa 37/38 · arena 39/40 · decoración 41-48.
// shortcut: arte procedural provisorio; cambiar por un PNG de un artista manteniendo el mismo orden de gids.
import type Phaser from 'phaser';

export const BIOME_TILES_KEY = 'world-biomes';

export type Biome = 'ruins' | 'forest' | 'bright' | 'arena';
export const BIOMES: Biome[] = ['ruins', 'forest', 'bright', 'arena']; // fila del tileset = (gid-1)/8

/** Bioma del suelo bajo un punto del mundo, o null si es vacío. */
export function biomeAt(map: Phaser.Tilemaps.Tilemap, x: number, y: number): Biome | null {
  const tile = map.getTileAtWorldXY(x, y, false, undefined, 'ground');
  return tile ? BIOMES[Math.floor((tile.index - 1) / 8)] ?? null : null;
}

type Px = (x: number, y: number, c: string) => void;

/** Ruido determinista 0..1 por pixel. */
const hash = (x: number, y: number, s: number): number => {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};

const speckle = (px: Px, seed: number, base: string, light: string, dark: string, pl = 0.12, pd = 0.12) => {
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const r = hash(x, y, seed);
    px(x, y, r < pd ? dark : r > 1 - pl ? light : base);
  }
};

const blades = (px: Px, seed: number, colors: string[], n: number) => {
  for (let i = 0; i < n; i++) {
    const x = Math.floor(hash(i, 1, seed) * 15);
    const y = 2 + Math.floor(hash(i, 2, seed) * 13);
    const c = colors[i % colors.length];
    px(x, y, c); px(x, y - 1, c);
    if (hash(i, 3, seed) > 0.5) px(x + 1, y - 2, c);
  }
};

// --- suelos -------------------------------------------------------------------
type Pal = [string, string, string];
const ruins: Pal = ['#2b2a36', '#36344a', '#211f2b'];
const forest: Pal = ['#17261e', '#21362a', '#101a15'];
const bright: Pal = ['#5cc96b', '#7fe08a', '#45ad59'];
const arena: Pal = ['#2a1f22', '#3a2a2d', '#1c1416'];

const FLOORS: ((px: Px) => void)[] = [
  // ruinas: losas, losa agrietada, losa con musgo, losa oscura
  (px) => { speckle(px, 1, ...ruins); for (let i = 0; i < 16; i++) { px(i, 7, '#25242f'); px(7, i, '#25242f'); px(i, 15, '#25242f'); px(15, i, '#25242f'); } },
  (px) => { speckle(px, 2, ...ruins); let x = 3; for (let y = 1; y < 15; y++) { px(x, y, '#15141c'); x += hash(y, 0, 9) > 0.5 ? 1 : 0; } px(x, 8, '#4a4762'); },
  (px) => { speckle(px, 3, ...ruins); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const r = hash(x, y, 4); if (r > 0.86) px(x, y, r > 0.95 ? '#3d6b4c' : '#2f4a3a'); } }, // musgo disperso, sin bordes de tile
  (px) => speckle(px, 6, '#24232e', '#2d2b3a', '#1b1a23'),
  // bosque: hierba oscura, hierba densa, tierra, raíces
  (px) => { speckle(px, 7, ...forest); blades(px, 7, ['#2c4a36', '#335640'], 6); },
  (px) => { speckle(px, 8, ...forest); blades(px, 8, ['#2c4a36', '#3b6648', '#284230'], 12); },
  (px) => speckle(px, 9, '#2b2219', '#362a1f', '#211a13', 0.15, 0.2),
  (px) => { speckle(px, 10, ...forest); let y = 4; for (let x = 0; x < 16; x++) { px(x, y, '#3e2c1e'); px(x, y + 1, '#2a1e14'); y += hash(x, 1, 10) > 0.6 ? 1 : hash(x, 2, 10) > 0.7 ? -1 : 0; } },
  // zona luminosa: hierba, flores, hierba clara, sendero
  (px) => { speckle(px, 11, ...bright); blades(px, 11, ['#3c9a50', '#a3f0a0'], 7); },
  (px) => { speckle(px, 12, ...bright); for (let i = 0; i < 6; i++) { const x = 1 + Math.floor(hash(i, 1, 12) * 14); const y = 1 + Math.floor(hash(i, 2, 12) * 14); const c = ['#ffd75e', '#ff7eb6', '#7ec8ff'][i % 3]; px(x, y, c); px(x + 1, y, c); px(x, y + 1, c); px(x + 1, y + 1, '#fff6c8'); } },
  (px) => speckle(px, 13, '#62cf70', '#7fe08a', '#55c165'),
  (px) => { speckle(px, 14, ...bright); blades(px, 14, ['#3c9a50', '#45ad59', '#2f7d3c'], 14); }, // trébol denso
  // arena: ceniza, grieta corta de brasa (no forma líneas entre tiles), sangre seca, ceniza oscura
  (px) => speckle(px, 15, ...arena),
  (px) => { speckle(px, 16, ...arena); let x = 5; for (let y = 4; y < 11; y++) { px(x, y, '#ff6a3d'); if (hash(y, 1, 16) > 0.7) px(x + 1, y, '#ffb36b'); x = Math.min(14, Math.max(1, x + (hash(y, 2, 16) > 0.5 ? 1 : -1))); } },
  (px) => { speckle(px, 17, ...arena); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (hash(x, y, 27) > 0.93) px(x, y, '#5a1a24'); px(9, 6, '#a3283a'); px(10, 6, '#a3283a'); }, // manchas de sangre seca
  (px) => speckle(px, 18, '#1f1618', '#2a1f22', '#160f11'),
];

// --- muros: top (cara superior) y cara frontal visible en 3/4 ----------------
type WallPal = [string, string, string, string]; // top, luz, cara, sombra
const WALLS: WallPal[] = [
  ['#5d5872', '#7a7494', '#3f3b52', '#2a2738'], // ruinas
  ['#2e4a2f', '#3f6640', '#3a2c20', '#261c14'], // bosque (seto sobre tierra)
  ['#e8e2cf', '#ffffff', '#b9b09a', '#8e8672'], // luminosa (piedra blanca)
  ['#4a2a2e', '#6b3a40', '#2e191c', '#1d0f11'], // arena
];

const wallTop = (px: Px, [top, light]: WallPal, seed: number) => {
  speckle(px, seed, top, light, top, 0.1, 0);
  for (let i = 0; i < 16; i++) px(i, 0, light);
};
const wallFace = (px: Px, [top, light, face, shadow]: WallPal, seed: number) => {
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) px(x, y, y < 4 ? (y === 0 ? light : top) : face);
  for (let row = 4; row < 16; row += 4) {
    for (let x = 0; x < 16; x++) px(x, row, shadow);
    const off = (row / 4) % 2 === 0 ? 0 : 4;
    for (let x = off; x < 16; x += 8) for (let y = row; y < row + 4 && y < 16; y++) px(x, y, shadow);
  }
  for (let x = 0; x < 16; x++) if (hash(x, 15, seed) > 0.5) px(x, 15, shadow);
};

// --- decoración (fondo transparente) -----------------------------------------
const DECO: ((px: Px) => void)[] = [
  (px) => blades(px, 41, ['#3b6648', '#4f8a5e', '#2c4a36'], 10), // mata
  (px) => { for (let y = 8; y < 15; y++) for (let x = 4; x < 12; x++) if (Math.hypot((x - 8) / 4, (y - 11.5) / 3.5) < 1) px(x, y, y < 10 ? '#8a879c' : x > 9 ? '#4b485a' : '#66637a'); px(6, 9, '#b4b1c6'); }, // roca
  (px) => { px(7, 12, '#d8cfc0'); px(7, 11, '#d8cfc0'); px(8, 12, '#d8cfc0'); for (let x = 5; x < 11; x++) px(x, 10, '#b46cff'); for (let x = 6; x < 10; x++) px(x, 9, '#d59bff'); px(4, 7, '#e9c8ff'); px(11, 8, '#e9c8ff'); px(9, 6, '#e9c8ff'); }, // hongo brillante
  (px) => { for (let x = 3; x < 13; x++) px(x, 10, '#e6e0d0'); px(3, 9, '#e6e0d0'); px(3, 11, '#e6e0d0'); px(12, 9, '#e6e0d0'); px(12, 11, '#e6e0d0'); for (let y = 4; y < 8; y++) for (let x = 6; x < 10; x++) px(x, y, '#d9d2c0'); px(7, 5, '#1c1416'); px(8, 5, '#1c1416'); }, // huesos y cráneo
  (px) => { px(8, 13, '#2f7d3c'); px(8, 12, '#2f7d3c'); px(8, 11, '#2f7d3c'); px(7, 9, '#ff7eb6'); px(9, 9, '#ff7eb6'); px(8, 8, '#ff7eb6'); px(8, 10, '#ff7eb6'); px(8, 9, '#fff6c8'); }, // flor
  (px) => { for (let y = 6; y < 15; y++) for (let x = 2; x < 14; x++) if (Math.hypot((x - 8) / 6, (y - 10.5) / 4.5) < 1) px(x, y, hash(x, y, 46) > 0.75 ? '#a3f0a0' : y > 12 ? '#2f7d3c' : '#45ad59'); px(5, 9, '#ff7eb6'); px(10, 8, '#ffd75e'); }, // arbusto
  (px) => { for (let x = 5; x < 11; x++) px(x, 11, '#6b5a4a'); for (let x = 6; x < 10; x++) px(x, 12, '#4a3d32'); px(7, 13, '#4a3d32'); px(8, 13, '#4a3d32'); px(7, 10, '#ff6a3d'); px(8, 10, '#ffb36b'); px(8, 9, '#ff6a3d'); px(7, 8, '#ffd75e'); px(9, 9, '#ff6a3d'); }, // brasero
  (px) => { for (let y = 3; y < 15; y++) for (let x = 5; x < 11; x++) px(x, y, x === 5 ? '#8a879c' : x === 10 ? '#3f3b52' : '#5d5872'); px(7, 6, '#5ee6d0'); px(8, 7, '#5ee6d0'); px(7, 8, '#5ee6d0'); px(8, 10, '#5ee6d0'); px(7, 11, '#a6fff0'); }, // piedra rúnica
];

/** Crea la textura una vez por juego (las texturas son globales). */
export function makeBiomeTiles(scene: Phaser.Scene): void {
  if (scene.textures.exists(BIOME_TILES_KEY)) return;
  const tex = scene.textures.createCanvas(BIOME_TILES_KEY, 128, 96)!;
  const ctx = tex.getContext();
  const at = (i: number): Px => (x, y, c) => {
    if (x < 0 || y < 0 || x > 15 || y > 15) return;
    ctx.fillStyle = c;
    ctx.fillRect((i % 8) * 16 + x, Math.floor(i / 8) * 16 + y, 1, 1);
  };
  // gid g → índice g-1: suelos en filas 0-3 (4 por bioma), muros fila 4, deco fila 5
  FLOORS.forEach((draw, k) => draw(at(Math.floor(k / 4) * 8 + (k % 4))));
  WALLS.forEach((pal, b) => { wallTop(at(32 + b * 2), pal, 60 + b); wallFace(at(33 + b * 2), pal, 70 + b); });
  DECO.forEach((draw, k) => draw(at(40 + k)));
  tex.refresh();
}
