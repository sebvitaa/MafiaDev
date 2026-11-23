// Dominio: vicho. Título de área estilo souls: la primera vez que entras a un bioma aparece su nombre
// en grande, centrado en la cámara principal, y se desvanece. Nombres provisorios (ver docs/LORE.md de seba).
import Phaser from 'phaser';
import { biomeAt, type Biome } from './biomeTiles';

const NAMES: Record<Biome, string> = {
  ruins: 'LA TIERRA MUERTA',
  forest: 'EL BOSQUE FRONDOSO',
  bright: 'LA CUEVA DE CRISTAL',
  arena: 'EL SET · CANAL 23',
  redforest: 'EL BOSQUE CARMESÍ',
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
      // 4 s en total (600 entrada + 2800 + 600 salida). from:0 explícito: si se corta a medio fade, el yoyo vuelve a 0 y no queda pegado.
      scene.tweens.add({ targets: [title, rule], alpha: { from: 0, to: 1 }, duration: 600, hold: b === 'arena' ? 500 : 2800, yoyo: true });
    }
    // Fijo a la pantalla aunque la cámara tenga zoom: se coloca en el centro de lo que ve y se escala con 1/zoom.
    const { centerX, centerY } = cam.worldView;
    const s = 1 / cam.zoom;
    const offset = b === 'arena' ? 92 : 40;
    title.setPosition(centerX, centerY - offset * s).setScale(s);
    rule.setPosition(centerX, centerY - (offset - 12) * s).setScale(s);
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, onUpdate);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.UPDATE, onUpdate));
}
