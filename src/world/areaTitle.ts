// Dominio: vicho. Título de área estilo souls: la primera vez que entras a un bioma aparece su nombre
// en grande, centrado en la cámara principal, y se desvanece. Nombres provisorios (ver docs/LORE.md de seba).
import Phaser from 'phaser';
import { biomeAt, type Biome } from './biomeTiles';

const NAMES: Record<Biome, string> = {
  ruins: 'LAS RUINAS DEL MUELLE',
  forest: 'EL BOSQUE INVERTIDO',
  bright: 'EL CLARO DE LA ÚLTIMA LUZ',
  arena: 'LA RECTA FINAL',
};

export function installAreaTitles(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap, player: { x: number; y: number }, hiddenFrom: Phaser.Cameras.Scene2D.Camera[]): void {
  const cam = scene.cameras.main;
  const seen = new Set<Biome>();
  const title = scene.add.text(0, 0, '', {
    fontFamily: 'serif', fontSize: '18px', color: '#efe6cf', stroke: '#07070d', strokeThickness: 3,
  }).setOrigin(0.5).setDepth(2e6).setAlpha(0);
  const rule = scene.add.rectangle(0, 0, 220, 1, 0xd8c69b).setDepth(2e6).setAlpha(0);
  for (const c of hiddenFrom) c.ignore([title, rule]);

  const onUpdate = () => {
    const b = biomeAt(map, player.x, player.y);
    if (b && !seen.has(b)) {
      seen.add(b);
      title.setText(NAMES[b]);
      scene.tweens.killTweensOf([title, rule]);
      scene.tweens.add({ targets: [title, rule], alpha: 1, duration: 700, hold: 1800, yoyo: true });
    }
    // Fijo a la pantalla aunque la cámara tenga zoom: se coloca en el centro de lo que ve y se escala con 1/zoom.
    const { centerX, centerY } = cam.worldView;
    const s = 1 / cam.zoom;
    title.setPosition(centerX, centerY - 40 * s).setScale(s);
    rule.setPosition(centerX, centerY - 28 * s).setScale(s);
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, onUpdate);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.UPDATE, onUpdate));
}
