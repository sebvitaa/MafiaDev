// Dominio: seba. Apertura + pantalla de carga (fase 2), tapando la carga real de TODOS los assets.
// Fondo negro → píxel parpadeando → marca de Codex que late con sting digital → MAFIADEV cae letra a letra
// (40 ms, rebote, chispas, glitch, shake suave) → fedora + tagline → carga con el personaje de las flexiones (X)
// → zoom al logo, que pasa a ser el del título. Cualquier tecla (salvo X) salta la animación.
// Cada dominio añade sus claves pidiéndolo a seba (pending) o exportando una función preload*() desde su index.ts.
import Phaser from 'phaser';
import type { PlaceholderKey } from '../types/assets';
import { AudioDirector, playPushupTick, playSplashSting, preloadAudio, settings, STING_BEATS_MS } from '../audio';
import { buildLogo, idleShine, LOGO_TITLE_Y, makeCodexMark, shineLogo, type Logo } from '../ui/logo';
import { PushupGuy } from '../ui/pushup';
import { shake } from '../ui/globalKeys';
import { C, reducedMotion, scanlines, skipIntro, text } from '../ui/theme';

// Consejos: borrador de GPT-5-mini revisado a mano (fase 2 · 2.33–2.35: uno fijo por carga).
const TIPS = [
  'UN PARRY A TIEMPO ABRE EL CONTRAATAQUE.',
  'DETÉN EL TIEMPO PARA REPOSICIONARTE.',
  'EL DASH TE SACA DE CUALQUIER GOLPE.',
  'EL DOBLE SALTO ALCANZA PASAJES OCULTOS.',
  'EL TERCER GOLPE DEL COMBO PEGA MÁS FUERTE.',
  'EXPLORA LOS RINCONES: HAY COFRES OCULTOS.',
  'ACTIVA CADA CHECKPOINT ANTES DEL PELIGRO.',
  'ESTUDIA LOS PATRONES DEL MINIJEFE.',
  '0 SILENCIA EL JUEGO. M ABRE EL MAPA.',
];

const SEEN_KEY = 'mafiadev.splash.seen';
export const PUSHUP_BEST_KEY = 'mafiadev.pushups.best';
const MIN_BAR_MS = 500; // 2.39: aunque la carga sea instantánea, la barra tarda 0,5 s
const LOGO_Y = 104;
const BLACK = 0x000000;

export interface PreloadData {
  /** Repetición desde el Lab: no recarga assets. */
  replay?: boolean;
  mode?: 'full' | 'short';
  /** Solo con replay: simula una carga de N ms (0 = instantánea). */
  fakeLoadMs?: number;
}

type Phase = 'intro' | 'loading' | 'leaving';

const storage = (): Storage | null => { try { return globalThis.localStorage ?? null; } catch { return null; } };

export class PreloadScene extends Phaser.Scene {
  private opts: PreloadData = {};
  private phase: Phase = 'intro';
  private progress = 0;
  private loaded = false;
  private barShownAt = -1;
  private logo: Logo | null = null;
  private loadingUi: Phaser.GameObjects.GameObject[] = [];
  private bar!: Phaser.GameObjects.Rectangle;
  private guy!: PushupGuy;
  private counter!: Phaser.GameObjects.Text;
  private calm = false;
  private lowFx = false;
  private short = false;
  private finishIntro: () => void = () => {};

  constructor() {
    super('PreloadScene');
  }

  init(data: PreloadData = {}): void {
    this.opts = data ?? {};
    this.phase = 'intro';
    this.progress = 0;
    this.loaded = false;
    this.barShownAt = -1;
    this.logo = null;
    this.loadingUi = [];
  }

  preload(): void {
    document.title = 'MafiaDev'; // 2.43: fijo durante la carga
    try { document.body.style.background = '#000'; } catch { /* sin DOM */ }
    this.cameras.main.setBackgroundColor(BLACK);
    this.calm = reducedMotion(settings.get().reducedMotion);
    const seen = storage()?.getItem(SEEN_KEY) === '1';
    this.short = this.opts.mode ? this.opts.mode === 'short' : seen;

    this.load.on(Phaser.Loader.Events.PROGRESS, (p: number) => { this.progress = p; });
    // 2.40: si falla un asset, silencio y placeholder (las escenas comprueban textures.exists / cache)
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (f: Phaser.Loader.File) => console.warn('[preload] sin asset:', f.key));

    if (!skipIntro()) this.startIntro();

    if (this.opts.replay) return;
    this.load.image('title-sky', 'assets/ui/title/title-sky.png');
    this.load.image('title-skyline', 'assets/ui/title/title-skyline.png');
    this.load.image('title-street', 'assets/ui/title/title-street.png');
    // El cuerpo del jugador sigue midiendo 12 × 24 en todas las partidas.
    this.load.image('rios', 'assets/sprites/player/rios.png');
    preloadAudio(this);
    // Ejemplos de otros dominios (descomentar cuando existan):
    // this.load.aseprite('player', 'assets/sprites/player/player.png', 'assets/sprites/player/player.json');
    // this.load.tilemapTiledJSON('zona1', 'assets/maps/zona1.json');
  }

  create(): void {
    this.makePlaceholder('ph-player', 12, 24, '#45d6c4');
    this.makePlaceholder('ph-enemy', 16, 16, '#ff5fa2');
    this.makePlaceholder('ph-tile', 16, 16, '#3a3352');
    AudioDirector.init(this.game);

    if (skipIntro()) { this.exit(); return; }

    const fake = this.opts.replay ? Math.max(0, this.opts.fakeLoadMs ?? 0) : 0;
    if (fake > 0) {
      this.tweens.addCounter({ from: 0, to: 1, duration: fake, onUpdate: (tw) => { this.progress = tw.getValue() ?? 0; }, onComplete: () => { this.loaded = true; } });
    } else {
      this.progress = 1;
      this.loaded = true;
    }
  }

  update(time: number): void {
    if (this.phase !== 'loading' || this.barShownAt < 0) return;
    // 2.49: si va lento, menos efectos
    if (!this.lowFx && this.game.loop.actualFps < 30 && time > 1500) this.lowFx = true;
    const shown = Math.min(this.progress, (time - this.barShownAt) / MIN_BAR_MS);
    this.bar.width = 120 * Math.max(0, Math.min(1, shown));
    if (this.loaded && shown >= 1) this.leave();
  }

  // ───────────── apertura ─────────────

  private startIntro(): void {
    const { width: w, height: h } = this.scale;
    makeCodexMark(this);
    scanlines(this, 0.12);
    text(this, w - 6, h - 12, 'HACKATÓN 2026', { color: C.panel, align: 'right' }).setOrigin(1, 0).setDepth(10);
    if (this.isMobile()) {
      text(this, w / 2, 8, 'JUEGA EN PC CON TECLADO', { color: C.accent2, align: 'center' }).setOrigin(0.5, 0).setDepth(10);
    }

    const tl: Phaser.Time.TimerEvent[] = [];
    const at = (ms: number, fn: () => void) => tl.push(this.time.delayedCall(ms, fn));
    const group: Phaser.GameObjects.GameObject[] = [];

    // 2.16 — negro con un píxel parpadeando
    const pixel = this.add.rectangle(w / 2, h / 2 - 10, 2, 2, C.text).setAlpha(0);
    group.push(pixel);
    const t0 = this.short ? 0 : 600;
    if (!this.short) {
      [0, 300].forEach((ms) => { at(ms, () => pixel.setAlpha(1)); at(ms + 150, () => pixel.setAlpha(0)); });
    }

    // 2.2 / 2.3 — marca de Codex latiendo con sting digital
    const mark = this.add.image(w / 2, h / 2 - 14, 'ui-codex-mark').setScale(0.05).setAlpha(0);
    const word = text(this, w / 2, h / 2 + 20, '', { size: 16, align: 'center' }).setOrigin(0.5, 0);
    const by = text(this, w / 2, h / 2 + 40, 'HECHO CON OPENAI CODEX', { color: C.dim, align: 'center' }).setOrigin(0.5, 0).setAlpha(0);
    group.push(mark, word, by);
    const beats = this.short ? [150] : [...STING_BEATS_MS];
    at(t0, () => {
      pixel.setAlpha(0);
      mark.setAlpha(1);
      this.tweens.add({ targets: mark, scale: 1, duration: 260, ease: this.calm ? 'Linear' : 'Back.Out' });
      this.tryStingOnce();
      [...'CODEX'].forEach((_, i) => this.time.delayedCall(200 + i * 40, () => word.setText('CODEX'.slice(0, i + 1))));
      this.tweens.add({ targets: by, alpha: 1, delay: 450, duration: 300 });
    });
    beats.forEach((b, i) => at(t0 + b, () => {
      if (this.calm) return;
      this.tweens.add({ targets: mark, scale: i === 0 ? 1.14 : 1.07, duration: 70, yoyo: true, ease: 'Quad.Out' });
    }));
    // si el jugador desbloquea el audio pulsando algo mientras está la marca, el sting suena entonces
    this.sound.once(Phaser.Sound.Events.UNLOCKED, () => { if (mark.alpha > 0 && this.phase === 'intro') this.tryStingOnce(); });

    // 2.18 — glitch sutil (2 parpadeos) y fuera
    const tOut = t0 + (this.short ? 700 : 1700);
    if (!this.calm) {
      at(tOut, () => { mark.setX(w / 2 + 3).setTint(C.accent2); word.setX(w / 2 - 2); });
      at(tOut + 50, () => { mark.setX(w / 2).clearTint(); word.setX(w / 2); });
      at(tOut + 110, () => { mark.setX(w / 2 - 2).setTint(C.accent); });
      at(tOut + 150, () => mark.clearTint());
    }
    at(tOut + 160, () => this.tweens.add({ targets: [mark, word, by], alpha: 0, duration: 140 }));

    // 2.14 / 2.15 / 2.19 / 2.20 — letras de una en una (40 ms) con rebote, chispas y shake al final
    const tLogo = tOut + 320;
    const stagger = this.short ? 25 : 40;
    const fall = this.short ? 260 : 380;
    at(tLogo, () => this.dropLogo(stagger, fall));
    const tLoad = tLogo + stagger * 8 + fall + 380;
    at(tLoad, () => this.showLoading());

    // 2.12 — cualquier tecla (menos X, que hace flexiones) salta la animación
    this.finishIntro = () => {
      if (this.phase !== 'intro') return;
      tl.forEach((e) => e.remove(false));
      this.tweens.killAll();
      group.forEach((o) => o.destroy());
      if (!this.logo) this.dropLogo(0, 0);
      this.logo?.letters.forEach((l, i) => l.setY(0).setX(this.logo!.homeX[i]));
      this.logo?.shadows.forEach((s, i) => s.setY(1).setX(this.logo!.homeX[i] + 1));
      if (this.logo) { this.logo.fedora.setY(-15).setAlpha(1); this.logo.tagline.setAlpha(1).setText(this.logo.tagline.getData('full')); }
      this.showLoading();
    };
    this.time.delayedCall(120, () => {
      this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
        if (e.repeat) return;
        if (e.key === 'x' || e.key === 'X') { this.pushup(); return; }
        if (this.phase === 'intro') this.finishIntro();
      });
      this.input.on('pointerdown', () => { if (this.phase === 'intro') this.finishIntro(); });
    });
    storage()?.setItem(SEEN_KEY, '1');
  }

  private stingPlayed = false;
  private tryStingOnce(): void {
    if (this.stingPlayed) return;
    this.stingPlayed = playSplashSting(this.game);
  }

  private dropLogo(stagger: number, fall: number): void {
    const { width: w } = this.scale;
    const logo = buildLogo(this, w / 2, LOGO_Y);
    this.logo = logo;
    const instant = fall === 0;
    logo.tagline.setData('full', logo.tagline.text).setText('');
    logo.fedora.setAlpha(instant ? 1 : 0);
    logo.letters.forEach((l, i) => {
      const sh = logo.shadows[i];
      if (instant) return;
      l.setY(-140); sh.setY(-139);
      const ease = this.calm ? 'Cubic.Out' : 'Back.Out';
      this.tweens.add({ targets: l, y: 0, duration: fall, delay: i * stagger, ease, onComplete: () => this.sparks(l) });
      this.tweens.add({ targets: sh, y: 1, duration: fall, delay: i * stagger, ease });
    });
    if (instant) { logo.tagline.setText(logo.tagline.getData('full')); return; }
    const landed = stagger * 7 + fall;
    this.time.delayedCall(landed, () => {
      shake(this, 140, 0.006);
      // fedora cae sobre la «M»
      logo.fedora.setY(-60).setAlpha(1);
      this.tweens.add({ targets: logo.fedora, y: -15, duration: 300, ease: this.calm ? 'Cubic.Out' : 'Bounce.Out' });
      const full: string = logo.tagline.getData('full');
      [...full].forEach((_, i) => this.time.delayedCall(120 + i * 18, () => logo.tagline.setText(full.slice(0, i + 1))));
      this.time.delayedCall(200, () => shineLogo(this, logo));
    });
  }

  /** Chispas pequeñas al caer cada letra (se omiten con movimiento reducido o fps bajos). */
  private sparks(letter: Phaser.GameObjects.Text): void {
    if (this.calm || this.lowFx || !this.logo) return;
    const c = this.logo.container;
    const x = c.x + letter.x + letter.width / 2;
    const y = c.y + letter.height / 2 - 4;
    for (let i = 0; i < 5; i++) {
      const p = this.add.rectangle(x + Phaser.Math.Between(-6, 6), y, 1, 1, i % 2 ? C.accent : 0xffd6ea);
      this.tweens.add({
        targets: p, x: p.x + Phaser.Math.Between(-14, 14), y: y - Phaser.Math.Between(2, 10), alpha: 0,
        duration: Phaser.Math.Between(180, 320), ease: 'Quad.Out', onComplete: () => p.destroy(),
      });
    }
  }

  // ───────────── carga ─────────────

  private showLoading(): void {
    if (this.phase !== 'intro') return;
    this.phase = 'loading';
    const { width: w, height: h } = this.scale;
    const y = LOGO_Y + 56;
    const frame = this.add.rectangle(w / 2, y, 122, 4).setStrokeStyle(1, C.panel);
    this.bar = this.add.rectangle(w / 2 - 60, y, 0, 2, C.accent).setOrigin(0, 0.5);
    this.guy = new PushupGuy(this, w / 2 - 92, y + 6, 2);
    this.counter = text(this, w / 2 + 70, y - 4, 'FLEXIONES: 0', { color: C.dim }).setOrigin(0, 0.5);
    const hint = text(this, w / 2, y + 12, '[X] FLEXIÓN', { color: C.panel, align: 'center' }).setOrigin(0.5, 0);
    const tip = text(this, w / 2, h - 34, TIPS[Math.floor(Math.random() * TIPS.length)], { color: C.dim, align: 'center' }).setOrigin(0.5);
    this.loadingUi = [frame, this.bar, this.guy.sprite, this.counter, hint, tip];
    for (const o of this.loadingUi) (o as unknown as Phaser.GameObjects.Components.Alpha).setAlpha(0);
    this.tweens.add({ targets: this.loadingUi, alpha: 1, duration: 200 });
    this.barShownAt = this.time.now;
    if (this.logo && !this.calm) idleShine(this, this.logo, 2200);
  }

  private pushup(): void {
    if (this.phase === 'intro') this.finishIntro();
    if (this.phase !== 'loading' || !this.guy) return;
    this.guy.pump((n) => {
      this.counter.setText(`FLEXIONES: ${n}`).setColor(n % 10 === 0 ? '#ff5fa2' : '#8a83a3');
      playPushupTick(this.game, n);
      const s = storage();
      const best = Number(s?.getItem(PUSHUP_BEST_KEY) ?? 0);
      if (n > best) s?.setItem(PUSHUP_BEST_KEY, String(n));
    });
  }

  // ───────────── salida: zoom al logo → título ─────────────

  private leave(): void {
    if (this.phase === 'leaving') return;
    this.phase = 'leaving';
    const logo = this.logo;
    if (!logo || this.calm) { this.exit(); return; }
    this.tweens.add({ targets: this.loadingUi, alpha: 0, duration: 180 });
    const cam = this.cameras.main;
    // 2.17 — zoom al logo, que sube a su sitio en el título
    this.tweens.add({ targets: cam, zoom: 1.18, duration: 220, ease: 'Cubic.In', yoyo: true });
    this.tweens.add({
      targets: logo.container, y: LOGO_TITLE_Y, duration: 440, ease: 'Cubic.InOut',
      onComplete: () => this.exit(),
    });
  }

  private exit(): void {
    try { document.body.style.background = '#13111c'; } catch { /* sin DOM */ }
    const next = this.registry.get('labMode') && !this.opts.replay ? 'LabScene' : 'TitleScene';
    this.scene.start(next, { fromSplash: !skipIntro() && !this.calm });
  }

  private isMobile(): boolean {
    try { return matchMedia('(pointer: coarse)').matches && !matchMedia('(any-pointer: fine)').matches; } catch { return false; }
  }

  private makePlaceholder(key: PlaceholderKey, w: number, h: number, color: string): void {
    if (this.textures.exists(key)) return;
    const tex = this.textures.createCanvas(key, w, h);
    if (!tex) return;
    const ctx = tex.getContext();
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);
    tex.refresh();
  }
}
