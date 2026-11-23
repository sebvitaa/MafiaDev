// Dominio: vicho (V18). Carteles (objetos type "sign", prop "text"): el texto aparece al acercarse.
import Phaser from 'phaser';
import { objectsOfType, prop } from './tiled';

const REACH = 30;

export function installSigns(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap, player: { x: number; y: number }): void {
  const signs = objectsOfType(map, 'sign').map((o) => {
    const x = o.x!, y = o.y!;
    const g = scene.add.graphics().setDepth(y);
    g.fillStyle(0x3a2c20).fillRect(x - 1, y - 12, 2, 12); // poste
    g.fillStyle(0x6b5a4a).fillRect(x - 8, y - 18, 16, 9); // tabla
    g.fillStyle(0x8a7560).fillRect(x - 8, y - 18, 16, 1);
    g.fillStyle(0x2a1e14).fillRect(x - 5, y - 15, 10, 1).fillRect(x - 5, y - 12, 7, 1); // "letras"
    const label = scene.add.text(x, y - 22, prop(o, 'text') ?? '', {
      fontFamily: 'monospace', fontSize: '8px', color: '#efe6cf', align: 'center',
      backgroundColor: '#0b0a10cc', padding: { x: 3, y: 2 }, wordWrap: { width: 140 },
    }).setOrigin(0.5, 1).setDepth(1e5).setAlpha(0);
    return { x, y, label };
  });

  const onUpdate = () => {
    for (const s of signs) {
      const near = Phaser.Math.Distance.Between(player.x, player.y, s.x, s.y) < REACH;
      s.label.setAlpha(Phaser.Math.Linear(s.label.alpha, near ? 1 : 0, 0.2));
    }
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, onUpdate);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.UPDATE, onUpdate));
}
