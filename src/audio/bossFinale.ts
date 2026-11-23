import type Phaser from 'phaser';
import { AudioDirector } from './AudioDirector';
/** Original existing audio only; no cloned voices or unlicensed recordings. */
export function installBossAudio(scene: Phaser.Scene) {
  let restore: Phaser.Time.TimerEvent | undefined;
  scene.events.once('shutdown',()=>{restore?.remove();AudioDirector.slowmo(false);AudioDirector.duck(1,100);});
  return {
    critical() {
      AudioDirector.slowmo(true);AudioDirector.sfx('sfx-low-hp',{detune:-500});restore?.remove();
      restore=scene.time.delayedCall(1500,()=>AudioDirector.slowmo(false));
    },
    dying() {restore?.remove();AudioDirector.slowmo(false);AudioDirector.sfx('sfx-ui-back',{detune:-700,volume:0.5});AudioDirector.stopMusic(1200);AudioDirector.playAmbient('amb-zone1',500);},
  };
}
