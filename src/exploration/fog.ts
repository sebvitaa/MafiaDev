// Dominio: vicho (V15). Niebla de guerra: celdas de 64 px visitadas (VisitedGrid), persistidas en
// GameState.visitedRooms como "cx,cy" (en mundo abierto cada celda hace de "sala"). La cámara principal la ignora:
// solo la ven el minimapa y el mapa grande.
import Phaser from 'phaser';
import { GameState } from '../core/GameState';
import { VisitedGrid } from './visited';

const CELL = 64;
const REVEAL = 2; // celdas alrededor del jugador (5x5 = ~lo que ve la cámara)

export function installFog(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap, player: { x: number; y: number }): Phaser.GameObjects.Graphics {
  const cols = Math.ceil(map.widthInPixels / CELL);
  const rows = Math.ceil(map.heightInPixels / CELL);
  const grid = VisitedGrid.fromKeys(cols, rows, CELL, GameState.data.visitedRooms);
  const fog = scene.add.graphics().setDepth(5e5);
  scene.cameras.main.ignore(fog);

  const redraw = () => {
    fog.clear().fillStyle(0x07070d, 1);
    for (let cy = 0; cy < rows; cy++) for (let cx = 0; cx < cols; cx++) {
      if (!grid.has(cx, cy)) fog.fillRect(cx * CELL, cy * CELL, CELL, CELL);
    }
  };
  redraw();

  const onUpdate = () => {
    let changed = false;
    for (let dy = -REVEAL; dy <= REVEAL; dy++) for (let dx = -REVEAL; dx <= REVEAL; dx++) {
      changed = grid.mark(player.x + dx * CELL, player.y + dy * CELL) || changed;
    }
    if (!changed) return;
    redraw();
    GameState.data.visitedRooms = grid.toKeys();
    GameState.save();
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, onUpdate);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.UPDATE, onUpdate));
  return fog;
}
