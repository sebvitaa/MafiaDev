// Dominio: vicho (V21 + V22). Ambientación souls: viñeta oscura en la cámara principal (suave en la zona luminosa)
// y partículas según el bioma bajo el jugador: polvo (ruinas), luciérnagas (bosque), pétalos (luminosa), brasas (arena).
import Phaser from 'phaser';

const DOT = 'amb-dot';

type Biome = 'ruins' | 'forest' | 'bright' | 'arena';
const BIOMES: Biome[] = ['ruins', 'forest', 'bright', 'arena']; // fila del tileset = (gid-1)/8 (ver biomeTiles.ts)

const PARTICLES: Record<Biome, Phaser.Types.GameObjects.Particles.ParticleEmitterConfig> = {
  ruins: { tint: 0x9a97ad, frequency: 140, lifespan: 5000, speedX: { min: -6, max: 6 }, speedY: { min: -4, max: 4 }, alpha: { start: 0.5, end: 0 } },
  forest: { tint: [0xd8ff7a, 0xfff3a0], frequency: 200, lifespan: 3500, speedX: { min: -12, max: 12 }, speedY: { min: -12, max: 12 }, alpha: { start: 1, end: 0 }, blendMode: Phaser.BlendModes.ADD },
  bright: { tint: [0xff7eb6, 0xffd75e, 0xffffff], frequency: 90, lifespan: 4500, speedX: { min: 8, max: 22 }, speedY: { min: 4, max: 14 }, rotate: { min: 0, max: 360 }, alpha: { start: 0.9, end: 0.2 } },
  arena: { tint: [0xff6a3d, 0xffb36b], frequency: 50, lifespan: 2600, speedX: { min: -8, max: 8 }, speedY: { min: -40, max: -18 }, alpha: { start: 1, end: 0 }, blendMode: Phaser.BlendModes.ADD },
};
const VIGNETTE: Record<Biome, number> = { ruins: 0.3, forest: 0.35, bright: 0.08, arena: 0.4 }; // suave: no tapar la pantalla

export function installAmbience(
  scene: Phaser.Scene,
  map: Phaser.Tilemaps.Tilemap,
  player: { x: number; y: number },
  hiddenFrom: Phaser.Cameras.Scene2D.Camera[],
): void {
  if (!scene.textures.exists(DOT)) {
    const g = scene.add.graphics().fillStyle(0xffffff).fillRect(0, 0, 2, 2);
    g.generateTexture(DOT, 2, 2);
    g.destroy();
  }
  const cam = scene.cameras.main;
  const view = new Phaser.Geom.Rectangle(0, 0, 1, 1);
  const emitters = Object.fromEntries(BIOMES.map((b) => [b, scene.add.particles(0, 0, DOT, {
    ...PARTICLES[b], quantity: 1, emitting: false, emitZone: { type: 'random', source: { getRandomPoint: (p: Phaser.Types.Math.Vector2Like) => { p.x = view.x + Math.random() * view.width; p.y = view.y + Math.random() * view.height; } } },
  }).setDepth(9e4)])) as Record<Biome, Phaser.GameObjects.Particles.ParticleEmitter>;
  for (const c of hiddenFrom) c.ignore(Object.values(emitters));

  const vignette = cam.filters.external.addVignette(0.5, 0.5, 0.75, VIGNETTE.ruins);
  let biome: Biome | null = null;

  const onUpdate = () => {
    const tile = map.getTileAtWorldXY(player.x, player.y, false, cam, 'ground');
    const b = tile ? BIOMES[Math.floor((tile.index - 1) / 8)] : undefined;
    if (b && b !== biome) {
      if (biome) emitters[biome].stop();
      emitters[b].start();
      scene.tweens.add({ targets: vignette, strength: VIGNETTE[b], duration: 900 });
      biome = b;
    }
    // La zona de emisión cubre lo que ve la cámara (en coordenadas de mundo).
    view.setTo(cam.worldView.x, cam.worldView.y, cam.worldView.width, cam.worldView.height);
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, onUpdate);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.UPDATE, onUpdate));
}
