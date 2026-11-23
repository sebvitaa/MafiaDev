import Phaser from 'phaser';
import { hdLayer } from '../ui/hd/HdLayer';
import type { BodoqueBrain, BodoquePoint } from './BodoqueBrain';

// SUP-basti-20261123-144553: local broadcast visuals; brief caption 1500ms, defeat 1600ms in enemies.json.
// PEN-basti-20261123-144553: replace explicitly labelled CODEX TEMP marker with approved official local asset.
/** Local-only broadcast/chest/core presentation. All effects are pooled Graphics, no timers/listeners. */
export class BodoqueFinale {
  readonly core: Phaser.GameObjects.Graphics;
  readonly caption: Phaser.GameObjects.Text;
  readonly channel: Phaser.GameObjects.Text;
  readonly monitors: Phaser.GameObjects.Text[];
  readonly panels: Phaser.GameObjects.Graphics;
  private readonly atmosphere: Phaser.GameObjects.Graphics;
  private readonly wheel: Phaser.GameObjects.Graphics;
  private readonly chest: Phaser.GameObjects.Graphics;
  private readonly placeholder: Phaser.GameObjects.Text;
  private readonly owned: Phaser.GameObjects.GameObject[];
  private timeMs = 0;
  private interruptionMs = 0;
  private hitMs = 0;
  private destroyed = false;
  criticalCount = 0;
  private dom?: { channel: HTMLDivElement; caption: HTMLDivElement; monitors: HTMLDivElement[] };

  constructor(scene: Phaser.Scene, overlay: Phaser.Scene = scene) {
    this.atmosphere = overlay.add.graphics().setDepth(9000).setName('room-codex-atmosphere');
    this.panels = overlay.add.graphics().setDepth(9001).setName('room-codex-monitors');
    this.wheel=scene.add.graphics().setName('room-codex-roulette').setVisible(false);
    this.chest = scene.add.graphics().setName('room-codex-chest');
    this.core = scene.add.graphics().setName('room-codex-core').setVisible(false);
    this.placeholder = scene.add.text(0, 0, 'CODEX\nTEMP', { fontFamily: 'monospace', fontSize: '8px',
      align: 'center', color: '#fff1ff', stroke: '#290e2c', strokeThickness: 2 })
      .setOrigin(0.5).setName('room-codex-placeholder').setVisible(false);
    this.channel = overlay.add.text(942, 67, 'CANAL 23 · EN VIVO', { fontFamily: 'monospace',
      fontSize: '12px', color: '#ffb1b7', backgroundColor: '#171320' }).setOrigin(1, 0).setDepth(12001)
      .setName('room-codex-channel');
    this.caption = overlay.add.text(480, 505, '', { fontFamily: 'monospace', fontSize: '17px',
      color: '#fff4e0', backgroundColor: '#201522', stroke: '#201522', strokeThickness: 4, align: 'center' })
      .setOrigin(0.5).setDepth(12002).setName('room-codex-caption').setVisible(false);
    this.monitors = [241, 790].map((x) => overlay.add.text(x + 39, 133, '23\nEN VIVO', {
      fontFamily: 'monospace', fontSize: '12px', align: 'center', color: '#deb0f8',
    }).setOrigin(0.5).setDepth(9002).setName('room-codex-monitor-text'));
    this.owned = [this.wheel, this.atmosphere, this.panels, this.chest, this.core, this.placeholder,
      this.channel, this.caption, ...this.monitors];
    const screenRoot = overlay.add.container(0,0,[this.atmosphere,this.panels,this.channel,this.caption,...this.monitors])
      .setScale(overlay.scale.width/960,overlay.scale.height/600).setDepth(12000).setScrollFactor(0);
    this.owned.push(screenRoot);
    if(overlay!==scene){
      const layer=hdLayer(overlay),x=overlay.scale.width/960,y=overlay.scale.height/600;
      this.dom={ channel:layer.text(840*x,69*y,'',{width:120,align:'center',fontSize:8,depth:85,color:'#ffb1c6'}),
        caption:layer.text(480*x,495*y,'',{width:320,align:'center',fontSize:12,depth:85,color:'#fff3de'}),
        monitors:[280,829].map(mx=>layer.text(mx*x,126*y,'',{width:75,align:'center',fontSize:10,depth:85,color:'#f5b7ff'})) };
    }
    this.owned.filter(object => object !== screenRoot).forEach((object) => (object as Phaser.GameObjects.Graphics).setVisible(false));
  }

  startCritical(): void {
    if (this.criticalCount) return;
    this.criticalCount++;
    this.interruptionMs = 1500;
  }

  showHit(): void { this.hitMs = 160; }

  update(dtMs: number, brain: BodoqueBrain, body: BodoquePoint, heart: BodoquePoint): void {
    if (this.destroyed) return;
    this.timeMs += Math.max(0, dtMs);
    this.interruptionMs = Math.max(0, this.interruptionMs - Math.max(0, dtMs));
    this.hitMs = Math.max(0, this.hitMs - Math.max(0, dtMs));
    const live = brain.state !== 'inactive';
    this.channel.setVisible(live);
    this.panels.setVisible(live).clear();
    const final = ['opening', 'heart', 'dying', 'defeated'].includes(brain.state);
    const dying = brain.state === 'dying' || brain.state === 'defeated';
    const end = brain.state === 'defeated' ? 1 : dying ? brain.finalProgress : 0;
    this.wheel.clear().setPosition(body.x,body.y-35).setDepth(body.y-2).setVisible(live&&brain.state!=='defeated');
    if(!dying)this.wheel.setRotation(this.timeMs/3500);
    this.wheel.lineStyle(2,0xab66ac,0.24).strokeCircle(0,0,68).strokeCircle(0,0,57);
    for(let i=0;i<12;i++){const a=i*Math.PI/6;this.wheel.lineBetween(Math.cos(a)*57,Math.sin(a)*57,Math.cos(a)*68,Math.sin(a)*68);}
    const pulse = Math.sin(this.timeMs / (brain.critical ? 65 : 190));
    this.monitors.forEach((monitor, i) => {
      const x = i === 0 ? 241 : 790;
      this.panels.fillStyle(0x0b0d18, 0.96).fillRoundedRect(x, 107, 78, 52, 5)
        .lineStyle(2, dying ? 0x433444 : 0xbb699b, 0.8).strokeRoundedRect(x, 107, 78, 52, 5);
      monitor.setVisible(live).setAlpha(1 - end).setText(dying ? 'SIN\nSEÑAL'
        : this.interruptionMs > 0 ? 'APUESTA' : brain.critical ? 'ERROR 23' : '23\nEN VIVO');
      if (live && end < 1) {
        for (let row = 0; row < 4; row++) {
          const offset = (this.timeMs * 0.035 + row * 11) % 45;
          this.panels.lineStyle(1, 0xef9de9, this.interruptionMs > 0 ? 0.5 : 0.12)
            .lineBetween(x + 3, 110 + offset, x + 75, 110 + offset);
        }
      }
    });
    this.channel.setText(dying ? 'CANAL 23 · FIN DE TRANSMISIÓN' : 'CANAL 23 · EN VIVO');
    this.atmosphere.clear().setVisible(live);
    // Local broadcast rain rises before the ending, falls normally once the core breaks.
    for (let i = 0; i < 24; i++) {
      const x = 70 + (i * 137) % 820;
      const y = 112 + ((i * 37 + (dying ? 1 : -1) * this.timeMs * 0.09) % 410 + 410) % 410;
      this.atmosphere.lineStyle(1, 0xc9d4ff, dying ? 0.27 : 0.09)
        .lineBetween(x, y, x - 2, y + 8);
    }
    this.caption.setVisible(this.interruptionMs > 0 && !dying)
      .setText('ERROR 23\nBODOQUE: ¡Queda una pura...!')
      .setX(480 + (this.interruptionMs > 1200 ? Math.sin(this.timeMs * 0.1) * 2 : 0));
    if (this.interruptionMs > 0 && !dying) {
      // Letterbox is confined to room edges; gameplay remains readable and interactive.
      this.atmosphere.fillStyle(0x180711, 0.65).fillRect(56, 104, 848, 12).fillRect(56, 526, 848, 12);
      for (let i = 0; i < 6; i++) {
        const y = 110 + (this.timeMs * 0.12 + i * 61) % 415;
        this.atmosphere.fillStyle(0xf474ba, 0.08).fillRect(56 + i * 40, y, 140, 2);
      }
    }
    this.chest.clear().setVisible(final && end < 1).setPosition(body.x, body.y - 19).setDepth(body.y + 2);
    this.core.clear().setVisible(final && end < 1).setPosition(heart.x, heart.y).setDepth(body.y + 10);
    this.placeholder.setVisible(final && end < 0.25).setPosition(heart.x, heart.y).setDepth(body.y + 11);
    if(this.dom){
      this.dom.channel.textContent=this.channel.text;this.dom.channel.hidden=!live;
      this.dom.caption.textContent=this.caption.text;this.dom.caption.hidden=!this.caption.visible;
      this.dom.monitors.forEach((m,i)=>{m.textContent=this.monitors[i].text;m.hidden=!live||end>=1;});
      this.channel.setVisible(false);this.caption.setVisible(false);this.monitors.forEach(m=>m.setVisible(false));
    }
    if(final)this.atmosphere.fillStyle(0x10041e,brain.state==='opening'?brain.finalProgress*0.3:0.13).fillRect(56,104,848,440);
    if (!final) return;
    const opening = brain.state === 'opening' ? brain.finalProgress : 1;
    const gap = opening * 12;
    this.chest.fillStyle(0x140e23).fillRect(-14, -13, 28, 28)
      .fillStyle(0x6a526c).fillRect(-16 - gap, -13, 13, 28).fillRect(3 + gap, -13, 13, 28)
      .lineStyle(2, 0xf577df, 0.9).lineBetween(-7 - gap, -13, -12 - gap, 0)
      .lineBetween(-12 - gap, 0, -4 - gap, 14);
    this.chest.lineStyle(2, 0xab749e, 0.7).lineBetween(12, 0, heart.x - body.x, heart.y - body.y + 19);
    this.core.setScale(1 + pulse * (brain.critical ? 0.1 : 0.045))
      .setRotation(Math.sin(this.timeMs / 500) * 0.1);
    this.core.fillStyle(0xc92068, 0.07 + opening * 0.07).fillCircle(0, 0, 46)
      .fillStyle(brain.critical ? 0xff334b : 0xc83cbd, 0.17).fillCircle(0, 0, 29);
    if (!dying) {
      this.core.fillStyle(0x301e4d).fillCircle(0, 0, 15).lineStyle(2, 0xf5ade5, 0.95).strokeCircle(0, 0, 15);
      if (this.hitMs > 0) this.core.fillStyle(0xffe9f7, this.hitMs / 220).fillCircle(0, 0, 17);
      const cracks = Math.ceil(6 * (1 - brain.hp / brain.config.heart.hp));
      for (let i = 0; i < cracks; i++) {
        const a = i * 2.4;
        this.core.lineStyle(1.5, 0xff6b98).lineBetween(Math.cos(a) * 7, Math.sin(a) * 7,
          Math.cos(a + 0.2) * 15, Math.sin(a + 0.2) * 15);
      }
    }
    // Bounded procedural motes double as a core rupture; no spawned particle objects.
    for (let i = 0; i < 18; i++) {
      const a = i * 2.4 + this.timeMs / 1300;
      const r = dying ? 12 + end * 100 : 19 + (this.timeMs * 0.015 + i * 7) % 22;
      this.core.fillStyle([0xf04567, 0xa45cff, 0xf04ac7][i % 3], dying ? 1 - end : 0.6)
        .fillCircle(Math.cos(a) * r, Math.sin(a) * r, dying ? 3 : 1.5);
    }
    this.core.setAlpha(brain.state === 'opening' ? opening : 1);
    this.placeholder.setAlpha(opening);
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.interruptionMs = 0;
    if(this.dom){this.dom.channel.remove();this.dom.caption.remove();this.dom.monitors.forEach(m=>m.remove());}
    this.owned.forEach((object) => object.destroy());
  }
}
