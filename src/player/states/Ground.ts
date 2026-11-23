import type { State } from '../../core/StateMachine';
import type { Player } from '../Player';
import tuning from '../../data/tuning.json';

export const Ground: State<Player> = {
  enter(p) {
    p.airJumps = p.stats.airJumps;
  },
  update(p) {
    p.moveX(p.controls.axisX);
    if (p.controls.pressed('jump') || p.jumpBuffer > 0) {
      p.jumpBuffer = 0;
      p.jump();
      return p.fsm.set('air');
    }
    if (!p.body.blocked.down) {
      p.coyote = tuning.player.coyoteMs; // cayó de un borde: aún puede saltar un instante
      p.fsm.set('air');
    }
  },
};
