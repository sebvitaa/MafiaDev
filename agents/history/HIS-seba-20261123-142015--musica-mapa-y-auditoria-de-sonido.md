---
id: HIS-seba-20261123-142015
type: history
owner: seba
agent: claude
created: 2026-11-23T17:20:15.475Z
title: musica-mapa-y-auditoria-de-sonido
status: pass
commit: 5265288
refs: [PEN-basti-20261123-142015, PEN-vicho-20261123-142015, PEN-seba-20261123-113139]
---

## Objetivo
La música se apagaba al abrir el mapa. Además, listar qué acciones y enemigos no tienen sonido.

## Cambios
- Causa: M era a la vez el silencio global (`src/ui/globalKeys.ts`, seba) y el mapa grande (`src/world/bigMap.ts`, vicho). F chocaba igual: pantalla completa contra viaje rápido.
- `src/ui/globalKeyCodes.ts` (nuevo, puro): en el juego el silencio es 0 y no hay F; en menús, 0/M silencian y F pone pantalla completa.
- `src/ui/globalKeys.ts`: usa `globalKeyCodes(inGame)`. `src/ui/index.ts`: `installGlobalKeys(scene, { inGame: true })`.
- `src/ui/ControlsPanel.ts`: SILENCIO [0]. `src/scenes/PreloadScene.ts`: consejo «0 silencia el juego. M abre el mapa».
- `tests/unit/seba-global-keys.test.ts` (nuevo).

## Comandos y resultados
```text
$ npm run build → ok · npm test → 19 archivos, 99 passed
Playwright ad hoc (5180): M → mapa abierto, music-zone1 sigue, muted=false, el jugador se mueve; 0 → muted=true; 0 → muted=false
$ npx playwright test seba-menus smoke world-zones exploration-secrets --workers=1 → 4 passed
```

## Tests
| test | resultado | nota |
|---|---|---|
| build | pass | |
| vitest | pass | 99/99 |
| e2e relacionados | pass | 4/4 |

## Observaciones
Auditoría de sonido en el juego integrado: el jugador cenital no emite eventos (PEN-basti), no hay enemigos, la exploración tiene acciones sin evento (PEN-vicho) y el teleport no tiene SFX propio (PEN-seba-20261123-113139).

## Siguiente paso
Mapear SFX del teleport (pendiente propio). Cuando basti y vicho emitan los eventos, el AudioDirector ya tiene los sonidos.
