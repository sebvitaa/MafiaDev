---
id: HIS-vicho-20261123-123651
type: history
owner: vicho
agent: claude
created: 2026-11-23T15:36:55Z
title: mapa irregular hogueras zonas niebla minimapa ambientacion
status: pass
commit: 6e4aa1a
refs: [PEN-vicho-20261123-102354, PEN-vicho-20261123-105110, PEN-vicho-20261123-105116, PEN-vicho-20261123-105117, PEN-vicho-20261123-105118, PEN-vicho-20261123-105124, PEN-vicho-20261123-105125, PEN-vicho-20261123-105126, PEN-vicho-20261123-105133, PEN-vicho-20261123-105135, PEN-vicho-20261123-105137]
---

## Objetivo
Pedido de vicho: mapa NO rectangular, irregular e interconectado (pasillos/túneles); seguir con tareas faltantes.

## Cambios
- `src/world/tools/genWorld.mjs` (Codex) → `public/assets/maps/world.json`: 240x180, 11 regiones orgánicas, hub, 2 ciclos, túnel único a la arena, zona luminosa única en esquina; valida conectividad 100%. Ajuste mío: chest4/chest6 no se superponen con hogueras.
- `src/exploration/zones.ts`, `visited.ts` + tests (Codex): zoneAt/roomAt, VisitedGrid.
- `src/exploration/index.ts`: zonas → zone:changed / room:entered (tutorial).
- `src/exploration/checkpoints.ts`: hogueras (E descansar): enciende, guarda checkpointId, cura en GameState, flash, checkpoint:reached; player:died → reaparece en la última hoguera y emite player:respawned.
- `src/exploration/fog.ts`: niebla de guerra en celdas de 64 px, persistida en visitedRooms.
- `src/world/bigMap.ts`: minimapa arriba-izquierda (N) + mapa grande (M), ambos con niebla.
- `src/world/ambience.ts`: viñeta por bioma (luminosa 0.15, arena 0.65) y partículas por bioma.
- `src/world/biomeTiles.ts`: arena con grietas cortas y sangre seca (sin patrones de grilla).
- `tests/e2e/world-zones.spec.ts`: V13.

## Comandos y resultados
```text
npm run build → ok   ·   npm test → 12 files, 74 tests passed
playwright (config temporal puerto 5183, workers 1) → 13 passed, 3 failed
  fallan solo tests/e2e/player-lateral-movement.spec.ts (3): esperan el Player lateral; en esta rama GameScene usa el RoomPlayer cenital (provisorio).
```

## Tests
| test | resultado | nota |
|---|---|---|
| unit exploration-zones / visited (Codex) | pass | 8 tests |
| e2e world-zones (V13) | pass | room:entered tutorial, checkpoint:reached cp1, zone:changed zone2, respawn en cp1 |
| e2e smoke + room-prototype + seba | pass | |
| e2e player-lateral-movement | fail (esperado) | incompatible con la integración cenital provisoria |

## Observaciones
- Commits reordenados antes de publicar (972e621..6e4aa1a); typecheck del e2e corregido antes del commit final.
- Curación al descansar solo en GameState: el HUD no se refresca hasta recargar (falta evento de curación, shared).
- Reaparición de enemigos al descansar/morir pendiente de contrato con basti.

## Siguiente paso
V16 cofres ocultos, V17 atajos, V18 carteles, V20 coleccionables, V23 viaje rápido. Bloqueados por basti: V09 spawns de enemigos, V11 arena del jefe.
