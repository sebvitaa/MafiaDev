// Dominio: vicho. Objetos grandes de ambientación (árboles, cristales, basalto, lápidas...) dibujados pixel a pixel.
// Cada tipo tiene varias variantes con semilla para que el entorno no se vea repetido. Solo decoran: sin colisión.
// shortcut: arte procedural provisorio; cambiar por sprites de artista con la misma clave.
import type Phaser from 'phaser';
import { hash, type Biome } from './biomeTiles';

type Px = (x: number, y: number, c: string) => void;
export interface PropDef { key: string; w: number; h: number; weight: number; glow?: number }

const circle = (px: Px, cx: number, cy: number, r: number, c: string) => {
  for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) if (Math.hypot(x - cx, y - cy) <= r) px(x, y, c);
};
const ellipse = (px: Px, cx: number, cy: number, rx: number, ry: number, c: string) => {
  for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) px(x, y, c);
};
const rect = (px: Px, x0: number, y0: number, w: number, h: number, c: string) => {
  for (let y = Math.floor(y0); y < y0 + h; y++) for (let x = Math.floor(x0); x < x0 + w; x++) px(x, y, c);
};
const SHADOW = 'rgba(0,0,0,0.35)';

/** Copa de árbol: grupo de círculos con sombra abajo-derecha, luz arriba-izquierda y contorno oscuro. */
function tree(px: Px, w: number, h: number, seed: number, [outline, dark, mid, light, hi]: string[], trunk: string) {
  const cx = w / 2, cy = h * 0.42, R = w * 0.4;
  ellipse(px, cx, h - 3, w * 0.34, 3, SHADOW);
  rect(px, cx - 2, cy + R * 0.5, 4, h - (cy + R * 0.5) - 2, trunk);
  const blobs = Array.from({ length: 5 }, (_, i) => ({
    x: cx + (hash(i, 1, seed) - 0.5) * R * 0.9, y: cy + (hash(i, 2, seed) - 0.5) * R * 0.7, r: R * (0.55 + hash(i, 3, seed) * 0.3),
  }));
  for (const b of blobs) circle(px, b.x, b.y, b.r + 1, outline);
  for (const b of blobs) circle(px, b.x, b.y, b.r, dark);
  for (const b of blobs) circle(px, b.x - 1, b.y - 1.5, b.r * 0.8, mid);
  for (const b of blobs) circle(px, b.x - b.r * 0.35, b.y - b.r * 0.4, b.r * 0.35, light);
  for (let i = 0; i < 6; i++) px(Math.round(cx - R * 0.5 + hash(i, 7, seed) * R), Math.round(cy - R * 0.6 + hash(i, 8, seed) * R * 0.6), hi);
}
function pine(px: Px, w: number, h: number, [outline, dark, mid, light]: string[], trunk: string) {
  const cx = w / 2;
  ellipse(px, cx, h - 3, w * 0.3, 2.5, SHADOW);
  rect(px, cx - 1, h - 9, 3, 7, trunk);
  for (let t = 0; t < 3; t++) {
    const top = 2 + t * (h * 0.22), base = top + h * 0.38, half = w * (0.28 + t * 0.09);
    for (let y = Math.floor(top); y < base; y++) {
      const hw = half * ((y - top) / (base - top));
      for (let x = Math.floor(cx - hw); x <= cx + hw; x++) {
        const edge = Math.abs(x - (cx - hw)) < 1 || Math.abs(x - (cx + hw)) < 1;
        px(x, y, edge ? outline : x < cx - hw * 0.2 ? light : x > cx + hw * 0.4 ? dark : mid);
      }
    }
  }
}
function bush(px: Px, w: number, h: number, seed: number, [outline, dark, mid, light]: string[], accents: string[]) {
  ellipse(px, w / 2, h - 2, w * 0.42, 2, SHADOW);
  for (let i = 0; i < 4; i++) {
    const x = w * (0.25 + hash(i, 1, seed) * 0.5), y = h * (0.45 + hash(i, 2, seed) * 0.2), r = h * 0.3;
    circle(px, x, y, r + 1, outline); circle(px, x, y, r, dark); circle(px, x - 1, y - 1, r * 0.7, mid); circle(px, x - r * 0.4, y - r * 0.4, r * 0.3, light);
  }
  for (let i = 0; i < accents.length * 2; i++) px(Math.round(w * 0.2 + hash(i, 5, seed) * w * 0.6), Math.round(h * 0.3 + hash(i, 6, seed) * h * 0.4), accents[i % accents.length]);
}
function deadTree(px: Px, w: number, h: number, seed: number, wood: string, dark: string) {
  const cx = Math.round(w / 2);
  ellipse(px, cx, h - 2, w * 0.25, 2, SHADOW);
  rect(px, cx - 2, h * 0.35, 4, h * 0.63, wood);
  rect(px, cx + 1, h * 0.35, 1, h * 0.63, dark);
  const branch = (x: number, y: number, dx: number, len: number) => { for (let i = 0; i < len; i++) px(Math.round(x + dx * i), Math.round(y - i * 0.8), wood); };
  for (let i = 0; i < 5; i++) branch(cx, h * (0.38 + hash(i, 1, seed) * 0.3), hash(i, 2, seed) > 0.5 ? 1 : -1, 4 + Math.floor(hash(i, 3, seed) * 7));
  branch(cx, h * 0.36, 0.2, 10);
}
function crystal(px: Px, w: number, h: number, seed: number, [dark, mid, light]: string[]) {
  ellipse(px, w / 2, h - 2, w * 0.4, 2, SHADOW);
  for (let i = 0; i < 4; i++) {
    const x0 = w * (0.2 + hash(i, 1, seed) * 0.6), top = h * (0.05 + hash(i, 2, seed) * 0.4), half = 2 + hash(i, 3, seed) * 2;
    for (let y = Math.floor(top); y < h - 2; y++) {
      const hw = Math.min(half, (y - top) * 0.6);
      for (let x = Math.floor(x0 - hw); x <= x0 + hw; x++) px(x, y, x < x0 - hw * 0.3 ? light : x > x0 + hw * 0.4 ? dark : mid);
    }
  }
}
function stump(px: Px, w: number, h: number, seed: number, bark: string, cut: string) {
  ellipse(px, w / 2, h - 2, w * 0.42, 2, SHADOW); rect(px, 3, 4, w - 6, h - 6, bark);
  ellipse(px, w / 2, 4, w * 0.34, 2.5, cut); ellipse(px, w / 2 - 1, 3, w * 0.18, 1, '#f1c67c');
  for (let i = 0; i < 3; i++) px(5 + Math.floor(hash(i, 3, seed) * (w - 10)), h - 5, '#2c1b12');
}
function stone(px: Px, w: number, h: number, seed: number, colors: string[]) {
  ellipse(px, w / 2, h - 2, w * 0.44, 2, SHADOW);
  for (let y = 3; y < h - 2; y++) { const half = Math.max(2, w * (0.46 - Math.abs(y - h * 0.55) / h * 0.25)); for (let x = Math.floor(w / 2 - half); x <= w / 2 + half; x++) px(x, y, x < w * 0.43 ? colors[2] : x > w * 0.63 ? colors[0] : colors[1]); }
  for (let i = 0; i < 3; i++) px(3 + Math.floor(hash(i, 8, seed) * (w - 6)), 4 + Math.floor(hash(i, 9, seed) * (h - 8)), colors[3] ?? colors[2]);
}

type Drawer = (px: Px, w: number, h: number, seed: number) => void;
interface Spec { name: string; w: number; h: number; weight: number; variants: number; glow?: number; draw: Drawer }
const LUSH = ['#0b1f10', '#1b4d27', '#2f7a3a', '#55a85a', '#9be08f'];
const LUSH2 = ['#0b1f10', '#225e2e', '#3c9444', '#6cc46a', '#c8f5a8'];
const RED = ['#2a0808', '#7a1f1f', '#b23a28', '#e5673b', '#ffb36b'];
const ORANGE = ['#2a1206', '#8a3a12', '#c8641f', '#f2a03d', '#ffe08a'];

const SPECS: Record<Biome, Spec[]> = {
  forest: [
    { name: 'tree', w: 40, h: 48, weight: 5, variants: 3, draw: (px, w, h, s) => tree(px, w, h, s, s % 2 ? LUSH : LUSH2, '#4a3220') },
    { name: 'pine', w: 24, h: 40, weight: 2, variants: 2, draw: (px, w, h) => pine(px, w, h, ['#0b1f10', '#174a24', '#25683a', '#3f9a54'], '#3a2616') },
    { name: 'bush', w: 22, h: 16, weight: 3, variants: 3, draw: (px, w, h, s) => bush(px, w, h, s, ['#0b1f10', '#225e2e', '#3c9444', '#6cc46a'], s % 3 === 1 ? ['#ff7eb6', '#ffd75e'] : []) },
    { name: 'log', w: 26, h: 12, weight: 1, variants: 1, draw: (px, w) => { ellipse(px, w / 2, 9, w * 0.45, 2, SHADOW); rect(px, 2, 3, w - 6, 5, '#5a3a22'); rect(px, 2, 3, w - 6, 1, '#7a5432'); circle(px, w - 4, 5.5, 2.5, '#c49a6a'); px(w - 4, 5, '#8a6a42'); } },
    { name: 'rock', w: 18, h: 13, weight: 2, variants: 2, draw: (px, w, h, s) => { ellipse(px, w / 2, h - 2, w * 0.42, 2, SHADOW); ellipse(px, w / 2, h * 0.55, w * 0.42, h * 0.38, '#344739'); ellipse(px, w * 0.42, h * 0.42, w * 0.2, h * 0.16, s % 2 ? '#66805a' : '#789065'); } },
    { name: 'stump', w: 18, h: 16, weight: 2, variants: 2, draw: (px, w, h, s) => stump(px, w, h, s, '#5a3a22', '#c99a5a') },
    { name: 'mossrock', w: 22, h: 15, weight: 2, variants: 2, draw: (px, w, h, s) => stone(px, w, h, s, ['#18251d', '#3d5740', '#71905a', '#9bcf72']) },
  ],
  redforest: [
    { name: 'rtree', w: 40, h: 48, weight: 5, variants: 3, draw: (px, w, h, s) => tree(px, w, h, s, s % 2 ? RED : ORANGE, '#3a2418') },
    { name: 'rbush', w: 22, h: 16, weight: 3, variants: 2, draw: (px, w, h, s) => bush(px, w, h, s, ['#2a0808', '#7a1f1f', '#c8641f', '#f2a03d'], ['#ffe08a']) },
    { name: 'rpine', w: 24, h: 40, weight: 1, variants: 1, draw: (px, w, h) => pine(px, w, h, ['#2a0808', '#6e1c1c', '#a8321f', '#e5673b'], '#3a2418') },
    { name: 'emberlog', w: 25, h: 11, weight: 1, variants: 2, draw: (px, w, h, s) => { ellipse(px, w / 2, h - 2, w * 0.44, 2, SHADOW); rect(px, 2, 3, w - 5, 5, '#5a2419'); rect(px, 4, 4, w - 10, 1, s % 2 ? '#ff7733' : '#c94226'); circle(px, w - 4, 5, 2, '#d07240'); } },
    { name: 'rstump', w: 18, h: 16, weight: 2, variants: 2, draw: (px, w, h, s) => stump(px, w, h, s, '#6d2a1b', '#f0a25b') },
  ],
  ruins: [
    { name: 'dtree', w: 30, h: 40, weight: 4, variants: 3, draw: (px, w, h, s) => deadTree(px, w, h, s, '#5a4d40', '#2e2620') },
    { name: 'tomb', w: 12, h: 16, weight: 2, variants: 2, draw: (px, _w, h, s) => { ellipse(px, 6, h - 2, 5, 1.5, SHADOW); rect(px, 2, 4, 8, h - 6, '#6b645c'); circle(px, 6, 4, 4, '#6b645c'); rect(px, 3, 4, 1, h - 7, '#8a8378'); rect(px, 5, 6, 3, 1, '#3a352f'); rect(px, 6, 5, 1, 4, '#3a352f'); if (s % 2) for (let y = 4; y < h - 3; y++) px(8 + (y % 3 === 0 ? 1 : 0), y, '#3a352f'); } },
    { name: 'pillar', w: 14, h: 28, weight: 2, variants: 2, draw: (px, _w, h, s) => { ellipse(px, 7, h - 2, 6, 2, SHADOW); const top = 4 + Math.floor(hash(1, 1, s) * 8); rect(px, 2, top, 10, h - top - 2, '#5c554d'); rect(px, 2, top, 3, h - top - 2, '#776f65'); rect(px, 1, h - 5, 12, 3, '#4c463f'); for (let x = 2; x < 12; x++) if (hash(x, 0, s) > 0.5) px(x, top - 1, '#5c554d'); } },
    { name: 'bones', w: 18, h: 10, weight: 1, variants: 1, draw: (px) => { for (let i = 0; i < 4; i++) rect(px, 2 + i * 3, 4 + (i % 2), 6, 1, '#d9d2c0'); circle(px, 13, 3, 2.5, '#e6e0d0'); px(12, 3, '#1c1416'); } },
    { name: 'rubble', w: 20, h: 14, weight: 2, variants: 2, draw: (px, w, h, s) => { ellipse(px, w / 2, h - 2, w * 0.42, 2, SHADOW); for (let i = 0; i < 5; i++) { const x = 2 + hash(i, 2, s) * (w - 7), y = h * (0.35 + hash(i, 3, s) * 0.35); circle(px, x, y, 2 + hash(i, 4, s) * 2, i % 2 ? '#71695f' : '#4a4541'); } } },
    { name: 'column', w: 16, h: 24, weight: 2, variants: 2, draw: (px, w, h, s) => { ellipse(px, w / 2, h - 2, 7, 2, SHADOW); rect(px, 3, 6, 10, h - 8, '#3d3935'); rect(px, 4, 5, 3, h - 8, '#81796d'); rect(px, 2, h - 5, 12, 3, '#504a43'); if (s % 2) rect(px, 9, 10, 3, 4, '#24211f'); } },
    { name: 'skull', w: 15, h: 11, weight: 1, variants: 2, draw: (px, w, h, s) => { ellipse(px, w / 2, h - 2, 6, 1.5, SHADOW); circle(px, w / 2, 5, 5, '#c9c0aa'); circle(px, 5, 5, 1.2, '#211b1a'); circle(px, 9, 5, 1.2, '#211b1a'); rect(px, 5, 8, 5, 1, '#958b78'); if (s % 2) px(11, 7, '#211b1a'); } },
  ],
  arena: [
    { name: 'basalt', w: 22, h: 30, weight: 4, variants: 3, draw: (px, w, h, s) => { ellipse(px, w / 2, h - 2, w * 0.45, 2, 'rgba(0,0,0,0.4)'); for (let i = 0; i < 4; i++) { const x = 2 + i * 5, top = 2 + Math.floor(hash(i, 1, s) * 14); rect(px, x, top, 5, h - top - 2, i % 2 ? '#1e1919' : '#2a2222'); rect(px, x, top, 5, 2, '#4a3632'); if (hash(i, 2, s) > 0.6) rect(px, x + 2, top + 4, 1, 3, '#ff6a1a'); } } },
    { name: 'vent', w: 18, h: 14, weight: 2, variants: 1, glow: 0xff6a1a, draw: (px) => { ellipse(px, 9, 9, 8, 4, '#1e1919'); ellipse(px, 9, 8, 5, 2.5, '#ff6a1a'); ellipse(px, 9, 8, 3, 1.5, '#ffe08a'); } },
    { name: 'ctree', w: 26, h: 34, weight: 2, variants: 2, draw: (px, w, h, s) => deadTree(px, w, h, s, '#1a1414', '#ff6a1a') },
    { name: 'lavaPool', w: 26, h: 15, weight: 2, variants: 2, glow: 0xff6a1a, draw: (px, w, h, s) => { ellipse(px, w / 2, h - 3, w * 0.46, h * 0.3, '#3d1711'); ellipse(px, w / 2, h - 4, w * 0.38, h * 0.2, '#e64b1f'); ellipse(px, w * (s % 2 ? 0.42 : 0.58), h - 5, w * 0.16, 2, '#ffd06a'); } },
    { name: 'obelisk', w: 16, h: 32, weight: 2, variants: 2, draw: (px, w, h, s) => { ellipse(px, w / 2, h - 2, 7, 2, SHADOW); for (let y = 3; y < h - 3; y++) { const half = Math.max(2, 7 - Math.floor(Math.abs(y - h * 0.55) / 7)); for (let x = Math.floor(w / 2 - half); x <= w / 2 + half; x++) px(x, y, x < w / 2 - 1 ? '#50413d' : '#171416'); } px(5, 9 + (s % 3), '#ff6a1a'); } },
  ],
  bright: [
    { name: 'crystalC', w: 18, h: 26, weight: 3, variants: 3, glow: 0x7ff0ff, draw: (px, w, h, s) => crystal(px, w, h, s, ['#1f7f9a', '#4fd6ef', '#d6ffff']) },
    { name: 'crystalM', w: 18, h: 26, weight: 2, variants: 2, glow: 0xff8af0, draw: (px, w, h, s) => crystal(px, w, h, s, ['#7a1f8a', '#d64fd0', '#ffd6fa']) },
    { name: 'shroom', w: 20, h: 26, weight: 2, variants: 2, glow: 0x7ff0ff, draw: (px, w, h, s) => { ellipse(px, w / 2, h - 2, 6, 2, SHADOW); rect(px, w / 2 - 1, h * 0.45, 3, h * 0.5, '#d8cfe8'); ellipse(px, w / 2, h * 0.42, w * 0.45, h * 0.18, s % 2 ? '#3fb6c8' : '#b46cff'); ellipse(px, w / 2 - 2, h * 0.38, w * 0.28, h * 0.09, s % 2 ? '#c2fbff' : '#e9c8ff'); } },
    { name: 'stalag', w: 12, h: 24, weight: 2, variants: 2, draw: (px, _w, h, s) => { ellipse(px, 6, h - 2, 5, 1.5, SHADOW); const top = 2 + Math.floor(hash(0, 1, s) * 6); for (let y = top; y < h - 2; y++) { const hw = (y - top) * 0.22 + 1; for (let x = Math.floor(6 - hw); x <= 6 + hw; x++) px(x, y, x < 6 - hw * 0.3 ? '#5d55a8' : '#2c2758'); } } },
    { name: 'geode', w: 22, h: 18, weight: 1, variants: 2, glow: 0x7ff0ff, draw: (px, w, h, s) => { ellipse(px, w / 2, h - 2, w * 0.42, 2, SHADOW); circle(px, w / 2, h * 0.55, w * 0.38, '#2c2758'); circle(px, w / 2, h * 0.52, w * 0.25, s % 2 ? '#7ff0ff' : '#ff8af0'); circle(px, w * 0.44, h * 0.43, w * 0.1, '#e5ffff'); } },
    { name: 'crystalShard', w: 12, h: 20, weight: 2, variants: 2, glow: 0x7ff0ff, draw: (px, w, h, s) => crystal(px, w, h, s, ['#184c69', '#37a9cf', '#d6ffff']) },
  ],
};

export const GLOW_KEY = 'prop-glow';

/** Genera las texturas (una vez por juego) y devuelve el catálogo por bioma. */
export function makeProps(scene: Phaser.Scene): Record<Biome, PropDef[]> {
  const out = {} as Record<Biome, PropDef[]>;
  for (const [biome, specs] of Object.entries(SPECS) as [Biome, Spec[]][]) {
    out[biome] = [];
    for (const s of specs) for (let v = 0; v < s.variants; v++) {
      const key = `prop-${s.name}-${v}`;
      if (!scene.textures.exists(key)) {
        const tex = scene.textures.createCanvas(key, s.w, s.h)!;
        const ctx = tex.getContext();
        s.draw((x, y, c) => {
          if (x < 0 || y < 0 || x >= s.w || y >= s.h) return;
          ctx.fillStyle = c;
          ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
        }, s.w, s.h, 7 + v * 13);
        tex.refresh();
      }
      out[biome].push({ key, w: s.w, h: s.h, weight: s.weight, glow: s.glow });
    }
  }
  if (!scene.textures.exists(GLOW_KEY)) {
    const tex = scene.textures.createCanvas(GLOW_KEY, 32, 32)!;
    const ctx = tex.getContext();
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(255,255,255,0.9)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 32, 32);
    tex.refresh();
  }
  return out;
}
