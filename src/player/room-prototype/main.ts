import Phaser from 'phaser';
import { ROOM, RoomScene } from './RoomScene';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'room-prototype',
  width: ROOM.width,
  height: ROOM.height,
  pixelArt: true,
  backgroundColor: '#0b141e',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
  scene: [RoomScene],
});

if (import.meta.env.DEV) window.__game = game;
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (window.__game === game) delete window.__game;
    game.destroy(true);
  });
}
