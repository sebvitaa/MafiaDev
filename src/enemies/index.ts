// Dominio: basti — IA de enemigos y minijefe. Stats en src/data/enemies.json.
// Contrato previsto: spawnEnemy(scene, kind, x, y), llamado por exploration al leer objetos de Tiled.
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
