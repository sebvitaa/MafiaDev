// Dominio: seba — HUD y pausa.
import Phaser from 'phaser';
import { bus } from '../core/EventBus';

export { HudScene } from './HudScene';

export function installUi(scene: Phaser.Scene): void {
  scene.scene.launch('HudScene');
  const pause = () => {
    scene.scene.pause();
    scene.scene.launch('PauseScene', { from: scene.scene.key });
    bus.emit('game:paused', {});
  };
  scene.input.keyboard?.on('keydown-ESC', pause);
  scene.input.keyboard?.on('keydown-P', pause);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.scene.stop('HudScene'));
}
export { OptionsScene } from './scenes/OptionsScene';
export { GameOverScene } from './scenes/GameOverScene';
export { CreditsScene } from './scenes/CreditsScene';
