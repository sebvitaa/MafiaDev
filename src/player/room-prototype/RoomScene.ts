import Phaser from 'phaser';
import classes from '../../data/classes.json';
import { RoomPlayer } from './RoomPlayer';
import { SwordPickup } from './SwordPickup';

export const ROOM = { width: 960, height: 600, left: 56, top: 104, right: 904, bottom: 544 };

/** SUP-basti-20261123-103543: opt-in test geometry, unrelated to production maps. */
export class RoomScene extends Phaser.Scene {
  player!: RoomPlayer;
  swordPickup!: SwordPickup;
  obstacles: Phaser.GameObjects.Container[] = [];
  private status!: Phaser.GameObjects.Text;

  constructor() { super('RoomPrototype'); }

  create(): void {
    this.obstacles = [];
    this.drawRoom();
    this.physics.world.setBounds(ROOM.left, ROOM.top, ROOM.right - ROOM.left, ROOM.bottom - ROOM.top);
    const solids = this.physics.add.staticGroup();
    this.block(solids, 320, 270, 96, 40, 68);
    this.block(solids, 640, 270, 96, 40, 68);
    this.block(solids, 480, 170, 112, 32, 42);
    this.block(solids, 700, 450, 80, 40, 34);
    this.player = new RoomPlayer(this, 480, 400, { ...classes.luchador.stats });
    // SUP-basti-20261123-112350: place pickup on the open right side, away from spawn and pillars.
    this.swordPickup = new SwordPickup(this, 760, 400);
    this.physics.add.collider(this.player.anchor, solids);

    // Isaac-style room framing: no target, scrolling, camera rotation, or 3D projection.
    this.cameras.main.stopFollow().setScroll(0, 0).setZoom(1).setRotation(0);
    this.cameras.main.setBounds(0, 0, ROOM.width, ROOM.height);
    this.add.text(64, 32, 'SALA 01  /  PATIO DE PRUEBAS', {
      fontFamily: 'monospace', fontSize: '13px', color: '#d8c69b',
    }).setDepth(10_000);
    this.status = this.add.text(896, 565, '', {
      fontFamily: 'monospace', fontSize: '12px', color: '#9fb5b5',
    }).setOrigin(1, 0).setDepth(10_000);
    this.add.text(64, 565, 'CAMARA FIJA  /  R REINICIA', {
      fontFamily: 'monospace', fontSize: '12px', color: '#9fb5b5',
    }).setDepth(10_000);
    this.input.keyboard!.once('keydown-R', () => this.scene.restart());
    const sync = () => this.player.sync();
    this.events.on(Phaser.Scenes.Events.POST_UPDATE, sync);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.events.off(Phaser.Scenes.Events.POST_UPDATE, sync));
  }

  update(_time: number, dtMs: number): void {
    this.player.update(dtMs);
    if (this.swordPickup.update(this.time.now, this.player.anchor.x, this.player.anchor.y)) {
      this.player.equipSword();
    }
    const { motion } = this.player;
    const label = motion.dash.active ? 'DASH' : motion.height > 0 ? 'AIRE' : 'SUELO';
    const swordLabel = this.player.hasSword ? this.player.attack.active ? ' / ATAQUE' : ' / ESPADA' : '';
    this.status.setText(`${label}${swordLabel}  /  ${Math.hypot(motion.velocity.x, motion.velocity.y).toFixed(0)} px/s  /  Z ${motion.height.toFixed(0)}`);
  }

  private drawRoom(): void {
    const g = this.add.graphics().setDepth(-10_000);
    g.fillStyle(0x0b141e).fillRect(0, 0, ROOM.width, ROOM.height);
    g.fillStyle(0x263f49).fillRect(ROOM.left, ROOM.top, ROOM.right - ROOM.left, ROOM.bottom - ROOM.top);
    for (let y = ROOM.top; y < ROOM.bottom; y += 32) {
      for (let x = ROOM.left; x < ROOM.right; x += 64) {
        g.fillStyle((Math.floor((x - ROOM.left) / 64) + (y - ROOM.top) / 32) % 2 === 0 ? 0x29434c : 0x253d47);
        g.fillRect(x + 1, y + 1, Math.min(62, ROOM.right - x - 1), Math.min(30, ROOM.bottom - y - 1));
      }
    }
    g.fillStyle(0x52636a).fillRect(32, 64, 896, 40);
    g.fillStyle(0x7a8178).fillRect(24, 52, 912, 12);
    g.fillStyle(0x42575f).fillRect(32, 104, 24, 440).fillRect(904, 104, 24, 440);
    g.fillStyle(0x62716e).fillRect(24, 104, 8, 440).fillRect(928, 104, 8, 440);
    g.fillStyle(0x50616a).fillRect(32, 544, 896, 12);
    g.lineStyle(2, 0xb9a87d, 0.6).strokeRect(64, 112, 832, 424);
    g.lineStyle(1, 0x648883, 0.65).strokeEllipse(480, 400, 90, 44);
    // Decorative doorway, no room transition or exploration system.
    g.fillStyle(0x172a35).fillRect(442, 65, 76, 39);
    g.lineStyle(3, 0xa79571).strokeRect(440, 64, 80, 40);
    for (const x of [120, 840]) {
      g.fillStyle(0xb8874f).fillRect(x - 4, 74, 8, 16);
      g.fillStyle(0xffcb78).fillCircle(x, 73, 5);
    }
  }

  private block(solids: Phaser.Physics.Arcade.StaticGroup, x: number, y: number, w: number, d: number, h: number): void {
    const footprint = this.add.rectangle(x, y, w, d, 0x071722, 0.55)
      .setStrokeStyle(1, 0xc5a173, 0.5).setDepth(-8000);
    this.physics.add.existing(footprint, true);
    solids.add(footprint);
    const art = this.add.graphics();
    art.fillStyle(0x745950).fillRect(-w / 2, d / 2 - h, w, h);
    art.fillStyle(0xa58a6c).fillRect(-w / 2, -d / 2 - h, w, d);
    art.fillStyle(0x55474a).fillRect(w / 2 - 10, d / 2 - h, 10, h);
    art.lineStyle(2, 0xc7b28b).strokeRect(-w / 2, -d / 2 - h, w, d);
    art.lineStyle(1, 0x3f3d40, 0.6);
    for (let row = 16; row < h; row += 16) art.lineBetween(-w / 2, d / 2 - row, w / 2, d / 2 - row);
    this.obstacles.push(this.add.container(x, y, [art]).setDepth(y + d / 2));
  }
}
