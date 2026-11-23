// Dominio: seba. Título cinemático: parallax + lluvia → logo con squash & stretch → «Pulsa cualquier tecla»
// (desbloquea el audio) → sting + voz + música → menú. Con ?skipIntro=1 el menú aparece al instante.
import Phaser from 'phaser';
import { GameState } from '../core/GameState';
import { AudioDirector, settings } from '../audio';
import { Menu } from '../ui/Menu';
import { installGlobalKeys } from '../ui/globalKeys';
import { C, reducedMotion, scanlines, skipIntro, text } from '../ui/theme';
import { fadeIn, goTo } from '../ui/transitions';

export class TitleScene extends Phaser.Scene {
  private menu: Menu | null = null;
  private logo!: Phaser.GameObjects.Image;

  constructor() {
    super('TitleScene');
  }

  create(data: { menu?: boolean } = {}): void {
    const { width: w, height: h } = this.scale;
    const instant = skipIntro() || data.menu === true;
    const calm = reducedMotion(settings.get().reducedMotion);
    this.menu = null;
    installGlobalKeys(this);
    fadeIn(this, instant ? 0 : 300);

    // capas (lejos → cerca) que entran desde abajo
    const layers = [
      this.add.image(0, 0, 'title-sky').setOrigin(0),
      this.add.image(0, 0, 'title-skyline').setOrigin(0),
      this.add.image(0, 40, 'title-street').setOrigin(0),
    ];
    if (!instant && !calm) {
      layers.slice(1).forEach((l, i) => { // el cielo queda fijo; skyline y calle suben
        const y = l.y;
        l.y += 40 + i * 30;
        this.tweens.add({ targets: l, y, duration: 900 + i * 200, ease: 'Cubic.Out' });
      });
    }
    // deriva lenta: la ciudad «respira»
    if (!calm) this.tweens.add({ targets: layers[1], x: -4, duration: 6000, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

    // lluvia
    this.add.particles(0, -10, 'ui-rain', {
      x: { min: -40, max: w + 40 }, lifespan: 900, speedY: { min: 260, max: 340 }, speedX: -60,
      quantity: calm ? 1 : 3, frequency: 30, alpha: { start: 0.7, end: 0.2 },
    });
    this.add.rectangle(0, 0, w, h, C.bg, 0.15).setOrigin(0);

    this.logo = this.add.image(w / 2, instant ? 62 : -80, 'title-logo').setOrigin(0.5);
    scanlines(this, 0.08);

    if (instant) {
      AudioDirector.whenUnlocked(() => AudioDirector.playMusic('music-title', 600));
      this.showMenu(true);
      return;
    }

    this.tweens.chain({
      targets: this.logo,
      tweens: [
        { y: 62, duration: 520, delay: 500, ease: 'Quad.In' },
        { scaleY: 0.78, scaleX: 1.18, duration: 70, onStart: () => { if (!calm) this.cameras.main.shake(80, 0.01); this.cameras.main.flash(120, 255, 95, 162); } },
        { scaleY: 1.08, scaleX: 0.94, duration: 110, ease: 'Quad.Out' },
        { scaleY: 1, scaleX: 1, duration: 140, ease: 'Back.Out' },
      ],
    });

    const prompt = text(this, w / 2, h - 46, 'PULSA CUALQUIER TECLA', { align: 'center', stroke: true }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: prompt, alpha: 1, delay: 1300, duration: 300, onComplete: () => {
      this.tweens.add({ targets: prompt, alpha: 0.25, duration: 600, yoyo: true, repeat: -1 });
    } });

    const start = () => {
      prompt.destroy();
      AudioDirector.whenUnlocked(() => {
        AudioDirector.sfx('sfx-title-sting', { channel: 'ui', detune: 0, volume: 1.4 });
        this.time.delayedCall(350, () => AudioDirector.voice('vo-title'));
        AudioDirector.playMusic('music-title', 1500);
      });
      this.tweens.killTweensOf(this.logo);
      this.logo.setScale(1);
      this.tweens.add({ targets: this.logo, y: 62, duration: 150 });
      this.showMenu(false);
    };
    this.time.delayedCall(250, () => {
      this.input.keyboard?.once('keydown', start);
      this.input.once('pointerdown', start);
    });
  }

  private showMenu(instant: boolean): void {
    if (this.menu) return;
    const { width: w, height: h } = this.scale;
    GameState.load();
    const hasSave = GameState.data.checkpointId !== null || GameState.data.visitedRooms.length > 0;

    const play = (fresh: boolean) => {
      this.menu?.setActive(false);
      if (fresh) GameState.reset(); else GameState.load();
      this.registry.set('newGame', fresh);
      void goTo(this, 'GameScene', undefined, 400);
    };
    const open = (key: string) => {
      this.menu?.setActive(false);
      this.scene.launch(key, { from: this.scene.key });
      this.scene.pause();
    };

    const box = this.add.graphics();
    box.fillStyle(C.panelDark, 0.82).fillRect(w / 2 - 70, h - 92, 140, 72);
    box.lineStyle(1, C.accent, 0.8).strokeRect(w / 2 - 69.5, h - 91.5, 139, 71);
    this.menu = new Menu(this, w / 2, h - 84, [
      { label: () => 'CONTINUAR', enabled: () => hasSave, onSelect: () => play(false) },
      { label: () => (hasSave ? 'NUEVA PARTIDA' : 'JUGAR'), onSelect: () => play(true) },
      { label: () => 'OPCIONES', onSelect: () => open('OptionsScene') },
      { label: () => 'CREDITOS', onSelect: () => open('CreditsScene') },
    ], { align: 'center' });
    const hint = text(this, w / 2, h - 10, 'FLECHAS / W S  ·  ESPACIO / ENTER', { color: C.dim, align: 'center' }).setOrigin(0.5);

    // al volver de Opciones/Créditos
    this.events.on(Phaser.Scenes.Events.RESUME, () => this.menu?.setActive(true));

    if (!instant) {
      for (const o of [box, this.menu.container, hint]) {
        const y = o.y;
        o.setAlpha(0).setY(y + 20);
        this.tweens.add({ targets: o, alpha: 1, y, duration: 260, ease: 'Cubic.Out' });
      }
    }
  }
}
