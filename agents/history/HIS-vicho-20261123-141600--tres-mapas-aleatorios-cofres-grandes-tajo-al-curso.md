---
id: HIS-vicho-20261123-141600
type: history
owner: vicho
agent: claude
created: 2026-11-23T17:16:00.541Z
title: tres mapas aleatorios cofres grandes tajo al cursor
status: partial          # pass | fail | partial
commit: fde754f, b9051e7 # hash del commit de código
refs: [PEN-vicho-20261123-131920, PEN-basti-20261123-134311, HIS-vicho-20261123-135913]
---

## Objetivo
V28 (2 mapas más, al azar en nuevo juego), cofres más grandes, tajo de espada hacia el cursor (pedido explícito del humano: "hazlo nomas en mi rama", aunque RoomPlayer es de basti).

## Cambios
- `src/world/tools/genWorld.mjs`: arg variante 1|2|3. 2 = espejo X, 3 = espejo Y (recalcula cara/tapa de muros); ambos cambian paleta forest↔redforest. Obstáculos ahora salen como objetos `obstacle` del mapa (se transforman con el espejo).
- `public/assets/maps/world.json` (+10 obstáculos, capas idénticas), `world-2.json`, `world-3.json`.
- `src/world/index.ts`: `preloadWorld` elige mapa al azar si `registry.newGame`, lo recuerda en localStorage `mafiadev.map` para Continuar; `?map=N` lo fuerza; borra la caché 'world' antes de cargar.
- `src/world/obstacles.ts`: eliminado FALLBACK_LAYOUT (lo da el mapa).
- `src/exploration/chests.ts`: cofre 22x19 (antes 16x14), REACH 26.
- `src/player/room-prototype/RoomPlayer.ts` (basti): `aim()` = dirección al cursor (positionToCamera); usado al pulsar/soltar y en la pose de carga.
- tests e2e: world-zones y exploration-secrets corren en mapas 1..3; player-room-prototype hace clic sobre el muñeco.

## Comandos y resultados
```text
$ node src/world/tools/genWorld.mjs 1|2|3   → tiles jugables 9893, asserts OK
$ npm run build   → ok
$ npm test        → 97/97
$ npx playwright test -c playwright.local.tmp.config.ts   (puerto 5183; el server en 8080 era viejo y colgaba todo)
```

## Tests
| test | resultado | nota |
|---|---|---|
| unit | 97 pass | |
| world-zones mapas 1-3 | pass | |
| exploration-secrets mapas 1-3 | pass | |
| player-room-prototype espada/carga | pass | tras ajustar clics al muñeco |
| abilities-game, abilities-marks (4) | fail | preexistente: PEN-basti-20261123-134311 |
| player-lateral-movement (3) | fail | preexistente (falla igual en HEAD limpio 4e9b8e4); queda en lista de revisión de mecánicas |

## Observaciones
`npm run ship` no sirve en esta rama: incluye archivos de basti del merge de feature/basti-movement-combat → guarda de dominio. Se hizo `git push` de la rama sin PR.

## Siguiente paso
Lote de mecánicas pedido por el humano: mapeo de botones duplicados, ulti apuntable con ratón mientras se mantiene, TP apuntado al cursor, enemigos por zona/densidad por bioma, título de bioma 4 s.
