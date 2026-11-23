// Dominio: seba — HUD en escena paralela (no se mueve con la cámara del juego).
import Phaser from 'phaser';
import { bus } from '../core/EventBus';
import { GameState } from '../core/GameState';

export class HudScene extends Phaser.Scene {
  private hpText!: Phaser.GameObjects.Text;

  constructor() {
    super('HudScene');
  }

  create(): void {
    const { hp, maxHp } = GameState.data;
    this.hpText = this.add.text(8, 6, '', { fontFamily: 'monospace', fontSize: '10px', color: '#ff5fa2' });
    this.setHp(hp, maxHp);
    bus.on('player:hit', (e) => this.setHp(e.hp, e.maxHp), this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => bus.offContext(this));
  }

  private setHp(hp: number, maxHp: number): void {
    this.hpText.setText('♥'.repeat(Math.max(0, hp)) + '·'.repeat(Math.max(0, maxHp - hp)));
  }
}
