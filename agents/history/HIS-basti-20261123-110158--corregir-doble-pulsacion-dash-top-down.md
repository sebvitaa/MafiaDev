---
id: HIS-basti-20261123-110158
type: history
owner: basti
agent: gpt
created: 2026-11-23T14:01:58.097Z
title: corregir doble pulsacion dash top-down
status: pass             # pass | fail | partial
commit:                  # hash del commit de código
refs: [SUP-basti-20261123-110158]
---

## Objetivo
Corregir el doble toque WASD del dash del prototipo tras el reporte de que no respondía con el ritmo del jugador.

## Cambios
- `src/data/tuning.json`: ventana de doble toque 230→350 ms.
- `src/player/room-prototype/RoomPlayer.ts`: referencia al supuesto de ventana de entrada.
- `src/player/room-prototype/index.html`, `README.md`: instrucciones reflejan 350 ms.
- `tests/unit/player-double-tap.test.ts`: regresión unitaria a 300 ms.
- `tests/e2e/player-room-prototype.spec.ts`: regresión en Chromium a 300 ms y comprobación de dirección mientras otra tecla está pulsada.

## Comandos y resultados
```text
$ npx vitest run tests/unit/player-double-tap.test.ts
FAIL esperado antes de ampliar ventana: 300 ms excedía los 230 ms.
$ npm run typecheck
PASS
$ npm test
PASS 46/46
$ npm run test:e2e
PASS 11/11 (incluye doble toque separado por 300 ms)
$ npm run build
PASS (tsc --noEmit + Vite)
$ git diff --check
PASS
```

## Tests
| test | resultado | nota |
|---|---|---|
| Vitest unitario | PASS 46/46 | Doble toque 300 ms ahora activa el dash |
| Playwright E2E | PASS 11/11 | Dashea hacia D, no hacia otra dirección mantenida |
| typecheck/build | PASS | Phaser 4 + TypeScript |

## Observaciones
<!-- comportamiento observado en playtest, métricas, warnings -->
La suite E2E pasó en Chromium. Avisos no bloqueantes de entorno `NO_COLOR` junto con `FORCE_COLOR`.

## Siguiente paso
Probar en `http://localhost:8080/src/player/room-prototype/` con dos taps de la misma tecla (incluyendo pausa de unos 300 ms); recargar la página para tomar el ajuste HMR. Sin commit/push.
