import { StateMachine } from '../core/StateMachine';
import type { Point } from '../abilities/markGeometry';

export interface EnemyDefinition {
  name: string; hp: number; dmg: number; speed: number; aggroRange: number;
  windupMs: number; activeMs: number; recoveryMs: number; staggerMs: number;
  attackRange: number; halfAngleDeg: number; radius: number; lungeSpeed: number;
  armored: boolean; color: number; loot: string;
}

/** Decisiones y ventanas de ataque sin Phaser; movimiento/impacto quedan en el adaptador. */
export class EnemyBrain {
  readonly fsm = new StateMachine(this);
  facing: Point = { x: 0, y: 1 };
  attackSequence = 0;
  private hitSpent = false;
  private remainingMs = 0;
  private position: Point = { x: 0, y: 0 };
  private target: Point | null = null;
  private clearShot = true;
  private elapsedMs = 0;

  constructor(readonly definition: EnemyDefinition) {
    this.fsm
      .add('idle', { update: (brain) => brain.decide() })
      .add('chase', { update: (brain) => brain.decide() })
      .add('windup', {
        enter: (brain) => { brain.remainingMs = definition.windupMs; brain.faceTarget(); },
        update: (brain) => brain.countdown('attack'),
      })
      .add('attack', {
        enter: (brain) => { brain.remainingMs = definition.activeMs; brain.hitSpent = false; brain.attackSequence++; },
        update: (brain) => brain.countdown('recovery'),
      })
      .add('recovery', {
        enter: (brain) => { brain.remainingMs = definition.recoveryMs; },
        update: (brain) => brain.countdown('chase'),
      })
      .add('hurt', {
        enter: (brain) => { brain.remainingMs = definition.staggerMs; },
        update: (brain) => brain.countdown('chase'),
      })
      .add('dead', {});
    this.fsm.set('idle');
  }

  get state(): string { return this.fsm.current; }
  get canStrike(): boolean { return this.state === 'attack' && !this.hitSpent; }

  update(dtMs: number, position: Point, target: Point | null, clearShot: boolean): void {
    if (this.state === 'dead') return;
    this.elapsedMs = Math.max(0, Number.isFinite(dtMs) ? dtMs : 0);
    this.position = position;
    this.target = target;
    this.clearShot = clearShot;
    if (!target) { this.fsm.set('idle'); return; }
    this.fsm.update(this.elapsedMs);
  }

  consumeHit(): void { this.hitSpent = true; }

  hurt(): void {
    if (this.state === 'dead' || (this.definition.armored && ['windup', 'attack'].includes(this.state))) return;
    this.fsm.set('hurt', true);
  }

  die(): void { this.fsm.set('dead'); }

  private countdown(next: string): void {
    this.remainingMs -= this.elapsedMs;
    // No saltar una ventana de impacto aunque el navegador entregue un frame largo.
    if (this.remainingMs <= 0) this.fsm.set(next);
  }

  private faceTarget(): void {
    if (!this.target) return;
    const dx = this.target.x - this.position.x, dy = this.target.y - this.position.y;
    const length = Math.hypot(dx, dy);
    if (length > 0) this.facing = { x: dx / length, y: dy / length };
  }

  private decide(): void {
    if (!this.target) return;
    const distance = Math.hypot(this.target.x - this.position.x, this.target.y - this.position.y);
    const range = this.definition.aggroRange * (this.state === 'chase' ? 1.3 : 1);
    if (distance > range) { this.fsm.set('idle'); return; }
    this.faceTarget();
    this.fsm.set(distance <= this.definition.attackRange && this.clearShot ? 'windup' : 'chase');
  }
}
