import Phaser from 'phaser';
import { HEART_CUT_FRAME, HEART_LAST_FRAME, HEART_TEXTURE } from './codexHeart';
import type { BodoqueBrain, BodoquePoint } from './BodoqueBrain';

// SUP-basti-20261123-144553: local broadcast visuals; brief caption 1500ms, defeat 1600ms in enemies.json.
/** Local-only broadcast/chest/core presentation. All effects are pooled Graphics, no timers/listeners. */
export class BodoqueFinale {
  readonly core: Phaser.GameObjects.Graphics;
  readonly caption: Phaser.GameObjects.Text;
  readonly channel: Phaser.GameObjects.Text;
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
    this.channel = scene.add.text(942, 67, 'CANAL 23 · EN VIVO', { fontFamily: 'monospace',
      fontSize: '12px', color: '#ffb1b7', backgroundColor: '#171320' }).setOrigin(1, 0).setDepth(12001)
      .setName('room-codex-channel');
    this.caption = scene.add.text(480, 505, '', { fontFamily: 'monospace', fontSize: '17px',
      color: '#fff4e0', backgroundColor: '#201522', stroke: '#201522', strokeThickness: 4, align: 'center' })
      .setOrigin(0.5).setDepth(12002).setName('room-codex-caption').setVisible(false);
    this.monitors = [92, 790].map((x) => scene.add.text(x + 39, 133, '23\nEN VIVO', {
      fontFamily: 'monospace', fontSize: '12px', align: 'center', color: '#deb0f8',
    }).setOrigin(0.5).setDepth(9002).setName('room-codex-monitor-text'));
    if (arena) {
      // El atrezo usa el espacio de diseño del laboratorio. El cuerpo y el núcleo ya están en coordenadas Tiled.
      scene.add.container(arena.x - 480 * 0.7, arena.y - 270 * 0.7,
        [this.atmosphere, this.panels, ...this.monitors, this.channel, this.caption]).setScale(0.7).setDepth(9000).setName('set-broadcast');
      // Phaser destruye el contenedor al cerrar la escena.
    }
    this.owned = [this.atmosphere, this.panels, this.chest, this.core, this.emblem,
      this.channel, this.caption, ...this.monitors];
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
    this.channel.setVisible(live);
    this.panels.setVisible(live).clear();
    const final = ['opening', 'heart', 'dying', 'defeated'].includes(brain.state);
    const dying = brain.state === 'dying' || brain.state === 'defeated';
    const end = brain.state === 'defeated' ? 1 : dying ? brain.finalProgress : 0;
    const pulse = Math.sin(this.timeMs / (brain.critical ? 65 : 190));
    this.monitors.forEach((monitor, i) => {
      const x = i === 0 ? 92 : 790;
      this.panels.fillStyle(0x0b0d18, 0.96).fillRoundedRect(x, 107, 78, 52, 5)
        .lineStyle(2, dying ? 0x433444 : 0xbb699b, 0.8).strokeRoundedRect(x, 107, 78, 52, 5);
      monitor.setVisible(live).setAlpha(1 - end).setText(dying ? 'SIN\nSEÑAL'
        : this.interruptionMs > 0 ? 'APUESTA' : brain.critical ? 'ERROR 23' : '23\nEN VIVO');
      if (live && end < 1) {
        for (let row = 0; row < 4; row++) {
          const offset = (this.timeMs * 0.035 + row * 11) % 45;
          this.panels.lineStyle(1, 0xef9de9, this.interruptionMs > 0 ? 0.5 : 0.12)
            .lineBetween(x + 3, 110 + offset, x + 75, 110 + offset);
        }
      }
    });
    this.channel.setText(dying ? 'CANAL 23 · FIN DE TRANSMISIÓN' : 'CANAL 23 · EN VIVO');
    this.atmosphere.clear().setVisible(live);
    // Local broadcast rain rises before the ending, falls normally once the core breaks.
    for (let i = 0; i < 24; i++) {
      const x = 70 + (i * 137) % 820;
      const y = 112 + ((i * 37 + (dying ? 1 : -1) * this.timeMs * 0.09) % 410 + 410) % 410;
      this.atmosphere.lineStyle(1, 0xc9d4ff, dying ? 0.27 : 0.09)
        .lineBetween(x, y, x - 2, y + 8);
    }
    this.caption.setVisible(this.interruptionMs > 0 && !dying)
      .setText('ERROR 23\nBODOQUE: ¡Queda una pura...!')
      .setX(480 + (this.interruptionMs > 1200 ? Math.sin(this.timeMs * 0.1) * 2 : 0));
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
    this.owned.forEach((object) => object.destroy());
  }
}
