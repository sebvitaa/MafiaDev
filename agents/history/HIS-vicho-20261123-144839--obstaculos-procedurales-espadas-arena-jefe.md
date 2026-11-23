---
id: HIS-vicho-20261123-144839
type: history
owner: vicho
agent: gpt
created: 2026-11-23T17:48:39.959Z
title: obstaculos procedurales espadas arena jefe
status: partial
commit:
refs: [PEN-vicho-20261123-144839]
---

## Objetivo

Sembrar obstáculos irregulares seguros en tres mapas, añadir tres espadas de inicio y enlazar la arena del jefe con `roomId=set`.

## Cambios

- `src/world/tools/genWorld.mjs`: clústeres deterministas por sala/bioma, exclusión de corredores y puntos, huellas verificadas con flood-fill; `sword2`, `sword3` y `boss.roomId`.
- `src/world/props.ts`: tocón, roca musgosa, tocón rojo, columna rota, calavera, obelisco y fragmento de cristal.
- `src/world/obstacles.ts`: colisión en la base (60% del ancho, 6–10 px alto).
- `public/assets/maps/world*.json`: regenerados. V1: ruins 36, forest 5, bright 6, redforest 16, arena 13; V2/V3 intercambian forest/redforest.

## Comandos y resultados

```text
$ node src/world/tools/genWorld.mjs 1|2|3
pass: asserts internos, 9893 tiles jugables
$ npm.cmd run build
pass: TypeScript y Vite
$ npm.cmd test
pass: 21 archivos, 109 tests
$ npx playwright test -c playwright.local.tmp.config.ts ...
parcial: smoke 1/1 pass; world-zones mapa 1 pass, mapas 2–3 ERR_CONNECTION_REFUSED al caer Vite local
```

## Tests

| test | resultado | nota |
|---|---|---|
| build | pass | TypeScript y Vite |
| unit | pass | 109/109 |
| e2e smoke | pass | 1/1 |
| e2e mapas | partial | PEN-vicho-20261123-144839 |

## Observaciones

No hubo commit, push, merge ni cambio de rama. `npm.ps1` está bloqueado por política local; se usó `npm.cmd`.

## Siguiente paso

Repetir la suite E2E con servidor local estable y cerrar PEN-vicho-20261123-144839.
