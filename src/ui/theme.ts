// Dominio: seba. Guía de UI: paleta, tipografía pixel (Silkscreen, OFL) y texturas generadas.
import Phaser from 'phaser';
import type { Rarity } from '../types/items';

export const C = {
  bg: 0x13111c,
  panel: 0x3a3352,
  panelDark: 0x221d33,
  accent: 0xff5fa2,
  accent2: 0x45d6c4,
  text: 0xebe7f4,
  dim: 0x8a83a3,
  danger: 0xff3b5c,
} as const;

export const hex = (c: number): string => `#${c.toString(16).padStart(6, '0')}`;

export const RARITY_COLOR: Record<Rarity, number> = {
  common: 0xebe7f4,
  rare: 0x45d6c4,
  epic: 0xb46cff,
  legendary: 0xffb347,
};

export const FONT = 'Silkscreen, monospace';

/** Silkscreen es nítida en múltiplos de 8 px. */
export function text(
  scene: Phaser.Scene, x: number, y: number, str: string,
  o: { size?: 8 | 16 | 24; color?: number; align?: 'left' | 'center' | 'right'; stroke?: boolean } = {},
): Phaser.GameObjects.Text {
  const t = scene.add.text(x, y, str, {
    fontFamily: FONT,
    fontSize: `${o.size ?? 8}px`,
    color: hex(o.color ?? C.text),
    align: o.align ?? 'left',
    ...(o.stroke ? { stroke: hex(C.bg), strokeThickness: 2 } : {}),
  });
  t.setResolution(1);
  return t;
}

export function reducedMotion(prefersSetting: boolean): boolean {
  if (prefersSetting) return true;
  try { return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false; } catch { return false; }
}

export function skipIntro(): boolean {
  try { return new URLSearchParams(globalThis.location?.search ?? '').has('skipIntro'); } catch { return false; }
}

/** Dibuja una textura a partir de una matriz de caracteres → color. Idempotente. */
export function pixelTexture(scene: Phaser.Scene, key: string, rows: string[], palette: Record<string, number>): void {
  if (scene.textures.exists(key)) return;
  const h = rows.length, w = rows[0].length;
  const tex = scene.textures.createCanvas(key, w, h);
  if (!tex) return;
  const ctx = tex.getContext();
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    const col = palette[ch];
    if (col === undefined) return;
    ctx.fillStyle = hex(col);
    ctx.fillRect(x, y, 1, 1);
  }));
  tex.refresh();
}

/** Texturas de UI comunes (corazones, lluvia, cursor, corredor de la barra de carga, viñeta). */
export function makeUiTextures(scene: Phaser.Scene): void {
  const heart = [
    '.ooo.ooo.',
    'ohhfofffo',
    'ohffffffo',
    'offfffffo',
    '.offfffo.',
    '..offfo..',
    '...ofo...',
    '....o....',
  ];
  pixelTexture(scene, 'ui-heart', heart, { o: C.bg, f: C.accent, h: C.text });
  pixelTexture(scene, 'ui-heart-empty', heart.map((r) => r.replace(/[fh]/g, 'e')), { o: C.bg, e: C.panel });
  pixelTexture(scene, 'ui-rain', ['r', 'r', 'r', 'r'], { r: 0x7d74b8 });
  pixelTexture(scene, 'ui-dot', ['d'], { d: C.text });
  pixelTexture(scene, 'ui-cursor', ['a...', 'aa..', 'aaa.', 'aaaa', 'aaa.', 'aa..', 'a...'], { a: C.accent });
  // corredor con sombrero (2 frames) para la barra de carga
  const runner = (legs: string) => [
    '..hhhh..', '.hhhhhh.', '..ffff..', '..fbfb..', '..ffff..', '.cccccc.', '.cccccc.', '..cccc..', ...legs.split('|'),
  ];
  pixelTexture(scene, 'ui-runner-0', runner('..l..l..|.l....l.'), { h: C.panelDark, f: 0xf2c3a0, b: C.bg, c: C.accent, l: C.text });
  pixelTexture(scene, 'ui-runner-1', runner('...ll...|...ll...'), { h: C.panelDark, f: 0xf2c3a0, b: C.bg, c: C.accent, l: C.text });
  if (!scene.textures.exists('ui-vignette')) {
    const tex = scene.textures.createCanvas('ui-vignette', 240, 135);
    if (tex) {
      const ctx = tex.getContext();
      const g = ctx.createRadialGradient(120, 67, 40, 120, 67, 150);
      g.addColorStop(0, 'rgba(255,59,92,0)');
      g.addColorStop(1, 'rgba(255,59,92,0.85)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 240, 135);
      tex.refresh();
    }
  }
}

/** Líneas de barrido CRT sobre toda la pantalla. */
export function scanlines(scene: Phaser.Scene, alpha = 0.12): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics().setDepth(1000).setScrollFactor(0);
  g.fillStyle(0x000000, alpha);
  for (let y = 0; y < scene.scale.height; y += 2) g.fillRect(0, y, scene.scale.width, 1);
  return g;
}

/** Panel con borde de 1 px. */
export function panel(scene: Phaser.Scene, x: number, y: number, w: number, h: number, alpha = 0.92): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.fillStyle(C.panelDark, alpha).fillRect(x, y, w, h);
  g.lineStyle(1, C.panel, 1).strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  g.fillStyle(C.accent, 1).fillRect(x + 2, y, w - 4, 1);
  return g;
}
