// Dominio: seba. Créditos en rodillo. Licencias completas en public/assets/audio/CREDITS.md.
import Phaser from 'phaser';
import { C, scanlines, text } from '../theme';
import { AudioDirector } from '../../audio';

const LINES: [string, number?][] = [
  ['MAFIADEV', C.accent],
  [''],
  ['UN JUEGO DE HACKATON', C.dim],
  [''],
  ['MAPA, EXPLORACION Y AMBIENTACION', C.accent2], ['VICHO'], [''],
  ['COMBATE Y MOVIMIENTO', C.accent2], ['BASTI'], [''],
  ['PERSONAJE Y HABILIDADES', C.accent2], ['ALEJANDRO'], [''],
  ['MUSICA, SONIDO Y PANTALLAS', C.accent2], ['SEBA'], [''],
  ['HERRAMIENTAS', C.accent],
  ['PHASER 4 (MIT) · TYPESCRIPT · VITE'],
  ['CLAUDE CODE Y CODEX/GPT'],
  [''],
  ['MUSICA Y EFECTOS', C.accent],
  ['PARTITURAS COMPUESTAS CON GPT-5,'],
  ['SINTETIZADAS CON UN CHIPTUNE PROPIO'],
  ['VOZ DEL NARRADOR: OPENAI TTS (VOZ IA)'],
  [''],
  ['ARTE DEL TITULO', C.accent],
  ['GENERADO CON GPT-IMAGE Y PIXELADO A MANO'],
  [''],
  ['TIPOGRAFIA', C.accent],
  ['SILKSCREEN · JASON KOTTKE (SIL OFL 1.1)'],
  [''],
  [''],
  ['GRACIAS POR JUGAR', C.accent],
];

export class CreditsScene extends Phaser.Scene {
  private from = 'TitleScene';

  constructor() {
    super('CreditsScene');
  }

  init(data: { from?: string }): void {
    this.from = data.from ?? 'TitleScene';
  }

  create(): void {
    const { width: w, height: h } = this.scale;
    this.add.rectangle(0, 0, w, h, C.bg, 0.94).setOrigin(0);
    const roll = this.add.container(w / 2, h + 10);
    LINES.forEach(([s, color], i) => roll.add(text(this, 0, i * 12, s, { color: color ?? C.text, align: 'center' }).setOrigin(0.5, 0)));
    const total = LINES.length * 12 + h + 20;
    this.tweens.add({ targets: roll, y: h + 10 - total, duration: total * 45, ease: 'Linear', onComplete: () => this.close() });
    scanlines(this, 0.08);
    text(this, w - 6, h - 12, 'ESC VOLVER', { color: C.dim, align: 'right' }).setOrigin(1, 0);
    this.time.delayedCall(200, () => this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
      if (['Escape', 'Enter', ' ', 'Backspace'].includes(e.key)) this.close();
    }));
  }

  private close(): void {
    AudioDirector.ui('sfx-ui-back');
    this.scene.resume(this.from);
    this.scene.stop();
  }
}
