---
id: HIS-vicho-20261123-135913
type: history
owner: vicho
agent: gpt
created: 2026-11-23T16:59:13.992Z
title: obstaculos transicion bioma e integracion habilidades
status: partial          # pass | fail | partial
commit: e0527be          # hash del commit de código
refs: [PEN-vicho-20261123-131916, PEN-vicho-20261123-131917, PEN-vicho-20261123-131918, PEN-basti-20261123-134311, SUP-vicho-20261123-133345] # PEN-/SUP-/HIS- relacionados
---

## Objetivo

Integrar y verificar las mecánicas disponibles del equipo, suavizar los cruces de bioma y agregar obstáculos en pixel art dentro de zonas transitables.

## Cambios
- `src/scenes/GameScene.ts`: avanza `character.abilities.update(dt)` y colisiona al héroe con obstáculos estáticos.
- `src/world/obstacles.ts`: instala árboles, rocas, tumbas, cristales, lava, basalto y troncos como sólidos Arcade por bioma.
- `src/world/props.ts`: suma un quinto tipo de prop en cada bioma, con variantes pixel art.
- `src/world/ambience.ts`: añade velo de color breve al cambiar de bioma (SUP-vicho-20261123-133345).

## Comandos y resultados
```text
$ npm.cmd run build -> pass
$ npm.cmd test -> pass, 18 files / 97 tests
$ npx.cmd playwright test --config playwright.local.tmp.config.ts tests/e2e/exploration-secrets.spec.ts tests/e2e/smoke.spec.ts -> pass (2/2)
$ npx.cmd playwright test --config playwright.local.tmp.config.ts tests/e2e/abilities-marks.spec.ts -> fail (4/4, PEN-basti-20261123-134311)
```

## Tests
| test | resultado | nota |
|---|---|---|
| build | pass | TypeScript estricto y Vite verdes |
| unit | pass | 97 pruebas |
| e2e mundo | pass | smoke y secretos |
| e2e marcas | fail | ciclo de habilidades no actualizado en RoomPrototype de Basti |

## Observaciones

`origin/main` ya era ancestro de `vicho/mundo-abierto`: el teletransporte de Alejandro estaba integrado. Los archivos locales `.claude/settings.local.json` y `playwright.local.tmp.config.ts` se preservaron sin añadirlos.

## Siguiente paso

Esperar/corroborar el arreglo de PEN-basti-20261123-134311, volver a ejecutar el E2E completo y entonces publicar con ship. V28 (mapas aleatorios) y la persistencia de cofres siguen pendientes.
