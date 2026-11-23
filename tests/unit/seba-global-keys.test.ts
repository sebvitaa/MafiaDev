import { describe, expect, it } from 'vitest';
import { globalKeyCodes } from '../../src/ui/globalKeyCodes';

describe('teclas globales de seba', () => {
  it('en el juego no escucha M (mapa) ni F (viaje rápido)', () => {
    const k = globalKeyCodes(true);
    expect([...k.mute, ...k.fullscreen]).not.toContain('M');
    expect([...k.mute, ...k.fullscreen]).not.toContain('F');
    expect(k.mute).toContain('ZERO');
  });

  it('en menús mantiene M y F además del 0', () => {
    const k = globalKeyCodes(false);
    expect(k.mute).toEqual(expect.arrayContaining(['ZERO', 'M']));
    expect(k.fullscreen).toEqual(['F']);
  });

});
