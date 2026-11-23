// Dominio: seba. Teclas globales en cualquier escena con UI: 0 = silencio; en menús también M = silencio y F = pantalla completa.
// En el juego, M (mapa grande) y F (viaje rápido) son de vicho (src/world/bigMap.ts, src/exploration/checkpoints.ts):
// si las escuchamos aquí, abrir el mapa silenciaba la música. Por eso en el juego solo queda el 0.
import Phaser from 'phaser';
import { AudioDirector, settings } from '../audio';
import { C, reducedMotion, text } from './theme';
import { globalKeyCodes } from './globalKeyCodes';

/** `inGame`: la escena es la de juego, donde M y F pertenecen al mundo. */
export function installGlobalKeys(scene: Phaser.Scene, { inGame = false }: { inGame?: boolean } = {}): void {
  const kb = scene.input.keyboard;
  if (!kb) return;
  const codes = globalKeyCodes(inGame);
  const onMute = () => {
    if (!scene.scene.isActive()) return;
    const muted = AudioDirector.toggleMute();
    toast(scene, muted ? 'SONIDO: NO' : 'SONIDO: SÍ');
  };
  const onFullscreen = () => {
    if (!scene.scene.isActive()) return;
    if (scene.scale.isFullscreen) scene.scale.stopFullscreen();
    else scene.scale.startFullscreen();
  };
  for (const k of codes.mute) kb.on(`keydown-${k}`, onMute);
  for (const k of codes.fullscreen) kb.on(`keydown-${k}`, onFullscreen);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    for (const k of codes.mute) kb.off(`keydown-${k}`, onMute);
    for (const k of codes.fullscreen) kb.off(`keydown-${k}`, onFullscreen);
  });
}

/** Temblor visual respetando las preferencias de accesibilidad del jugador. */
export function shake(scene: Phaser.Scene, durationMs: number, intensity: number): void {
  if (!settings.get().screenShake) return;
  if (!reducedMotion(settings.get().reducedMotion)) scene.cameras.main.shake(durationMs, intensity);
}

/** Aviso breve arriba a la derecha. */
export function toast(scene: Phaser.Scene, msg: string, color: number = C.text): void {
  const t = text(scene, scene.scale.width - 6, 6, msg, { color, align: 'right', stroke: true }).setOrigin(1, 0).setDepth(2000).setScrollFactor(0);
  scene.tweens.add({ targets: t, alpha: 0, y: 0, delay: 900, duration: 300, onComplete: () => t.destroy() });
}
