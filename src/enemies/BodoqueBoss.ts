import Phaser from 'phaser';
import enemyData from '../data/enemies.json';
import tuning from '../data/tuning.json';
import { hdLayer } from '../ui/hd/HdLayer';
import type { GameEvents } from '../types/events';
import { combatLineClear } from '../combat/visibility';
import { BodoqueFinale } from './BodoqueFinale';
import { patternZones, hitsPattern } from './BodoquePatterns';
import type { SwordDamageTarget } from '../player/room-prototype/SwordCombat';
import type { FireballDamageTarget } from '../player/room-prototype/FireballCombat';
import {
  BodoqueBrain,
  isPointInBodoqueAttack,
  type BodoqueAttackId,
  type BodoqueConfig,
  type BodoquePoint,
  type BodoqueState,
} from './BodoqueBrain';

// SUP-basti-20261123-143619: provisional Phase 1 combat timings, damage, room activation and test-player HP.
const config = enemyData.bodoque as BodoqueConfig;
const markLimit = tuning.roomPrototype.debtMarkMax;
const markLifetimeMs = tuning.roomPrototype.debtMarkDurationMs;

export interface BodoqueBossHooks {
  onPhase?: (event: GameEvents['boss:phase']) => void;
  onHit?: (event: GameEvents['enemy:hit']) => void;
  onKilled?: (event: GameEvents['enemy:killed']) => void;
  onSummon?: (position: BodoquePoint) => void;
  onTimeTheft?: () => void;
  onCritical?: () => void;
  onDying?: () => void;
  onOpening?: () => void;
  onPlayerHit?: (damage: number, attack: BodoqueAttackId) => void;
}

/** Phaser presentation and local combat adapters for Juan Carlos Bodoque. */
export class BodoqueBoss {
  readonly id = 'bodoque';
  readonly radius = config.radius;
  readonly brain: BodoqueBrain;
  readonly visual: Phaser.GameObjects.Container;
  readonly healthBar: Phaser.GameObjects.Graphics;
  readonly telegraph: Phaser.GameObjects.Graphics;
  readonly attackLabel: Phaser.GameObjects.Text;
  readonly nameLabel: Phaser.GameObjects.Text;
  readonly healthText: Phaser.GameObjects.Text;
  readonly victoryLabel: Phaser.GameObjects.Text;
  readonly debtMarksVisual: Phaser.GameObjects.Graphics;
  readonly finale: BodoqueFinale;
  readonly heartTarget: SwordDamageTarget & FireballDamageTarget;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly body: Phaser.GameObjects.Container;
  private readonly damageLabel: Phaser.GameObjects.Text;
  private readonly hitFlash: Phaser.GameObjects.Graphics;
  private readonly marksRemaining: number[] = [];
  private damageLabelRemainingMs = 0;
  private debtBurstRemainingMs = 0;
  private readonly hooks: BodoqueBossHooks;
  private readonly worldMonitors: Phaser.GameObjects.Graphics;
  private readonly screenTexts: HTMLDivElement[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    x: number,
    y: number,
    hooks: BodoqueBossHooks = {},
    options: { overlay?: Phaser.Scene; bounds?: BodoqueConfig['bounds'] } = {},
  ) {
    this.hooks = hooks;
    this.worldMonitors=scene.add.graphics().setName('bodoque-world-monitors');
    this.brain = new BodoqueBrain({ ...config, bounds: options.bounds ?? config.bounds });
    this.finale = new BodoqueFinale(scene, options.overlay);
    const boss = this;
    // Stable ID across body/core keeps an ongoing hit tracker from hitting both on transition.
    this.heartTarget = {
      id: this.id,
      get x() { return boss.x + 48; },
      get y() { return boss.y - 18; },
      radius: 16,
      takeSwordDamage: (damage, direction, knockback = 0) => this.applyDamage(damage, direction, knockback, 'heart'),
      takeFireDamage: (damage, direction) => this.applyDamage(damage, direction, 10, 'heart'),
      addDebtMark: () => this.addDebtMark(),
      consumeDebtMarks: () => this.consumeDebtMarks(),
      onDebtDetonated: (stacks) => this.onDebtDetonated(stacks),
    };
    this.shadow = scene.add.ellipse(x, y + 3, 58, 20, 0x070b12, 0.75).setDepth(y - 0.3)
      .setName('room-bodoque-shadow').setVisible(false);
    this.body = this.createReporterVisual();
    this.visual = scene.add.container(x, y, [this.body]).setDepth(y + 0.5)
      .setName('room-bodoque-visual').setVisible(false);
    this.hitFlash = scene.add.graphics().setName('room-bodoque-hit-flash').setVisible(false);
    this.damageLabel = scene.add.text(x, y - 58, '', {
      fontFamily: 'monospace', fontSize: '15px', color: '#ffb5a8', stroke: '#17131a', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(y + 40).setName('room-bodoque-damage').setVisible(false);
    this.telegraph = scene.add.graphics().setDepth(y - 1).setName('room-bodoque-telegraph').setVisible(false);
    this.attackLabel = scene.add.text(x, y - 70, '', {
      fontFamily: 'monospace', fontSize: '12px', color: '#ffdc9c', stroke: '#10141a', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(y + 50).setName('room-bodoque-attack-label').setVisible(false);
    this.debtMarksVisual = scene.add.graphics().setName('room-bodoque-debt-marks').setVisible(false);

    const screen = options.overlay ?? scene;
    const hud = screen.add.container(0, 0).setScale(screen.scale.width / 960, screen.scale.height / 600).setScrollFactor(0).setDepth(12_000)
      .setName('room-bodoque-hud').setVisible(false);
    this.nameLabel = screen.add.text(480, 10, 'JUAN CARLOS BODOQUE', {
      fontFamily: 'monospace', fontSize: '14px', color: '#f0dfc7', stroke: '#0a0f18', strokeThickness: 3,
    }).setOrigin(0.5, 0).setName('room-bodoque-name');
    this.healthText = screen.add.text(480, 30, 'EL ÚLTIMO TITULAR  ·  FASE 1: LA NOTA', {
      fontFamily: 'monospace', fontSize: '9px', color: '#c6a0ba', stroke: '#0a0f18', strokeThickness: 2,
    }).setOrigin(0.5, 0).setName('room-bodoque-health-text');
    this.healthBar = screen.add.graphics().setName('room-bodoque-health-bar');
    this.healthBar.setPosition(180, 44);
    hud.add([this.nameLabel, this.healthText, this.healthBar]);
    this.victoryLabel = screen.add.text(480, 128, 'VICTORIA\nBODOQUE DERROTADO', {
      fontFamily: 'monospace', fontSize: '21px', color: '#f4d9a2', align: 'center',
      stroke: '#11131c', strokeThickness: 5,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(12_010).setName('room-bodoque-victory').setVisible(false);

    hud.add(this.victoryLabel);
    if(options.overlay) {
      this.nameLabel.setVisible(false);this.healthText.setVisible(false);
      this.healthBar.setY(80);
      const layer=hdLayer(screen);
      this.screenTexts.push(layer.text(screen.scale.width/2,7,'JUAN CARLOS BODOQUE',{width:280,align:'center',fontSize:11,depth:80,color:'#f0dfc7'}),
        layer.text(screen.scale.width/2,23,'',{width:300,align:'center',fontSize:8,depth:80,color:'#efbbdc'}));
    }
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  get x(): number { return this.visual.x; }
  get y(): number { return this.visual.y; }
  get hp(): number { return this.brain.hp; }
  get maxHp(): number { return this.brain.maxHp; }
  get state(): BodoqueState { return this.brain.state; }
  get active(): boolean { return this.brain.active; }
  get defeated(): boolean { return this.brain.state === 'defeated'; }
  get debtMarkCount(): number { return this.marksRemaining.length; }
  get damageTargets(): readonly (SwordDamageTarget & FireballDamageTarget)[] {
    if (this.state === 'heart') return [this.heartTarget];
    if (['inactive', 'opening', 'dying', 'defeated'].includes(this.state)) return [];
    return [this];
  }

  activate(): boolean {
    if (!this.brain.activate()) return false;
    this.visual.setVisible(true);
    this.shadow.setVisible(true);
    this.telegraph.setVisible(false);
    this.nameLabel.parentContainer?.setVisible(true);
    this.victoryLabel.setVisible(false);
    this.drawHealth();
    this.hooks.onPhase?.({ phase: 1 });
    return true;
  }

  update(dtMs: number, player: BodoquePoint, playerHeight = 0): void {
    this.updateDebtMarks(dtMs);
    this.updateDamageLabel(dtMs);
    if (!this.active) return;
    this.worldMonitors.clear().setVisible(this.brain.phase===3);
    if(this.brain.phase===3){const b=this.brain.config.bounds!;this.worldMonitors.setDepth((b.top+b.bottom)/2-1);
      for(const mx of [b.left+48,b.right-48])this.worldMonitors.fillStyle(0x0d0a1c).fillRect(mx-24,(b.top+b.bottom)/2-50,48,50)
        .lineStyle(3,0x9169ac).strokeRect(mx-24,(b.top+b.bottom)/2-50,48,50)
        .lineStyle(1,0xce84cf,0.5).lineBetween(mx-20,(b.top+b.bottom)/2-15,mx+20,(b.top+b.bottom)/2-15);}

    const previousState = this.brain.state;
    this.brain.update(dtMs, player, { x: this.x, y: this.y });
    this.finale.update(dtMs, this.brain, this, this.heartTarget);
    if (['opening', 'heart', 'dying', 'defeated'].includes(this.state)) {
      this.telegraph.setVisible(false);
      this.attackLabel.setVisible(false);
      if (this.state === 'opening') this.body.setRotation(Math.sin(this.brain.finalProgress * 30) * 0.12).setScale(1,1-this.brain.finalProgress*0.3).setY(this.brain.finalProgress*8);
      else this.body.setRotation(0);
      if (this.state === 'dying' || this.defeated) {
        const progress = this.defeated ? 1 : this.brain.finalProgress;
        this.body.setScale(1, 0.62).setY(8 - Math.max(0, progress - 0.4) * 110).setAlpha(1 - progress);
        if (this.brain.consumeVictory()) {
          this.victoryLabel.setVisible(true);
          this.hooks.onKilled?.({ id: this.id, kind: 'boss', x: this.x, y: this.y });
        }
      }
      this.drawHealth();
      return;
    }
    const intent = this.brain.currentAttack;
    if (intent && this.state === 'active' && previousState === 'telegraph') {
      if (intent.id === 'collectors') this.hooks.onSummon?.(this);
      if (intent.id === 'monitorShift') {
        const bounds = this.brain.config.bounds!;
        this.visual.setPosition(this.x < (bounds.left+bounds.right)/2 ? bounds.right-48 : bounds.left+48,
          (bounds.top+bounds.bottom)/2);
        intent.origin = {x:this.x,y:this.y};
        const dx=player.x-this.x,dy=player.y-this.y,len=Math.hypot(dx,dy)||1;
        intent.direction={x:dx/len,y:dy/len};
      }
    }
    if (intent?.id === 'lastHour') {
      if (this.brain.state === 'active') {
        const t = this.brain.attackProgress;
        const next={x:intent.origin.x+(intent.destination.x-intent.origin.x)*t,y:intent.origin.y+(intent.destination.y-intent.origin.y)*t};
        if(combatLineClear(this.scene,this,next))this.visual.setPosition(next.x,next.y);
        else intent.destination={x:this.x,y:this.y};
      } else if (this.brain.state === 'recovery') {
        if(combatLineClear(this.scene,this,intent.destination))this.visual.setPosition(intent.destination.x, intent.destination.y);
      } else if (this.brain.state === 'telegraph' && previousState === 'recovery') {
        this.visual.setPosition(intent.origin.x, intent.origin.y);
      }
    }

    this.updatePresentation();
    if (this.brain.state !== 'active' || !intent || playerHeight > (intent.config.jumpAvoidHeight??Infinity)) return;
    const currentEnd = intent.id === 'lastHour' ? { x: this.x, y: this.y } : intent.destination;
    const zones = patternZones(intent);
    const collides = zones.length ? hitsPattern(player, 8, zones)
      : intent.id !== 'collectors' && isPointInBodoqueAttack(intent.id, player, 8, intent.config, intent.origin, intent.direction, currentEnd);
    if (collides && combatLineClear(this.scene, intent.origin, player) && this.brain.consumePlayerHit()) {
      if(intent.id==='timeTheft')this.hooks.onTimeTheft?.();
      this.hooks.onPlayerHit?.(intent.config.damage, intent.id);
    }
  }

  /** Shared shape used by the local sword, combo, charge and echo adapters. */
  takeSwordDamage(damage: number, direction: BodoquePoint, knockback = 0): void {
    this.applyDamage(damage, direction, knockback);
  }

  /** The local Italian Rain blast calls one radial damage path per target. */
  takeFireDamage(damage: number, direction: BodoquePoint): void {
    this.applyDamage(damage, direction, 10);
  }

  addDebtMark(): void {
    if (!this.damageTargets.length || this.marksRemaining.length >= markLimit) return;
    this.marksRemaining.push(markLifetimeMs);
    this.drawDebtMarks();
  }

  consumeDebtMarks(): number {
    const consumed = this.marksRemaining.length;
    this.marksRemaining.length = 0;
    this.drawDebtMarks();
    return consumed;
  }

  onDebtDetonated(stacks: number): void {
    if (stacks <= 0) return;
    this.debtBurstRemainingMs = 420;
    this.hitFlash.clear().fillStyle(0xb35aff, 0.72).fillCircle(0, -23, 35)
      .setPosition(this.x, this.y).setDepth(this.y + 22).setAlpha(1).setVisible(true);
    this.scene.tweens.killTweensOf(this.hitFlash);
    this.scene.tweens.add({ targets: this.hitFlash, alpha: 0, duration: 420,
      onComplete: () => this.hitFlash.setVisible(false) });
  }

  private applyDamage(damage: number, direction: BodoquePoint, knockback: number, target: 'body' | 'heart' = 'body'): void {
    if (this.state === 'inactive' || this.defeated) return;
    const result = this.brain.takeDamage(damage, target);
    if (result.applied <= 0) return;
    if (target === 'heart') this.finale.showHit();
    this.damageLabel.setText(`-${result.applied}`).setPosition(this.x, this.y - 58).setAlpha(1).setVisible(true);
    this.damageLabelRemainingMs = 720;
    this.scene.tweens.killTweensOf(this.body);
    const reactionScale = 1.08 + Math.min(Math.max(0, knockback), 20) * 0.001;
    this.body.setScale(reactionScale).setRotation(Math.atan2(direction.y, direction.x) * 0.06).setAlpha(0.35);
    this.scene.tweens.add({ targets: this.body, scale: 1, alpha: 1, rotation: 0, duration: 150, ease: 'Quad.Out' });
    this.hooks.onHit?.({ id: this.id, dmg: result.applied, x: this.x, y: this.y });
    result.preparedPhases.forEach((phase) => this.hooks.onPhase?.({ phase }));
    if (result.criticalTriggered) { this.finale.startCritical(); this.hooks.onCritical?.(); }
    if (this.state === 'dying') this.hooks.onDying?.();
    if (this.state === 'opening') {
      this.hooks.onOpening?.();
      this.scene.tweens.killTweensOf(this.body);
      this.body.setAlpha(1).setScale(1);
      this.telegraph.setVisible(false);
      this.attackLabel.setVisible(false);
    }
    this.finale.update(0, this.brain, this, this.heartTarget);
    this.drawHealth();
  }

  private updatePresentation(): void {
    const intent = this.brain.currentAttack;
    this.visual.setDepth(this.y + 0.5);
    this.shadow.setPosition(this.x, this.y + 3).setDepth(this.y - 0.3);
    this.damageLabel.setDepth(this.y + 40);
    this.debtMarksVisual.setPosition(this.x, this.y - 54).setDepth(this.y + 45);
    if (!intent || (this.brain.state !== 'telegraph' && this.brain.state !== 'active')) {
      this.telegraph.setVisible(false);
      this.attackLabel.setVisible(false);
      return;
    }

    const isTell = this.brain.state === 'telegraph';
    const isMallet = intent.id === 'microphoneMallet';
    const color = intent.id === 'cameraFlash' ? 0xc457ff : isMallet ? 0xffbd66 : 0xf0646e;
    this.telegraph.clear().setPosition(intent.origin.x, intent.origin.y).setDepth(intent.origin.y + 0.1);
    const zones = patternZones(intent);
    if (zones.length) {
      this.telegraph.setPosition(0,0);
      for (const z of zones) {
        this.telegraph.fillStyle(color, isTell ? 0.16 : 0.55).lineStyle(2, color, 0.9);
        if(z.circle) this.telegraph.fillCircle(z.x+z.width/2,z.y+z.height/2,z.width/2).strokeCircle(z.x+z.width/2,z.y+z.height/2,z.width/2);
        else {
          this.telegraph.fillRect(z.x,z.y,z.width,z.height).strokeRect(z.x,z.y,z.width,z.height);
          if(!isTell) {
            const hx=z.x+z.width*this.brain.attackProgress;
            this.telegraph.fillStyle(0xbcb2ff,0.85).fillEllipse(hx,z.y+15,36,20).fillRect(hx-10,z.y+12,5,22).fillRect(hx+7,z.y+12,5,22);
          }
        }
      }
    } else if (intent.id === 'lastHour') {
      const length = Math.hypot(intent.destination.x - intent.origin.x, intent.destination.y - intent.origin.y);
      this.telegraph.lineStyle(isTell ? 3 : 9, color, isTell ? 0.82 : 0.42)
        .lineBetween(0, 0, intent.direction.x * length, intent.direction.y * length)
        .lineStyle(2, 0xfff2d8, isTell ? 0.75 : 0.55)
        .lineBetween(-intent.direction.y * 8, 0, intent.direction.y * 8, -intent.direction.x * 8);
    } else {
      const angle = Math.atan2(intent.direction.y, intent.direction.x);
      const halfAngle = (intent.config.halfAngleDeg ?? 40) * Math.PI / 180;
      const points = [new Phaser.Math.Vector2(0, 0)];
      const steps = 20;
      for (let i = 0; i <= steps; i++) {
        const theta = angle - halfAngle + (halfAngle * 2 * i) / steps;
        points.push(new Phaser.Math.Vector2(Math.cos(theta) * intent.config.range, Math.sin(theta) * intent.config.range));
      }
      this.telegraph.fillStyle(color, isTell ? 0.16 : 0.42).fillPoints(points, true);
      this.telegraph.lineStyle(isTell ? 2 : 4, color, isTell ? 0.85 : 0.95)
        .strokePoints(points.slice(1), false);
      if (isMallet) {
        this.telegraph.lineStyle(5, 0xffedbd, isTell ? 0.9 : 0.98)
          .lineBetween(intent.direction.x * 18, intent.direction.y * 18,
            intent.direction.x * 60, intent.direction.y * 60);
      }
    }
    this.telegraph.setVisible(true);
    const label = intent.id === 'microphoneMallet' ? 'MICRÓFONO-MAZO · PARRYABLE'
      : intent.id === 'cameraFlash' ? 'FLASH DE CÁMARA · SAL DE LA ZONA'
        : 'ÚLTIMA HORA · TRAYECTORIA ANUNCIADA';
    const phaseLabels: Record<string,string> = {spectralRace:'CARRERA · CARRIL SUPERIOR SEGURO',betTickets:'BOLETOS · SAL DE LOS CÍRCULOS',collectors:'COBRADORES · REFUERZOS',timeTheft:'ROBO DE TIEMPO',monitorShift:'TRASPASAR · MONITORES',cableSweep:'CABLE-LÁTIGO · SALTA'};
    this.attackLabel.setText(isTell ? (phaseLabels[intent.id] ?? label) : intent.id === 'lastHour' ? '¡ÚLTIMA HORA!' : '¡IMPACTO!')
      .setPosition(this.x, this.y - 70).setDepth(this.y + 50).setVisible(true)
      .setColor(isTell ? '#ffdc9c' : '#fff1d5');
  }

  private drawHealth(): void {
    if(this.screenTexts[1])this.screenTexts[1].textContent = this.brain.phase===3&&this.hp<=config.heart.hp ? 'CORAZÓN CODEX — '+this.hp+' HP'+(this.brain.critical?' · ERROR 23':'') : ['LA NOTA','LA APUESTA','SIN SEÑAL'][this.brain.phase-1]+' · '+this.hp+'/'+this.maxHp;
    const ratio = Math.max(0, this.hp / this.maxHp);
    this.healthBar.clear()
      .fillStyle(0x160f1a, 0.92).fillRoundedRect(0, 0, 600, 13, 5)
      .fillStyle(0x663247, 1).fillRoundedRect(2, 2, 596, 9, 4)
      .fillStyle(0xc13f67, 1).fillRoundedRect(2, 2, 596 * ratio, 9, 4)
      .lineStyle(1, 0xe5c38e, 0.9).strokeRoundedRect(0, 0, 600, 13, 5);
    this.healthText.setText(this.brain.phase === 3 && this.hp <= config.heart.hp
      ? `CORAZÓN CODEX · ${this.hp} / ${this.maxHp}${this.brain.critical ? ' · ERROR 23' : ''}`
      : `EL ÚLTIMO TITULAR  ·  FASE ${this.brain.phase}: ${['LA NOTA','LA APUESTA','SIN SEÑAL'][this.brain.phase-1]}  ·  ${this.hp} / ${this.maxHp}`);
  }

  private drawDebtMarks(): void {
    this.debtMarksVisual.clear();
    this.marksRemaining.forEach((_remaining, index) => this.debtMarksVisual
      .fillStyle(0xb65aff, 0.96).fillCircle((index - (this.marksRemaining.length - 1) / 2) * 10, 0, 3.5)
      .lineStyle(1, 0xf3dcff, 0.9).strokeCircle((index - (this.marksRemaining.length - 1) / 2) * 10, 0, 3.5));
    this.debtMarksVisual.setVisible(this.marksRemaining.length > 0 && this.active);
  }

  private updateDebtMarks(dtMs: number): void {
    for (let index = this.marksRemaining.length - 1; index >= 0; index--) {
      this.marksRemaining[index] -= dtMs;
      if (this.marksRemaining[index] <= 0) this.marksRemaining.splice(index, 1);
    }
    this.drawDebtMarks();
    if (this.debtBurstRemainingMs > 0) {
      this.debtBurstRemainingMs = Math.max(0, this.debtBurstRemainingMs - dtMs);
      if (this.debtBurstRemainingMs === 0) this.hitFlash.setVisible(false);
    }
  }

  private updateDamageLabel(dtMs: number): void {
    if (this.damageLabelRemainingMs <= 0) return;
    this.damageLabelRemainingMs = Math.max(0, this.damageLabelRemainingMs - dtMs);
    this.damageLabel.setY(this.damageLabel.y - dtMs * 0.025)
      .setAlpha(this.damageLabelRemainingMs / 720);
    if (this.damageLabelRemainingMs === 0) this.damageLabel.setVisible(false);
  }

  private createReporterVisual(): Phaser.GameObjects.Container {
    const g = this.scene.add.graphics();
    // Placeholder: recognizable red rabbit reporter silhouette, fedora and vintage mic.
    g.fillStyle(0x871f35).fillEllipse(0, -18, 38, 38);
    g.fillStyle(0x4c2730).fillPoints([
      new Phaser.Math.Vector2(-19, -23), new Phaser.Math.Vector2(19, -23),
      new Phaser.Math.Vector2(15, 5), new Phaser.Math.Vector2(-15, 5),
    ], true);
    g.fillStyle(0xc79661).fillRect(-12, -9, 24, 3);
    g.fillStyle(0x55202b).fillPoints([
      new Phaser.Math.Vector2(-12, -8), new Phaser.Math.Vector2(12, -8),
      new Phaser.Math.Vector2(18, 9), new Phaser.Math.Vector2(-18, 9),
    ], true);
    g.fillStyle(0xc8464c).fillCircle(0, -42, 13);
    g.fillStyle(0x932535).fillPoints([
      new Phaser.Math.Vector2(-10, -48), new Phaser.Math.Vector2(-13, -68),
      new Phaser.Math.Vector2(-4, -54), new Phaser.Math.Vector2(2, -53),
      new Phaser.Math.Vector2(10, -69), new Phaser.Math.Vector2(9, -47),
    ], true);
    g.fillStyle(0xede1c9).fillEllipse(0, -39, 14, 8);
    g.fillStyle(0x2b1720).fillCircle(-5, -43, 1.6).fillCircle(5, -43, 1.6);
    g.fillStyle(0xe0ba7e).fillRect(-14, -56, 28, 4).fillRect(-10, -62, 20, 8);
    g.fillStyle(0x2b2527).fillRect(19, -25, 4, 32).fillCircle(21, -30, 7);
    g.lineStyle(2, 0xd2b17b).strokeCircle(21, -30, 7);
    g.fillStyle(0xd3b274).fillRect(5, -3, 7, 9);
    g.fillStyle(0x292330).fillCircle(8.5, 0, 1.8);
    const badge = this.scene.add.text(2, -4, 'JC', {
      fontFamily: 'monospace', fontSize: '6px', color: '#fff0ca', fontStyle: 'bold',
    }).setOrigin(0.5);
    return this.scene.add.container(0, 0, [g, badge]);
  }

  destroy(): void {
    this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    this.finale.destroy();this.worldMonitors.destroy();
    this.screenTexts.forEach(node=>node.remove());
    this.scene.tweens.killTweensOf(this.body);
    this.scene.tweens.killTweensOf(this.hitFlash);
    this.shadow.destroy();
    this.visual.destroy(true);
    this.healthBar.parentContainer?.destroy(true);
    this.telegraph.destroy();
    this.attackLabel.destroy();
    this.damageLabel.destroy();
    this.hitFlash.destroy();
    this.debtMarksVisual.destroy();
    this.victoryLabel.destroy();
  }
}
