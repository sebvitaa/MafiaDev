import Phaser from 'phaser';
import { BINDINGS } from '../core/Input';
import { C, panel, text } from './theme';

const KEY_LABEL: Record<string, string> = {
  LEFT: '←', RIGHT: '→', UP: '↑', DOWN: '↓', SPACE: 'SPACE', SHIFT: 'SHIFT',
};

/** Panel visual con todas las teclas declaradas por Input y las teclas globales. */
export function showControls(scene: Phaser.Scene): Promise<void> {
  return new Promise((resolve) => {
    const w = scene.scale.width, h = scene.scale.height;
    const pw = Math.min(420, w - 16), ph = Math.min(222, h - 16);
    const px = (w - pw) / 2, py = (h - ph) / 2;
    const objects: Phaser.GameObjects.GameObject[] = [];
    const add = <T extends Phaser.GameObjects.GameObject>(object: T): T => { objects.push(object); return object; };
    let closed = false;

    const clickZone = add(scene.add.zone(0, 0, w, h).setOrigin(0, 0).setInteractive());
    clickZone.on('pointerdown', () => close());
    add(panel(scene, px, py, pw, ph, 0.98));
    add(text(scene, w / 2, py + 8, 'CONTROLES', { size: 16, color: C.accent, align: 'center' }).setOrigin(0.5, 0));

    const keyLabel = (key: string) => KEY_LABEL[key] ?? key;
    const caps = (keys: string[], x: number, y: number, maxX: number): number => {
      let cx = x;
      for (const key of keys) {
        const label = keyLabel(key);
        const kw = Math.max(14, label.length * 6 + 8);
        if (cx + kw > maxX) break;
        const g = add(scene.add.graphics());
        g.fillStyle(0x090811, 0.9).fillRect(cx + 2, y + 3, kw, 14);
        g.fillStyle(0x221d33, 1).fillRect(cx + 1, y, kw - 2, 14).fillRect(cx, y + 1, kw, 12);
        g.fillStyle(0x8a83a3, 1)
          .fillRect(cx + 2, y, kw - 4, 1)
          .fillRect(cx + 1, y + 1, 1, 12)
          .fillRect(cx + kw - 2, y + 1, 1, 12)
          .fillRect(cx + 2, y + 13, kw - 4, 1);
        add(text(scene, cx + kw / 2, y + 3, label, { size: 8, align: 'center' }).setOrigin(0.5, 0));
        cx += kw + 3;
      }
      return cx;
    };
    const row = (name: string, keys: string[], x: number, y: number, right: number): void => {
      add(text(scene, x, y + 3, name, { color: C.text }));
      const nameW = Math.max(64, name.length * 6 + 8);
      caps(keys, x + nameW, y, right);
    };

    const moveKeys = [...BINDINGS.left, ...BINDINGS.right, ...BINDINGS.up, ...BINDINGS.down];
    row('MOVERSE', moveKeys, px + 16, py + 34, px + pw - 16);
    const leftX = px + 16, rightX = px + pw / 2 + 5;
    const colRight = px + pw / 2 - 10;
    const rowY = py + 65, step = 28;
    row('SALTAR', BINDINGS.jump, leftX, rowY, colRight);
    row('ATACAR', BINDINGS.attack, leftX, rowY + step, colRight);
    row('DASH', BINDINGS.dash, leftX, rowY + step * 2, colRight);
    row('PARRY', BINDINGS.parry, rightX, rowY, px + pw - 16);
    row('HABILIDAD', BINDINGS.ability, rightX, rowY + step, px + pw - 16);
    row('PAUSA', BINDINGS.pause, rightX, rowY + step * 2, px + pw - 16);
    row('SILENCIO', ['M'], rightX, rowY + step * 3, px + pw - 16);
    row('PANTALLA COMPLETA', ['F'], leftX, rowY + step * 3, px + pw - 16);
    add(text(scene, w / 2, py + ph - 13, 'ESC / ENTER PARA VOLVER', { color: C.dim, align: 'center' }).setOrigin(0.5));

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
      objects.forEach((object) => object.destroy());
      resolve();
    };
    scene.input.keyboard?.on('keydown', keyHandler);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, shutdown);
  });
}
