// Dominio: vicho — composition root (SUP-seba-20261123-084249). SIN lógica de juego aquí:
// cada dominio se engancha con su install*() exportado desde su index.ts.
import Phaser from 'phaser';
import { installAmbience, installCamera, installMapViews, installWorld, preloadWorld } from '../world';
import { installExploration, stageStart } from '../exploration';
import { installCharacter } from '../character';
import type { Player } from '../player';
import { RoomPlayer } from '../player/room-prototype/RoomPlayer';
import { SwordPickup } from '../player/room-prototype/SwordPickup';
import { installAudio } from '../audio';
import { installUi } from '../ui';

export class GameScene extends Phaser.Scene {
  /** Público para tests e2e (tests/e2e/smoke.spec.ts). */
  player!: Player;

  constructor() {
    super('GameScene');
  }

  /** Escenario elegido en JUGAR (seba). CONTINUAR no lo pasa: se usa la hoguera guardada. */
  private stage: number | null = null;

  init(data?: { stage?: number }): void {
    this.stage = data?.stage ?? null;
  }

  preload(): void {
    preloadWorld(this);
  }

  create(): void {
    const world = installWorld(this);
    const character = installCharacter(this, 'luchador');
    // PROVISIONAL (vicho, rama vicho/mundo-abierto): jugador cenital del lab de basti hasta que exponga
    // su install*() (PEN-basti pendiente). Volver a installPlayer cuando exista.
    const hero = new RoomPlayer(this, world.spawn.x, world.spawn.y, character.stats);
    this.physics.add.collider(hero.anchor, world.solids);
    // Espadas de prueba del lab en los objetos type "sword" del mapa.
    const swords = world.map.filterObjects('objects', (o) => o.type === 'sword')!.map((o) => new SwordPickup(this, o.x!, o.y!));
    const tick = (t: number, dt: number) => {
      hero.update(dt);
      if (swords.some((s) => s.update(t, hero.anchor.x, hero.anchor.y))) hero.equipSword();
    };
    // Personaje más pequeño que en el lab (pensado para 960x600); el juego es 480x270 a lo Titan Souls.
    const SCALE = 0.6;
    hero.visual.setScale(SCALE);
    (hero.anchor.body as Phaser.Physics.Arcade.Body).setSize(9, 5);
    const sync = () => { hero.sync(); hero.shadow.setScale(hero.shadow.scaleX * SCALE); };
    this.events.on(Phaser.Scenes.Events.UPDATE, tick);
    this.events.on(Phaser.Scenes.Events.POST_UPDATE, sync);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off(Phaser.Scenes.Events.UPDATE, tick);
      this.events.off(Phaser.Scenes.Events.POST_UPDATE, sync);
    });
    // shortcut: tipado como Player lateral para no romper el typecheck de tests de basti; en runtime es el punto de suelo (x/y). Quitar al integrar.
    this.player = hero.anchor as unknown as Player;
    installCamera(this, hero.anchor); // sigue el punto de suelo, no el sprite que sube al saltar
    const { fog } = installExploration(this, world, hero.anchor);
    const start = this.stage ? stageStart(world.map, this.stage) : null;
    if (start) (hero.anchor.body as Phaser.Physics.Arcade.Body).reset(start.x, start.y);
    const mapCams = installMapViews(this, world.map, hero.anchor, fog);
    installAmbience(this, world.map, hero.anchor, mapCams);
    installAudio(this);
    installUi(this);
  }
}
