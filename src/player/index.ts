// Dominio: basti.
import Phaser from 'phaser';
import { Input } from '../core/Input';
import type { World } from '../world';
import type { Character } from '../character';
import { Player } from './Player';

export { Player };

export function installPlayer(scene: Phaser.Scene, world: World, character: Character): Player {
  const controls = new Input(scene);
  const player = new Player(scene, world.spawn.x, world.spawn.y, controls, character.stats, character.abilities);
  scene.physics.add.collider(player, world.solids);
  scene.cameras.main.startFollow(player, true, 0.1, 0.1);

  const onUpdate = (_t: number, dt: number) => {
    controls.update();
    player.tick(dt);
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, onUpdate);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.UPDATE, onUpdate));
  return player;
}
