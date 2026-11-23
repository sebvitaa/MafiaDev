import Phaser from 'phaser';
import { AudioDirector } from '../../audio';
import { C, text } from '../theme';
import { getLabRecentSounds } from './labPanel';

export class LabScene extends Phaser.Scene {
  private musicLabel!: Phaser.GameObjects.Text;
  private soundsLabel!: Phaser.GameObjects.Text;

  constructor() {
    super('LabScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(C.bg);
    text(this, 16, 18, 'LAB · MAFIADEV', { size: 16, color: C.accent });
    text(this, 16, 46, 'Panel derecho: escucha, eventos y pantallas', { color: C.dim });
    this.musicLabel = text(this, 16, 76, '', { color: C.accent2 });
    text(this, 16, 104, 'ULTIMOS SONIDOS DEL PANEL', { color: C.accent });
    this.soundsLabel = text(this, 16, 120, '', { color: C.text });
    this.refreshLabels();
    this.time.addEvent({ delay: 250, loop: true, callback: () => this.refreshLabels() });
  }

  private refreshLabels(): void {
    this.musicLabel.setText(`MUSICA: ${AudioDirector.currentMusic ?? 'ninguna'}`);
    const sounds = getLabRecentSounds();
    this.soundsLabel.setText(sounds.length ? sounds.map((sound) => `· ${sound}`).join('\n') : '· (sin reproducir)');
  }
}
