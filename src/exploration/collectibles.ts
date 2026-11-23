// Dominio: vicho (V20). Coleccionables (objetos type "collectible"): fragmentos brillantes que se recogen al tocarlos.
// shortcut: el contador vive solo en esta partida; persistir cuando SaveData tenga campo de mundo (shared).
import Phaser from 'phaser';
import { floatText, objectsOfType } from './tiled';

const REACH = 12;

export function installCollectibles(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap, player: { x: number; y: number }): void {
  const all = objectsOfType(map, 'collectible');
  let got = 0;
  const items = all.map((o) => {
    const x = o.x!, y = o.y!;
    const glow = scene.add.circle(x, y - 6, 9, 0x7ec8ff, 0.18).setDepth(y - 1).setBlendMode(Phaser.BlendModes.ADD);
    const gem = scene.add.graphics().setDepth(y);
    gem.fillStyle(0x7ec8ff).fillTriangle(x - 4, y - 6, x + 4, y - 6, x, y - 12);
    gem.fillStyle(0x3f7fd0).fillTriangle(x - 4, y - 6, x + 4, y - 6, x, y - 1);
    gem.fillStyle(0xe8f6ff).fillRect(x - 1, y - 9, 1, 2);
    scene.tweens.add({ targets: gem, y: -2, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    scene.tweens.add({ targets: glow, alpha: 0.45, duration: 600, yoyo: true, repeat: -1 });
    return { x, y, gem, glow, taken: false };
  });

  const onUpdate = () => {
    for (const c of items) {
      if (c.taken || Phaser.Math.Distance.Between(player.x, player.y, c.x, c.y) > REACH) continue;
      c.taken = true;
      got++;
      c.gem.destroy();
      c.glow.destroy();
      floatText(scene, c.x, c.y - 12, `Fragmento ${got}/${all.length}`, '#7ec8ff');
    }
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, onUpdate);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.UPDATE, onUpdate));
}
