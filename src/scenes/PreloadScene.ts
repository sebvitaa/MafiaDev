// Dominio: seba. Barra de carga + carga de TODOS los assets. Cada dominio añade aquí sus claves
// pidiéndolo a seba (pending) o, mejor, exportando una función preload*() desde su index.ts.
import Phaser from 'phaser';
import type { PlaceholderKey } from '../types/assets';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    const { width: w, height: h } = this.scale;
    const frame = this.add.rectangle(w / 2, h / 2, 202, 10).setStrokeStyle(1, 0xebe7f4);
    const bar = this.add.rectangle(frame.x - 100, h / 2, 0, 6, 0xff5fa2).setOrigin(0, 0.5);
    this.load.on(Phaser.Loader.Events.PROGRESS, (p: number) => (bar.width = 200 * p));

    // Ejemplos (descomentar cuando existan los archivos):
    // this.load.aseprite('player', 'assets/sprites/player/player.png', 'assets/sprites/player/player.json');
    // this.load.tilemapTiledJSON('zona1', 'assets/maps/zona1.json');
    // this.load.audio('sfx-jump', 'assets/audio/sfx/jump.ogg');
  }

  create(): void {
    this.makePlaceholder('ph-player', 12, 24, '#45d6c4');
    this.makePlaceholder('ph-enemy', 16, 16, '#ff5fa2');
    this.makePlaceholder('ph-tile', 16, 16, '#3a3352');
    this.scene.start('TitleScene');
  }

  private makePlaceholder(key: PlaceholderKey, w: number, h: number, color: string): void {
    if (this.textures.exists(key)) return;
    const tex = this.textures.createCanvas(key, w, h);
    if (!tex) return;
    const ctx = tex.getContext();
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);
    tex.refresh();
  }
}
