// Dominio: seba. Overlay de muerte: desaturación + viñeta + «HAS MUERTO». Lo lanza installUi con player:died
// y se cierra con player:respawned (vicho) o, como fallback, a los 4 s (SUP-seba-20261123-102354).
import Phaser from 'phaser';
import { bus } from '../../core/EventBus';
import { C, scanlines, text } from '../theme';

const FALLBACK_MS = 4000;

export class GameOverScene extends Phaser.Scene {
  private from = 'GameScene';
  private grade: Phaser.Filters.ColorMatrix | null = null;

  constructor() {
    super('GameOverScene');
  }

  init(data: { from?: string }): void {
    this.from = data.from ?? 'GameScene';
  }

  create(): void {
    const { width: w, height: h } = this.scale;
    this.desaturate(true);
    const shade = this.add.rectangle(0, 0, w, h, 0x000000, 0).setOrigin(0);
    this.tweens.add({ targets: shade, fillAlpha: 0.55, duration: 700 });
    const vig = this.add.image(w / 2, h / 2, 'ui-vignette').setDisplaySize(w, h).setAlpha(0);
    this.tweens.add({ targets: vig, alpha: 0.6, duration: 700 });

    const title = text(this, w / 2, h / 2 - 12, 'HAS MUERTO', { size: 24, color: C.danger, align: 'center', stroke: true }).setOrigin(0.5).setAlpha(0).setScale(1.6);
    this.tweens.add({ targets: title, alpha: 1, scale: 1, duration: 600, delay: 600, ease: 'Back.Out' });
    const sub = text(this, w / 2, h / 2 + 16, 'FIN DEL TRATO... POR AHORA', { color: C.dim, align: 'center' }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: sub, alpha: 1, duration: 400, delay: 1300 });
    scanlines(this, 0.1);

    const close = () => this.close();
    bus.once('player:respawned', close, this);
    this.time.delayedCall(FALLBACK_MS, close);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { bus.offContext(this); this.desaturate(false); });
  }

  private close(): void {
    if (!this.scene.isActive()) return;
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.stop());
  }

  /** Desatura la cámara del juego (solo WebGL; en Canvas se omite). */
  private desaturate(on: boolean): void {
    try {
      const cam = this.scene.get(this.from)?.cameras?.main;
      if (!cam?.filters) return;
      if (on && !this.grade) {
        this.grade = cam.filters.internal.addColorMatrix();
        this.grade.colorMatrix.desaturate();
      } else if (!on && this.grade) {
        cam.filters.internal.remove(this.grade);
        this.grade = null;
      }
    } catch {
      /* renderer sin filtros */
    }
  }
}
