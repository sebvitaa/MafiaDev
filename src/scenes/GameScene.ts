// Dominio: vicho — composition root (SUP-seba-20261123-084249). SIN lógica de juego aquí:
// cada dominio se engancha con su install*() exportado desde su index.ts.
import Phaser from 'phaser';
import { GameState } from '../core/GameState';
import { balance } from '../combat';
import { installAmbience, installAreaTitles, installCamera, installEncounters, installMapViews, installWorld, preloadWorld } from '../world';
import { installExploration, stageStart } from '../exploration';
import { installCharacter } from '../character';
import type { Player } from '../player';
import { RoomPlayer } from '../player/room-prototype/RoomPlayer';
import { safeSpawn } from '../player/room-prototype/safeSpawn';
import { SwordPickup } from '../player/room-prototype/SwordPickup';
import { installAudio } from '../audio';
import { installUi } from '../ui';
import { installGameStatus } from '../ui/gameStatus';
import { installBoss, type Boss } from '../world/boss';

export class GameScene extends Phaser.Scene {
  /** Público para tests e2e (tests/e2e/smoke.spec.ts). */
  player!: Player;
  hero!: RoomPlayer;
  boss?: Boss;
  combatTargets = () => this.targets();
  private targets: () => readonly (import('../player/room-prototype/SwordCombat').SwordDamageTarget & import('../player/room-prototype/FireballCombat').FireballDamageTarget)[] = () => [];

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
    const character = installCharacter(this, this.registry.get('classId') === 'mago' ? 'mago' : 'luchador');
    // PROVISIONAL (vicho, rama vicho/mundo-abierto): jugador cenital del lab de basti hasta que exponga
    // su install*() (PEN-basti pendiente). Volver a installPlayer cuando exista.
    let enemies: ReturnType<typeof installEncounters>;
    let boss: Boss | undefined;
    this.targets = () => [...(enemies?.targets ?? []), ...(boss?.targets ?? [])];
    const hero = new RoomPlayer(this, world.spawn.x, world.spawn.y, character.stats,
      () => [...(enemies?.targets ?? []), ...(boss?.targets ?? [])], character.abilities);
    this.physics.add.collider(hero.anchor, world.solids);
    this.physics.add.collider(hero.anchor, world.obstacles);
    enemies = installEncounters(this, hero, world);
    if(!this.registry.get('newGame')) {
      hero.health.maxHp=GameState.data.maxHp*balance.pointsPerHeart;
      hero.health.hp=GameState.data.hp*balance.pointsPerHeart;
      if(GameState.data.equipped.weapon)hero.equipSword();
    }
    GameState.data.maxHp=hero.maxHp/balance.pointsPerHeart;GameState.data.hp=Math.ceil(hero.hp/balance.pointsPerHeart);
    if(this.stage === 3)hero.equipSword();
    this.hero = hero;
    this.boss = boss = installBoss(this, hero, world);
    // Espadas de prueba del lab en los objetos type "sword" del mapa.
    const swords = world.map.filterObjects('objects', (o) => o.type === 'sword')!.map((o) => new SwordPickup(this, o.x!, o.y!));
    const tick = (t: number, dt: number) => {
      hero.update(dt);
      enemies?.update(dt);
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
    const { fog } = installExploration(this, world, hero.anchor);
    const start = this.stage ? stageStart(world.map, this.stage) : null;
    if (start) (hero.anchor.body as Phaser.Physics.Arcade.Body).reset(start.x, start.y);
    const safe=safeSpawn(hero.anchor,world.bounds.width,world.bounds.height,(x,y)=>
      !world.solids.getTilesWithinWorldXY(x-6,y-5,12,10).some(t=>t.collides)
      && !world.obstacles.getChildren().some(o=>{const b=(o as Phaser.GameObjects.GameObject).body as Phaser.Physics.Arcade.StaticBody;return b&&x+6>b.x&&x-6<b.right&&y+5>b.y&&y-5<b.bottom;}));
    hero.body.reset(safe.x,safe.y);hero.motion.velocity={x:0,y:0};hero.sync();
    installCamera(this, hero.anchor);
    this.cameras.main.setZoom(this.stage===3?0.5:0.75).centerOn(safe.x,safe.y);
    if(this.stage===3)GameState.data.checkpointId='cp4';
    const mapCams = installMapViews(this, world.map, hero.anchor, fog);
    installAmbience(this, world.map, hero.anchor, mapCams);
    installAreaTitles(this, world.map, hero.anchor, mapCams);
    installAudio(this);
    installUi(this);
    installGameStatus(this, hero.fireball);
  }
}
