---
id: HIS-vicho-20261123-143041
type: history
owner: vicho
agent: gpt
created: 2026-11-23T17:30:41.446Z
title: enemigos por zona y densidad por bioma
status: partial          # pass | fail | partial
commit:                  # hash del commit de código
refs: [SUP-vicho-20261123-142549, PEN-vicho-20261123-105118]                 # PEN-/SUP-/HIS- relacionados
---

## Objetivo

Integrar los enemigos de basti en el mundo abierto con spawns Tiled por bioma y activación perezosa cerca de cámara.

## Cambios
- `src/world/tools/genWorld.mjs`, `public/assets/maps/world*.json`: spawns `enemy_spawn` protegidos y espejados en las tres variantes.
- `src/world/encounters.ts`, `src/scenes/GameScene.ts`: EnemySystem, targets de espada, colisiones y activación a 480 px.
- `src/world/encounterDensity.ts`, `tests/unit/world-encounters.test.ts`: pools de bioma testeables.
- `tests/e2e/{world-zones,exploration-secrets,smoke}.spec.ts`: modo determinista `noEnemies=1`.

## Comandos y resultados
```text
$ npm.cmd run build
pass (tsc --noEmit + Vite)
$ npm.cmd test
20 files, 107 tests passed
$ npx.cmd playwright test -c playwright.local.tmp.config.ts tests/e2e/world-zones.spec.ts tests/e2e/exploration-secrets.spec.ts tests/e2e/smoke.spec.ts
parcial: las dos primeras variantes de exploration-secrets pasaron; el runner local fue interrumpido por ENOENT de artefactos Playwright, sin aserción de juego fallida.
$ git commit -m "feat(world): enemigos por zona y densidad por bioma"
bloqueado: sandbox deniega crear .git/index.lock.
```

## Tests
| test | resultado | nota |
|---|---|---|
| build | pass | TypeScript y bundle correctos |
| unit | pass | 107 pruebas |
| e2e indicado | partial | runner/artefactos locales bloquean el cierre completo |

## Observaciones

SUP-vicho-20261123-142549 documenta 1/90 ruins, 1/155 forest, 1/52 redforest, 1/950 bright y arena sin enemigos. V08 sigue pendiente: no se implementó el respawn de enemigos muertos.

## Siguiente paso

Ejecutar los e2e en una sesión sin procesos Playwright residuales y hacer los dos commits solicitados cuando el sandbox permita escribir `.git/index.lock`.
