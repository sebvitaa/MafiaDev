import Phaser from 'phaser';
import type { Ability } from './index';
import definitions from '../data/abilities.json';
import { combatLineClear } from '../combat/visibility';
import { segmentHit } from './markGeometry';
import type { SwordDamageTarget } from '../player/room-prototype/SwordCombat';
const config=definitions.soul_bolt;
type Bolt={art:Phaser.GameObjects.Arc;age:number;delay:number;done:boolean};
/** Three finite souls per burst; phase-three Bodoque absorbs the first, never the entire burst. */
export class SoulBolt implements Ability {
  readonly id='soul_bolt';
  readonly cooldownMs=config.cooldownMs;
  private bolts:Bolt[]=[];
  private origin={x:0,y:0};private direction={x:1,y:0};private absorbed=false;
  activate(scene:Phaser.Scene):boolean {
    const hero=(scene as Phaser.Scene & {hero?:{anchor:{x:number;y:number};alive:boolean}}).hero;
    if(!hero?.alive)return false;
    const souls=Number(scene.registry.get('souls')??config.startingSouls);
    if(souls<config.soulCost)return false;
    scene.registry.set('souls',souls-config.soulCost);
    this.destroy();this.absorbed=false;this.origin={x:hero.anchor.x,y:hero.anchor.y};
    const aim=scene.input.activePointer.positionToCamera(scene.cameras.main) as Phaser.Math.Vector2;
    const dx=aim.x-this.origin.x,dy=aim.y-this.origin.y,len=Math.hypot(dx,dy)||1;
    this.direction={x:dx/len,y:dy/len};
    this.bolts=Array.from({length:config.burst},(_,i)=>({art:scene.add.circle(this.origin.x,this.origin.y,5,0xbf83ff)
      .setStrokeStyle(2,0xf2ceff).setDepth(this.origin.y).setVisible(false),age:0,delay:i*config.burstDelayMs,done:false}));
    return true;
  }
  update(scene:Phaser.Scene,dt:number):void {
    const game=scene as Phaser.Scene & {hero?:{alive:boolean};combatTargets?:()=>readonly SwordDamageTarget[];
      boss?:{entity?:{brain:{phase:number};state:string}}};
    if(game.hero?.alive===false){this.destroy();return;}
    for(const bolt of this.bolts){
      if(bolt.done)continue;
      const previous={x:bolt.art.x,y:bolt.art.y};bolt.age+=dt;
      const elapsed=bolt.age-bolt.delay;if(elapsed<0)continue;
      const distance=elapsed*config.speed/1000;
      const point={x:this.origin.x+this.direction.x*distance,y:this.origin.y+this.direction.y*distance};
      if(elapsed>config.lifetimeMs||!combatLineClear(scene,previous,point)){bolt.done=true;bolt.art.setVisible(false);continue;}
      bolt.art.setVisible(true).setPosition(point.x,point.y).setDepth(point.y+15);
      for(const target of game.combatTargets?.()??[]){
        const r=target.radius;
        if(segmentHit(previous,point,{x:target.x-r,y:target.y-r,width:r*2,height:r*2},5)===null)continue;
        const boss=game.boss?.entity;
        if(target.id==='bodoque'&&boss?.brain.phase===3&&boss.state!=='heart'&&!this.absorbed)this.absorbed=true;
        else target.takeSwordDamage(config.damage,this.direction);
        bolt.done=true;bolt.art.setVisible(false);break;
      }
    }
    if(this.bolts.length&&this.bolts.every(b=>b.done))this.destroy();
  }
  destroy():void {for(const bolt of this.bolts)bolt.art.destroy();this.bolts=[];}
}
