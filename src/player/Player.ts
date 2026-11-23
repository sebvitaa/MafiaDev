// Dominio: basti. STUB jugable: correr, salto, doble salto, coyote time, jump buffer.
// Reemplazar placeholder por sprite real (alejandro) cuando existan las animaciones.
import Phaser from 'phaser';
import { StateMachine } from '../core/StateMachine';
import { bus } from '../core/EventBus';
import type { Input } from '../core/Input';
import type { AbilitySlots, CharacterStats } from '../types/character';
import tuning from '../data/tuning.json';
import { Ground } from './states/Ground';
import { Air } from './states/Air';

export class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  readonly fsm: StateMachine<Player>;
  coyote = 0;
  jumpBuffer = 0;
  airJumps = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    readonly controls: Input,
    readonly stats: CharacterStats,
    readonly abilities: AbilitySlots,
  ) {
    super(scene, x, y, 'ph-player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.fsm = new StateMachine<Player>(this).add('ground', Ground).add('air', Air);
    this.fsm.set('ground');
  }

  tick(dtMs: number): void {
    this.coyote = Math.max(0, this.coyote - dtMs);
    this.jumpBuffer = Math.max(0, this.jumpBuffer - dtMs);
    if (this.controls.pressed('ability')) this.abilities.tryActivate(0);
    this.abilities.update(dtMs);
    this.fsm.update(dtMs);
  }

  moveX(dir: number): void {
    this.setVelocityX(dir * this.stats.speed);
    if (dir !== 0) this.setFlipX(dir < 0);
  }

  jump(multiplier = 1): void {
    const air = !this.body.blocked.down;
    this.setVelocityY(-tuning.player.jumpVelocity * multiplier);
    bus.emit('player:jump', { air });
  }
}
