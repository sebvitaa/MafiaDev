import { describe, expect, it } from 'vitest';
import { StateMachine } from '../../src/core/StateMachine';

describe('StateMachine', () => {
  it('llama exit/enter en orden y registra prev', () => {
    const log: string[] = [];
    const owner = {};
    const fsm = new StateMachine(owner)
      .add('a', { enter: (_o, prev) => log.push(`enter a<-${prev}`), exit: (_o, next) => log.push(`exit a->${next}`) })
      .add('b', { enter: (_o, prev) => log.push(`enter b<-${prev}`) });
    fsm.set('a');
    fsm.set('b');
    expect(log).toEqual(['enter a<-', 'exit a->b', 'enter b<-a']);
    expect(fsm.previous).toBe('a');
  });

  it('no re-entra en el mismo estado salvo force', () => {
    let enters = 0;
    const fsm = new StateMachine({}).add('atk', { enter: () => enters++ });
    fsm.set('atk');
    fsm.set('atk');
    expect(enters).toBe(1);
    fsm.set('atk', true);
    expect(enters).toBe(2);
  });

  it('lanza con estado desconocido', () => {
    expect(() => new StateMachine({}).set('nope')).toThrow(/desconocido/);
  });
});
