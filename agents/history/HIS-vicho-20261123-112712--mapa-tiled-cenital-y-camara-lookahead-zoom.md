---
id: HIS-vicho-20261123-112712
type: history
owner: vicho
agent: claude
created: 2026-11-23T14:27:12.902Z
title: mapa tiled cenital y camara lookahead zoom
status: pass
commit: 5a0fb62
refs: [PEN-vicho-20261123-105111, PEN-vicho-20261123-105113, PEN-vicho-20261123-105114, PEN-vicho-20261123-105115, SUP-vicho-20261123-105154, PEN-basti-20261123-112707]
---

## Objetivo
V02 (provisorio), V03, V04 y V05: mundo abierto cenital cargado desde Tiled y cámara estilo Titan Souls con alejamiento en combate.

## Cambios
- `public/assets/maps/world.json`: mapa Tiled 200x150 (generado por Codex, revisado): capas ground/walls/objects; spawn, zonas zone1/zone2/boss/tutorial, 4 checkpoints, 6 cofres, boss_arena.
- `src/world/index.ts`: carga el mapa, tileset provisorio generado en runtime, colisión con capa walls, spawn desde objeto, gravedad de mundo 0 (SUP-vicho-20261123-105154). `World.solids` pasa a TilemapLayer; se añade `map`.
- `src/world/camera.ts` + `cameraMath.ts` + `config.json`: follow con lerp, lookahead ~40 px suavizado, zoom por nivel de amenaza (explore 1 · combat 0.85 · miniboss 0.7 · boss 0.6). API `setCombatTier(scene, tier)`; `boss:phase` aleja y `zone:changed` fuera de boss restaura.
- `src/scenes/GameScene.ts`: `preload` del mapa e `installCamera` tras `installPlayer`.
- `tests/unit/world-camera.test.ts`: 3 tests de lógica pura.

## Comandos y resultados
```text
$ npm run build            → ok
$ npm test                 → 5 files, 18 tests passed
$ npx playwright test -c <config temporal puerto 5181>  → smoke 1 passed
  (con playwright.config.ts el smoke falla en ESTE PC: el puerto 8080 lo ocupa un servidor EnterpriseDB/Postgres local; falla igual en main)
```

## Tests
| test | resultado | nota |
|---|---|---|
| unit world-camera | pass | lookahead, suavizado independiente de fps |
| e2e smoke | pass | puerto 5181 |
| e2e temporal (no versionado) lookahead | pass | followOffset.x = -37.6 moviendo a la derecha |
| e2e temporal (no versionado) zoom jefe | pass | boss:phase → zoom 0.606; zone:changed zone1 → 0.994 |

## Observaciones
- Zoom no entero con pixelArt: los tiles se ven de tamaño desigual al alejar. Aceptable por ahora; revisar con arte real.
- El jugador de main sigue siendo lateral: sin gravedad no cae ni salta bien hasta que basti suba su versión cenital.
- installPlayer (basti) sigue llamando startFollow; installCamera lo pisa (PEN-basti-20261123-112707).

## Siguiente paso
V06 zonas (zoneAt + eventos) y V15 registro de exploración → delegar a Codex. Luego V07 checkpoints interactivos (tecla E local + SUP).
