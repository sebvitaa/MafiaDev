// Dominio: seba. Pausa sobre la escena de juego: Continuar · Opciones · Salir al título.
// La música baja al 30 % (AudioDirector escucha game:paused / game:resumed).
import Phaser from 'phaser';
import { bus } from '../core/EventBus';
import { AudioDirector } from '../audio';
import { Menu } from '../ui/Menu';
import { installGlobalKeys } from '../ui/globalKeys';
import { C, panel, text } from '../ui/theme';

export class PauseScene extends Phaser.Scene {
  private from = 'GameScene';
  private menu!: Menu;

  constructor() {
    super('PauseScene');
  }

  init(data: { from?: string }): void {
    this.from = data.from ?? 'GameScene';
  }

  create(): void {
    const { width: w, height: h } = this.scale;
    installGlobalKeys(this);
    const dim = this.add.rectangle(0, 0, w, h, C.bg, 0).setOrigin(0);
    this.tweens.add({ targets: dim, fillAlpha: 0.7, duration: 150 });
    const pw = 150, ph = 92, px = (w - pw) / 2, py = (h - ph) / 2;
    const box = this.add.container(0, -10).setAlpha(0);
    box.add(panel(this, px, py, pw, ph));
    box.add(text(this, w / 2, py + 8, 'PAUSA', { size: 16, color: C.accent, align: 'center' }).setOrigin(0.5, 0));
    this.tweens.add({ targets: box, y: 0, alpha: 1, duration: 160, ease: 'Cubic.Out' });

    const resume = () => {
      this.menu.setActive(false);
      this.scene.resume(this.from);
      this.scene.stop();
      bus.emit('game:resumed', {});
    };
    const quit = () => {
      this.menu.setActive(false);
      AudioDirector.duck(1, 0);
      AudioDirector.playAmbient(null, 300);
      this.scene.stop(this.from);
      this.scene.stop();
      this.scene.start('TitleScene', { menu: true });
    };
    this.menu = new Menu(this, w / 2, py + 34, [
      { label: () => 'CONTINUAR', onSelect: resume },
      { label: () => 'OPCIONES', onSelect: () => { this.menu.setActive(false); this.scene.launch('OptionsScene', { from: this.scene.key }); this.scene.pause(); } },
      { label: () => 'SALIR AL TITULO', onSelect: quit },
    ], { align: 'center', onBack: resume });
    this.events.on(Phaser.Scenes.Events.RESUME, () => this.menu.setActive(true));
    this.time.delayedCall(80, () => this.input.keyboard?.on('keydown-P', resume));
  }
}
