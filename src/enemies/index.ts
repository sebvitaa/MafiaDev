// Dominio: basti — enemigos básicos y adaptador de encuentros.
export { Enemy, type EnemyPlayer } from './Enemy';
export { EnemySystem, type BasicEnemyKind } from './EnemySystem';
export { BodoqueBoss, type BodoqueBossHooks } from './BodoqueBoss';
export {
  BodoqueBrain,
  isPointInBodoqueAttack,
  type BodoqueAttackConfig,
  type BodoqueAttackId,
  type BodoqueConfig,
  type BodoquePoint,
  type BodoqueState,
} from './BodoqueBrain';
