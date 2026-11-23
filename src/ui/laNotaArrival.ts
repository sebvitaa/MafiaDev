import Phaser from 'phaser';
import { settings } from '../audio';
import { hdLayer } from './hd/HdLayer';
import { reducedMotion } from './theme';

// SUP-seba-20261123-154710 / SUP-basti-20261123-153110: el último plano usa la cámara del escenario elegido.
export function presentLaNotaArrival(hud: Phaser.Scene, onControl: () => void): void {
  const arrival = hud.registry.get('laNotaArrival');
  hud.registry.remove('laNotaArrival');
  if (arrival !== 'natural' && arrival !== 'skip') {
    onControl();
    return;
  }

  const layer = hdLayer(hud);
  const objective = layer.el('div', {
    text: 'Investiga a La Banca. Consigue pruebas y regresa.',
    x: 48, y: 222, width: 384, height: 23,
    style: { background: '#141022ed', color: '#f4edf0', font: '600 13px/23px "Barlow Condensed", sans-serif',
      textAlign: 'center', borderBottom: '1px solid #7fd6e0' },
  });
  objective.setAttribute('role', 'status');
  const releaseControl = () => {
    onControl();
    hud.time.delayedCall(6000, () => objective.remove());
  };
  if (arrival === 'skip') {
    releaseControl();
    return;
  }

  hud.scene.pause('GameScene');
  const surface = layer.el('div', { width: 480, height: 270, style: { background: '#211537' } });
  const title = layer.el('div', {
    text: 'EL REVERSO', x: 24, y: 159, width: 432, height: 32,
    style: { textAlign: 'center', color: '#e6e9ff', font: '22px Silkscreen, monospace',
      textShadow: '0 2px 2px #130e26, 0 0 8px #130e26' },
  });
  const skip = layer.el('button', { text: 'Saltar · Esc', x: 421, y: 0, width: 56, height: 15, interactive: true,
    style: { background: '#0c0e19', color: '#ebe7f4', border: '0', cursor: 'pointer', font: '10px "Barlow Condensed", sans-serif' } });
  objective.style.zIndex = '1';
  const calm = reducedMotion(settings.get().reducedMotion);
  hud.tweens.addCounter({ from: 0, to: 1, duration: 800, onUpdate: tween => {
    const p = tween.getValue() ?? 0;
    if (calm) surface.style.opacity = String(1 - p);
    else surface.style.maskImage = `radial-gradient(ellipse at 50% 53%, transparent ${p * 138}%, #000 ${p * 138 + 10}%)`;
  }, onComplete: () => surface.remove() });
  hud.time.delayedCall(2400, () => title.remove());

  let released = false;
  const key = (e: KeyboardEvent) => {
    if (e.key !== 'Escape' && e.key !== 'Enter') return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (!e.repeat) finish();
  };
  const finish = () => {
    if (released) return;
    released = true;
    window.removeEventListener('keydown', key, true);
    skip.remove();
    surface.remove();
    title.remove();
    hud.scene.resume('GameScene');
    releaseControl();
  };
  skip.onclick = finish;
  window.addEventListener('keydown', key, true);
  hud.events.once(Phaser.Scenes.Events.SHUTDOWN, () => window.removeEventListener('keydown', key, true));
  hud.time.delayedCall(5000, finish);
}
