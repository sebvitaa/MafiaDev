// Dominio: vicho — tilemaps, salas, puertas, cámara, parallax, ambientación.
// STUB: geometría de prueba hasta que exista el primer mapa de Tiled (public/assets/maps/).
import Phaser from 'phaser';
import { installExploration } from '../exploration';

export interface World {
  solids: Phaser.Physics.Arcade.StaticGroup;
  bounds: Phaser.Geom.Rectangle;
  spawn: { x: number; y: number };
}

export function installWorld(scene: Phaser.Scene): World {
  const W = 960;
  const H = 270;
  const bounds = new Phaser.Geom.Rectangle(0, 0, W, H);
  scene.physics.world.setBounds(0, 0, W, H);
  scene.cameras.main.setBounds(0, 0, W, H);

  const solids = scene.physics.add.staticGroup();
  const block = (x: number, y: number, w: number, h: number) => {
    const r = scene.add.rectangle(x, y, w, h, 0x3a3352).setOrigin(0);
    scene.physics.add.existing(r, true);
    solids.add(r);
  };
  block(0, H - 16, W, 16); // suelo
  block(140, 196, 80, 8);
  block(300, 156, 80, 8);
  block(470, 196, 120, 8);
  block(660, 140, 64, 8);

  installExploration(scene);
  return { solids, bounds, spawn: { x: 48, y: H - 48 } };
}
