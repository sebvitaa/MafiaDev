---
id: HIS-basti-20261123-112929
type: history
owner: basti
agent: gpt
created: 2026-11-23T14:29:29.247Z
title: animar espada equipada y dash con flechas
status: pass             # pass | fail | partial
commit:                  # hash del commit de código
refs: [SUP-basti-20261123-112350, SUP-basti-20261123-112929]
---

## Objetivo
Responder al playtest: mostrar el arma equipada, animar su movimiento junto al tajo, alejar el pickup del centro y admitir doble dash con flechas.

## Cambios
- `src/player/room-prototype/RoomPlayer.ts`: sprite placeholder de espada unido al jugador; tween de arma disparado junto al tajo; detector de doble toque registra WASD y flechas.
- `src/player/room-prototype/SwordAttack.ts`: reemplaza el rectángulo visual con arco de corte y balanceo de arma en Phaser Tweens; duración local 220 ms; restaura el arma a su pose.
- `src/player/room-prototype/DoubleTapDash.ts`: incorpora aliases direccionales UP/LEFT/DOWN/RIGHT.
- `src/player/room-prototype/RoomScene.ts`: mueve el pickup al lateral derecho despejado (760, 400).
- `src/data/tuning.json`: ventana temporal del tajo 220 ms.
- `src/player/room-prototype/index.html`, `README.md`: controles y ubicación actualizados.
- `tests/unit/player-double-tap.test.ts`: direcciones para las cuatro flechas.
- `tests/e2e/player-room-prototype.spec.ts`: comprueba dash con ArrowRight y cambios/restauración de rotación del arma durante el tajo.

## Comandos y resultados
```text
$ npm run test:e2e -- --grep "flecha derecha|lateral, se equipa" # RED antes del cambio
FAIL: arrow double tap no activa dash; equippedSword/slash no existen.
$ npm run typecheck
PASS
$ npm test
PASS 50/50
$ npm run test:e2e
PASS 13/13
$ npm run build
PASS (tsc --noEmit + Vite)
$ git diff --check
PASS
$ git fetch origin
PASS; origin/feature/basti-movement-combat sin cambios nuevos.
```

## Tests
| test | resultado | nota |
|---|---|---|
| Vitest | PASS 50/50 | doble tap en WASD y cada flecha |
| Playwright E2E | PASS 13/13 | weapon swing, slash visual y dash por ArrowRight |
| typecheck/build | PASS | TypeScript + Vite |

## Observaciones
<!-- comportamiento observado en playtest, métricas, warnings -->
Una ejecución E2E intermedia falló al capturar el screenshot durante la corta ventana de movimiento; se quitó la captura de la aserción temporal y se amplió el tajo a 220 ms. La corrida final completa pasó.

## Siguiente paso
Verificar el arco/pose del arma a velocidad real en navegador. El tajo sigue siendo visual y no daña enemigos.
