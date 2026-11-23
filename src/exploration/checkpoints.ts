// Dominio: vicho (V07 + V08). Hogueras estilo souls (objetos type "checkpoint" de Tiled): E cerca = descansar.
// Descansar: enciende la hoguera, guarda el punto, cura y emite checkpoint:reached. Morir: reaparece en la última.
// SUP-vicho-20261123-121240: tecla E local hasta que exista la acción 'interact' en Input (shared).
import Phaser from 'phaser';
import { bus } from '../core/EventBus';
import { GameState } from '../core/GameState';

const REACH = 24;
const RESPAWN_MS = 2200; // deja ver «HAS MUERTO» (seba) antes de reaparecer

/** Punto de suelo del jugador con cuerpo Arcade dinámico. */
type Ground = Phaser.GameObjects.GameObject & { x: number; y: number };
const place = (p: Ground, x: number, y: number) => (p.body as Phaser.Physics.Arcade.Body).reset(x, y);

/** Hoguera: anillo de piedras, espada clavada y llama (oculta hasta encenderla). */
function drawBonfire(scene: Phaser.Scene, x: number, y: number) {
  const base = scene.add.graphics().setDepth(y);
  base.fillStyle(0x16121a, 0.6).fillEllipse(x, y, 26, 10);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    base.fillStyle(i % 2 ? 0x5d5872 : 0x7a7494).fillRect(Math.round(x + Math.cos(a) * 10) - 2, Math.round(y + Math.sin(a) * 4) - 2, 4, 3);
  }
  base.fillStyle(0x2a2420).fillRect(x - 5, y - 2, 10, 3); // ceniza
  base.fillStyle(0x9aa3ad).fillRect(x - 1, y - 16, 2, 14); // hoja clavada
  base.fillStyle(0x6b5a4a).fillRect(x - 3, y - 18, 6, 2).fillRect(x - 1, y - 22, 2, 4); // guarda y empuñadura
  const glow = scene.add.circle(x, y - 4, 26, 0xff8a3d, 0).setDepth(y - 1).setBlendMode(Phaser.BlendModes.ADD);
  const flame = scene.add.graphics().setDepth(y + 1).setVisible(false);
  flame.fillStyle(0xff6a3d).fillTriangle(x - 6, y - 1, x + 6, y - 1, x, y - 15);
  flame.fillStyle(0xffd75e).fillTriangle(x - 3, y - 1, x + 3, y - 1, x, y - 9);
  return { glow, flame };
}

export function installCheckpoints(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap, player: Ground, spawn: { x: number; y: number }): void {
  const fires = map.filterObjects('objects', (o) => o.type === 'checkpoint')!.map((o) => ({
    id: o.name, x: o.x!, y: o.y!, lit: false, ...drawBonfire(scene, o.x!, o.y!),
  }));
  const light = (f: (typeof fires)[number]) => {
    if (f.lit) return;
    f.lit = true;
    f.flame.setVisible(true);
    f.glow.setFillStyle(0xff8a3d, 0.18);
    scene.tweens.add({ targets: f.flame, scaleY: 1.15, duration: 180, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    scene.tweens.add({ targets: f.glow, alpha: 0.6, duration: 420, yoyo: true, repeat: -1 });
  };

  // Al cargar partida: hoguera guardada encendida y el jugador aparece ahí.
  const saved = fires.find((f) => f.id === GameState.data.checkpointId);
  if (saved) { light(saved); place(player, saved.x, saved.y + 10); }

  const hint = scene.add.text(0, 0, 'E  descansar', { fontFamily: 'monospace', fontSize: '8px', color: '#ffd75e' })
    .setOrigin(0.5, 1).setDepth(1e5).setVisible(false);
  let pressed = false;
  const onE = () => { pressed = true; };
  scene.input.keyboard!.on('keydown-E', onE);

  const onUpdate = () => {
    const near = fires.find((f) => Phaser.Math.Distance.Between(player.x, player.y, f.x, f.y) < REACH);
    const wants = pressed;
    pressed = false;
    hint.setVisible(!!near);
    if (!near) return;
    hint.setPosition(near.x, near.y - 24);
    if (!wants) return;
    light(near);
    GameState.data.checkpointId = near.id;
    // shortcut: cura en el guardado; el HUD (seba) lo verá al recargar. Falta un evento de curación (shared).
    GameState.data.hp = GameState.data.maxHp;
    GameState.save();
    scene.cameras.main.flash(300, 255, 170, 90);
    bus.emit('checkpoint:reached', { id: near.id });
    // PEN-vicho V08: aquí reaparecerán los enemigos (falta contrato world:reset / resetEnemies con basti).
  };

  const onDied = () => {
    scene.time.delayedCall(RESPAWN_MS, () => {
      const f = fires.find((c) => c.id === GameState.data.checkpointId);
      place(player, f ? f.x : spawn.x, f ? f.y + 10 : spawn.y);
      GameState.data.hp = GameState.data.maxHp;
      GameState.save();
      bus.emit('player:respawned', {});
    });
  };

  scene.events.on(Phaser.Scenes.Events.UPDATE, onUpdate);
  bus.on('player:died', onDied, hint);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.events.off(Phaser.Scenes.Events.UPDATE, onUpdate);
    scene.input.keyboard?.off('keydown-E', onE);
    bus.offContext(hint);
  });
}
