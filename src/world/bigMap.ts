// Dominio: vicho (V14 + V24). Vistas de mapa: minimapa arriba a la izquierda (N lo muestra/oculta) y mapa
// grande (M lo abre/cierra). Ambas son cámaras extra que ven la niebla de guerra; la cámara principal no.
// SUP-vicho-20261123-121240: teclas M/N locales hasta que existan acciones en Input (shared).
import Phaser from 'phaser';

const MINI = { x: 6, y: 22, w: 92, h: 58, zoom: 0.11 }; // bajo los corazones del HUD (seba)

export function installMapViews(
  scene: Phaser.Scene,
  map: Phaser.Tilemaps.Tilemap,
  player: { x: number; y: number; body?: unknown },
  fog: Phaser.GameObjects.Graphics,
): Phaser.Cameras.Scene2D.Camera[] {
  const W = map.widthInPixels;
  const H = map.heightInPixels;
  const { width, height } = scene.scale;

  // --- mapa grande ---
  const zoom = Math.min((width - 24) / W, (height - 40) / H);
  const big = scene.cameras.add(0, 0, width, height).setZoom(zoom).setBackgroundColor('#07070d').setVisible(false);
  big.centerOn(W / 2, H / 2 + 8 / zoom);
  const bigMarker = scene.add.circle(0, 0, 6 / zoom, 0xffd75e).setStrokeStyle(1 / zoom, 0x07070d).setDepth(1e6);
  const title = scene.add.text(W / 2, -4 / zoom, 'MAPA  ·  M para cerrar', {
    fontFamily: 'monospace', fontSize: `${Math.round(8 / zoom)}px`, color: '#d8c69b',
  }).setOrigin(0.5, 1).setDepth(1e6);

  // --- minimapa ---
  const mini = scene.cameras.add(MINI.x, MINI.y, MINI.w, MINI.h).setZoom(MINI.zoom).setBackgroundColor('rgba(7,7,13,0.85)');
  mini.startFollow(player, true, 0.2, 0.2);
  // Flecha del color de la capucha del jugador, apuntando hacia donde se mueve (o se movió por última vez).
  const k = 1 / MINI.zoom;
  const miniMarker = scene.add.triangle(0, 0, 0, -4 * k, 3 * k, 3 * k, -3 * k, 3 * k, 0x61d2bd)
    .setStrokeStyle(k, 0x07070d).setDepth(1e6);
  let heading = 0;
  const frame = scene.add.graphics().setDepth(1e6);

  // Cada cámara ve solo sus marcadores; la principal no ve ninguno ni la niebla.
  scene.cameras.main.ignore([bigMarker, title, miniMarker, frame]);
  big.ignore([miniMarker, frame]);
  mini.ignore([bigMarker, title]);
  fog.setVisible(true);

  const keys = scene.input.keyboard!;
  let miniOn = true; // preferencia del jugador; el minimapa se oculta mientras el mapa grande está abierto
  const toggleBig = () => { big.setVisible(!big.visible); mini.setVisible(miniOn && !big.visible); };
  const toggleMini = () => { miniOn = !miniOn; mini.setVisible(miniOn && !big.visible); };
  keys.addCapture('TAB'); // sin esto el navegador mueve el foco fuera del canvas
  keys.on('keydown-TAB', toggleBig); // M es silencio global (seba)
  keys.on('keydown-N', toggleMini);

  const onUpdate = (time: number) => {
    const blink = 0.55 + 0.45 * Math.sin(time / 150);
    if (big.visible) bigMarker.setPosition(player.x, player.y).setAlpha(blink);
    if (mini.visible) {
      const vel = (player.body as { velocity?: { x: number; y: number } } | undefined)?.velocity;
      if (vel && Math.hypot(vel.x, vel.y) > 5) heading = Math.atan2(vel.y, vel.x) + Math.PI / 2;
      miniMarker.setPosition(player.x, player.y).setRotation(heading);
      const v = mini.worldView;
      frame.clear().lineStyle(2 / MINI.zoom, 0x5ee6d0, 0.9).strokeRect(v.x, v.y, v.width, v.height);
    }
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, onUpdate);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    keys.off('keydown-TAB', toggleBig);
    keys.off('keydown-N', toggleMini);
    scene.events.off(Phaser.Scenes.Events.UPDATE, onUpdate);
  });
  return [mini, big];
}
