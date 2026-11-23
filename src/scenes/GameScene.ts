// Dominio: vicho — composition root (SUP-seba-20261123-084249). SIN lógica de juego aquí:
// cada dominio se engancha con su install*() exportado desde su index.ts.
import Phaser from 'phaser';
import { installCamera, installWorld, preloadWorld } from '../world';
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

  preload(): void {
    preloadWorld(this);
  }

  create(): void {
    const world = installWorld(this);
    const character = installCharacter(this, 'luchador');
    this.player = installPlayer(this, world, character);
    installCamera(this, this.player); // después de installPlayer: reemplaza su startFollow
    installAudio(this);
    installUi(this);
  }
}
