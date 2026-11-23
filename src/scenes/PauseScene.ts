// Dominio: seba. Overlay de pausa: continuar, opciones, controles y salir al título.
import Phaser from 'phaser';
import { bus } from '../core/EventBus';
import { AudioDirector } from '../audio';
import { confirmDialog } from '../ui/ConfirmDialog';
import { showControls } from '../ui/ControlsPanel';
import { Menu } from '../ui/Menu';
import { installGlobalKeys } from '../ui/globalKeys';
import { hdLayer } from '../ui/hd/HdLayer';
import { C } from '../ui/theme';

export class PauseScene extends Phaser.Scene {
  private from = 'GameScene';
  private menu!: Menu;
  private grade: Phaser.Filters.ColorMatrix | null = null;
  private readonly resumeKey = (): void => this.resumeGame();

  constructor() {
    super('PauseScene');
  }

  init(data: { from?: string }): void {
    this.from = data.from ?? 'GameScene';
  }

  create(): void {
    const { width: w, height: h } = this.scale;
    this.input.setDefaultCursor('default');
    installGlobalKeys(this);
    this.desaturate(true);
    const dim = this.add.rectangle(0, 0, w, h, C.bg, 0).setOrigin(0);
    this.tweens.add({ targets: dim, fillAlpha: 0.76, duration: 200, ease: 'Cubic.Out' });
    const pw = 224, ph = 124, px = (w - pw) / 2, py = (h - ph) / 2;
    const layer = hdLayer(this);
    const frame = layer.panel(px, py, pw, ph, { depth: 10 });
    const title = layer.text(w / 2, py + 8, 'PAUSA', {
      depth: 11, width: 140, fontSize: 16, weight: 600, color: '#ff5fa2', align: 'center',
    });
    const box = this.add.container(0, -8).setAlpha(0);
    const syncBox = () => {
      const transform = `translateY(${box.y}px)`;
      frame.style.transform = transform;
      title.style.transform = transform;
      frame.style.opacity = String(box.alpha);
      title.style.opacity = String(box.alpha);
    };
    this.events.on(Phaser.Scenes.Events.POST_UPDATE, syncBox);
    this.tweens.add({ targets: box, y: 0, alpha: 1, duration: 200, ease: 'Cubic.Out' });

    const resume = () => this.resumeGame();
    const options = () => {
      this.menu.setActive(false);
      this.scene.launch('OptionsScene', { from: this.scene.key });
      this.scene.pause();
    };
    const controls = async () => {
      this.menu.setActive(false);
      await showControls(this);
      if (this.scene.isActive()) this.menu.setActive(true);
    };
    const quitPrompt = async () => {
      this.menu.setActive(false);
      const yes = await confirmDialog(this, '¿SALIR AL TÍTULO? SE PERDERÁ EL PROGRESO DESDE EL ÚLTIMO CHECKPOINT');
      if (yes) this.quitToTitle();
      else if (this.scene.isActive()) this.menu.setActive(true);
    };
    this.menu = new Menu(this, w / 2, py + 34, [
      { label: () => 'CONTINUAR', onSelect: resume },
      { label: () => 'OPCIONES', onSelect: options },
      { label: () => 'CONTROLES', onSelect: () => { void controls(); } },
      { label: () => 'SALIR AL TÍTULO', onSelect: () => { void quitPrompt(); } },
    ], { align: 'center', onBack: resume, lineHeight: 16, rowWidth: 210 });
    this.menu.container.setDepth(12);
    this.menu.refresh(false);
    this.events.on(Phaser.Scenes.Events.RESUME, () => this.menu.setActive(true));
    this.time.delayedCall(80, () => this.input.keyboard?.on('keydown-P', this.resumeKey));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown-P', this.resumeKey);
      this.events.off(Phaser.Scenes.Events.POST_UPDATE, syncBox);
      box.destroy();
      this.desaturate(false);
      try {
        const game = this.scene.get(this.from);
        if (game.scene.isActive()) game.input.setDefaultCursor('none');
      } catch {
        this.input.setDefaultCursor('default');
      }
    });
  }

  private resumeGame(): void {
    if (!this.scene.isActive()) return;
    this.menu.setActive(false);
    this.desaturate(false);
    this.scene.resume(this.from);
    this.scene.stop();
    bus.emit('game:resumed', {});
  }

  private quitToTitle(): void {
    this.menu.setActive(false);
    this.desaturate(false);
    AudioDirector.duck(1, 0);
    AudioDirector.playAmbient(null, 300);
    this.scene.stop(this.from);
    this.scene.stop();
    this.scene.start('TitleScene', { menu: true });
  }

  /** Desatura la cámara del juego con el filtro de Phaser 4. */
  private desaturate(on: boolean): void {
    try {
      const camera = this.scene.get(this.from)?.cameras?.main;
      if (!camera?.filters) return;
      if (on && !this.grade) {
        this.grade = camera.filters.internal.addColorMatrix();
        this.grade.colorMatrix.desaturate();
      } else if (!on && this.grade) {
        camera.filters.internal.remove(this.grade);
        this.grade = null;
      }
    } catch {
      /* filtros no disponibles en algunos renderers */
    }
  }
}
