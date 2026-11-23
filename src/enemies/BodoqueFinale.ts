import Phaser from 'phaser';
import { hdLayer } from '../ui/hd/HdLayer';
import './bodoque-broadcast.css';
import { HEART_CUT_FRAME, HEART_LAST_FRAME, HEART_TEXTURE } from './codexHeart';
import type { BodoqueBrain, BodoquePoint } from './BodoqueBrain';

/** Broadcast effects in the room and a camera-independent caption for the last line. */
export class BodoqueFinale {
  readonly core: Phaser.GameObjects.Graphics;
  private readonly caption: HTMLDivElement;
  private readonly channel: HTMLDivElement;
  private readonly channelNumbers: Phaser.GameObjects.Text[];
  readonly monitors: Phaser.GameObjects.Text[];
  readonly panels: Phaser.GameObjects.Graphics;
  private readonly atmosphere: Phaser.GameObjects.Graphics;
  private readonly chest: Phaser.GameObjects.Graphics;
  readonly emblem: Phaser.GameObjects.Image;
  private readonly lastFrame: number;
  private readonly owned: Phaser.GameObjects.GameObject[];
  private timeMs = 0;
  private interruptionMs = 0;
  private hitMs = 0;
  private destroyed = false;
  criticalCount = 0;

  constructor(scene: Phaser.Scene, arena?: BodoquePoint) {
    this.atmosphere = scene.add.graphics().setDepth(9000).setName('room-codex-atmosphere');
    this.panels = scene.add.graphics().setDepth(9001).setName('room-codex-monitors');
    this.chest = scene.add.graphics().setName('room-codex-chest');
    this.core = scene.add.graphics().setName('room-codex-core').setVisible(false);
    this.lastFrame = arena ? HEART_CUT_FRAME : HEART_LAST_FRAME;
    this.emblem = scene.add.image(0, 0, HEART_TEXTURE, 0).setName('bodoque-heart-emblem').setVisible(false);
    const overlay = hdLayer(scene);
    this.channel = overlay.el('div', { x: 471, y: 8, depth: 10, className: 'bodoque-channel' });
    this.channel.hidden = true;
    const liveTag = document.createElement('span');
    liveTag.className = 'bodoque-channel-live';
    liveTag.textContent = 'EN VIVO';
    const station = document.createElement('span');
    station.className = 'bodoque-channel-station';
    station.textContent = 'CANAL ';
    const number = document.createElement('strong');
    number.textContent = '23';
    station.append(number);
    this.channel.append(liveTag, station);
    this.caption = overlay.el('div', { x: 240, y: 181, depth: 10, className: 'bodoque-caption' });
    this.caption.hidden = true;
    this.caption.setAttribute('role', 'status');
    const speaker = document.createElement('div');
    speaker.className = 'bodoque-caption-speaker';
    speaker.textContent = 'Bodoque';
    const signal = document.createElement('span');
    signal.textContent = 'ERROR 23';
    speaker.append(signal);
    const line = document.createElement('div');
    line.className = 'bodoque-caption-line';
    line.textContent = '¡Queda una pura...!';
    this.caption.append(speaker, line);
    const monitorCenters = [131, 829];
    this.channelNumbers = monitorCenters.map(x => scene.add.text(x, 125, '23', {
      fontFamily: 'monospace', fontSize: '57px', fontStyle: 'bold', color: '#fff8df',
    }).setOrigin(0.5).setDepth(9002).setName('room-codex-monitor-number'));
    this.monitors = monitorCenters.map(x => scene.add.text(x, 159, 'CANAL', {
      fontFamily: 'monospace', fontSize: '16px', fontStyle: 'bold', color: '#ffc0d5',
    }).setOrigin(0.5).setDepth(9002).setName('room-codex-monitor-text'));
    if (arena) {
      // El atrezo usa el espacio de diseño del laboratorio. El cuerpo y el núcleo ya están en coordenadas Tiled.
      scene.add.container(arena.x - 480 * 0.7, arena.y - 270 * 0.7,
        [this.atmosphere, this.panels, ...this.channelNumbers, ...this.monitors]).setScale(0.7).setDepth(9000).setName('set-broadcast');
      // Phaser destruye el contenedor al cerrar la escena.
    }
    this.owned = [this.atmosphere, this.panels, this.chest, this.core, this.emblem,
      ...this.channelNumbers, ...this.monitors];
    this.owned.forEach((object) => (object as Phaser.GameObjects.Graphics).setVisible(false));
  }

  startCritical(): void {
    if (this.criticalCount) return;
    this.criticalCount++;
    this.interruptionMs = 1500;
  }

  showHit(): void { this.hitMs = 160; }

  update(dtMs: number, brain: BodoqueBrain, body: BodoquePoint, heart: BodoquePoint): void {
    if (this.destroyed) return;
    this.timeMs += Math.max(0, dtMs);
    this.interruptionMs = Math.max(0, this.interruptionMs - Math.max(0, dtMs));
    this.hitMs = Math.max(0, this.hitMs - Math.max(0, dtMs));
    const live = brain.state !== 'inactive';
    const onAir = brain.active;
    if (this.channel.hidden === onAir) this.channel.hidden = !onAir;
    this.panels.setVisible(live).clear();
    const final = ['opening', 'heart', 'dying', 'defeated'].includes(brain.state);
    const dying = brain.state === 'dying' || brain.state === 'defeated';
    const end = brain.state === 'defeated' ? 1 : dying ? brain.finalProgress : 0;
    const pulse = Math.sin(this.timeMs / (brain.critical ? 65 : 190));
    this.monitors.forEach((monitor, i) => {
      const left = monitor.x - 60;
      this.panels.fillStyle(0x0c0b17).fillRoundedRect(left, 89, 120, 84, 5)
        .lineStyle(3, dying ? 0x514357 : 0xc477a2).strokeRoundedRect(left, 89, 120, 84, 5)
        .fillStyle(0x28182c).fillRect(left + 5, 149, 110, 19);
      this.channelNumbers[i].setVisible(live).setAlpha(1 - end);
      monitor.setVisible(live).setAlpha(1 - end).setText(dying ? 'SIN SEÑAL'
        : this.interruptionMs > 0 ? 'APUESTA' : brain.critical ? 'ERROR' : 'CANAL');
      if (live && end < 1) {
        const scanY = 94 + (this.timeMs * 0.035) % 51;
        this.panels.lineStyle(1, 0xf298ce, 0.18).lineBetween(left + 5, scanY, left + 115, scanY);
      }
    });
    this.atmosphere.clear().setVisible(live);
    // Local broadcast rain rises before the ending, falls normally once the core breaks.
    for (let i = 0; i < 24; i++) {
      const x = 70 + (i * 137) % 820;
      const y = 112 + ((i * 37 + (dying ? 1 : -1) * this.timeMs * 0.09) % 410 + 410) % 410;
      this.atmosphere.lineStyle(1, 0xc9d4ff, dying ? 0.27 : 0.09)
        .lineBetween(x, y, x - 2, y + 8);
    }
    const hideCaption = !brain.captionVisible;
    if (this.caption.hidden !== hideCaption) this.caption.hidden = hideCaption;
    if (this.interruptionMs > 0 && !dying) {
      // Letterbox is confined to room edges; gameplay remains readable and interactive.
      this.atmosphere.fillStyle(0x180711, 0.65).fillRect(56, 104, 848, 12).fillRect(56, 526, 848, 12);
      for (let i = 0; i < 6; i++) {
        const y = 110 + (this.timeMs * 0.12 + i * 61) % 415;
        this.atmosphere.fillStyle(0xf474ba, 0.08).fillRect(56 + i * 40, y, 140, 2);
      }
    }
    const chestY = body.y - (this.lastFrame === HEART_CUT_FRAME ? 32 - 8 * end : 19);
    this.chest.clear().setVisible(final && end < 1).setPosition(body.x, chestY).setDepth(body.y + 2);
    this.core.clear().setVisible(final && end < 1).setPosition(heart.x, heart.y).setDepth(body.y + 10);
    this.emblem.setVisible(final && end < 1);
    if (!final) return;
    const opening = brain.state === 'opening' ? brain.finalProgress : 1;
    const exposed = dying ? 1 - Phaser.Math.Easing.Sine.InOut(end) : opening;
    const x = Phaser.Math.Linear(body.x, heart.x, exposed);
    const y = Phaser.Math.Linear(chestY, heart.y, exposed);
    const size = (88 + (dying ? 32 * Math.min(1, end * 3) : 0)) * (1 + 0.045 * pulse);
    this.emblem.setPosition(x, y).setDepth(body.y + 11).setAlpha(opening).setDisplaySize(size, size)
      .setFrame(dying ? Math.round(this.lastFrame * end) : 0);
    this.core.setPosition(x, y);
    const gap = opening * 3;
    this.chest.fillStyle(0x240f25, 0.86).fillEllipse(0, 0, 13 + gap, 16)
      .lineStyle(1.5, 0xf577ba, 0.85).lineBetween(-3 - gap, -7, -6 - gap, 0)
      .lineBetween(-6 - gap, 0, -2 - gap, 6);
    this.chest.lineStyle(1, 0xab749e, 0.6 * exposed).lineBetween(5, 0, x - body.x, y - chestY);
    this.core.setScale(1 + pulse * (brain.critical ? 0.1 : 0.045))
      .setRotation(Math.sin(this.timeMs / 500) * 0.1);
    this.core.fillStyle(0xc92068, 0.07 + opening * 0.07).fillCircle(0, 0, 46)
      .fillStyle(brain.critical ? 0xff334b : 0xc83cbd, 0.17).fillCircle(0, 0, 29);
    if (!dying) {
      if (this.hitMs > 0) this.core.fillStyle(0xffe9f7, this.hitMs / 300).fillCircle(0, 0, 24);
      const cracks = Math.ceil(6 * (1 - brain.hp / brain.config.heart.hp));
      for (let i = 0; i < cracks; i++) {
        const a = i * 2.4;
        this.core.lineStyle(1.5, 0xff6b98).lineBetween(Math.cos(a) * 17, Math.sin(a) * 17,
          Math.cos(a + 0.2) * 24, Math.sin(a + 0.2) * 24);
      }
    }
    // Bounded procedural motes double as a core rupture; no spawned particle objects.
    for (let i = 0; i < 18; i++) {
      const a = i * 2.4 + this.timeMs / 1300;
      const r = dying ? 12 + end * 100 : 19 + (this.timeMs * 0.015 + i * 7) % 22;
      this.core.fillStyle([0xf04567, 0xa45cff, 0xf04ac7][i % 3], dying ? 1 - end : 0.6)
        .fillCircle(Math.cos(a) * r, Math.sin(a) * r, dying ? 3 : 1.5);
    }
    this.core.setAlpha(brain.state === 'opening' ? opening : 1);
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.interruptionMs = 0;
    this.channel.remove();
    this.caption.remove();
    this.owned.forEach((object) => object.destroy());
  }
}
