// Dominio: seba. Menú vertical controlado por teclado (las teclas salen de BINDINGS de core/Input).
import Phaser from 'phaser';
import { BINDINGS } from '../core/Input';
import { AudioDirector } from '../audio';
import { text } from './theme';

export interface MenuItem {
  label: () => string;
  onSelect?: () => void;
  /** Para sliders/opciones: dir −1 | +1 */
  onAdjust?: (dir: -1 | 1) => void;
  enabled?: () => boolean;
}

const CONFIRM = ['ENTER', 'SPACE', ...BINDINGS.jump, ...BINDINGS.attack];
const BACK = ['ESC', 'BACKSPACE'];

export class Menu {
  readonly container: Phaser.GameObjects.Container;
  private readonly labels: Phaser.GameObjects.Text[] = [];
  private readonly values: (Phaser.GameObjects.Text | null)[] = [];
  private readonly cursor: Phaser.GameObjects.Image;
  private index = 0;
  private active = true;
  private readonly handler: (e: KeyboardEvent) => void;

  constructor(
    private readonly scene: Phaser.Scene,
    x: number, y: number,
    private readonly items: MenuItem[],
    private readonly opts: { onBack?: () => void; lineHeight?: number; align?: 'left' | 'center'; valueX?: number } = {},
  ) {
    this.container = scene.add.container(x, y);
    const lh = opts.lineHeight ?? 14;
    items.forEach((it, i) => {
      const t = text(scene, 0, i * lh, it.label(), { align: opts.align ?? 'left' });
      if (opts.align === 'center') t.setOrigin(0.5, 0);
      this.labels.push(t);
      this.container.add(t);
      // «ETIQUETA\tVALOR»: el valor va en una columna fija (opts.valueX)
      const v = it.label().includes('\t') ? text(scene, opts.valueX ?? 96, i * lh, '') : null;
      this.values.push(v);
      if (v) this.container.add(v);
    });
    this.cursor = scene.add.image(0, 0, 'ui-cursor').setOrigin(1, 0);
    this.container.add(this.cursor);
    scene.tweens.add({ targets: this.cursor, x: '-=2', duration: 300, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.index = this.firstEnabled(0, 1);
    this.refresh(false);

    const keyOf = (e: KeyboardEvent) =>
      e.key === ' ' ? 'SPACE' : e.key === 'Escape' ? 'ESC' : e.key.length === 1 ? e.key.toUpperCase() : e.key.replace('Arrow', '').toUpperCase();
    this.handler = (e: KeyboardEvent) => {
      if (!this.active || e.repeat) return;
      const k = keyOf(e);
      if (BINDINGS.up.includes(k)) this.move(-1);
      else if (BINDINGS.down.includes(k)) this.move(1);
      else if (BINDINGS.left.includes(k)) this.adjust(-1);
      else if (BINDINGS.right.includes(k)) this.adjust(1);
      else if (CONFIRM.includes(k)) this.select();
      else if (BACK.includes(k) && opts.onBack) { AudioDirector.ui('sfx-ui-back'); opts.onBack(); }
    };
    scene.input.keyboard?.on('keydown', this.handler);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
  }

  setActive(on: boolean): this { this.active = on; return this; }

  /** Vuelve a pintar las etiquetas (p. ej. tras cambiar un ajuste). */
  refresh(animate = true): void {
    this.labels.forEach((t, i) => {
      const it = this.items[i];
      const on = it.enabled?.() ?? true;
      const [label, value] = it.label().split('\t');
      const color = i === this.index ? '#ff5fa2' : on ? '#ebe7f4' : '#5a5370';
      t.setText(label).setColor(color);
      this.values[i]?.setText(value ?? '').setColor(color);
    });
    const sel = this.labels[this.index];
    const cx = this.opts.align === 'center' ? sel.x - sel.width / 2 - 4 : sel.x - 4;
    if (animate) this.scene.tweens.add({ targets: this.cursor, y: sel.y + 1, duration: 70 });
    else this.cursor.setY(sel.y + 1);
    this.cursor.setX(cx);
  }

  destroy(): void {
    this.scene.input.keyboard?.off('keydown', this.handler);
  }

  private firstEnabled(from: number, dir: 1 | -1): number {
    for (let n = 0; n < this.items.length; n++) {
      const i = (from + dir * n + this.items.length * 2) % this.items.length;
      if (this.items[i].enabled?.() ?? true) return i;
    }
    return 0;
  }

  private move(dir: 1 | -1): void {
    this.index = this.firstEnabled(this.index + dir, dir);
    AudioDirector.ui('sfx-ui-move');
    this.refresh();
  }

  private adjust(dir: -1 | 1): void {
    const it = this.items[this.index];
    if (!it.onAdjust) return;
    it.onAdjust(dir);
    this.refresh();
  }

  private select(): void {
    const it = this.items[this.index];
    if (!(it.enabled?.() ?? true) || !it.onSelect) return;
    AudioDirector.ui('sfx-ui-select');
    const t = this.labels[this.index];
    this.scene.tweens.add({ targets: t, scaleX: 1.15, scaleY: 1.15, duration: 60, yoyo: true });
    it.onSelect();
    this.refresh();
  }
}

