// SUP-alejandro-20261123-121806: marcas reutilizables; quinta reemplaza la más antigua.
import Phaser from 'phaser';
import definitions from '../data/abilities.json';
import type { Ability } from './index';
import { MarkStore, findLanding, segmentHit, type Mark, type Point, type Rect } from './markGeometry';

type Body = Phaser.Physics.Arcade.Body;
type Teleportable = Phaser.GameObjects.GameObject & {
  x: number; y: number; body: Body | null;
  setPosition(x: number, y: number): unknown;
};
type ScenePlayer = Teleportable | { anchor: Teleportable; sync(): void };
type Runtime = Phaser.Scene & { player?: ScenePlayer };
interface Paper {
  mark: Mark;
  art: Phaser.GameObjects.Container;
  ring: Phaser.GameObjects.Arc;
  destination: Point;
  attached?: { body: Body; offset: Point };
}

export class Teleport implements Ability {
  readonly id = 'teleport';
  readonly cooldownMs = definitions.teleport.cooldownMs;
  private readonly config = definitions.teleport;
  private readonly store = new MarkStore(definitions.teleport.maxMarks);
  private readonly papers = new Map<number, Paper>();
  private scene!: Runtime;
  private modifier!: Phaser.Input.Keyboard.Key;
  private readonly shortcuts: { key: Phaser.Input.Keyboard.Key; down: () => void }[] = [];
  private aim!: Phaser.GameObjects.Graphics;
  private status!: Phaser.GameObjects.Text;
  private requestTeleport!: () => boolean;
  private remainingCooldownMs!: () => number;
  private requested?: Mark;
  private message = '';
  private messageUntil = 0;

  install(scene: Phaser.Scene, requestTeleport: () => boolean, remainingCooldownMs: () => number): void {
    this.scene = scene as Runtime;
    this.requestTeleport = requestTeleport;
    this.remainingCooldownMs = remainingCooldownMs;
    this.modifier = scene.input.keyboard!.addKey('Q');
    for (const [slot, code] of ['ONE', 'TWO', 'THREE', 'FOUR'].entries()) {
      const key = scene.input.keyboard!.addKey(code, true, false);
      const down = () => this.teleportTo(this.store.bySlot(slot));
      key.on('down', down);
      this.shortcuts.push({ key, down });
    }
    scene.input.mouse?.disableContextMenu();
    this.aim = scene.add.graphics().setDepth(20_000);
    const large = scene.cameras.main.width >= 800;
    this.status = scene.add.text(large ? 64 : 8, large ? 54 : 32, '', {
      fontFamily: 'monospace', fontSize: large ? '12px' : '9px', color: '#ffe5a3',
      backgroundColor: '#101e2b', padding: { x: 6, y: 3 },
    }).setScrollFactor(0).setDepth(20_001).setName('teleport-status');
    scene.input.on('pointerdown', this.onPointer, this);
    scene.events.on('postupdate', this.render, this);
  }

  private readonly onPointer = (pointer: Phaser.Input.Pointer): void => {
    if (!this.modifier.isDown) return;
    pointer.updateWorldPoint(this.scene.cameras.main);
    if (pointer.button === 2) this.throwPaper({ x: pointer.worldX, y: pointer.worldY });
    if (pointer.button === 0) {
      const mark = this.store.nearest({ x: pointer.worldX, y: pointer.worldY }, this.config.selectionRadius);
      if (!mark) this.notify('Apunta a una marca que ya haya llegado.');
      else this.teleportTo(mark);
    }
  };

  private teleportTo(mark: Mark | undefined): void {
    if (!mark) { this.notify('No hay una marca en ese número.'); return; }
    if (!mark.landed) { this.notify('Esa marca aún está en vuelo.'); return; }
    this.requested = mark;
    try {
      if (!this.requestTeleport() && this.remainingCooldownMs() > 0) this.notify('TP recargando...');
    } finally {
      this.requested = undefined;
    }
  }

  activate(_scene: Phaser.Scene): boolean {
    // Q sola apunta. Mouse y teclas 1–4 solicitan la marca a través de AbilitySlots.
    const mark = this.requested;
    const target = this.player();
    if (!mark?.landed || !target?.body || this.remainingCooldownMs() > 0) return false;
    const body = target.body;
    const attached = this.papers.get(mark.id)?.attached?.body;
    if (attached && (!attached.enable || !attached.gameObject?.active
      || attached.gameObject.getData('teleportTarget') !== true)) return false;
    let desired: Point = mark;
    if (attached) {
      // Llegar junto al enemigo, sin superponer los cuerpos ni causar contacto inevitable.
      const angle = Math.atan2(body.center.y - attached.center.y, body.center.x - attached.center.x);
      const dx = Math.cos(angle), dy = Math.sin(angle);
      const edge = Math.min(
        Math.abs(dx) > 1e-6 ? (attached.width + body.width) / 2 / Math.abs(dx) : Infinity,
        Math.abs(dy) > 1e-6 ? (attached.height + body.height) / 2 / Math.abs(dy) : Infinity,
      ) + this.config.enemyPadding;
      desired = { x: attached.center.x + dx * edge, y: attached.center.y + dy * edge };
    }
    const obstacles = [...this.scene.physics.world.staticBodies].filter((solid) => solid.enable);
    const destination = findLanding(desired, body, this.scene.physics.world.bounds,
      [...obstacles, ...this.enemies(), ...this.wallRects(desired, desired, this.config.landingSearchRadius + body.width)],
      this.config.landingSearchRadius, this.config.landingSearchStep);
    if (!destination) { this.notify('No hay espacio seguro junto a esa marca.'); return false; }
    const from = { x: target.x, y: target.y };
    // Conservar el desplazamiento entre objeto y centro de cuerpo (sprites con offset).
    const x = destination.x + target.x - body.center.x;
    const y = destination.y + target.y - body.center.y;
    const { x: vx, y: vy } = body.velocity;
    body.reset(x, y);
    body.setVelocity(vx, vy);
    const player = this.scene.player;
    if (player && 'anchor' in player) player.sync();
    this.flash(from);
    this.flash({ x, y });
    this.notify('¡TP!');
    return true;
  }

  update(_scene: Phaser.Scene, dtMs: number): void {
    for (const paper of this.papers.values()) {
      if (paper.attached) {
        const { body, offset } = paper.attached;
        if (!body.enable || !body.gameObject?.active || body.gameObject.getData('teleportTarget') !== true
          || !this.scene.physics.world.bodies.has(body)) {
          this.remove(paper.mark.id);
          continue;
        }
        paper.mark.x = body.x + offset.x;
        paper.mark.y = body.y + offset.y;
      } else if (!paper.mark.landed) this.advance(paper, dtMs);
    }
  }

  private throwPaper(point: Point): void {
    const player = this.player();
    if (!player?.body) return;
    const bounds = this.scene.physics.world.bounds;
    const margin = this.config.projectileRadius;
    const destination = {
      x: Math.max(bounds.x + margin, Math.min(bounds.right - margin, point.x)),
      y: Math.max(bounds.y + margin, Math.min(bounds.bottom - margin, point.y)),
    };
    const { mark, removed } = this.store.add({ x: player.body.center.x, y: player.body.center.y });
    if (removed) this.remove(removed.id);
    const ring = this.scene.add.circle(0, 0, 13, 0xfbd26b, 0.08).setStrokeStyle(1, 0xfbd26b, 0.8);
    const sheet = this.scene.add.rectangle(0, 0, 12, 18, 0xfff2ce).setStrokeStyle(1, 0xd79a43);
    const ink = this.scene.add.graphics().lineStyle(2, 0x433047);
    ink.strokeCircle(0, -2, 3).lineBetween(-4, 5, 4, 5).lineBetween(0, 1, 0, 8);
    const label = this.scene.add.text(9, -16, String(mark.slot + 1), {
      fontFamily: 'monospace', fontSize: '10px', color: '#fff2ce',
    }).setName('teleport-mark-number');
    const art = this.scene.add.container(mark.x, mark.y, [ring, sheet, ink, label])
      .setName(`teleport-mark-${mark.id}`).setDepth(mark.y + 1);
    this.papers.set(mark.id, { mark, art, ring, destination });
  }

  private advance(paper: Paper, dtMs: number): void {
    const from = { x: paper.mark.x, y: paper.mark.y };
    const dx = paper.destination.x - from.x, dy = paper.destination.y - from.y;
    const distance = Math.hypot(dx, dy);
    const fraction = distance === 0 ? 1 : Math.min(1, this.config.projectileSpeed * dtMs / 1000 / distance);
    const to = { x: from.x + dx * fraction, y: from.y + dy * fraction };
    let hit = 1;
    let enemy: Body | undefined;
    let wall = false;
    for (const solid of this.scene.physics.world.staticBodies) {
      if (!solid.enable) continue;
      const t = segmentHit(from, to, solid, this.config.projectileRadius);
      if (t !== null && t <= hit) { hit = t; wall = true; }
    }
    for (const tile of this.wallRects(from, to, this.config.projectileRadius)) {
      const t = segmentHit(from, to, tile, this.config.projectileRadius);
      if (t !== null && t <= hit) { hit = t; wall = true; }
    }
    for (const body of this.enemies()) {
      const t = segmentHit(from, to, body, this.config.projectileRadius);
      if (t !== null && (t < hit || (t === hit && !wall))) { hit = t; enemy = body; wall = false; }
    }
    paper.mark.x = from.x + (to.x - from.x) * hit;
    paper.mark.y = from.y + (to.y - from.y) * hit;
    if (enemy) paper.attached = {
      body: enemy, offset: { x: paper.mark.x - enemy.x, y: paper.mark.y - enemy.y },
    };
    if (wall || enemy || fraction === 1) paper.mark.landed = true;
    if (!paper.mark.landed) paper.art.rotation += dtMs * 0.012;
    else paper.art.rotation = 0;
  }

  private readonly render = (): void => {
    const pointer = this.scene.input.activePointer;
    pointer.updateWorldPoint(this.scene.cameras.main);
    const selected = this.modifier.isDown
      ? this.store.nearest({ x: pointer.worldX, y: pointer.worldY }, this.config.selectionRadius) : undefined;
    for (const paper of this.papers.values()) {
      // Los cuerpos ya se han movido al llegar a postupdate.
      if (paper.attached?.body.enable) {
        paper.mark.x = paper.attached.body.x + paper.attached.offset.x;
        paper.mark.y = paper.attached.body.y + paper.attached.offset.y;
      }
      paper.art.setPosition(paper.mark.x, paper.mark.y).setDepth(paper.mark.y + 1);
      paper.ring.setScale(selected === paper.mark ? 1.5 : 1);
      paper.ring.setStrokeStyle(selected === paper.mark ? 3 : 1, selected === paper.mark ? 0x79ffe1 : 0xfbd26b);
    }
    this.aim.clear();
    const player = this.player();
    if (this.modifier.isDown && player) {
      this.aim.lineStyle(1, selected ? 0x79ffe1 : 0xfbd26b, 0.65)
        .lineBetween(player.x, player.y, selected?.x ?? pointer.worldX, selected?.y ?? pointer.worldY)
        .strokeCircle(pointer.worldX, pointer.worldY, this.config.projectileRadius + 4);
    }
    const remaining = this.remainingCooldownMs();
    const feedback = this.scene.time.now < this.messageUntil ? this.message : '';
    this.status.setText(`MARCAS ${this.papers.size}/${this.config.maxMarks} | TP ${remaining > 0 ? `${(remaining / 1000).toFixed(1)}s` : 'LISTO'}${feedback ? ` | ${feedback}` : ''}\n1–4: TP directo | Mantener Q: derecho lanza / izquierdo TP`);
  };

  private player(): Teleportable | null {
    const player = this.scene.player;
    return player ? ('anchor' in player ? player.anchor : player) : null;
  }

  /** Muros de tilemap (capas con colisión) en la caja que cubre a→b: no son cuerpos estáticos, así que el papel los atravesaba. */
  private wallRects(a: Point, b: Point, pad: number): Rect[] {
    const x = Math.min(a.x, b.x) - pad, y = Math.min(a.y, b.y) - pad;
    const w = Math.abs(a.x - b.x) + pad * 2, h = Math.abs(a.y - b.y) + pad * 2;
    const rects: Rect[] = [];
    for (const child of this.scene.children.list) {
      if (!(child instanceof Phaser.Tilemaps.TilemapLayer)) continue;
      for (const tile of child.getTilesWithinWorldXY(x, y, w, h, { isColliding: true })) {
        rects.push({ x: tile.pixelX + child.x, y: tile.pixelY + child.y, width: tile.width, height: tile.height });
      }
    }
    return rects;
  }

  private enemies(): Body[] {
    return [...this.scene.physics.world.bodies].filter((body) => body.enable
      && body.gameObject?.active && body.gameObject.getData('teleportTarget') === true);
  }

  private remove(id: number): void {
    this.papers.get(id)?.art.destroy();
    this.papers.delete(id);
    this.store.remove(id);
  }

  private notify(message: string): void {
    this.message = message;
    this.messageUntil = this.scene.time.now + this.config.feedbackMs;
  }

  private flash(point: Point): void {
    const ring = this.scene.add.circle(point.x, point.y, 6).setStrokeStyle(3, 0xffe6a1).setDepth(20_000);
    this.scene.tweens.add({ targets: ring, scale: 4, alpha: 0, duration: this.config.flashMs, onComplete: () => ring.destroy() });
  }

  destroy(): void {
    for (const { key, down } of this.shortcuts) key.off('down', down);
    this.shortcuts.length = 0;
    this.scene.input.off('pointerdown', this.onPointer, this);
    this.scene.events.off('postupdate', this.render, this);
    for (const id of this.papers.keys()) this.remove(id);
    this.aim.destroy();
    this.status.destroy();
  }
}
