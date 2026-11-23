// Dominio: vicho — composition root (SUP-seba-20261123-084249). SIN lógica de juego aquí:
// cada dominio se engancha con su install*() exportado desde su index.ts.
import Phaser from 'phaser';
import { installWorld } from '../world';
import { installCharacter } from '../character';
import { installPlayer, type Player } from '../player';
import { installAudio } from '../audio';
import { installUi } from '../ui';

export class GameScene extends Phaser.Scene {
  /** Público para tests e2e (tests/e2e/smoke.spec.ts). */
  player!: Player;

  constructor() {
    super('GameScene');
  }

  create(): void {
    const world = installWorld(this);
    const character = installCharacter(this, 'luchador');
    this.player = installPlayer(this, world, character);
    installAudio(this);
    installUi(this);
  }
}
