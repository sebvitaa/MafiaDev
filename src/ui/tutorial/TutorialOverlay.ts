// Dominio: seba. Tutorial contextual: burbujas que enseñan jugando. Se completa con eventos del bus.
// Arranca en partida nueva (si no se completó antes) o al entrar en la sala `tutorial` de vicho.
import Phaser from 'phaser';
import { bus } from '../../core/EventBus';
import { BINDINGS, type Action } from '../../core/Input';
import type { GameEventName } from '../../types/events';
import { AudioDirector, settings } from '../../audio';
import { C, text } from '../theme';
import { createTutorial, formatStep, TUTORIAL_STEPS } from './steps';

const WATCHED: GameEventName[] = [...new Set(TUTORIAL_STEPS.map((s) => s.event).filter((e): e is GameEventName => e !== null))];

export class TutorialOverlay {
  private readonly tut = createTutorial();
  private readonly box: Phaser.GameObjects.Container;
  private readonly label: Phaser.GameObjects.Text;
  private readonly bg: Phaser.GameObjects.Graphics;
  private readonly keys = new Map<Action, Phaser.Input.Keyboard.Key[]>();
  private readonly hint: Phaser.GameObjects.Text;

  constructor(private readonly scene: Phaser.Scene) {
    const w = scene.scale.width;
    this.bg = scene.add.graphics();
    this.label = text(scene, 0, 0, '', { align: 'center' }).setOrigin(0.5);
    this.hint = text(scene, w / 2, 44, '[T] SALTAR TUTORIAL', { color: C.dim, align: 'center' }).setOrigin(0.5).setAlpha(0);
    this.box = scene.add.container(w / 2, -30, [this.bg, this.label]).setDepth(500);
    const kb = scene.input.keyboard;
    if (kb) for (const a of ['left', 'right', 'up', 'down'] as Action[]) this.keys.set(a, BINDINGS[a].map((k) => kb.addKey(k, false)));

    for (const ev of WATCHED) bus.on(ev, (p: unknown) => this.onEvent(ev, p), this);
    bus.on('room:entered', ({ roomId }) => { if (roomId === 'tutorial' && this.tut.status !== 'running') this.start(); }, this);
    bus.on('boss:phase', () => this.skip(), this);
    kb?.on('keydown-T', () => this.skip());
    scene.events.on(Phaser.Scenes.Events.UPDATE, (_t: number, dt: number) => this.update(dt));
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => bus.offContext(this));
  }

  start(): void {
    this.tut.start();
    this.show();
    this.scene.tweens.add({ targets: this.hint, alpha: 1, duration: 300 });
  }

  private update(dt: number): void {
    if (this.tut.status !== 'running') return;
    const held = [...this.keys].filter(([, ks]) => ks.some((k) => k.isDown)).map(([a]) => a);
    if (this.tut.onHeld(held, dt)) this.completed();
  }

  private onEvent(ev: GameEventName, p: unknown): void {
    if (this.tut.onEvent(ev, p)) this.completed();
  }

  private show(): void {
    const step = this.tut.current;
    if (!step) return;
    this.label.setText(formatStep(step.text, BINDINGS).toUpperCase()).setColor('#ebe7f4');
    const bw = Math.max(120, this.label.width + 20), bh = 20;
    this.bg.clear().fillStyle(C.panelDark, 0.92).fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 4)
      .lineStyle(1, C.accent2, 1).strokeRoundedRect(-bw / 2 + 0.5, -bh / 2 + 0.5, bw - 1, bh - 1, 4);
    this.box.setY(-30);
    this.scene.tweens.add({ targets: this.box, y: 30, duration: 280, ease: 'Back.Out' });
  }

  private completed(): void {
    AudioDirector.ui('sfx-tutorial-ok');
    this.label.setText(`✓ ${this.label.text}`).setColor('#45d6c4');
    const done = this.tut.status === 'done';
    this.scene.tweens.add({
      targets: this.box, y: -30, delay: 450, duration: 220, ease: 'Cubic.In',
      onComplete: () => (done ? this.finish(true) : this.show()),
    });
  }

  private skip(): void {
    if (this.tut.status !== 'running') return;
    this.tut.skip();
    AudioDirector.ui('sfx-ui-back');
    this.scene.tweens.add({ targets: this.box, y: -30, duration: 200 });
    this.finish(false);
  }

  private finish(completed: boolean): void {
    settings.set({ tutorialDone: true });
    this.scene.tweens.add({ targets: this.hint, alpha: 0, duration: 200 });
    if (!completed) return;
    const w = this.scene.scale.width;
    const ok = text(this.scene, w / 2, 30, '¡LISTO! LA CIUDAD ES TUYA', { color: C.accent, align: 'center', stroke: true }).setOrigin(0.5);
    this.scene.tweens.add({ targets: ok, alpha: 0, y: 22, delay: 1600, duration: 400, onComplete: () => ok.destroy() });
  }
}
