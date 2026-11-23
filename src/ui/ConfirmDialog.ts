import Phaser from 'phaser';
import { AudioDirector } from '../audio';
import { C, panel, text } from './theme';

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

/** Panel modal pequeño. El dueño del menú debe desactivarlo mientras la promesa está abierta. */
export function confirmDialog(
  scene: Phaser.Scene,
  message: string,
  opts: { yes?: string; no?: string } = {},
): Promise<boolean> {
  return new Promise((resolve) => {
    const width = scene.scale.width;
    const height = scene.scale.height;
    const lines = wrap(message, 31);
    const boxW = Math.min(220, width - 16);
    const boxH = Math.min(height - 16, 66 + lines.length * 10);
    const x = (width - boxW) / 2;
    const y = (height - boxH) / 2;
    let choice = 1; // NO es la opción segura por defecto.
    let settled = false;
    let charIndex = 0;
    const fullMessage = lines.join('\n');
    const objects: Phaser.GameObjects.GameObject[] = [];
    const fadeTargets: Array<{ setAlpha(value: number): unknown }> = [];
    const add = <T extends Phaser.GameObjects.GameObject>(object: T): T => { objects.push(object); return object; };

    const shade = add(scene.add.rectangle(0, 0, width, height, 0x090811, 0.72).setOrigin(0));
    const frame = add(panel(scene, x, y, boxW, boxH, 0.98));
    const messageText = add(text(scene, width / 2, y + 16, '', { align: 'center', color: C.text })).setOrigin(0.5, 0);
    fadeTargets.push(shade, frame, messageText);
    const buttonY = y + boxH - 29;
    const buttonW = 70, buttonH = 17, gap = 12;
    const buttonX = width / 2 - buttonW - gap / 2;
    const labels = [opts.yes ?? 'SÍ', opts.no ?? 'NO'];
    const buttonFrames: Phaser.GameObjects.Graphics[] = [];
    const buttonLabels: Phaser.GameObjects.Text[] = [];
    const buttonZones: Phaser.GameObjects.Zone[] = [];
    for (let i = 0; i < 2; i++) {
      const bx = buttonX + i * (buttonW + gap);
      const buttonFrame = add(scene.add.graphics());
      buttonFrames.push(buttonFrame);
      fadeTargets.push(buttonFrame);
      const buttonLabel = add(text(scene, bx + buttonW / 2, buttonY + 4, labels[i], { align: 'center' }).setOrigin(0.5, 0));
      buttonLabels.push(buttonLabel);
      fadeTargets.push(buttonLabel);
      const zone = add(scene.add.zone(bx, buttonY, buttonW, buttonH).setOrigin(0, 0).setInteractive());
      zone.on('pointerover', () => focus(i));
      zone.on('pointerdown', () => { focus(i); choose(i); });
      buttonZones.push(zone);
    }

    const drawButtons = () => {
      buttonFrames.forEach((g, i) => {
        const bx = buttonX + i * (buttonW + gap);
        g.clear();
        g.fillStyle(i === choice ? 0x3a3352 : 0x221d33, 1).fillRect(bx, buttonY, buttonW, buttonH);
        g.lineStyle(1, i === choice ? C.accent : 0x5a5370, 1).strokeRect(bx + 0.5, buttonY + 0.5, buttonW - 1, buttonH - 1);
      });
      buttonLabels.forEach((label, i) => label.setColor(i === choice ? '#ff5fa2' : '#ebe7f4'));
    };
    const cleanup = () => {
      scene.input.keyboard?.off('keydown', onKey);
      scene.events.off(Phaser.Scenes.Events.SHUTDOWN, onShutdown);
      timer?.remove();
      objects.forEach((object) => object.destroy());
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
    fadeTargets.forEach((object) => object.setAlpha(0));
    scene.tweens.add({ targets: fadeTargets, alpha: 1, duration: 120, ease: 'Cubic.Out' });
    scene.input.keyboard?.on('keydown', onKey);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, onShutdown);
    timer = scene.time.addEvent({
      delay: 18,
      repeat: fullMessage.length - 1,
      callback: () => {
        charIndex++;
        messageText.setText(fullMessage.slice(0, charIndex));
        if (charIndex % 4 === 0) AudioDirector.ui('sfx-ui-move');
      },
    });
  });
}
