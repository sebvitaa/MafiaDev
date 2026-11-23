import Phaser from 'phaser';
import { AudioDirector, settings } from '../../audio';
import { hdLayer } from '../hd/HdLayer';
import { installGlobalKeys } from '../globalKeys';

// SUP-alejandro-20261123-133427: el selector FINAL da acceso al clip mientras se implementa El Set.
type Entry = { stage: 1 | 3; fromRoom?: boolean; resumeHud?: boolean };

export class CinematicScene extends Phaser.Scene {
  constructor() { super('CinematicScene'); }

  create(entry: Entry): void {
    this.scene.bringToTop();
    installGlobalKeys(this);
    const id = entry.stage === 1 ? 'cine1' : 'cine2';
    const layer = hdLayer(this);
    const video = layer.el('video', { width: 480, height: 270, style: { backgroundColor: '#090b15' } });
    video.setAttribute('aria-label', entry.stage === 1 ? 'La Nota' : 'La Última Apuesta');
    video.playsInline = true;
    video.preload = 'auto';
    video.src = `${import.meta.env.BASE_URL}assets/ui/cinematics/${id}/${id}.webm`;
    const setVolume = () => {
      video.muted = settings.get().muted;
      video.volume = settings.get().master;
    };
    setVolume();
    const unsubscribe = settings.subscribe(setVolume);
    AudioDirector.duck(0, 90);
    let done = false;

    const finish = (arrival: 'natural' | 'skip' = 'skip') => {
      if (done) return;
      done = true;
      if (entry.stage === 3) this.registry.set('setCinematicSeen', true);
      if (entry.fromRoom) {
        this.scene.resume('GameScene');
        if (entry.resumeHud) this.scene.resume('HudScene');
        this.scene.stop();
      } else {
        if (entry.stage === 1) this.registry.set('laNotaArrival', arrival);
        this.scene.start('GameScene', { stage: entry.stage });
      }
    };
    const buttonStyle = {
      border: '0', background: '#0c0e19', color: '#ebe7f4', cursor: 'pointer',
      fontFamily: '"Barlow Condensed", sans-serif', fontSize: '10px', padding: '0',
    };
    const skip = layer.el('button', { text: 'Saltar · Esc', x: 421, y: 0, width: 56, height: 15, interactive: true, style: buttonStyle });
    skip.onclick = () => finish();
    const play = layer.el('button', { text: 'Reproducir', x: 199, y: 119, width: 82, height: 32, interactive: true, style: buttonStyle });
    play.hidden = true;
    const start = () => {
      if (done || document.hidden) return;
      play.hidden = true;
      void video.play().catch((error: DOMException) => {
        if (done || error.name === 'AbortError') return;
        if (error.name === 'NotAllowedError') play.hidden = false;
        else finish();
      });
    };
    play.onclick = start;
    const keydown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' && event.key !== 'Enter') return;
      if (event.key === 'Enter' && document.activeElement === play && !play.hidden) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!event.repeat) finish();
    };
    const visibility = () => { if (document.hidden) video.pause(); else start(); };
    window.addEventListener('keydown', keydown, true);
    document.addEventListener('visibilitychange', visibility);
    const onEnded = () => finish('natural');
    const onError = () => finish();
    video.addEventListener('ended', onEnded);
    video.addEventListener('error', onError);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      done = true;
      window.removeEventListener('keydown', keydown, true);
      document.removeEventListener('visibilitychange', visibility);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('error', onError);
      unsubscribe();
      video.pause();
      video.removeAttribute('src');
      video.load();
      AudioDirector.duck(1, 180);
    });
    start();
  }
}
