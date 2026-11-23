// Dominio: seba. Menú de pausa sobre la escena de juego.
import Phaser from 'phaser';
import { bus } from '../core/EventBus';

export class PauseScene extends Phaser.Scene {
  private from = 'GameScene';

  constructor() {
    super('PauseScene');
  }

  init(data: { from?: string }): void {
    this.from = data.from ?? 'GameScene';
  }

  create(): void {
    const { width: w, height: h } = this.scale;
    this.add.rectangle(0, 0, w, h, 0x0d0b15, 0.7).setOrigin(0);
    this.add.text(w / 2, h / 2, 'PAUSA\n\nESC para continuar', { fontFamily: 'monospace', fontSize: '12px', color: '#ebe7f4', align: 'center' }).setOrigin(0.5);
    const resume = () => {
      this.scene.resume(this.from);
      this.scene.stop();
      bus.emit('game:resumed', {});
    };
    this.input.keyboard?.once('keydown-ESC', resume);
    this.input.keyboard?.once('keydown-P', resume);
  }
}
