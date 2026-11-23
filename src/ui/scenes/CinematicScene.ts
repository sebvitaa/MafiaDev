import Phaser from 'phaser';
import { HEART_FILM_CUT_SECONDS } from '../../enemies/codexHeart';
import { AudioDirector, settings } from '../../audio';
import { hdLayer } from '../hd/HdLayer';
import { installGlobalKeys } from '../globalKeys';

// SUP-alejandro-20261123-133427: el selector FINAL da acceso al clip mientras se implementa El Set.
type Entry = { stage: 1 | 3 | 'ending'; fromRoom?: boolean; resumeHud?: boolean };

export class CinematicScene extends Phaser.Scene {
  constructor() { super('CinematicScene'); }

  create(entry: Entry): void {
    this.scene.bringToTop();
    installGlobalKeys(this);
    const id = entry.stage === 'ending' ? 'cine3' : entry.stage === 1 ? 'cine1' : 'cine2';
    const layer = hdLayer(this);
    const video = layer.el('video', { width: 480, height: 270, style: { backgroundColor: '#090b15' } });
    video.setAttribute('aria-label', entry.stage === 'ending' ? 'Fin de transmisión' : entry.stage === 1 ? 'La Nota' : 'La Última Apuesta');
    video.playsInline = true;
    video.preload = 'auto';
    const cue = entry.stage === 'ending' ? '#t=' + HEART_FILM_CUT_SECONDS : '';
    video.src = `${import.meta.env.BASE_URL}assets/ui/cinematics/${id}/${id}.webm${cue}`;
    const setVolume = () => {
      video.muted = settings.get().muted;
      video.volume = settings.get().master * settings.get().music;
    };
    setVolume();
    const unsubscribe = settings.subscribe(setVolume);
    AudioDirector.duck(0, 90);
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      if (entry.stage === 'ending') {
        this.scene.stop('GameScene');
        this.scene.start('CreditsScene', { from: 'GameScene' });
        return;
      }
      if (entry.stage === 3) {
        this.registry.set('setCinematicSeen', true);
        // La mezcla de La Última Apuesta contiene este mismo tema desde 7.6 s, con offset de 3 s.
        this.registry.set('bossMusicOffset', video.currentTime >= 7.6 ? 3 + video.currentTime - 7.6 : 0);
      }
      if (entry.fromRoom) {
        this.scene.resume('GameScene');
        if (entry.resumeHud) this.scene.resume('HudScene');
        this.scene.stop();
      } else {
        this.scene.start('GameScene', { stage: entry.stage });
      }
    };
    const buttonStyle = {
      border: '0', background: '#0c0e19', color: '#ebe7f4', cursor: 'pointer',
      fontFamily: '"Barlow Condensed", sans-serif', fontSize: '10px', padding: '0',
    };
    const skip = layer.el('button', { text: 'Saltar · Esc', x: 421, y: 0, width: 56, height: 15, interactive: true, style: buttonStyle });
    skip.onclick = finish;
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
    video.addEventListener('ended', finish);
    video.addEventListener('error', finish);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      done = true;
      window.removeEventListener('keydown', keydown, true);
      document.removeEventListener('visibilitychange', visibility);
      video.removeEventListener('ended', finish);
      video.removeEventListener('error', finish);
      unsubscribe();
      video.pause();
      video.removeAttribute('src');
      video.load();
      AudioDirector.duck(1, 180);
    });
    start();
  }
}
