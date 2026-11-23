// Dominio: vicho (V16 + V17). Pared ilusoria (false_wall) que esconde un cofre y atajo de un solo sentido
// (shortcut, prop "from"): ambos son tiles de la capa walls que desaparecen al interactuar (E).
// shortcut: lo abierto vive solo en esta partida; persistir cuando SaveData tenga campo de mundo (shared).
import Phaser from 'phaser';
import { distToRect, floatText, interactKey, objectsOfType, prop, type TiledObject } from './tiled';

const REACH = 18;

type Side = 'north' | 'south' | 'east' | 'west';
const onSide = (o: TiledObject, side: Side, x: number, y: number): boolean =>
  side === 'north' ? y < o.y! : side === 'south' ? y > o.y! + o.height! : side === 'west' ? x < o.x! : x > o.x! + o.width!;

export function installPassages(
  scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap, walls: Phaser.Tilemaps.TilemapLayer, player: { x: number; y: number },
): void {
  const passages = [
    ...objectsOfType(map, 'false_wall').map((o) => ({ o, kind: 'false' as const, open: false })),
    ...objectsOfType(map, 'shortcut').map((o) => ({ o, kind: 'shortcut' as const, open: false })),
  ];
  const pressed = interactKey(scene);

  const open = (o: TiledObject) => {
    const x0 = Math.floor(o.x! / 16), y0 = Math.floor(o.y! / 16);
    const x1 = Math.ceil((o.x! + o.width!) / 16), y1 = Math.ceil((o.y! + o.height!) / 16);
    for (let ty = y0; ty < y1; ty++) for (let tx = x0; tx < x1; tx++) walls.removeTileAt(tx, ty);
    scene.cameras.main.shake(180, 0.004);
  };

  const onUpdate = () => {
    if (!pressed()) return;
    const near = passages.find((p) => !p.open && distToRect(p.o, player.x, player.y) < REACH);
    if (!near) return;
    const cx = near.o.x! + near.o.width! / 2;
    if (near.kind === 'shortcut' && !onSide(near.o, prop<Side>(near.o, 'from') ?? 'north', player.x, player.y)) {
      floatText(scene, cx, near.o.y!, 'No se abre desde este lado');
      return;
    }
    near.open = true;
    open(near.o);
    floatText(scene, cx, near.o.y!, near.kind === 'false' ? 'La pared era una ilusión' : 'Atajo abierto', '#ffd75e');
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, onUpdate);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.UPDATE, onUpdate));
}
