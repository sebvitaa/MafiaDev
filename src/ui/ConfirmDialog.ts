import Phaser from 'phaser';
import { AudioDirector } from '../audio';
import { hdLayer } from './hd/HdLayer';

const KEY_OK = ['ENTER', 'SPACE', 'X', 'Z'];

function wrap(message: string, maxChars: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of message.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && next.length > maxChars) { lines.push(line); line = word; }
    else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Crisp DOM confirmation panel. The owner deactivates its menu while this promise is open. */
export function confirmDialog(
  scene: Phaser.Scene,
  message: string,
  opts: { yes?: string; no?: string } = {},
): Promise<boolean> {
  return new Promise((resolve) => {
    const width = scene.scale.width;
    const height = scene.scale.height;
    const layer = hdLayer(scene);
    const lines = wrap(message, 31);
    const boxW = Math.min(220, width - 16);
    const boxH = Math.min(height - 16, 66 + lines.length * 10);
    const x = (width - boxW) / 2;
    const y = (height - boxH) / 2;
    let choice = 1;
    let settled = false;
    let charIndex = 0;
    const fullMessage = lines.join('\n');
    const elements: HTMLElement[] = [];
    const add = <T extends HTMLElement>(element: T): T => { elements.push(element); return element; };

    const shade = add(layer.el('div', { x: 0, y: 0, width, height, depth: 100, className: 'hd-dialog-shade', interactive: true }));
    shade.style.background = 'rgba(9,8,17,.72)';
    const frame = add(layer.panel(x, y, boxW, boxH, { depth: 101, alpha: 0.98 }));
    frame.style.opacity = '0';
    const messageText = add(layer.text(width / 2, y + 16, '', {
      depth: 102, width: boxW - 24, align: 'center', fontSize: 13, lineHeight: 15, className: 'hd-dialog-message',
    }));
    messageText.style.textAlign = 'center';
    messageText.style.opacity = '0';

    const buttonY = y + boxH - 29;
    const buttonW = 70, buttonH = 17, gap = 12;
    const buttonX = width / 2 - buttonW - gap / 2;
    const labels = [opts.yes ?? 'SÍ', opts.no ?? 'NO'];
    const buttons: HTMLButtonElement[] = [];
    for (let i = 0; i < 2; i++) {
      const bx = buttonX + i * (buttonW + gap);
      const button = add(layer.el('button', {
        x: bx, y: buttonY, width: buttonW, height: buttonH, depth: 103,
        className: 'hd-choice', text: labels[i], interactive: true,
      }));
      button.type = 'button';
      button.addEventListener('pointerenter', () => focus(i));
      button.addEventListener('pointerdown', (event) => { event.preventDefault(); event.stopPropagation(); focus(i); choose(i); });
      buttons.push(button);
    }
    shade.addEventListener('pointerdown', (event) => { event.preventDefault(); event.stopPropagation(); });

    const drawButtons = () => buttons.forEach((button, i) => button.classList.toggle('is-selected', i === choice));
    const cleanup = () => {
      scene.input.keyboard?.off('keydown', onKey);
      scene.events.off(Phaser.Scenes.Events.SHUTDOWN, onShutdown);
      timer?.remove();
      elements.forEach((element) => element.remove());
    };
    const finish = (yes: boolean) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(yes);
    };
    const choose = (i: number) => {
      if (settled) return;
      AudioDirector.ui('sfx-ui-select');
      finish(i === 0);
    };
    const focus = (i: number) => {
      if (settled || choice === i) return;
      choice = i;
      AudioDirector.ui('sfx-ui-move');
      drawButtons();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || settled) return;
      const key = event.key === ' ' ? 'SPACE' : event.key === 'Escape' ? 'ESC' : event.key.length === 1 ? event.key.toUpperCase() : event.key.replace('Arrow', '').toUpperCase();
      if (key === 'ESC' || key === 'BACKSPACE') {
        AudioDirector.ui('sfx-ui-back');
        finish(false);
      } else if (key === 'LEFT' || key === 'UP') focus(0);
      else if (key === 'RIGHT' || key === 'DOWN') focus(1);
      else if (KEY_OK.includes(key)) choose(choice);
    };
    const onShutdown = () => finish(false);
    let timer: Phaser.Time.TimerEvent | undefined;

    drawButtons();
    requestAnimationFrame(() => {
      frame.style.transition = 'opacity 120ms ease-out';
      messageText.style.transition = 'opacity 120ms ease-out';
      frame.style.opacity = '1';
      messageText.style.opacity = '1';
    });
    scene.input.keyboard?.on('keydown', onKey);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, onShutdown);
    timer = scene.time.addEvent({
      delay: 18,
      repeat: fullMessage.length - 1,
      callback: () => {
        charIndex++;
        messageText.textContent = fullMessage.slice(0, charIndex);
        if (charIndex % 4 === 0) AudioDirector.ui('sfx-ui-move');
      },
    });
  });
}
