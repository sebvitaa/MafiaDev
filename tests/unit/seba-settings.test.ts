import { describe, expect, it } from 'vitest';
import { createSettingsStore, DEFAULT_SETTINGS, effectiveVolume, sanitize, SETTINGS_KEY } from '../../src/audio/settings';

function memStorage(init: Record<string, string> = {}) {
  const m = new Map(Object.entries(init));
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m };
}

describe('settings', () => {
  it('usa los valores por defecto sin datos guardados', () => {
    expect(createSettingsStore(memStorage()).get()).toEqual(DEFAULT_SETTINGS);
  });

  it('persiste y recarga', () => {
    const st = memStorage();
    createSettingsStore(st).set({ music: 0.2, tutorialDone: true });
    const again = createSettingsStore(st).get();
    expect(again.music).toBe(0.2);
    expect(again.tutorialDone).toBe(true);
  });

  it('limpia valores corruptos o fuera de rango', () => {
    const s = sanitize({ master: 7, sfx: -1, music: 'alto', muted: 'si' });
    expect(s.master).toBe(1);
    expect(s.sfx).toBe(0);
    expect(s.music).toBe(DEFAULT_SETTINGS.music);
    expect(s.muted).toBe(false);
  });

  it('JSON inválido no rompe la carga', () => {
    expect(createSettingsStore(memStorage({ [SETTINGS_KEY]: '{oops' })).get()).toEqual(DEFAULT_SETTINGS);
  });

  it('volumen efectivo = base × canal × master, 0 en mute', () => {
    const s = sanitize({ master: 0.5, sfx: 0.8 });
    expect(effectiveVolume(s, 'sfx', 0.5)).toBeCloseTo(0.2);
    expect(effectiveVolume({ ...s, muted: true }, 'sfx')).toBe(0);
  });

  it('avisa a los suscriptores', () => {
    const store = createSettingsStore(memStorage());
    const seen: number[] = [];
    const off = store.subscribe((s) => seen.push(s.ui));
    store.set({ ui: 0.1 });
    off();
    store.set({ ui: 0.3 });
    expect(seen).toEqual([0.1]);
  });
});
