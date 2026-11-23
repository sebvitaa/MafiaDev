import Phaser from 'phaser';

const FILLED = 0xff5fa2;
const EMPTY = 0x3a3352;
const BLOCK_W = 5;
const BLOCK_H = 6;
const GAP = 1;

/** Dibuja diez bloques; el último bloque refleja fracciones del 10 %. */
export function drawPixelBar(g: Phaser.GameObjects.Graphics, value: number, x = 0, y = 0): void {
  g.clear();
  const amount = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0)) * 10;
  for (let i = 0; i < 10; i++) {
    const bx = x + i * (BLOCK_W + GAP);
    g.fillStyle(EMPTY, 1).fillRect(bx, y, BLOCK_W, BLOCK_H);
    const portion = Math.min(1, Math.max(0, amount - i));
    const fillWidth = Math.round(BLOCK_W * portion);
    if (fillWidth > 0) g.fillStyle(FILLED, 1).fillRect(bx, y, fillWidth, BLOCK_H);
  }
}

export function pixelBar(scene: Phaser.Scene, x: number, y: number, value: number): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  drawPixelBar(g, value, x, y);
  return g;
}
