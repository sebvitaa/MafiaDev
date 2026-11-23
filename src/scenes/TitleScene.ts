// Dominio: seba. Título (fase 4): ciudad noir con lluvia (parallax que sube) → el logo de la apertura
// aterriza con squash + shake → «PRESIONA CUALQUIER TECLA» (desbloquea el audio) → sting + voz + noir jazz → menú.
// Menú: CONTINUAR (oculto sin partida) · JUGAR < escenario 1/2/3 > (←/→ elige, ENTER empieza) · OPCIONES · CRÉDITOS.
// Con ?skipIntro=1 o { menu: true } el menú aparece al instante.
import Phaser from 'phaser';
import { GameState } from '../core/GameState';
import { AudioDirector, settings } from '../audio';
import { confirmDialog } from '../ui/ConfirmDialog';
import { Menu, type MenuItem } from '../ui/Menu';
import { installGlobalKeys, shake } from '../ui/globalKeys';
import { hdLayer } from '../ui/hd/HdLayer';
import { buildLogo, idleShine, LOGO_TITLE_Y, squashLogo, type Logo } from '../ui/logo';
import { C, reducedMotion, scanlines, skipIntro, text } from '../ui/theme';
import { fadeIn, flashTo } from '../ui/transitions';

export interface TitleData { menu?: boolean; fromSplash?: boolean }

// SUP-seba-20261123-114613-2: «3 escenarios: early, mid, late». GameScene (vicho) lee registry 'stage' / data.stage.
// El selector va en la propia fila JUGAR (no en un submenú) para que ENTER/ESPACIO siga empezando al instante.
export const STAGES = [
  { id: 1, label: '1 · INICIO' },
  { id: 2, label: '2 · MITAD' },
  { id: 3, label: '3 · FINAL' },
] as const;

export class TitleScene extends Phaser.Scene {
  private menu: Menu | null = null;
  private logo!: Logo;
  private menuMotion: Array<{ element: HTMLElement; proxy: Phaser.GameObjects.Container }> = [];
  private stageIdx = 0;

  constructor() {
    super('TitleScene');
  }

  create(data: TitleData = {}): void {
    const { width: w, height: h } = this.scale;
    const instant = skipIntro() || data.menu === true;
    const fromSplash = data.fromSplash === true && !instant;
    const calm = reducedMotion(settings.get().reducedMotion);
    this.menu = null;
    this.menuMotion = [];
    this.events.off(Phaser.Scenes.Events.POST_UPDATE, this.syncMenuMotion);
    const last = Number(this.registry.get('stage') ?? new URLSearchParams(location.search).get('stage') ?? 1);
    this.stageIdx = Math.max(0, STAGES.findIndex((s) => s.id === last));
    document.title = 'MafiaDev · Metroidvania';
    installGlobalKeys(this);
    if (!fromSplash) fadeIn(this, instant ? 0 : 300);

    // capas (lejos → cerca) que entran desde abajo; si falta un asset, se omite (2.40)
    const layers = (['title-sky', 'title-skyline', 'title-street'] as const)
      .filter((k) => this.textures.exists(k))
      .map((k, i) => this.add.image(0, k === 'title-street' ? 40 : 0, k).setOrigin(0).setDepth(i));
    if (!instant && !calm) {
      layers.forEach((l, i) => {
        if (fromSplash) { l.setAlpha(0); this.tweens.add({ targets: l, alpha: 1, duration: 500 + i * 150 }); }
        if (i === 0) return; // el cielo queda fijo; skyline y calle suben
        const y = l.y;
        l.y += 40 + i * 30;
        this.tweens.add({ targets: l, y, duration: 900 + i * 200, ease: 'Cubic.Out' });
      });
    }
    if (!calm && layers[1]) this.tweens.add({ targets: layers[1], x: -4, duration: 6000, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

    // lluvia
    this.add.particles(0, -10, 'ui-rain', {
      x: { min: -40, max: w + 40 }, lifespan: 900, speedY: { min: 260, max: 340 }, speedX: -60,
      quantity: calm ? 1 : 3, frequency: 30, alpha: { start: 0.7, end: 0.2 },
    }).setDepth(5);
    this.add.rectangle(0, 0, w, h, C.bg, 0.15).setOrigin(0).setDepth(6);

    // el mismo logo de la apertura (2.30): llega aquí sin corte
    this.logo = buildLogo(this, w / 2, LOGO_TITLE_Y);
    this.logo.container.setDepth(10);
    scanlines(this, 0.08);
    this.fullscreenButton();
    const quake = () => shake(this, 90, 0.008);

    if (instant) {
      AudioDirector.whenUnlocked(() => AudioDirector.playMusic('music-title', 600));
      if (!calm) idleShine(this, this.logo);
      this.showMenu(true);
      return;
    }

    if (fromSplash) {
      // 4.5 — al asentarse la ciudad, el logo «aterriza» con squash + shake
      if (!calm) this.time.delayedCall(650, () => squashLogo(this, this.logo, quake));
    } else if (!calm) {
      const c = this.logo.container;
      c.y = -60;
      this.tweens.add({ targets: c, y: LOGO_TITLE_Y, duration: 520, delay: 500, ease: 'Quad.In', onComplete: () => squashLogo(this, this.logo, quake) });
    }
    if (!calm) this.time.delayedCall(1200, () => idleShine(this, this.logo));

    const prompt = text(this, w / 2, h - 46, 'PRESIONA CUALQUIER TECLA', { align: 'center', stroke: true }).setOrigin(0.5).setAlpha(0).setDepth(10);
    this.tweens.add({ targets: prompt, alpha: 1, delay: fromSplash ? 700 : 1300, duration: 300, onComplete: () => {
      this.tweens.add({ targets: prompt, alpha: 0.35, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    } });

    const start = () => {
      prompt.destroy();
      AudioDirector.whenUnlocked(() => {
        // 4.6 — sting al pulsar la primera tecla; 3.17/«TTS solo en la intro»: voz del narrador aquí
        AudioDirector.sfx('sfx-title-sting', { channel: 'ui', detune: 0, volume: 1.4 });
        this.time.delayedCall(350, () => AudioDirector.voice('vo-title'));
        AudioDirector.playMusic('music-title', 1500);
      });
      this.showMenu(false);
    };
    this.time.delayedCall(250, () => {
      this.input.keyboard?.once('keydown', start);
      this.input.once('pointerdown', start);
    });
  }

  private hasSave(): boolean {
    GameState.load();
    return GameState.data.checkpointId !== null || GameState.data.visitedRooms.length > 0;
  }

  private showMenu(instant: boolean): void {
    if (this.menu) return;
    const hasSave = this.hasSave();
    this.buildMenu([
      { label: () => 'CONTINUAR', hidden: () => !hasSave, onSelect: () => this.play(null) },
      {
        label: () => `JUGAR  < ${STAGES[this.stageIdx].label} >`,
        onAdjust: (dir) => { this.stageIdx = (this.stageIdx + dir + STAGES.length) % STAGES.length; AudioDirector.ui('sfx-ui-move'); },
        onSelect: () => void this.chooseStage(STAGES[this.stageIdx].id),
      },
      { label: () => 'OPCIONES', onSelect: () => this.open('OptionsScene') },
      { label: () => 'CRÉDITOS', onSelect: () => this.open('CreditsScene') },
    ], instant, hasSave ? 4 : 3);
    // al volver de Opciones/Créditos
    this.events.off(Phaser.Scenes.Events.RESUME);
    this.events.on(Phaser.Scenes.Events.RESUME, () => this.menu?.setActive(true));
  }

  private async chooseStage(stage: number): Promise<void> {
    if (this.hasSave()) {
      this.menu?.setActive(false);
      const ok = await confirmDialog(this, '¿EMPEZAR DE NUEVO? SE SOBRESCRIBIRÁ LA PARTIDA GUARDADA.');
      if (!ok) { this.menu?.setActive(true); return; }
    }
    this.play(stage);
  }

  /** stage = null → continuar la partida guardada. */
  private play(stage: number | null): void {
    this.menu?.setActive(false);
    if (stage === null) GameState.load(); else GameState.reset();
    this.registry.set('newGame', stage !== null);
    if (stage !== null) {
      this.registry.set('stage', stage);
      this.registry.set('setCinematicSeen', false);
    }
    if ((stage === 1 && !skipIntro()) || stage === 3) {
      void flashTo(this, 'CinematicScene', { stage });
      return;
    }
    void flashTo(this, 'GameScene', stage !== null ? { stage } : undefined);
  }

  private open(key: string): void {
    this.menu?.setActive(false);
    this.scene.launch(key, { from: this.scene.key });
    this.scene.pause();
  }

  private buildMenu(items: MenuItem[], instant: boolean, rows: number): void {
    const { width: w, height: h } = this.scale;
    this.menu?.destroy();
    this.menu = null;
    this.events.off(Phaser.Scenes.Events.POST_UPDATE, this.syncMenuMotion);
    this.menuMotion.forEach(({ element, proxy }) => { element.remove(); proxy.destroy(); });
    this.menuMotion = [];
    const lh = 14;
    const bw = 190, bh = rows * lh + 14, by = h - 22 - bh;
    const layer = hdLayer(this);
    const box = layer.panel(w / 2 - bw / 2, by, bw, bh, { depth: 10 });
    this.menu = new Menu(this, w / 2, by + 8, items, { align: 'center', lineHeight: lh, rowWidth: bw - 8 });
    this.menu.container.setDepth(11);
    this.menu.refresh(false);
    const hint = layer.text(w / 2, h - 17, '↑ ↓ ELEGIR  ·  ← → ESCENARIO  ·  ENTER / ESPACIO', {
      depth: 10, width: 460, color: '#8a83a3', align: 'center', fontSize: 11,
    });
    const boxMotion = this.add.container(0, instant ? 0 : 20).setAlpha(instant ? 1 : 0);
    const hintMotion = this.add.container(0, instant ? 0 : 20).setAlpha(instant ? 1 : 0);
    this.menuMotion = [{ element: box, proxy: boxMotion }, { element: hint, proxy: hintMotion }];
    this.events.on(Phaser.Scenes.Events.POST_UPDATE, this.syncMenuMotion);
    this.syncMenuMotion();
    if (!instant) {
      this.menu.container.setAlpha(0).setY(by + 28);
      this.tweens.add({ targets: boxMotion, alpha: 1, y: 0, duration: 260, ease: 'Cubic.Out' });
      this.tweens.add({ targets: hintMotion, alpha: 1, y: 0, duration: 260, ease: 'Cubic.Out' });
      this.tweens.add({ targets: this.menu.container, alpha: 1, y: by + 8, duration: 260, ease: 'Cubic.Out' });
    }
  }

  private syncMenuMotion = (): void => {
    this.menuMotion.forEach(({ element, proxy }) => {
      element.style.opacity = String(proxy.alpha);
      element.style.transform = `translateY(${proxy.y}px)`;
    });
  }

  /** 2.45 — botón discreto de pantalla completa (esquina superior derecha). */
  private fullscreenButton(): void {
    const { width: w } = this.scale;
    const g = this.add.graphics().setDepth(20).setAlpha(0.45);
    const x = w - 14, y = 5, s = 9;
    g.lineStyle(1, C.text, 1);
    for (const [cx, cy, dx, dy] of [[x, y, 1, 1], [x + s, y, -1, 1], [x, y + s, 1, -1], [x + s, y + s, -1, -1]]) {
      g.lineBetween(cx, cy, cx + 3 * dx, cy);
      g.lineBetween(cx, cy, cx, cy + 3 * dy);
    }
    const zone = this.add.zone(x - 2, y - 2, s + 5, s + 5).setOrigin(0).setDepth(21).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => g.setAlpha(1));
    zone.on('pointerout', () => g.setAlpha(0.45));
    zone.on('pointerdown', (_p: unknown, _x: unknown, _y: unknown, ev: Phaser.Types.Input.EventData) => {
      ev.stopPropagation();
      if (this.scale.isFullscreen) this.scale.stopFullscreen(); else this.scale.startFullscreen();
    });
  }
}
