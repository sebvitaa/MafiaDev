// Dominio: seba. Menú de teclado y ratón basado en las acciones comunes del juego.
import Phaser from 'phaser';
import { BINDINGS } from '../core/Input';
import { AudioDirector, settings } from '../audio';
import { C, pixelTexture, reducedMotion, text } from './theme';

export interface MenuItem {
  label: () => string;
  onSelect?: () => void;
  /** Para sliders/opciones: dir −1 | +1 */
  onAdjust?: (dir: -1 | 1) => void;
  enabled?: () => boolean;
  /** Un elemento oculto no ocupa espacio ni puede seleccionarse. */
  hidden?: () => boolean;
}

const CONFIRM = ['ENTER', 'SPACE', ...BINDINGS.jump, ...BINDINGS.attack];
const BACK = ['ESC', 'BACKSPACE'];
const CURSOR_KEY = 'ui-cursor-fedora';

export class Menu {
  readonly container: Phaser.GameObjects.Container;
  private readonly labels: Phaser.GameObjects.Text[] = [];
  private readonly values: Phaser.GameObjects.Text[] = [];
  private readonly zones: Phaser.GameObjects.Zone[] = [];
  private readonly cursor: Phaser.GameObjects.Image;
  private index = -1;
  private active = true;
  private bob: Phaser.Tweens.Tween | null = null;
  private readonly handler: (e: KeyboardEvent) => void;

  constructor(
    private readonly scene: Phaser.Scene,
    x: number, y: number,
    private readonly items: MenuItem[],
    private readonly opts: { onBack?: () => void; lineHeight?: number; align?: 'left' | 'center'; valueX?: number; rowWidth?: number } = {},
  ) {
    this.container = scene.add.container(x, y);
    const lh = opts.lineHeight ?? 14;
    const rowWidth = opts.rowWidth ?? 220;
    items.forEach((_, i) => {
      const zone = scene.add.zone(opts.align === 'center' ? -rowWidth / 2 : -4, 0, rowWidth, lh).setOrigin(0, 0);
      zone.setInteractive();
      zone.on('pointerover', () => { if (this.active) this.focus(i); });
      zone.on('pointerdown', () => { if (this.active) { this.focus(i); this.select(); } });
      this.zones.push(zone);
      this.container.add(zone);

      const label = text(scene, 0, 0, '', { align: opts.align ?? 'left' });
      if (opts.align === 'center') label.setOrigin(0.5, 0);
      this.labels.push(label);
      this.container.add(label);
      const value = text(scene, opts.valueX ?? 96, 0, '');
      this.values.push(value);
      this.container.add(value);
    });

    pixelTexture(scene, CURSOR_KEY, ['..l.....', '..dddd..', '.dddddd.', 'pppppppp', '.dddddd.'], {
      d: 0x221d33, p: 0xff5fa2, l: 0xebe7f4,
    });
    this.cursor = scene.add.image(0, 0, CURSOR_KEY).setOrigin(1, 0.5);
    this.container.add(this.cursor);
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

  setActive(on: boolean): this {
    this.active = on;
    for (const zone of this.zones) {
      if (on) zone.setInteractive();
      else zone.disableInteractive();
    }
    if (!on) this.stopCursorMotion();
    else this.refresh(false);
    return this;
  }

  /** Vuelve a pintar etiquetas y recompone filas visibles. */
  refresh(animate = true): void {
    if (!this.selectable(this.index)) this.index = this.firstEnabled(0, 1);
    const lh = this.opts.lineHeight ?? 14;
    const rowWidth = this.opts.rowWidth ?? 220;
    let row = 0;
    this.items.forEach((item, i) => {
      const visible = !item.hidden?.();
      const label = this.labels[i];
      const value = this.values[i];
      const zone = this.zones[i];
      label.setVisible(visible);
      value.setVisible(visible);
      zone.setVisible(visible);
      if (visible && this.active) zone.setInteractive();
      else zone.disableInteractive();
      if (!visible) return;

      const y = row++ * lh;
      zone.setPosition(this.opts.align === 'center' ? -rowWidth / 2 : -4, y).setSize(rowWidth, lh);
      label.setPosition(0, y);
      value.setPosition(this.opts.valueX ?? 96, y);
      const [caption, valueText] = item.label().split('\t');
      const enabled = item.enabled?.() ?? true;
      const selected = i === this.index;
      label.setText(caption).setColor(selected ? '#ff5fa2' : enabled ? '#ebe7f4' : '#5a5370');
      value.setText(valueText ?? '').setColor(selected ? '#ff5fa2' : enabled ? '#ebe7f4' : '#5a5370');
      const targetX = selected ? 2 : 0;
      if (animate && !reducedMotion(settings.get().reducedMotion)) {
        this.scene.tweens.killTweensOf(label);
        this.scene.tweens.add({ targets: label, x: targetX, duration: 90, ease: 'Cubic.Out' });
      } else label.setX(targetX);
    });

    if (this.index < 0) {
      this.cursor.setVisible(false);
      this.stopCursorMotion();
      return;
    }
    const selected = this.labels[this.index];
    this.cursor.setVisible(true);
    const x = (this.opts.align === 'center' ? 2 - selected.width / 2 : 2) - 4;
    const y = selected.y + selected.height / 2;
    if (animate && !reducedMotion(settings.get().reducedMotion)) {
      this.stopCursorMotion();
      this.scene.tweens.add({
        targets: this.cursor, x, y, duration: 90, ease: 'Cubic.Out',
        onComplete: () => this.startBob(),
      });
    } else {
      this.stopCursorMotion();
      this.cursor.setPosition(x, y);
      if (!reducedMotion(settings.get().reducedMotion)) this.startBob();
    }
  }

  destroy(): void {
    this.scene.input.keyboard?.off('keydown', this.handler);
    this.stopCursorMotion();
    for (const child of [...this.container.list]) child.destroy();
    this.container.destroy();
  }

  private selectable(i: number): boolean {
    return i >= 0 && i < this.items.length && !this.items[i].hidden?.() && (this.items[i].enabled?.() ?? true);
  }

  private firstEnabled(from: number, dir: 1 | -1): number {
    for (let n = 0; n < this.items.length; n++) {
      const i = (from + dir * n + this.items.length * 2) % this.items.length;
      if (this.selectable(i)) return i;
    }
    return -1;
  }

  private focus(i: number): void {
    if (!this.selectable(i) || i === this.index) return;
    this.index = i;
    AudioDirector.ui('sfx-ui-move');
    this.refresh();
  }

  private move(dir: 1 | -1): void {
    const next = this.firstEnabled(this.index < 0 ? 0 : this.index + dir, dir);
    if (next < 0 || next === this.index) return;
    this.index = next;
    AudioDirector.ui('sfx-ui-move');
    this.refresh();
  }

  private adjust(dir: -1 | 1): void {
    if (this.index < 0) return;
    const item = this.items[this.index];
    if (!item.onAdjust) return;
    item.onAdjust(dir);
    this.refresh();
  }

  private select(): void {
    if (!this.selectable(this.index)) return;
    const item = this.items[this.index];
    if (!item.onSelect) return;
    AudioDirector.ui('sfx-ui-select');
    const label = this.labels[this.index];
    if (!reducedMotion(settings.get().reducedMotion)) {
      this.scene.tweens.add({ targets: label, scaleX: 1.1, scaleY: 1.1, duration: 65, yoyo: true });
      this.spark(label);
    }
    item.onSelect();
    if (this.active && this.container.active) this.refresh();
  }

  private spark(label: Phaser.GameObjects.Text): void {
    const count = 6 + Math.floor(Math.random() * 3);
    const centerX = this.container.x + label.x + (this.opts.align === 'center' ? 0 : label.width / 2);
    const centerY = this.container.y + label.y + label.height / 2;
    for (let i = 0; i < count; i++) {
      const angle = Math.PI * 2 * i / count;
      const size = 2 + Math.floor(Math.random() * 3);
      const spark = this.scene.add.rectangle(centerX, centerY, size, size, C.accent).setDepth(1000);
      this.scene.tweens.add({
        targets: spark, x: centerX + Math.cos(angle) * (7 + size), y: centerY + Math.sin(angle) * (5 + size),
        alpha: 0, duration: 250, ease: 'Cubic.Out', onComplete: () => spark.destroy(),
      });
    }
  }

  private startBob(): void {
    if (!this.active || reducedMotion(settings.get().reducedMotion) || !this.cursor.active) return;
    this.bob = this.scene.tweens.add({ targets: this.cursor, y: '-=1', duration: 300, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  }

  private stopCursorMotion(): void {
    this.bob?.stop();
    this.bob = null;
    this.scene.tweens.killTweensOf(this.cursor);
  }
}
