import type { State } from '../../core/StateMachine';
import type { Player } from '../Player';
import { bus } from '../../core/EventBus';
import tuning from '../../data/tuning.json';

export const Air: State<Player> = {
  update(p) {
    p.moveX(p.controls.axisX);

    if (p.controls.pressed('jump')) {
      if (p.coyote > 0) {
        p.coyote = 0;
        p.jump();
      } else if (p.airJumps > 0) {
        p.airJumps--;
        p.jump(tuning.player.airJumpMultiplier);
      } else {
        p.jumpBuffer = tuning.player.jumpBufferMs;
      }
    }

    // salto variable: soltar el botón amortigua la subida
    if (!p.controls.held('jump') && p.body.velocity.y < 0) {
      p.setVelocityY(p.body.velocity.y * tuning.player.jumpCutDamping);
    }

    if (p.body.blocked.down) {
      bus.emit('player:land', { vy: p.body.velocity.y });
      p.fsm.set('ground');
    }
  },
};
