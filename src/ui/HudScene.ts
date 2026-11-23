// Dominio: seba — HUD en escena paralela (no se mueve con la cámara del juego).
// Corazones con juice · viñeta y latido con 1 corazón · barra del jefe con barra fantasma ·
// enfriamiento de la habilidad · avisos de objetos por rareza · tutorial contextual.
import Phaser from 'phaser';
import { bus } from '../core/EventBus';
import { GameState } from '../core/GameState';
import { BINDINGS } from '../core/Input';
import enemies from '../data/enemies.json';
import abilities from '../data/abilities.json';
import items from '../data/items.json';
import type { ItemDef } from '../types/items';
import { settings } from '../audio';
import { C, RARITY_COLOR, text } from './theme';
import { TutorialOverlay } from './tutorial/TutorialOverlay';

const isBoss = (s: string) => /boss/i.test(s);
const BOSS_HP = (enemies as Record<string, { hp?: number }>).boss?.hp ?? 30; // jefe final (src/world/boss.ts)

export class HudScene extends Phaser.Scene {
  private hearts!: Phaser.GameObjects.Container;
  private hp = 5;
  private maxHp = 5;
  private vignette!: Phaser.GameObjects.Image;
  private boss!: { root: Phaser.GameObjects.Container; fill: Phaser.GameObjects.Rectangle; ghost: Phaser.GameObjects.Rectangle; hp: number; max: number };
  private ability!: { fill: Phaser.GameObjects.Rectangle; frame: Phaser.GameObjects.Rectangle; tween: Phaser.Tweens.Tween | null };
  private toastY = 0;

  constructor() {
    super('HudScene');
  }

  create(): void {
    const { hp, maxHp } = GameState.data;
    this.hp = hp;
    this.maxHp = maxHp;
    this.hearts = this.add.container(8, 8);
    this.drawHearts();

    const { width: w, height: h } = this.scale;
    this.vignette = this.add.image(w / 2, h / 2, 'ui-vignette').setDisplaySize(w, h).setAlpha(0).setDepth(-1);
    this.buildBossBar(w);
    this.buildAbility(h);

    bus.on('player:hit', (e) => this.onHit(e.hp, e.maxHp), this);
    bus.on('player:died', () => this.setLowHp(false), this);
    bus.on('boss:phase', ({ phase }) => { if (phase === 1) this.showBoss(); }, this);
    bus.on('enemy:hit', ({ id, dmg }) => { if (isBoss(id)) this.damageBoss(id, dmg); }, this); // solo el jefe: los mobs vaciaban la barra
    bus.on('enemy:killed', ({ id, kind }) => { if (isBoss(kind) || isBoss(id)) this.hideBoss(); }, this);
    bus.on('ability:used', ({ id }) => this.abilityUsed(id), this);
    bus.on('ability:ready', () => this.abilityReady(), this);
    bus.on('item:picked', ({ itemId, rarity }) => {
      const def = (items as ItemDef[]).find((i) => i.id === itemId);
      this.toast(`+ ${(def?.name ?? itemId).toUpperCase()}`, RARITY_COLOR[rarity] ?? C.text);
    }, this);
    bus.on('checkpoint:reached', () => this.toast('PUNTO DE CONTROL', C.accent2), this);
    bus.on('chest:opened', ({ hidden }) => { if (hidden) this.toast('¡COFRE OCULTO!', RARITY_COLOR.legendary); }, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => bus.offContext(this));

    const tutorial = new TutorialOverlay(this);
    if (this.registry.get('newGame') === true && !settings.get().tutorialDone) this.time.delayedCall(800, () => tutorial.start());
  }

  // ───────── corazones ─────────
  private drawHearts(lost = -1): void {
    this.hearts.removeAll(true);
    for (let i = 0; i < this.maxHp; i++) {
      const img = this.add.image(i * 11, 0, i < this.hp ? 'ui-heart' : 'ui-heart-empty').setOrigin(0);
      this.hearts.add(img);
      if (i === lost) {
        const ghost = this.add.image(i * 11, 0, 'ui-heart').setOrigin(0).setTint(0xffffff).setTintMode(Phaser.TintModes.FILL);
        this.hearts.add(ghost);
        this.tweens.add({ targets: ghost, alpha: 0, y: -6, scale: 1.4, duration: 380, onComplete: () => ghost.destroy() });
      }
    }
  }

  private onHit(hp: number, maxHp: number): void {
    const lost = hp < this.hp ? hp : -1;
    this.hp = Math.max(0, hp);
    this.maxHp = maxHp;
    this.drawHearts(lost);
    if (!settings.get().reducedMotion) {
      this.tweens.add({ targets: this.hearts, x: { from: 6, to: 8 }, duration: 40, repeat: 3, yoyo: true, onComplete: () => this.hearts.setX(8) });
    }
    this.setLowHp(this.hp === 1);
  }

  private setLowHp(on: boolean): void {
    this.tweens.killTweensOf(this.vignette);
    if (on) this.tweens.add({ targets: this.vignette, alpha: { from: 0.15, to: 0.55 }, duration: 450, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    else this.tweens.add({ targets: this.vignette, alpha: 0, duration: 300 });
  }

  // ───────── jefe ─────────
  private buildBossBar(w: number): void {
    const bw = 220, y = this.scale.height - 22;
    const root = this.add.container(w / 2, y).setVisible(false);
    const back = this.add.rectangle(0, 0, bw + 4, 8, C.bg).setStrokeStyle(1, C.panel);
    const ghost = this.add.rectangle(-bw / 2, 0, bw, 4, C.text).setOrigin(0, 0.5);
    const fill = this.add.rectangle(-bw / 2, 0, bw, 4, C.danger).setOrigin(0, 0.5);
    const name = text(this, 0, -12, 'EL PADRINO', { color: C.accent, align: 'center', stroke: true }).setOrigin(0.5);
    root.add([back, ghost, fill, name]);
    this.boss = { root, fill, ghost, hp: BOSS_HP, max: BOSS_HP };
  }

  private showBoss(): void {
    const b = this.boss;
    b.hp = b.max;
    b.fill.width = b.ghost.width = 220;
    b.root.setVisible(true).setAlpha(0).setY(this.scale.height - 10);
    this.tweens.add({ targets: b.root, alpha: 1, y: this.scale.height - 22, duration: 500, delay: 1200, ease: 'Back.Out' });
  }

  private damageBoss(_id: string, dmg: number): void {
    const b = this.boss;
    if (!b.root.visible) return;
    b.hp = Math.max(0, b.hp - dmg);
    const wTarget = 220 * (b.hp / b.max);
    b.fill.width = wTarget;
    this.tweens.killTweensOf(b.ghost);
    this.tweens.add({ targets: b.ghost, width: wTarget, duration: 500, delay: 350, ease: 'Quad.Out' });
  }

  private hideBoss(): void {
    this.tweens.add({ targets: this.boss.root, alpha: 0, duration: 600, onComplete: () => this.boss.root.setVisible(false) });
  }

  // ───────── habilidad ─────────
  private buildAbility(h: number): void {
    const x = 14, y = h - 16;
    const frame = this.add.rectangle(x, y, 14, 14, C.panelDark).setStrokeStyle(1, C.accent2);
    const fill = this.add.rectangle(x - 6, y + 6, 12, 12, C.accent2, 0.6).setOrigin(0, 1);
    text(this, x, y, BINDINGS.ability[0], { color: C.text, align: 'center' }).setOrigin(0.5);
    this.ability = { fill, frame, tween: null };
  }

  private abilityUsed(id: string): void {
    const cd = (abilities as Record<string, { cooldownMs?: number }>)[id]?.cooldownMs ?? 12000;
    const a = this.ability;
    a.tween?.stop();
    a.fill.height = 0;
    a.frame.setStrokeStyle(1, C.panel);
    a.tween = this.tweens.add({ targets: a.fill, height: 12, duration: cd });
  }

  private abilityReady(): void {
    const a = this.ability;
    a.tween?.stop();
    a.fill.height = 12;
    a.frame.setStrokeStyle(1, C.accent2);
    this.tweens.add({ targets: a.frame, scale: 1.3, duration: 90, yoyo: true });
  }

  // ───────── avisos ─────────
  private toast(msg: string, color: number): void {
    const { width: w, height: h } = this.scale;
    const y = h - 40 - this.toastY;
    this.toastY = (this.toastY + 12) % 48;
    const t = text(this, w + 4, y, msg, { color, align: 'right', stroke: true }).setOrigin(1, 0.5);
    this.tweens.chain({
      targets: t,
      tweens: [
        { x: w - 8, duration: 220, ease: 'Back.Out' },
        { alpha: 0, x: w, delay: 1600, duration: 300 },
      ],
      onComplete: () => t.destroy(),
    });
  }
}
