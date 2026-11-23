import Phaser from 'phaser';
import { bus } from '../core/EventBus';
import { BodoqueBoss, EnemySystem, type EnemyPlayer } from '../enemies';
import type { SwordDamageTarget } from '../player/room-prototype/SwordCombat';
import type { FireballDamageTarget } from '../player/room-prototype/FireballCombat';
import { installBossAudio } from '../audio/bossFinale';

export interface Boss {
  readonly targets: readonly (SwordDamageTarget & FireballDamageTarget)[];
  readonly entity: BodoqueBoss | null;
}
/** Vicente's arena/film entry, one boss, one final event. */
export function installBoss(scene: Phaser.Scene, player: EnemyPlayer,
  world: { map: Phaser.Tilemaps.Tilemap; solids: Phaser.Tilemaps.TilemapLayer; obstacles: Phaser.Physics.Arcade.StaticGroup }): Boss {
  const arena = world.map.findObject('objects', o => o.type === 'boss_arena');
  let boss: BodoqueBoss | null = null;
  let won = false;
  scene.registry.set('bossEnding',false);
  const audio = installBossAudio(scene);
  const reinforcements = new EnemySystem(scene, player, world.solids,world.obstacles);
  const spawn = () => {
    if (boss || won || !arena || !player.alive) return;
    const x=arena.x!+arena.width!/2, y=arena.y!+arena.height!/2;
    boss = new BodoqueBoss(scene,x,y,{
      onPhase: event => bus.emit('boss:phase',event),
      onHit: event => bus.emit('enemy:hit',{...event,id:'boss-bodoque'}),
      onPlayerHit: damage => player.takeEnemyDamage(damage,{x:player.anchor.x-(boss?.x??x),y:player.anchor.y-(boss?.y??y)}),
      onSummon: position => {
        if(reinforcements.targets.length >= 4) return;
        for(const side of [-1,1]) {
          reinforcements.spawn('cobrador',position.x+side*48,position.y+30);
        }
      },
      onTimeTheft: () => scene.registry.set('heroSlowUntil',scene.time.now+1000),
      onCritical: () => audio.critical(), onDying: () => {scene.registry.set('bossEnding',true);reinforcements.clear();audio.dying();},
      onOpening: () => {scene.cameras.main.flash(180,120,20,80);scene.registry.set('heartCameraUntil',scene.time.now+1200);},
      onKilled: event => {if(won)return;won=true;bus.emit('enemy:killed',{...event,id:'boss-bodoque',kind:'boss'});},
    },{overlay:scene.scene.get('HudScene'),bounds:{
      left:arena.x!+35,right:arena.x!+arena.width!-70,top:arena.y!+40,bottom:arena.y!+arena.height!-40,
    }});
    boss.activate();
  };
  const onRoom=({roomId}:{roomId:string})=>{
    if(roomId!=='set')return;
    scene.time.delayedCall(0,()=>{if(scene.scene.isPaused())scene.events.once('resume',spawn);else spawn();});
  };
  const onUpdate=(_t:number,dt:number)=>{
    if(!player.alive)return;
    const stopped=Number(scene.registry.get('timeStopRemaining')??0)>0;
    const cinematic=boss&&['opening','dying'].includes(boss.state);
    if(boss && (cinematic || !stopped || (boss.brain.phase===3 && Number(scene.registry.get('timeStopElapsed')??0)<1000)))boss.update(stopped&&!cinematic?dt*0.5:dt,player.anchor,
      (player as EnemyPlayer & {motion?:{height:number}}).motion?.height??0);
    if(!stopped)reinforcements.update(dt);
  };
  const onDeath=()=>{
    scene.registry.set('heroSlowUntil',0);scene.registry.set('timeStopRemaining',0);
    if(boss&&!won){boss.destroy();boss=null;}
    reinforcements.clear();
  };
  const onRespawn=()=>{if(arena&&player.anchor.x>=arena.x!&&player.anchor.x<=arena.x!+arena.width!
    &&player.anchor.y>=arena.y!&&player.anchor.y<=arena.y!+arena.height!)spawn();};
  bus.on('room:entered',onRoom);bus.on('player:died',onDeath);bus.on('player:respawned',onRespawn);
  scene.events.on('update',onUpdate);
  scene.events.once('shutdown',()=>{
    bus.off('room:entered',onRoom);bus.off('player:died',onDeath);bus.off('player:respawned',onRespawn);
    scene.events.off('update',onUpdate);scene.events.off('resume',spawn);
  });
  return {get entity(){return boss;},get targets(){return [...(boss?.damageTargets??[]),...reinforcements.targets];}};
}
