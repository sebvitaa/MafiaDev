// Dominio: seba. Carga la fuente pixel y las texturas generadas de UI; luego Preload (apertura + carga).
import Phaser from 'phaser';
import { loadFonts } from '../ui/fonts';
import { makeUiTextures } from '../ui/theme';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    makeUiTextures(this);
    void loadFonts().then(() => this.scene.start('PreloadScene'));
  }
}
