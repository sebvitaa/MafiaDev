import { describe, expect, it } from 'vitest';
import { createSettingsStore, DEFAULT_SETTINGS, effectiveVolume, sanitize, SETTINGS_KEY, stepVolume } from '../../src/audio/settings';

function memStorage(init: Record<string, string> = {}) {
  const m = new Map(Object.entries(init));
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m };
}

describe('settings', () => {
  it('usa los valores por defecto sin datos guardados', () => {
    expect(createSettingsStore(memStorage()).get()).toEqual(DEFAULT_SETTINGS);
    expect(DEFAULT_SETTINGS).toMatchObject({ master: 0.8, music: 0.35, sfx: 0.6, ambient: 0.6, ui: 0.7, screenShake: true });
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

  it('completa campos nuevos al cargar un guardado antiguo', () => {
    const old = JSON.stringify({ master: 0.4, music: 0.5, sfx: 0.6, ambient: 0.6, ui: 0.7, muted: false, reducedMotion: false, tutorialDone: true });
    expect(createSettingsStore(memStorage({ [SETTINGS_KEY]: old })).get()).toMatchObject({
      master: 0.4, music: 0.5, sfx: 0.6, screenShake: true, tutorialDone: true,
    });
  });

  it('restaura valores por defecto y conserva tutorialDone', () => {
    const store = createSettingsStore(memStorage());
    store.set({ master: 0.1, music: 0.9, tutorialDone: true, screenShake: false });
    expect(store.reset()).toEqual({ ...DEFAULT_SETTINGS, tutorialDone: true });
  });

  it('sube y baja volumen en pasos de 5 %, con límites y dos decimales', () => {
    expect(stepVolume(0.3, 1)).toBe(0.35);
    expect(stepVolume(0.3, -1)).toBe(0.25);
    expect(stepVolume(1, 1)).toBe(1);
    expect(stepVolume(0, -1)).toBe(0);
    expect(stepVolume(0.999, 1)).toBe(1);
    expect(stepVolume(Number.NaN, 1)).toBe(0.05);
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
