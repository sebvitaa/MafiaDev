// Dominio: seba. Ajustes compartidos por el menú principal y la pausa.
import Phaser from 'phaser';
import { AudioDirector, settings } from '../../audio';
import { stepVolume } from '../../audio/settings';
import type { SfxKey } from '../../types/assets';
import { Menu, type MenuItem } from '../Menu';
import { confirmDialog } from '../ConfirmDialog';
import { installGlobalKeys } from '../globalKeys';
import { hdLayer } from '../hd/HdLayer';
import { C } from '../theme';

type VolKey = 'master' | 'music' | 'sfx';

export class OptionsScene extends Phaser.Scene {
  private from = 'TitleScene';
  private menu?: Menu;
  private unsubscribe?: () => void;

  constructor() {
    super('OptionsScene');
  }

  init(data: { from?: string }): void {
    this.from = data.from ?? 'TitleScene';
  }

  create(): void {
    const { width: w, height: h } = this.scale;
    installGlobalKeys(this);
    this.add.rectangle(0, 0, w, h, C.bg, 0.78).setOrigin(0);
    const pw = Math.min(440, w - 24), ph = 226, px = (w - pw) / 2, py = (h - ph) / 2;
    const layer = hdLayer(this);
    layer.panel(px, py, pw, ph, { depth: 10 });
    layer.text(w / 2, py + 8, 'OPCIONES', { depth: 11, width: 180, fontSize: 16, weight: 600, color: '#ff5fa2', align: 'center' });

    const preview: Partial<Record<VolKey, SfxKey>> = { master: 'sfx-pickup', sfx: 'sfx-hit' };
    const volume = (key: VolKey, label: string): MenuItem => ({
      label: () => `${label}\t${Math.round(settings.get()[key] * 100)}%`,
      bar: () => settings.get()[key],
      onAdjust: (dir) => {
        settings.set({ [key]: stepVolume(settings.get()[key], dir) });
        const sound = preview[key];
        if (sound === 'sfx-hit') AudioDirector.sfx(sound, { detune: 0 });
        else if (sound) AudioDirector.sfx(sound);
      },
      onSelect: () => this.adjustVolume(key, 1, preview),
    });
    const toggle = (key: 'reducedMotion' | 'screenShake', label: string): MenuItem => ({
      label: () => `${label}\t${settings.get()[key] ? 'SÍ' : 'NO'}`,
      onSelect: () => settings.set({ [key]: !settings.get()[key] }),
      onAdjust: () => settings.set({ [key]: !settings.get()[key] }),
    });
    const fullscreen = (): MenuItem => ({
      label: () => `PANTALLA COMPLETA\t${this.scale.isFullscreen ? 'SÍ' : 'NO'}`,
      onSelect: () => this.toggleFullscreen(),
      onAdjust: () => this.toggleFullscreen(),
    });
    const close = () => {
      this.menu?.setActive(false);
      this.scene.resume(this.from);
      this.scene.stop();
    };
    const restore = async () => {
      this.menu?.setActive(false);
      const confirmed = await confirmDialog(this, '¿RESTAURAR LOS VALORES POR DEFECTO?', { yes: 'SÍ', no: 'NO' });
      if (confirmed) settings.reset();
      this.menu?.refresh();
      this.menu?.setActive(true);
    };

    const items: MenuItem[] = [
      volume('master', 'GENERAL'),
      volume('music', 'MÚSICA'),
      volume('sfx', 'EFECTOS'),
      fullscreen(),
      toggle('reducedMotion', 'MENOS MOVIMIENTO'),
      toggle('screenShake', 'VIBRACIÓN DE PANTALLA'),
      { label: () => 'RESTAURAR VALORES', onSelect: () => { void restore(); } },
      { label: () => 'VOLVER', onSelect: close },
    ];
    const menuX = px + 26;
    const firstY = py + 36;
    this.menu = new Menu(this, menuX, firstY, items, { onBack: close, lineHeight: 18, valueX: 306, rowWidth: pw - 48 });
    this.menu.container.setDepth(12);
    this.menu.refresh(false);
    this.unsubscribe = settings.subscribe(() => this.menu?.refresh());
    this.scale.on(Phaser.Scale.Events.ENTER_FULLSCREEN, this.refreshMenu, this);
    this.scale.on(Phaser.Scale.Events.LEAVE_FULLSCREEN, this.refreshMenu, this);
    layer.text(w / 2, py + ph - 16, '← → AJUSTAR · ESC VOLVER', {
      depth: 10, width: 260, color: '#8a83a3', align: 'center', fontSize: 11,
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.unsubscribe?.();
      this.unsubscribe = undefined;
      this.scale.off(Phaser.Scale.Events.ENTER_FULLSCREEN, this.refreshMenu, this);
      this.scale.off(Phaser.Scale.Events.LEAVE_FULLSCREEN, this.refreshMenu, this);
      this.menu = undefined;
    });
  }

  private adjustVolume(key: VolKey, dir: -1 | 1, preview: Partial<Record<VolKey, SfxKey>>): void {
    settings.set({ [key]: stepVolume(settings.get()[key], dir) });
    const sound = preview[key];
    if (sound === 'sfx-hit') AudioDirector.sfx(sound, { detune: 0 });
    else if (sound) AudioDirector.sfx(sound);
  }

  private toggleFullscreen(): void {
    if (this.scale.isFullscreen) this.scale.stopFullscreen();
    else this.scale.startFullscreen();
    this.time.delayedCall(0, () => this.refreshMenu());
  }

  private refreshMenu = (): void => { this.menu?.refresh(); };

}
