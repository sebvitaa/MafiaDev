// Dominio: seba. Pantalla de inicio. La primera tecla también desbloquea el audio del navegador.
import Phaser from 'phaser';
import { GameState } from '../core/GameState';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create(): void {
    const { width: w, height: h } = this.scale;
    this.add.text(w / 2, h / 2 - 24, 'MAFIADEV', { fontFamily: 'monospace', fontSize: '28px', color: '#ff5fa2' }).setOrigin(0.5);
    const hint = this.add.text(w / 2, h / 2 + 24, 'Pulsa cualquier tecla', { fontFamily: 'monospace', fontSize: '10px', color: '#ebe7f4' }).setOrigin(0.5);
    this.tweens.add({ targets: hint, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

    this.input.keyboard?.once('keydown', () => {
      GameState.load();
      this.scene.start('GameScene');
    });
  }
}
