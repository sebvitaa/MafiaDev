// Dominio: vicho. Utilidades para leer objetos de Tiled (capa "objects").
import Phaser from 'phaser';

export type TiledObject = Phaser.Types.Tilemaps.TiledObject;

/** Valor de una custom property de Tiled, o undefined. */
export const prop = <T = string>(o: TiledObject, name: string): T | undefined =>
  (o.properties as { name: string; value: T }[] | undefined)?.find((p) => p.name === name)?.value;

export const objectsOfType = (map: Phaser.Tilemaps.Tilemap, type: string): TiledObject[] =>
  map.filterObjects('objects', (o) => o.type === type) ?? [];

/** Distancia de un punto al rectángulo (0 si está dentro). */
export const distToRect = (o: TiledObject, x: number, y: number): number =>
  Math.hypot(Math.max(o.x! - x, 0, x - (o.x! + o.width!)), Math.max(o.y! - y, 0, y - (o.y! + o.height!)));

/** Texto flotante que sube y se desvanece (avisos del mundo). */
export function floatText(scene: Phaser.Scene, x: number, y: number, text: string, color = '#d8c69b'): void {
  const t = scene.add.text(x, y, text, { fontFamily: 'monospace', fontSize: '8px', color, align: 'center' })
    .setOrigin(0.5, 1).setDepth(1e5);
  scene.tweens.add({ targets: t, y: y - 16, alpha: 0, duration: 1800, onComplete: () => t.destroy() });
}

/** Pulsaciones de E (interactuar) acumuladas entre frames. SUP-vicho-20261123-121240. */
export function interactKey(scene: Phaser.Scene): () => boolean {
  let pressed = false;
  const onE = () => { pressed = true; };
  scene.input.keyboard!.on('keydown-E', onE);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.input.keyboard?.off('keydown-E', onE));
  return () => { const p = pressed; pressed = false; return p; };
}
