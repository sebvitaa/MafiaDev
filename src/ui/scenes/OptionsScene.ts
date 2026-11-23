// Dominio: seba. Stub registrado en main.ts (fase 1); se completa en fases 4–6.
import Phaser from 'phaser';

export class OptionsScene extends Phaser.Scene {
  constructor() {
    super('OptionsScene');
  }

  create(): void {
    this.scene.stop();
  }
}
