import Phaser from 'phaser';
import { BINDINGS } from '../core/Input';
import { hdLayer } from './hd/HdLayer';

const KEY_LABEL: Record<string, string> = {
  LEFT: '←', RIGHT: '→', UP: '↑', DOWN: '↓', SPACE: 'SPACE', SHIFT: 'SHIFT',
};

/** Crisp DOM panel with the declared game and global controls. */
export function showControls(scene: Phaser.Scene): Promise<void> {
  return new Promise((resolve) => {
    const w = scene.scale.width, h = scene.scale.height;
    const pw = Math.min(420, w - 16), ph = Math.min(222, h - 16);
    const px = (w - pw) / 2, py = (h - ph) / 2;
    const layer = hdLayer(scene);
    const elements: HTMLElement[] = [];
    const add = <T extends HTMLElement>(element: T): T => { elements.push(element); return element; };
    let closed = false;

    const shade = add(layer.el('div', { x: 0, y: 0, width: w, height: h, depth: 100, interactive: true }));
    shade.addEventListener('pointerdown', () => close());
    const frame = add(layer.panel(px, py, pw, ph, { depth: 101, alpha: 0.98, interactive: true }));
    frame.addEventListener('pointerdown', (event) => event.stopPropagation());
    add(layer.text(w / 2, py + 8, 'CONTROLES', {
      depth: 102, width: 150, fontSize: 16, weight: 600, color: '#ff5fa2', align: 'center',
    }));

    const keyLabel = (key: string) => KEY_LABEL[key] ?? key;
    const caps = (keys: string[], x: number, y: number, maxX: number): number => {
      let cx = x;
      for (const key of keys) {
        const label = keyLabel(key);
        const kw = Math.max(14, label.length * 6 + 8);
        if (cx + kw > maxX) break;
        add(layer.el('span', {
          x: cx, y, width: kw, height: 14, depth: 103, text: label, className: 'hd-keycap',
        }));
        cx += kw + 3;
      }
      return cx;
    };
    const row = (name: string, keys: string[], x: number, y: number, right: number): void => {
      add(layer.text(x, y + 3, name, { depth: 102, fontSize: 12, color: '#ebe7f4' }));
      const nameW = Math.max(64, name.length * 6 + 8);
      caps(keys, x + nameW, y, right);
    };

    // Controles reales del mundo cenital (RoomPlayer + abilities + exploration), sin teclas duplicadas.
    const leftX = px + 16, rightX = px + pw / 2 + 5;
    const colRight = px + pw / 2 - 10;
    const rowY = py + 32, step = 23;
    const left: [string, string[]][] = [
      ['MOVERSE', ['WASD', '←↑↓→']], ['CORRER', ['SHIFT']], ['SALTAR', BINDINGS.jump], ['DASH', ['C', 'K', '2×DIR']],
      ['ATACAR', ['CLIC IZQ']], ['ULTI', ['CLIC DER']], ['PAPEL TP', ['Q+CLIC DER']],
    ];
    const right: [string, string[]][] = [
      ['IR A PAPEL', ['Q+CLIC IZQ', '1-4']], ['INTERACTUAR', ['E']], ['VIAJAR', ['G']], ['MAPA', ['TAB', 'N']],
      ['PAUSA', BINDINGS.pause], ['SILENCIO', ['M']], ['PANT. COMPLETA', ['F']],
    ];
    left.forEach(([name, keys], i) => row(name, keys, leftX, rowY + step * i, colRight));
    right.forEach(([name, keys], i) => row(name, keys, rightX, rowY + step * i, px + pw - 16));
    add(layer.text(w / 2, py + ph - 19, 'ESC / ENTER PARA VOLVER', {
      depth: 102, width: 220, color: '#8a83a3', align: 'center', fontSize: 11,
    }));

    const keyHandler = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') close();
    };
    const shutdown = () => close();
    const close = () => {
      if (closed) return;
      closed = true;
      scene.input.keyboard?.off('keydown', keyHandler);
      scene.events.off(Phaser.Scenes.Events.SHUTDOWN, shutdown);
      elements.forEach((element) => element.remove());
      resolve();
    };
    scene.input.keyboard?.on('keydown', keyHandler);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, shutdown);
  });
}
