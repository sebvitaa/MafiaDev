// shared (congelado tras H1). Registrar aquí escenas nuevas.
import Phaser from 'phaser';
import tuning from './data/tuning.json';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { TitleScene } from './scenes/TitleScene';
import { GameScene } from './scenes/GameScene';
import { PauseScene } from './scenes/PauseScene';
import { HudScene } from './ui';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 480,
  height: 270,
  backgroundColor: '#13111c',
  pixelArt: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: tuning.gravity }, debug: false },
  },
  scene: [BootScene, PreloadScene, TitleScene, GameScene, PauseScene, HudScene],
});

// Gancho para tests e2e y depuración desde consola (solo en dev).
if (import.meta.env.DEV) window.__game = game;
