// Dominio: seba. Stub registrado en main.ts (fase 1); se completa en fases 4–6.
import Phaser from 'phaser';

export class CreditsScene extends Phaser.Scene {
  constructor() {
    super('CreditsScene');
  }

  create(): void {
    this.scene.stop();
  }
}
