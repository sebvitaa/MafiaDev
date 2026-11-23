// Estado de habilidades bajo el minimapa, en texto HD (DOM) nítido: el texto Phaser con zoom 0.75 se veía borroso y el minimapa lo tapaba.
import Phaser from 'phaser';
import { hdLayer } from './hd/HdLayer';
import tuning from '../data/tuning.json';

const X = 6, Y = 84, W = 150; // justo bajo el minimapa (src/world/bigMap.ts MINI: y 22 + h 58)

export function installGameStatus(scene: Phaser.Scene, fireball: { aiming: boolean; cooldownRemainingMs: number }): void {
  const layer = hdLayer(scene);
  const cooldown = tuning.roomPrototype.fireballCooldownMs;
  const ulti = layer.text(X, Y, 'R · ULTI', { depth: 50, fontSize: 8, weight: 600, color: '#ffb36b', letterSpacing: '.06em' });
  const track = layer.el('div', { x: X + 26, y: Y + 2, width: 60, height: 5, depth: 50,
    style: { background: 'rgba(7,7,13,.85)', border: '1px solid #5a5370', boxSizing: 'border-box' } });
  const fill = layer.el('div', { x: 0, y: 0, height: 3, depth: 51, parent: track, style: { background: '#ff7a3d' } });
  const tp = layer.text(X, Y + 10, '', { depth: 50, width: W, fontSize: 8, color: '#ffe5a3', letterSpacing: '.04em', lineHeight: 10 });

  const onUpdate = () => {
    const remaining = fireball.cooldownRemainingMs;
    const ratio = 1 - Math.min(1, remaining / cooldown);
    fill.style.width = `${Math.round(58 * ratio)}px`;
    fill.style.background = ratio >= 1 ? (fireball.aiming ? '#ffe36b' : '#ff7a3d') : '#8a4a2a';
    ulti.textContent = fireball.aiming ? 'R ▸' : ratio >= 1 ? 'R · ULTI' : `R ${Math.ceil(remaining / 1000)}s`;
    // Teleport (abilities) sigue escribiendo su texto Phaser (lo leen los tests); aquí solo se muestra la primera línea.
    const status = scene.children.getByName('teleport-status') as Phaser.GameObjects.Text | null;
    if (status) {
      status.setVisible(false);
      tp.textContent = (status.text.split('\n')[0] ?? '')+'\nI · HABILIDAD CLASE · ALMAS '+String(scene.registry.get('souls')??0);
    }
  };
  scene.events.on(Phaser.Scenes.Events.POST_UPDATE, onUpdate);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.POST_UPDATE, onUpdate));
}
