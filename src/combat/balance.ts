import tuning from '../data/tuning.json';
import type { CharacterStats } from '../types/character';

// SUP-basti-20261123-133221: preservar stats en corazones y convertir a puntos al combatir.
export const balance = tuning.combat.balance;
export const playerMaxHp = (stats: Pick<CharacterStats, 'maxHp'>): number => stats.maxHp * balance.pointsPerHeart;
export const playerSwordDamage = (stats: Pick<CharacterStats, 'atk'>): number => stats.atk * balance.pointsPerAttackStat;
