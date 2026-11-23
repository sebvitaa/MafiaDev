// Dominio: seba. Opciones sobre Title o Pause: volúmenes por canal (con vista previa), silencio,
// movimiento reducido y pantalla completa. Persisten en settings (mafiadev.settings.v1).
import Phaser from 'phaser';
import { AudioDirector, settings } from '../../audio';
import type { Settings } from '../../audio/settings';
import type { SfxKey } from '../../types/assets';
import { Menu } from '../Menu';
import { C, panel, text } from '../theme';

type VolKey = 'master' | 'music' | 'sfx' | 'ambient' | 'ui';

const bar = (v: number) => '■'.repeat(Math.round(v * 10)).padEnd(10, '·');

export class OptionsScene extends Phaser.Scene {
  private from = 'TitleScene';

  constructor() {
    super('OptionsScene');
  }

  init(data: { from?: string }): void {
    this.from = data.from ?? 'TitleScene';
  }

  create(): void {
    const { width: w, height: h } = this.scale;
    this.add.rectangle(0, 0, w, h, C.bg, 0.75).setOrigin(0);
    const pw = 260, ph = 190, px = (w - pw) / 2, py = (h - ph) / 2;
    panel(this, px, py, pw, ph);
    text(this, w / 2, py + 8, 'OPCIONES', { size: 16, color: C.accent, align: 'center' }).setOrigin(0.5, 0);

    const preview: Partial<Record<VolKey, SfxKey>> = { master: 'sfx-pickup', sfx: 'sfx-hit', ui: 'sfx-ui-move' };
    const vol = (key: VolKey, label: string) => ({
      label: () => `${label}\t${bar(settings.get()[key])}`,
      onAdjust: (d: -1 | 1) => {
        const s = settings.get();
        settings.set({ [key]: Math.round((s[key] + d * 0.1) * 10) / 10 } as Partial<Settings>);
        const p = preview[key];
        if (p) AudioDirector.sfx(p, { channel: key === 'ui' ? 'ui' : 'sfx', detune: 0 });
      },
    });
    const toggle = (key: 'muted' | 'reducedMotion', label: string) => ({
      label: () => `${label}\t${settings.get()[key] ? 'SI' : 'NO'}`,
      onSelect: () => settings.set({ [key]: !settings.get()[key] }),
      onAdjust: () => settings.set({ [key]: !settings.get()[key] }),
    });

    const close = () => {
      this.scene.resume(this.from);
      this.scene.stop();
    };
    new Menu(this, px + 30, py + 34, [
      vol('master', 'GENERAL'),
      vol('music', 'MUSICA'),
      vol('sfx', 'EFECTOS'),
      vol('ambient', 'AMBIENTE'),
      vol('ui', 'MENUS'),
      toggle('muted', 'SILENCIO'),
      toggle('reducedMotion', 'MENOS MOV.'),
      {
        label: () => `PANTALLA\t${this.scale.isFullscreen ? 'COMPLETA' : 'VENTANA'}`,
        onSelect: () => (this.scale.isFullscreen ? this.scale.stopFullscreen() : this.scale.startFullscreen()),
      },
      { label: () => 'VOLVER', onSelect: close },
    ], { onBack: close, lineHeight: 15, valueX: 100 });
    text(this, w / 2, py + ph - 12, '← → AJUSTAR · ESC VOLVER', { color: C.dim, align: 'center' }).setOrigin(0.5);
  }
}
