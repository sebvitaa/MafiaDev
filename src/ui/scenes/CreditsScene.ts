// Dominio: seba. Créditos en rodillo (fase 6): equipo y roles, herramientas, assets y licencias, IA usada.
// Música = tema del título. Mantén ESPACIO / X / ↓ para acelerar. Easter egg al final. Licencias: public/assets/audio/CREDITS.md
import Phaser from 'phaser';
import { C, scanlines, text } from '../theme';
import { AudioDirector } from '../../audio';
import { PushupGuy } from '../pushup';

const PUSHUP_BEST_KEY = 'mafiadev.pushups.best';

type Line = [string, number?];
const H = (s: string): Line => [s, C.accent2];
const T = (s: string): Line => [s, C.accent];

export const CREDIT_LINES: Line[] = [
  T('MAFIADEV'),
  ['UN METROIDVANIA HECHO EN UN DÍA', C.dim],
  ['HACKATÓN 2026', C.dim],
  [''], [''],
  T('EQUIPO'), [''],
  H('MAPA, EXPLORACIÓN Y AMBIENTACIÓN'), ['VICHO'], [''],
  H('COMBATE Y MOVIMIENTO'), ['BASTI'], [''],
  H('PERSONAJE, HABILIDADES Y LOOT'), ['ALEJANDRO'], [''],
  H('MÚSICA, SONIDO Y PANTALLAS'), ['SEBA'], [''], [''],
  T('HECHO CON AGENTES DE IA'), [''],
  ['CADA LÍNEA DE ESTE JUEGO PASÓ POR UN AGENTE.'],
  ['CUATRO HUMANOS DIRIGIENDO, LOS AGENTES CONSTRUYENDO.'], [''],
  H('CLAUDE CODE (ANTHROPIC)'), ['ARQUITECTURA, CÓDIGO Y REVISIÓN'], [''],
  H('OPENAI CODEX'), ['CÓDIGO DELEGADO: LAB, MENÚS Y SINTETIZADOR'], [''],
  H('GPT-5 (OPENAI)'), ['COMPOSICIÓN DE LAS PARTITURAS Y DE LOS EFECTOS'], [''],
  H('GPT-IMAGE · GPT-4O-MINI-TTS'), ['ARTE DEL TÍTULO · VOZ DEL NARRADOR (VOZ IA)'], [''],
  H('FREELLMAPI'), ['MODELOS GRATUITOS PARA TAREAS MECÁNICAS'], [''], [''],
  T('HERRAMIENTAS'), [''],
  ['PHASER 4 (MIT) · TYPESCRIPT · VITE'],
  ['TILED · VITEST · PLAYWRIGHT'], [''], [''],
  T('ASSETS Y LICENCIAS'), [''],
  H('MÚSICA Y EFECTOS'),
  ['PARTITURAS DE GPT-5 SINTETIZADAS CON UN'],
  ['SINTETIZADOR PROPIO (MODELADO FÍSICO + FM)'],
  ['APERTURA: SONIDO GENERADO EN VIVO CON WEBAUDIO'], [''],
  H('TIPOGRAFÍA'), ['SILKSCREEN · JASON KOTTKE (SIL OFL 1.1)'], [''],
  H('LOGOS'), ['MAFIADEV Y MARCA DE CODEX DIBUJADOS POR CÓDIGO'],
  ['OPENAI Y CODEX SON MARCAS DE OPENAI'], [''], [''],
  T('GRACIAS'), [''],
  ['A LA ORGANIZACIÓN DE LA HACKATÓN'],
  ['A QUIENES PROBARON EL JUEGO'],
  ['Y A TI, POR LLEGAR HASTA AQUÍ'], [''], [''], [''],
  T('GRACIAS POR JUGAR'),
];

const LH = 12;
const SPEED_MS_PER_PX = 42;

export class CreditsScene extends Phaser.Scene {
  private from = 'TitleScene';
  private roll!: Phaser.Tweens.Tween;
  private closing = false;

  constructor() {
    super('CreditsScene');
  }

  init(data: { from?: string }): void {
    this.from = data.from ?? 'TitleScene';
    this.closing = false;
  }

  create(): void {
    const { width: w, height: h } = this.scale;
    this.add.rectangle(0, 0, w, h, C.bg, 0.96).setOrigin(0);
    AudioDirector.whenUnlocked(() => AudioDirector.playMusic('music-title', 800));

    const roll = this.add.container(w / 2, h + 10);
    CREDIT_LINES.forEach(([s, color], i) => {
      roll.add(text(this, 0, i * LH, s, { color: color ?? C.text, align: 'center' }).setOrigin(0.5, 0));
    });
    // easter egg: el de las flexiones de la pantalla de carga, con tu récord
    const eggY = CREDIT_LINES.length * LH + h / 2 - 20;
    let best = 0;
    try { best = Number(localStorage.getItem(PUSHUP_BEST_KEY) ?? 0); } catch { /* */ }
    const guy = new PushupGuy(this, 0, eggY, 2);
    const record = text(this, 0, eggY + 8, best > 0 ? `RÉCORD DE FLEXIONES: ${best}` : '¿NO HICISTE NI UNA FLEXIÓN?', { color: C.dim, align: 'center' }).setOrigin(0.5, 0);
    const egg = text(this, 0, eggY + 20, '[X] UNA MÁS', { color: C.panel, align: 'center' }).setOrigin(0.5, 0);
    roll.add([guy.sprite, record, egg]);

    const travel = eggY + h / 2 + 10; // hasta dejar el easter egg en el centro
    this.roll = this.tweens.add({
      targets: roll, y: h + 10 - travel, duration: travel * SPEED_MS_PER_PX, ease: 'Linear',
      onComplete: () => this.time.delayedCall(6000, () => this.close()),
    });
    scanlines(this, 0.08);
    text(this, w - 6, h - 12, 'ESC VOLVER · ESPACIO ACELERA', { color: C.dim, align: 'right' }).setOrigin(1, 0);

    const fast = (on: boolean) => { this.roll.timeScale = on ? 5 : 1; };
    this.time.delayedCall(200, () => {
      const kb = this.input.keyboard;
      kb?.on('keydown', (e: KeyboardEvent) => {
        if (['Escape', 'Enter', 'Backspace'].includes(e.key)) this.close();
        else if ([' ', 'ArrowDown', 's', 'S'].includes(e.key)) fast(true);
        else if ((e.key === 'x' || e.key === 'X') && !e.repeat) {
          if (this.roll.isPlaying()) fast(true);
          else guy.pump((n) => record.setText(`FLEXIONES: ${n} · RÉCORD: ${Math.max(best, n)}`));
        }
      });
      kb?.on('keyup', () => fast(false));
      this.input.on('pointerdown', () => fast(true));
      this.input.on('pointerup', () => fast(false));
    });
  }

  private close(): void {
    if (this.closing) return;
    this.closing = true;
    AudioDirector.ui('sfx-ui-back');
    if (this.from === 'GameScene') {
      // 6.28 — fin de la demo: «gracias por jugar» + créditos → título
      AudioDirector.stopAll();
      this.scene.stop('GameScene');
      this.scene.start('TitleScene', { menu: true });
      return;
    }
    if (this.scene.isPaused(this.from)) this.scene.resume(this.from);
    this.scene.stop();
  }
}
