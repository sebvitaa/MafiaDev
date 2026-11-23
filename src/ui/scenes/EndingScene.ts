import Phaser from 'phaser';
import { hdLayer } from '../hd/HdLayer';
import { AudioDirector } from '../../audio';

export const ENDING_CARDS = [
  { ms: 3000, title: 'LA BANCA NO PERDIÓ. LA CASA NUNCA PIERDE.', detail: '', art: 'noir' },
  { ms: 3000, title: 'SOLO CAMBIÓ DE DEUDOR.', detail: '', art: 'noir' },
  { ms: 3500, title: 'DESAPARECE JUAN CARLOS BODOQUE', detail: 'NOTICIERO DE MEDIANOCHE\nPor Ríos', art: 'paper' },
  { ms: 2000, title: '', detail: '', art: 'black' },
  { ms: 4000, title: 'EL CUENTO DE TULIO', detail: 'Tulio lee a los niños la historia de Ríos, Bodoque y La Banca.', art: 'book' },
  { ms: 3500, title: 'MAFIADEV: LA ÚLTIMA APUESTA', detail: 'Tulio termina de leer. Cierra el libro. Los niños lo miran sorprendidos.', art: 'book' },
  { ms: 4000, title: 'BODOQUE', detail: '«Tulio, no asustes a los niños con esos libros».', art: 'door' },
  { ms: 2000, title: '...', detail: 'Tulio guarda silencio. Los niños se miran.', art: 'door' },
  { ms: 3000, title: 'MAFIADEV — FIN', detail: '', art: 'black' },
] as const;

/** Original provisional comic/subtitles; published intro videos and credits remain unchanged. */
export class EndingScene extends Phaser.Scene {
  cardIndex = 0;
  private elapsed = 0;
  private from = 'GameScene';
  private title!: HTMLDivElement;
  private subtitle!: HTMLDivElement;
  private note!: HTMLDivElement;
  private art!: Phaser.GameObjects.Graphics;
  private completed = false;
  constructor() { super('EndingScene'); }
  init(data: {from?:string}): void {this.from=data.from??'GameScene';this.cardIndex=0;this.elapsed=0;this.completed=false;}
  create(): void {
    this.scene.bringToTop();
    hdLayer(this.scene.get(this.from)).remove();
    hdLayer(this.scene.get('HudScene')).remove();
    const layer=hdLayer(this);
    this.cameras.main.setBackgroundColor('#080a13');
    this.art=this.add.graphics().setDepth(1);
    this.title=layer.text(240,22,'',{width:440,align:'center',fontSize:19,weight:600,depth:5,color:'#f5dfb3'});
    this.subtitle=layer.text(240,211,'',{width:440,align:'center',fontSize:13,depth:5,color:'#f3e6d1',lineHeight:17});
    this.note=layer.text(240,193,'VIÑETA PROVISIONAL · ARTE Y VOCES PENDIENTES',{width:420,align:'center',fontSize:7,depth:5,color:'#d2bca2'});
    AudioDirector.stopMusic(700);
    this.drawCard();
  }
  update(_time: number, dt: number): void {
    if(this.completed)return;
    this.elapsed+=Math.max(0,dt);
    if(this.elapsed<ENDING_CARDS[this.cardIndex].ms)return;
    this.elapsed=0;this.cardIndex++;
    if(this.cardIndex===ENDING_CARDS.length){
      this.completed=true;
      this.scene.launch('CreditsScene',{from:this.from});
      this.scene.stop();
      return;
    }
    this.drawCard();
  }
  private drawCard(): void {
    const card=ENDING_CARDS[this.cardIndex];
    this.title.textContent=card.title;this.subtitle.textContent=card.detail;
    this.note.hidden=!['book','door'].includes(card.art);
    const g=this.art.clear();
    if(card.art==='black'){AudioDirector.stopAll();return;}
    if(card.art==='paper'){
      g.fillStyle(0xe2ce9f).fillRoundedRect(32,70,416,124,3).lineStyle(1,0x58493a);
      for(let i=0;i<7;i++)g.lineBetween(48,100+i*10,430,100+i*10);
    } else if(card.art==='book'||card.art==='door'){
      if(this.cardIndex===4)AudioDirector.ui('sfx-ui-move'); // original page-turn substitute
      if(this.cardIndex===7)AudioDirector.sfx('sfx-title-sting',{detune:0,volume:0.25});
      g.fillStyle(0x7b4d30).fillRoundedRect(24,62,432,128,8)
        .fillStyle(0xffc873,0.15).fillEllipse(240,130,330,100);
      // Original puppet silhouettes, labelled in subtitles; no generated likeness/actor voice.
      g.fillStyle(0xe6bd48).fillCircle(235,108,21).fillRoundedRect(214,126,42,46,6)
        .fillStyle(0x3c2934).fillRect(216,83,38,10).fillRect(211,91,48,6)
        .fillStyle(0x181220).fillCircle(229,105,2).fillCircle(242,105,2);
      for(const x of [105,145,330,370])g.fillStyle(x<200?0x6bbcc7:0xc98fcd)
        .fillCircle(x,149,12).fillRect(x-11,160,22,20);
      g.fillStyle(0xf8e7b9).fillTriangle(193,136,238,143,238,174).fillTriangle(238,143,283,136,238,174)
        .lineStyle(2,0x6b3046).lineBetween(238,143,238,174);
      if(card.art==='door'){
        g.fillStyle(0x362330).fillRect(398,75,40,105).fillStyle(0xc9474c).fillCircle(408,119,14)
          .fillRect(398,130,21,39).fillEllipse(402,92,8,32).fillEllipse(415,92,8,32);
      }
    }
    this.cameras.main.fadeIn(350);
  }
}
