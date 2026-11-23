// Dominio: seba. Carga la fuente pixel y las texturas generadas de UI; luego Preload (apertura + carga).
// Con ?lab monta el entorno de pruebas de audio y pantallas (src/ui/lab) y Preload termina en LabScene.
import Phaser from 'phaser';
import { loadFonts } from '../ui/fonts';
import { setFavicon } from '../ui/logo';
import { makeUiTextures } from '../ui/theme';

const labRequested = (): boolean => {
  try { return new URLSearchParams(globalThis.location?.search ?? '').has('lab'); } catch { return false; }
};

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x000000);
    makeUiTextures(this);
    setFavicon();
    const lab = labRequested()
      ? import('../ui/lab').then((m) => {
        m.ensureLabScene(this.game);
        m.mountLabPanel(this.game);
        this.registry.set('labMode', true);
      }).catch((e: unknown) => console.warn('[lab] no se pudo montar', e))
      : Promise.resolve();
    void Promise.all([loadFonts(), lab]).then(() => this.scene.start('PreloadScene'));
  }
}
