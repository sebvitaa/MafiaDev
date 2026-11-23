import type { State } from '../../core/StateMachine';
import type { Player } from '../Player';
import tuning from '../../data/tuning.json';

export const Dash: State<Player> = {
  update(p) {
    if (p.controls.pressed('jump')) p.jumpBuffer = tuning.player.jumpBufferMs;
    if (!p.dash.active) {
      p.fsm.set(p.body.blocked.down ? 'ground' : 'air');
      p.moveX(p.controls.axisX);
      return;
    }
    p.setVelocity(p.dash.direction * tuning.player.dash.speed, 0);
  },
  exit(p) {
    p.body.setAllowGravity(p.gravityBeforeDash);
    p.setVelocityY(p.body.blocked.down ? 0 : p.velocityBeforeDash);
  },
};
