// Dominio: seba. Apertura (encendido CRT + logo) que tapa la carga de TODOS los assets.
// Sin sonido: el navegador no deja reproducir audio hasta la primera tecla (eso ocurre en Title).
// Cada dominio añade sus claves pidiéndolo a seba (pending) o exportando una función preload*() desde su index.ts.
import Phaser from 'phaser';
import type { PlaceholderKey } from '../types/assets';
import { AudioDirector, preloadAudio, settings } from '../audio';
import { C, reducedMotion, scanlines, skipIntro, text } from '../ui/theme';
import { fadeOut } from '../ui/transitions';

const TIPS = [
  'Un parry a tiempo vale más que tres golpes.',
  'Parar el tiempo también congela los proyectiles.',
  'Los cofres ocultos suenan distinto. Escucha.',
  'Pulsa ESC para pausar y ajustar el volumen.',
  'M silencia el juego. F, pantalla completa.',
  'La ciudad nunca duerme. Tú tampoco deberías.',
];

export class PreloadScene extends Phaser.Scene {
  private animDone!: Promise<void>;

  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    const fast = skipIntro() || reducedMotion(settings.get().reducedMotion);
    this.animDone = fast ? Promise.resolve() : this.playOpening();
    this.buildLoadingBar(fast);

    this.load.image('title-sky', 'assets/ui/title/title-sky.png');
    this.load.image('title-skyline', 'assets/ui/title/title-skyline.png');
    this.load.image('title-street', 'assets/ui/title/title-street.png');
    this.load.image('title-logo', 'assets/ui/title/title-logo.png');
    preloadAudio(this);
    // Ejemplos de otros dominios (descomentar cuando existan):
    // this.load.aseprite('player', 'assets/sprites/player/player.png', 'assets/sprites/player/player.json');
    // this.load.tilemapTiledJSON('zona1', 'assets/maps/zona1.json');
  }

  create(): void {
    this.makePlaceholder('ph-player', 12, 24, '#45d6c4');
    this.makePlaceholder('ph-enemy', 16, 16, '#ff5fa2');
    this.makePlaceholder('ph-tile', 16, 16, '#3a3352');
    AudioDirector.init(this.game);
    // max(animación, carga): la carga ya terminó al llegar a create(); falta esperar la animación.
    void this.animDone.then(async () => {
      if (!skipIntro()) await fadeOut(this, 250);
      this.scene.start('TitleScene');
    });
  }

  /** ~1,9 s: píxel → línea → pantalla (encendido CRT) → letras que caen con glitch. */
  private playOpening(): Promise<void> {
    const { width: w, height: h } = this.scale;
    const done = new Promise<void>((resolve) => {
      const skip = () => resolve();
      this.input.keyboard?.once('keydown', skip);
      this.input.once('pointerdown', skip);

      const beam = this.add.rectangle(w / 2, h / 2, 2, 2, C.accent).setAlpha(0);
      this.tweens.chain({
        targets: beam,
        tweens: [
          { alpha: 1, duration: 150, delay: 150 },
          { scaleX: w / 2, duration: 280, ease: 'Expo.Out' },
          { scaleY: 40, alpha: 0.15, duration: 220, ease: 'Expo.In' },
          { alpha: 0, duration: 150 },
        ],
      });

      const word = 'MAFIADEV';
      const size = 24;
      // ancho real de cada letra (Silkscreen no es monoespaciada)
      const widths = [...word].map((ch) => { const m = text(this, 0, 0, ch, { size }); const wd = m.width; m.destroy(); return wd + 3; });
      let x = w / 2 - widths.reduce((a, b) => a + b, 0) / 2;
      [...word].forEach((ch, i) => {
        const ghost = text(this, x + 2, -30, ch, { size, color: C.accent2 }).setAlpha(0.6);
        const letter = text(this, x, -30, ch, { size, color: C.accent });
        this.tweens.add({
          targets: [letter, ghost], y: h / 2 - 40, duration: 420, delay: 850 + i * 45, ease: 'Back.Out',
        });
        this.tweens.add({ targets: ghost, x: x, alpha: 0, duration: 120, delay: 1350 + i * 45, yoyo: true, repeat: 2 });
        x += widths[i];
      });
      this.time.delayedCall(1900, resolve);
    });
    scanlines(this);
    return done;
  }

  private buildLoadingBar(fast: boolean): void {
    const { width: w, height: h } = this.scale;
    const y = h / 2 + 30;
    const frame = this.add.rectangle(w / 2, y, 202, 8).setStrokeStyle(1, C.panel);
    const bar = this.add.rectangle(frame.x - 100, y, 0, 4, C.accent).setOrigin(0, 0.5);
    const pct = text(this, w / 2, y + 8, '0%', { color: C.dim, align: 'center' }).setOrigin(0.5, 0);
    const runner = this.add.image(frame.x - 100, y - 7, 'ui-runner-0').setOrigin(0.5, 1);
    const tip = text(this, w / 2, h - 24, TIPS[Math.floor(Math.random() * TIPS.length)], { color: C.dim, align: 'center' }).setOrigin(0.5);
    for (const o of [frame, bar, pct, runner, tip]) o.setAlpha(fast ? 1 : 0);
    if (!fast) this.tweens.add({ targets: [frame, bar, pct, runner, tip], alpha: 1, duration: 250, delay: 700 });

    let frameIdx = 0;
    this.time.addEvent({ delay: 120, loop: true, callback: () => runner.setTexture(`ui-runner-${(frameIdx ^= 1)}`) });
    let t = 0;
    this.time.addEvent({ delay: 1300, loop: true, callback: () => tip.setText(TIPS[(++t + 1) % TIPS.length]) });
    this.load.on(Phaser.Loader.Events.PROGRESS, (p: number) => {
      bar.width = 200 * p;
      runner.x = frame.x - 100 + 200 * p;
      pct.setText(`${Math.round(p * 100)}%`);
    });
  }

  private makePlaceholder(key: PlaceholderKey, w: number, h: number, color: string): void {
    if (this.textures.exists(key)) return;
    const tex = this.textures.createCanvas(key, w, h);
    if (!tex) return;
    const ctx = tex.getContext();
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);
    tex.refresh();
  }
}
