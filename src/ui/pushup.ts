// Dominio: seba. Personaje de la pantalla de carga: hace una flexión cada vez que se pulsa X (fase 2 · 2.31).
import Phaser from 'phaser';
import { C, pixelTexture } from './theme';

const PAL = { h: 0x5a4f7a, f: 0xf2c3a0, c: C.accent2, l: 0x8a83a3, a: C.accent2 };

export function makePushupTextures(scene: Phaser.Scene): void {
  pixelTexture(scene, 'ui-pushup-up', [
    '...................hh.',
    '..................hhhh',
    '...................ff.',
    '..............ccccff..',
    '..........cccccccc.a..',
    '......cccccccc.....a..',
    '..llllcccc.........a..',
    'llll...............a..',
    'l..................aa.',
  ], PAL);
  pixelTexture(scene, 'ui-pushup-down', [
    '......................',
    '......................',
    '......................',
    '...................hh.',
    '..................hhhh',
    '..........cccccccccff.',
    '..lllllcccccccc..aa...',
    'lllll............a....',
    'l................aa...',
  ], PAL);
}

/** Sprite que baja y sube; `pump()` devuelve false si aún está a mitad de la flexión anterior. */
export class PushupGuy {
  readonly sprite: Phaser.GameObjects.Image;
  count = 0;
  private busy = false;

  constructor(private readonly scene: Phaser.Scene, x: number, y: number, scale = 2) {
    makePushupTextures(scene);
    this.sprite = scene.add.image(x, y, 'ui-pushup-up').setOrigin(0.5, 1).setScale(scale);
  }

  pump(onCount: (n: number) => void): boolean {
    if (this.busy) return false;
    this.busy = true;
    this.sprite.setTexture('ui-pushup-down');
    this.scene.time.delayedCall(110, () => {
      this.sprite.setTexture('ui-pushup-up');
      this.count++;
      onCount(this.count);
      this.scene.time.delayedCall(40, () => { this.busy = false; });
    });
    return true;
  }
}
