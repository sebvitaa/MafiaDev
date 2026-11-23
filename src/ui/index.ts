// Dominio: seba — HUD, pausa, game over y teclas globales.
import Phaser from 'phaser';
import { bus } from '../core/EventBus';
import { installGlobalKeys } from './globalKeys';
import { fadeIn } from './transitions';

export { HudScene } from './HudScene';
export { OptionsScene } from './scenes/OptionsScene';
export { GameOverScene } from './scenes/GameOverScene';
export { CreditsScene } from './scenes/CreditsScene';

export function installUi(scene: Phaser.Scene): void {
  scene.scene.launch('HudScene');
  fadeIn(scene, 400);
  installGlobalKeys(scene);
  const ctx = {};
  const pause = () => {
    scene.scene.pause();
    scene.scene.launch('PauseScene', { from: scene.scene.key });
    bus.emit('game:paused', {});
  };
  scene.input.keyboard?.on('keydown-ESC', pause);
  scene.input.keyboard?.on('keydown-P', pause);
  bus.on('player:died', () => scene.scene.launch('GameOverScene', { from: scene.scene.key }), ctx);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    bus.offContext(ctx);
    scene.scene.stop('HudScene');
    scene.scene.stop('GameOverScene');
  });
}
