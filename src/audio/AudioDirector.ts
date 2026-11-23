// Dominio: seba. Director de audio global (vive en game.sound, sobrevive a los cambios de escena).
// Canales music/sfx/ambient/ui/voice · limitador anti-spam · crossfade de música · ducking · cámara lenta.
import Phaser from 'phaser';
import type { AmbientKey, MusicKey, SfxKey, VoiceKey } from '../types/assets';
import { createLimiter, fadeAt, MIX, SFX_GAIN, variantKey } from './mixing';
import { effectiveVolume, settings, type Channel, type Settings } from './settings';

type Snd = Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound;

interface Fade { snd: Snd; from: number; to: number; t: number; dur: number; stopAtEnd: boolean }

interface Track { key: string; snd: Snd; gain: number }

export interface SfxOptions { variant?: number; volume?: number; detune?: number; rate?: number; channel?: Channel }

class AudioDirectorImpl {
  private game!: Phaser.Game;
  private readonly limiter = createLimiter(4, 40);
  private fades: Fade[] = [];
  private music: Track | null = null;
  private ambient: Track | null = null;
  private duckFactor = 1;
  private slow = false;
  private ready = false;
  private s: Settings = settings.get();

  init(game: Phaser.Game): void {
    if (this.ready) return;
    this.game = game;
    this.ready = true;
    game.events.on(Phaser.Core.Events.STEP, (_t: number, delta: number) => this.step(delta));
    settings.subscribe((s) => { this.s = s; this.applyVolumes(); });
  }

  /** Ejecuta cb cuando el navegador permita audio (tras la primera interacción). */
  whenUnlocked(cb: () => void): void {
    if (!this.ready) return;
    if (!this.sound.locked) cb();
    else this.sound.once(Phaser.Sound.Events.UNLOCKED, cb);
  }

  toggleMute(): boolean {
    const muted = !settings.get().muted;
    settings.set({ muted });
    return muted;
  }

  private get sound(): Phaser.Sound.BaseSoundManager { return this.game.sound; }
  private has(key: string): boolean { return this.ready && this.game.cache.audio.exists(key); }

  // ───────────── SFX / UI / voz ─────────────
  sfx(key: SfxKey, o: SfxOptions = {}): void {
    if (!this.ready) return;
    const file = variantKey(key, o.variant);
    if (!this.has(file)) return;
    const vol = effectiveVolume(this.s, o.channel ?? 'sfx', (o.channel === 'ui' ? MIX.ui : MIX.sfx) * (SFX_GAIN[key] ?? 1) * (o.volume ?? 1));
    if (vol <= 0) return;
    const durMs = this.durationMs(file);
    if (!this.limiter.tryPlay(file, this.game.loop.time, durMs)) return;
    this.sound.play(file, {
      volume: vol,
      detune: (o.detune ?? Phaser.Math.Between(-90, 90)) + (this.slow ? -500 : 0),
      rate: (o.rate ?? 1) * (this.slow ? 0.75 : 1),
    });
  }

  ui(key: SfxKey): void { this.sfx(key, { channel: 'ui', detune: 0 }); }

  voice(key: VoiceKey): void {
    if (!this.has(key)) return;
    const vol = effectiveVolume(this.s, 'music', MIX.voice) / Math.max(0.01, this.s.music) * Math.max(this.s.music, this.s.sfx);
    this.sound.play(key, { volume: Math.min(1, vol) });
  }

  // ───────────── música y ambiente ─────────────
  get currentMusic(): string | null { return this.music?.key ?? null; }

  /** Crossfade a otra pista en bucle. Misma pista = no hace nada. */
  playMusic(key: MusicKey, fadeMs = 800, { loop = true, gain = 1 } = {}): void {
    if (!this.ready) return;
    if (this.music?.key === key && this.music.snd.isPlaying) return;
    this.fadeOutTrack(this.music, fadeMs);
    this.music = null;
    if (!this.has(key)) return; // pista diferida aún sin cargar: silencio en vez de error
    const snd = this.sound.add(key, { loop, volume: 0 }) as Snd;
    snd.play();
    if (this.slow) this.applySlow(snd, true);
    this.music = { key, snd, gain };
    this.fadeTo(snd, this.target('music', gain), fadeMs);
  }

  stopMusic(fadeMs = 600): void {
    this.fadeOutTrack(this.music, fadeMs);
    this.music = null;
  }

  /** Jingle de una vez (game over, fanfarria larga) que sustituye a la música actual. */
  playJingle(key: MusicKey, fadeOutMs = 300): void {
    this.playMusic(key, fadeOutMs, { loop: false });
  }

  playAmbient(key: AmbientKey | null, fadeMs = 1200): void {
    if (!this.ready) return;
    if (key && this.ambient?.key === key) return;
    this.fadeOutTrack(this.ambient, fadeMs);
    this.ambient = null;
    if (!key || !this.has(key)) return;
    const snd = this.sound.add(key, { loop: true, volume: 0 }) as Snd;
    snd.play();
    this.ambient = { key, snd, gain: 1 };
    this.fadeTo(snd, this.target('ambient', 1), fadeMs);
  }

  /** Baja música y ambiente (pausa = 0.3). duck(1) restaura. */
  duck(factor: number, ms = 250): void {
    this.duckFactor = factor;
    if (this.music) this.fadeTo(this.music.snd, this.target('music', this.music.gain), ms);
    if (this.ambient) this.fadeTo(this.ambient.snd, this.target('ambient', 1), ms);
  }

  /** «Parar el tiempo»: música a cámara lenta (rate 0.6, detune −600). */
  slowmo(on: boolean): void {
    if (this.slow === on) return;
    this.slow = on;
    if (this.music) this.applySlow(this.music.snd, on);
    if (this.ambient) this.applySlow(this.ambient.snd, on);
  }

  stopAll(): void {
    this.fades = [];
    this.music?.snd.destroy();
    this.ambient?.snd.destroy();
    this.music = this.ambient = null;
    this.slow = false;
    this.duckFactor = 1;
  }

  // ───────────── internos ─────────────
  private target(channel: Channel, gain: number): number {
    const base = channel === 'music' ? MIX.music : channel === 'ambient' ? MIX.ambient : 1;
    return effectiveVolume(this.s, channel, base * gain) * this.duckFactor;
  }

  private applySlow(snd: Snd, on: boolean): void {
    snd.setRate(on ? 0.6 : 1);
    snd.setDetune(on ? -600 : 0);
  }

  private applyVolumes(): void {
    if (this.music) this.fadeTo(this.music.snd, this.target('music', this.music.gain), 120);
    if (this.ambient) this.fadeTo(this.ambient.snd, this.target('ambient', 1), 120);
  }

  private fadeOutTrack(track: Track | null, ms: number): void {
    if (!track) return;
    this.fadeTo(track.snd, 0, ms, true);
  }

  private fadeTo(snd: Snd, to: number, ms: number, stopAtEnd = false): void {
    this.fades = this.fades.filter((f) => f.snd !== snd);
    if (ms <= 0) { snd.setVolume(to); if (stopAtEnd) snd.destroy(); return; }
    this.fades.push({ snd, from: snd.volume, to, t: 0, dur: ms, stopAtEnd });
  }

  private step(delta: number): void {
    if (!this.fades.length) return;
    const done: Fade[] = [];
    for (const f of this.fades) {
      f.t += delta;
      const k = f.t / f.dur;
      if (!f.snd.pendingRemove) f.snd.setVolume(fadeAt(f.from, f.to, k));
      if (k >= 1) done.push(f);
    }
    if (!done.length) return;
    this.fades = this.fades.filter((f) => !done.includes(f));
    for (const f of done) if (f.stopAtEnd && !f.snd.pendingRemove) f.snd.destroy();
  }

  private durationMs(key: string): number {
    const data = this.game.cache.audio.get(key) as AudioBuffer | HTMLAudioElement | undefined;
    const d = data && 'duration' in data ? Number(data.duration) : 0.3;
    return Number.isFinite(d) && d > 0 ? d * 1000 : 300;
  }
}

/** Instancia única. Se inicializa en PreloadScene. */
export const AudioDirector = new AudioDirectorImpl();
