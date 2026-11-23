// Dominio: basti. Movilidad lateral: caminar/correr, saltos, coyote, buffer y dash.
// Reemplazar placeholder por sprite real (alejandro) cuando existan las animaciones.
import Phaser from 'phaser';
import { StateMachine } from '../core/StateMachine';
import { bus } from '../core/EventBus';
import type { Input } from '../core/Input';
import type { AbilitySlots, CharacterStats } from '../types/character';
import tuning from '../data/tuning.json';
import { Ground } from './states/Ground';
import { Air } from './states/Air';
import { Dash } from './states/Dash';
import { DashMotion, horizontalSpeed } from './states/DashMotion';
import { BINDINGS } from '../core/Input';

export class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  readonly fsm: StateMachine<Player>;
  coyote = 0;
  jumpBuffer = 0;
  airJumps = 0;
  readonly dash = new DashMotion(tuning.player.dash);
  gravityBeforeDash = true;
  velocityBeforeDash = 0;
  private readonly runKey: Phaser.Input.Keyboard.Key;
  private readonly dashKeys: Phaser.Input.Keyboard.Key[];

  /** Future damage systems can consult this; no damage behavior is installed here. */
  get isInvulnerable(): boolean { return this.dash.invulnerable; }

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    readonly controls: Input,
    readonly stats: CharacterStats,
    readonly abilities: AbilitySlots,
  ) {
    super(scene, x, y, scene.textures.exists('rios') ? 'rios' : 'ph-player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    // SUP-basti-20261123-102326: split Shift/run from C,K/dash locally, without changing shared Input.
    this.runKey = scene.input.keyboard!.addKey('SHIFT');
    this.dashKeys = BINDINGS.dash.filter((key) => key !== 'SHIFT')
      .map((key) => scene.input.keyboard!.addKey(key));
    this.fsm = new StateMachine<Player>(this).add('ground', Ground).add('air', Air).add('dash', Dash);
    this.fsm.set('ground');
  }

  tick(dtMs: number): void {
    this.coyote = Math.max(0, this.coyote - dtMs);
    this.jumpBuffer = Math.max(0, this.jumpBuffer - dtMs);
    this.dash.update(dtMs);
    // Consume every key edge, even during cooldown: holding a key never queues another dash.
    const dashPressed = this.dashKeys.map((key) => Phaser.Input.Keyboard.JustDown(key)).some(Boolean);
    if (dashPressed && this.fsm.current !== 'dash'
      && this.dash.tryStart(this.controls.axisX || (this.flipX ? -1 : 1), this.stats.dashCooldownMs)) {
      this.gravityBeforeDash = this.body.allowGravity;
      this.velocityBeforeDash = this.body.velocity.y;
      this.coyote = 0;
      this.setFlipX(this.dash.direction < 0);
      this.body.setAllowGravity(false);
      this.setVelocity(this.dash.direction * tuning.player.dash.speed, 0);
      this.fsm.set('dash');
      bus.emit('player:dash', {});
    }
    if (this.controls.pressed('ability')) this.abilities.tryActivate(0);
    this.abilities.update(dtMs);
    this.fsm.update(dtMs);
  }

  moveX(dir: number): void {
    this.setVelocityX(horizontalSpeed(dir, this.stats.speed, this.runKey.isDown, tuning.player.runMultiplier));
    if (dir !== 0) this.setFlipX(dir < 0);
  }

  jump(multiplier = 1): void {
    const air = !this.body.blocked.down;
    this.setVelocityY(-tuning.player.jumpVelocity * multiplier);
    bus.emit('player:jump', { air });
  }
}
