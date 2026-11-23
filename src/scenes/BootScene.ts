// Dominio: seba. Carga mínima (fuente/logo de la barra) y pasa a Preload.
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    this.scene.start('PreloadScene');
  }
}
