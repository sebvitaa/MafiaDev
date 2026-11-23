import { describe, expect, it } from 'vitest';
import { DoubleTapDash } from '../../src/player/room-prototype/DoubleTapDash';

describe('doble pulsación WASD', () => {
  it.each([['W', 0, -1], ['A', -1, 0], ['S', 0, 1], ['D', 1, 0]] as const)(
    'elige %s después de soltar y volver a pulsar', (key, x, y) => {
      const taps = new DoubleTapDash(230);
      expect(taps.press(key, 0)).toBeNull();
      taps.release(key);
      expect(taps.press(key, 180)).toEqual({ x, y });
    },
  );
  it.each([['UP', 0, -1], ['LEFT', -1, 0], ['DOWN', 0, 1], ['RIGHT', 1, 0]] as const)(
    'permite doble pulsación de flecha %s', (key, x, y) => {
      const taps = new DoubleTapDash(350);
      expect(taps.press(key, 0)).toBeNull();
      taps.release(key);
      expect(taps.press(key, 100)).toEqual({ x, y });
    },
  );
  it('mantener una tecla o su autorepetición no dispara dash', () => {
    const taps = new DoubleTapDash(350);
    taps.press('W', 0);
    expect(taps.press('W', 80)).toBeNull();
    expect(taps.press('W', 150)).toBeNull();
  });
  it('no mezcla teclas y descarta pares fuera de la ventana', () => {
    const taps = new DoubleTapDash(230);
    taps.press('W', 0); taps.release('W');
    expect(taps.press('D', 80)).toBeNull(); taps.release('D');
    expect(taps.press('W', 231)).toBeNull();
  });
  it('tolera una segunda pulsación después de 300 ms', () => {
    const taps = new DoubleTapDash(350);
    taps.press('D', 0); taps.release('D');
    expect(taps.press('D', 300)).toEqual({ x: 1, y: 0 });
  });
  it('consume el par aunque el motor descarte dash por cooldown', () => {
    const taps = new DoubleTapDash(230);
    taps.press('A', 0); taps.release('A');
    expect(taps.press('A', 80)).toEqual({ x: -1, y: 0 }); taps.release('A');
    expect(taps.press('A', 160)).toBeNull();
  });
  it('pierde los taps pendientes al perder foco o reiniciar', () => {
    const taps = new DoubleTapDash(230);
    taps.press('S', 0); taps.release('S'); taps.clear();
    expect(taps.press('S', 100)).toBeNull();
  });
});
