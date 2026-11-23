// Dominio: alejandro — registro de habilidades y cooldowns por slot.
import type Phaser from 'phaser';
import { bus } from '../core/EventBus';
import type { AbilitySlots } from '../types/character';
import { Teleport } from './Teleport';
import { TimeStop } from './TimeStop';
import { SoulBolt } from './SoulBolt';
export { registerTeleportTarget } from './TeleportTarget';

export interface Ability {
  id: string;
  cooldownMs: number;
  /** Devuelve false si no pudo ejecutarse; no consume cooldown. */
  activate(scene: Phaser.Scene): boolean;
  install?(scene: Phaser.Scene, requestActivation: () => boolean, remainingCooldownMs: () => number): void;
  update?(scene: Phaser.Scene, dtMs: number): void;
  destroy?(): void;
}

const factories: Record<string, () => Ability> = { teleport: () => new Teleport(), time_stop:()=>new TimeStop(), soul_bolt:()=>new SoulBolt() };

export function createAbilitySlots(scene: Phaser.Scene, ids: readonly string[]): AbilitySlots {
  const slots = ids.map((id) => factories[id]?.() ?? null);
  const cooldowns = new Map<Ability, number>();
  const result: AbilitySlots = {
    tryActivate(slot): boolean {
      const ability = slots[slot];
      if (!ability || (cooldowns.get(ability) ?? 0) > 0) return false;
      if (!ability.activate(scene)) return false;
      cooldowns.set(ability, Math.max(0, ability.cooldownMs));
      bus.emit('ability:used', { id: ability.id });
      return true;
    },
    update(dtMs): void {
      const elapsed = Number.isFinite(dtMs) ? Math.max(0, dtMs) : 0;
      for (const [ability, remaining] of cooldowns) {
        if (remaining <= 0) continue;
        const next = Math.max(0, remaining - elapsed);
        cooldowns.set(ability, next);
        if (next === 0) bus.emit('ability:ready', { id: ability.id });
      }
      for (const ability of slots) ability?.update?.(scene, elapsed);
    },
  };
  slots.forEach((ability, index) => {
    if (!ability || index > 1) return;
    ability.install?.(scene, () => result.tryActivate(index as 0 | 1), () => cooldowns.get(ability) ?? 0);
  });
  scene.events.once('shutdown', () => {
    for (const ability of slots) ability?.destroy?.();
    cooldowns.clear();
  });
  return result;
}
