// Dominio: seba. Overlay de muerte (fase 6): cámara lenta + desaturación + «HAS MUERTO» estilo Elden Ring. Lo lanza installUi con player:died
// y se cierra con player:respawned (vicho) o, como fallback, a los 4 s (SUP-seba-20261123-102354).
import Phaser from 'phaser';
import { bus } from '../../core/EventBus';
import { scanlines, text } from '../theme';

const FALLBACK_MS = 4000;
const SLOWMO_MS = 900;

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
    this.slowmo(true);
    const shade = this.add.rectangle(0, 0, w, h, 0x000000, 0).setOrigin(0);
    this.tweens.add({ targets: shade, fillAlpha: 0.35, duration: 900 });

    // 6.2 — «HAS MUERTO» como en Elden Ring: banda oscura difuminada, rojo carmesí, aparece lento y crece
    this.makeBand();
    const band = this.add.image(w / 2, h / 2, 'ui-death-band').setDisplaySize(w, 64).setAlpha(0);
    this.tweens.add({ targets: band, alpha: 0.9, duration: 900, delay: 500 });
    const title = text(this, w / 2, h / 2, 'HAS MUERTO', { size: 32, color: 0xc4223a, align: 'center' }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: title, alpha: 1, duration: 1400, delay: 700, ease: 'Sine.In' });
    this.tweens.add({ targets: title, scale: 1.08, duration: 3600, delay: 700, ease: 'Linear' });
    scanlines(this, 0.1);

    // la cámara lenta dura lo que el golpe final; luego vuelve a velocidad normal bajo el texto
    this.time.delayedCall(SLOWMO_MS, () => this.slowmo(false));
    const close = () => this.close();
    bus.once('player:respawned', close, this);
    this.time.delayedCall(FALLBACK_MS, close);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { bus.offContext(this); this.desaturate(false); this.slowmo(false); });
  }

  /** Banda horizontal negra con bordes difuminados (canvas generado, 0 KB). */
  private makeBand(): void {
    if (this.textures.exists('ui-death-band')) return;
    const tex = this.textures.createCanvas('ui-death-band', 4, 64);
    if (!tex) return;
    const ctx = tex.getContext();
    const g = ctx.createLinearGradient(0, 0, 0, 64);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.3, 'rgba(0,0,0,0.85)');
    g.addColorStop(0.7, 'rgba(0,0,0,0.85)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4, 64);
    tex.refresh();
  }

  /** 6.1 — cámara lenta de la escena de juego (se restaura siempre al cerrar). */
  private slowed = false;
  private slowmo(on: boolean): void {
    if (this.slowed === on) return;
    this.slowed = on;
    try {
      const g = this.scene.get(this.from);
      if (!g) return;
      const k = on ? 0.25 : 1;
      g.time.timeScale = k;
      g.tweens.timeScale = k;
      const world = (g as Phaser.Scene & { physics?: Phaser.Physics.Arcade.ArcadePhysics }).physics?.world;
      if (world) world.timeScale = on ? 4 : 1; // en Arcade, timeScale > 1 = más lento
      g.anims.globalTimeScale = k;
    } catch {
      /* escena de juego ya cerrada */
    }
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
