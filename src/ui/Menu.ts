// Dominio: seba. Menú de teclado y ratón con texto nítido en el overlay DOM.
import Phaser from 'phaser';
import { BINDINGS } from '../core/Input';
import { AudioDirector, settings } from '../audio';
import { hdLayer } from './hd/HdLayer';
import { pixelBar, updatePixelBar } from './pixelBar';
import { pixelTexture, reducedMotion } from './theme';

export interface MenuItem {
  label: () => string;
  onSelect?: () => void;
  /** Para sliders/opciones: dir −1 | +1 */
  onAdjust?: (dir: -1 | 1) => void;
  enabled?: () => boolean;
  /** Un elemento oculto no ocupa espacio ni puede seleccionarse. */
  hidden?: () => boolean;
  /** Valor normalizado opcional que se representa como barra CSS segmentada. */
  bar?: () => number;
}

const CONFIRM = ['ENTER', 'SPACE', ...BINDINGS.jump, ...BINDINGS.attack];
const BACK = ['ESC', 'BACKSPACE'];
const CURSOR_KEY = 'ui-cursor-fedora';

interface MenuRow {
  element: HTMLDivElement;
  caption: HTMLSpanElement;
  value: HTMLDivElement;
  bar?: HTMLDivElement;
}

export class Menu {
  /** Empty Phaser proxy retained for existing depth/alpha/y tweens and callers. */
  readonly container: Phaser.GameObjects.Container;
  private readonly rows: MenuRow[] = [];
  private readonly rowRoot: HTMLDivElement;
  private readonly cursor: HTMLImageElement;
  private index = -1;
  private active = true;
  private destroyed = false;
  private readonly handler: (e: KeyboardEvent) => void;
  private readonly onPostUpdate: () => void;
  private readonly onShutdown: () => void;

  constructor(
    private readonly scene: Phaser.Scene,
    x: number, y: number,
    private readonly items: MenuItem[],
    private readonly opts: { onBack?: () => void; lineHeight?: number; align?: 'left' | 'center'; valueX?: number; rowWidth?: number } = {},
  ) {
    this.container = scene.add.container(x, y);
    const layer = hdLayer(scene);
    const rowWidth = opts.rowWidth ?? 220;
    this.rowRoot = layer.el('div', { x: 0, y: 0, width: 480, height: 270, className: 'hd-menu-root', depth: this.container.depth });
    this.rowRoot.style.pointerEvents = 'none';
    this.rowRoot.setAttribute('role', 'menu');
    this.rowRoot.setAttribute('aria-label', 'Menú');

    items.forEach((item, i) => {
      const row = layer.el('div', {
        x: opts.align === 'center' ? -rowWidth / 2 : -4,
        y: 0,
        width: rowWidth,
        height: opts.lineHeight ?? 14,
        className: 'hd-menu-row',
        parent: this.rowRoot,
      });
      row.style.justifyContent = opts.align === 'center' ? 'center' : 'flex-start';
      const caption = layer.el('span', { className: 'hd-menu-caption', parent: row });
      // el() posiciona en absoluto; el texto de la fila debe fluir con el flex para centrarse
      Object.assign(caption.style, { position: 'relative', left: '', top: '' });
      const value = layer.el('div', { className: 'hd-menu-value', x: opts.valueX ?? 96, width: 64, parent: row });
      const menuRow: MenuRow = { element: row, caption, value };
      if (item.bar) {
        menuRow.bar = pixelBar(row, item.bar());
        menuRow.bar.style.left = `${(opts.valueX ?? 96) - 90}px`;
        value.style.width = '64px';
      }
      row.addEventListener('pointerenter', () => { if (this.active) this.focus(i); });
      row.addEventListener('pointerdown', (event) => {
        if (!this.active || !this.selectable(i)) return;
        event.preventDefault();
        event.stopPropagation();
        this.focus(i);
        this.select();
      });
      this.rows.push(menuRow);
    });

    pixelTexture(scene, CURSOR_KEY, ['..l.....', '..dddd..', '.dddddd.', 'pppppppp', '.dddddd.'], {
      d: 0x221d33, p: 0xff5fa2, l: 0xebe7f4,
    });
    const texture = scene.textures.exists(CURSOR_KEY)
      ? scene.textures.get(CURSOR_KEY).getSourceImage() as HTMLCanvasElement
      : null;
    this.cursor = layer.el('img', { x: 0, y: 0, width: 12, height: 7.5, className: 'hd-menu-cursor', parent: this.rowRoot });
    this.cursor.alt = '';
    this.cursor.setAttribute('aria-hidden', 'true');
    this.cursor.draggable = false;
    this.cursor.style.visibility = 'hidden';
    if (texture && 'toDataURL' in texture) this.cursor.src = texture.toDataURL();

    this.index = this.firstEnabled(0, 1);
    this.refresh(false);
    this.onPostUpdate = () => this.syncContainer();
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.onPostUpdate);

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
    this.onShutdown = () => this.destroy();
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown);
    this.syncContainer();
  }

  setActive(on: boolean): this {
    this.active = on;
    if (on) this.refresh(false);
    this.refresh();
    return this;
  }

  /** Vuelve a pintar etiquetas y recompone filas visibles. */
  refresh(animate = true): void {
    if (!this.selectable(this.index)) this.index = this.firstEnabled(0, 1);
    const lh = this.opts.lineHeight ?? 14;
    const rowWidth = this.opts.rowWidth ?? 220;
    let rowIndex = 0;
    this.items.forEach((item, i) => {
      const row = this.rows[i];
      const visible = !item.hidden?.();
      row.element.style.display = visible ? 'flex' : 'none';
      if (!visible) return;

      const y = rowIndex++ * lh;
      row.element.style.top = `${y}px`;
      row.element.style.left = `${this.opts.align === 'center' ? -rowWidth / 2 : -4}px`;
      row.element.style.width = `${rowWidth}px`;
      row.element.style.height = `${lh}px`;
      row.element.style.textAlign = this.opts.align ?? 'left';
      const [caption, valueText] = item.label().split('\t');
      const enabled = item.enabled?.() ?? true;
      const selected = i === this.index;
      row.caption.textContent = caption;
      row.value.textContent = valueText ?? '';
      row.element.classList.toggle('is-selected', selected);
      row.element.classList.toggle('is-disabled', !enabled);
      row.element.classList.toggle('is-interactive', this.active && enabled && visible);
      row.element.setAttribute('aria-disabled', String(!enabled));
      row.element.setAttribute('role', 'menuitem');
      row.element.style.transform = selected ? 'translateX(2px)' : 'translateX(0)';
      row.element.style.transition = reducedMotion(settings.get().reducedMotion) || !animate ? 'none' : '';
      row.value.style.left = `${this.opts.valueX ?? 96}px`;
      if (row.bar) updatePixelBar(row.bar, item.bar?.() ?? 0);
    });

    this.cursor.style.visibility = this.index >= 0 ? 'visible' : 'hidden';
    if (this.index >= 0) {
      const selected = this.rows[this.index];
      const rowRect = selected.element.offsetTop;
      const captionLeft = selected.caption.offsetLeft;
      const rowLeft = this.opts.align === 'center' ? -rowWidth / 2 : -4;
      this.cursor.style.left = `${rowLeft + captionLeft - 15}px`;
      this.cursor.style.top = `${rowRect + lh / 2 - 4.5}px`;
      this.cursor.style.animation = reducedMotion(settings.get().reducedMotion) || !this.active
        ? 'none'
        : 'hd-fedora-bob 600ms ease-in-out infinite alternate';
    }
    this.syncContainer();
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.scene.input.keyboard?.off('keydown', this.handler);
    this.scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.onPostUpdate);
    this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown);
    this.rowRoot.remove();
    this.container.destroy();
  }

  private syncContainer(): void {
    this.rowRoot.style.transform = `translate(${this.container.x}px, ${this.container.y}px)`;
    this.rowRoot.style.opacity = String(this.container.alpha);
    this.rowRoot.style.visibility = this.container.visible ? 'visible' : 'hidden';
    this.rowRoot.style.zIndex = String(this.container.depth);
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
    const row = this.rows[this.index].element;
    if (!reducedMotion(settings.get().reducedMotion)) {
      row.animate([{ scale: '1' }, { scale: '1.025' }, { scale: '1' }], { duration: 130, easing: 'ease-out' });
    }
    item.onSelect();
    if (this.active && this.container.active) this.refresh();
  }
}
