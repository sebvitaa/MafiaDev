import type Phaser from 'phaser';
import type { Ability } from './index';
import config from '../data/abilities.json';
import { bus } from '../core/EventBus';

/** Player movement stays live; enemy and boss adapters consume the same remaining duration. */
export class TimeStop implements Ability {
  readonly id = 'time_stop';
  readonly cooldownMs = config.time_stop.cooldownMs;
  private remaining = 0;
  activate(scene: Phaser.Scene): boolean {
    this.remaining = config.time_stop.durationMs;
    scene.registry.set('timeStopRemaining',this.remaining);
    return true;
  }
  update(scene: Phaser.Scene, dt: number): void {
    if(this.remaining<=0)return;
    if((scene as Phaser.Scene & {hero?:{alive:boolean}}).hero?.alive===false)this.remaining=0;
    this.remaining=Math.max(0,this.remaining-dt);
    scene.registry.set('timeStopElapsed',config.time_stop.durationMs-this.remaining);
    scene.registry.set('timeStopRemaining',this.remaining);
    if(this.remaining===0)bus.emit('ability:ended',{id:this.id});
  }
}
