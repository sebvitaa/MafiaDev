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
  installGlobalKeys(scene, { inGame: true }); // M = mapa y F = viaje rápido (vicho): aquí solo 0 silencia
  scene.input.setDefaultCursor('none');
  const ctx = {};
  bus.on('room:entered', ({ roomId }) => {
    if (roomId !== 'set' || scene.registry.get('setCinematicSeen') || !scene.scene.isActive()) return;
    scene.registry.set('setCinematicSeen', true);
    const resumeHud = scene.scene.isActive('HudScene');
    if (resumeHud) scene.scene.pause('HudScene');
    scene.scene.pause();
    scene.scene.launch('CinematicScene', { stage: 3, fromRoom: true, resumeHud });
  }, ctx);
  const pause = () => {
    if (!scene.scene.isActive() || scene.scene.isActive('PauseScene') || scene.scene.isActive('GameOverScene')) return;
    scene.scene.pause();
    scene.scene.launch('PauseScene', { from: scene.scene.key });
    bus.emit('game:paused', {});
  };
  const onBlur = () => pause();
  const onVisibility = () => { if (document.visibilityState === 'hidden') pause(); };
  const keyboard = scene.input.keyboard;
  keyboard?.on('keydown-ESC', pause);
  keyboard?.on('keydown-P', pause);
  scene.game.events.on(Phaser.Core.Events.BLUR, onBlur);
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisibility);
  bus.on('player:died', () => scene.scene.launch('GameOverScene', { from: scene.scene.key }), ctx);
  let endingStarted = false;
  // 6.28 — fin de la demo: al caer el jefe, tras la fanfarria, «gracias por jugar» + créditos
  bus.on('enemy:killed', ({ kind }) => {
    if (kind !== 'boss' || endingStarted) return;
    endingStarted = true;
    scene.scene.pause();
    scene.scene.pause('HudScene');
    scene.scene.launch('EndingScene', { from: scene.scene.key });
  }, ctx);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    keyboard?.off('keydown-ESC', pause);
    keyboard?.off('keydown-P', pause);
    scene.game.events.off(Phaser.Core.Events.BLUR, onBlur);
    if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisibility);
    scene.input.setDefaultCursor('default');
    bus.offContext(ctx);
    scene.scene.stop('HudScene');
    scene.scene.stop('GameOverScene');
  });
}
