// Dominio: vicho (V10). Cofres del mapa (objetos type "chest" de Tiled): se abren interactuando (E) cerca.
// SUP-vicho-interact: tecla E leída localmente hasta que exista la acción 'interact' en src/core/Input.ts (shared).
import Phaser from 'phaser';
import { bus } from '../core/EventBus';
import { RARITY_COLOR, rollTable } from '../items';
import { prop } from './tiled';

const CLOSED = 'chest-closed';
const OPEN = 'chest-open';
const REACH = 22;

// shortcut: cofre dibujado pixel a pixel (16x14); cambiar por sprite real cuando haya arte.
function makeChestTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(CLOSED)) return;
  for (const [key, open] of [[CLOSED, false], [OPEN, true]] as const) {
    const g = scene.add.graphics();
    g.fillStyle(0x3a2414).fillRect(1, 5, 14, 9); // cuerpo
    g.fillStyle(0x6b4423).fillRect(2, 6, 12, 7);
    g.fillStyle(0xc9a227).fillRect(1, 8, 14, 1).fillRect(7, 6, 2, 4); // banda y cerradura
    if (open) {
      g.fillStyle(0x140c08).fillRect(2, 3, 12, 3); // interior
      g.fillStyle(0xffd75e).fillRect(5, 4, 6, 1);
      g.fillStyle(0x6b4423).fillRect(1, 0, 14, 3); // tapa abierta
    } else {
      g.fillStyle(0x8a5a2e).fillRect(1, 1, 14, 5); // tapa
      g.fillStyle(0xc9a227).fillRect(1, 1, 14, 1);
    }
    g.generateTexture(key, 16, 14);
    g.destroy();
  }
}

export function installChests(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap, player: { x: number; y: number }): void {
  makeChestTextures(scene);
  // Evento de tecla (no JustDown por frame): no se pierde una pulsación más corta que un frame.
  let pressed = false;
  const onE = () => { pressed = true; };
  scene.input.keyboard!.on('keydown-E', onE);
  const chests = map.filterObjects('objects', (o) => o.type === 'chest')!.map((o) => ({
    id: o.name,
    hidden: prop<boolean>(o, 'hidden') === true,
    sprite: scene.add.image(o.x!, o.y!, CLOSED).setOrigin(0.5, 1).setDepth(o.y!),
    open: false,
  }));
  const hint = scene.add.text(0, 0, 'E', { fontFamily: 'monospace', fontSize: '8px', color: '#ffd75e' })
    .setOrigin(0.5, 1).setDepth(1e5).setVisible(false);

  const onUpdate = () => {
    const near = chests.find((c) => !c.open && Phaser.Math.Distance.Between(player.x, player.y, c.sprite.x, c.sprite.y) < REACH);
    const wantsOpen = pressed;
    pressed = false;
    hint.setVisible(!!near);
    if (!near) return;
    hint.setPosition(near.sprite.x, near.sprite.y - 16);
    if (!wantsOpen) return;
    near.open = true;
    near.sprite.setTexture(OPEN);
    bus.emit('chest:opened', { id: near.id, hidden: near.hidden });
    const item = rollTable(near.hidden ? 'chest_hidden' : 'chest');
    if (!item) return;
    // shortcut: el item se "recoge" directo con aviso flotante; el drop físico es de alejandro (A4).
    bus.emit('item:picked', { itemId: item.id, rarity: item.rarity });
    const label = scene.add.text(near.sprite.x, near.sprite.y - 18, item.name, {
      fontFamily: 'monospace', fontSize: '8px', color: `#${RARITY_COLOR[item.rarity].toString(16).padStart(6, '0')}`,
    }).setOrigin(0.5, 1).setDepth(1e5);
    scene.tweens.add({ targets: label, y: label.y - 14, alpha: 0, duration: 1600, onComplete: () => label.destroy() });
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, onUpdate);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.events.off(Phaser.Scenes.Events.UPDATE, onUpdate);
    scene.input.keyboard?.off('keydown-E', onE);
  });
}
