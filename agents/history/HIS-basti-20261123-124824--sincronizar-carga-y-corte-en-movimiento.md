---
id: HIS-basti-20261123-124824
type: history
owner: basti
agent: gpt
created: 2026-11-23T15:48:24.737Z
title: sincronizar carga y corte en movimiento
status: partial          # pass | fail | partial
commit:                  # hash del commit de código
refs: []                 # PEN-/SUP-/HIS- relacionados
---

## Objetivo
Corregir efecto y arma de carga congelados al mantener click, capturar pose actual al soltar y sincronizar trayectoria visual/física.

## Cambios
- `src/player/room-prototype/SwordAttack.ts`: efecto de carga como contenedor posicionado en pose actual; hitbox usa el mismo inicio, dirección, recorrido y easing que el slash; carga cancela combo activo y no aplica daño.
- `src/player/room-prototype/RoomPlayer.ts`: actualiza espada y pose cargada en POST_UPDATE, y pasa pose actual en pointerup.
- `tests/e2e/player-room-prototype.spec.ts`: carga–mover–soltar, giro durante carga, dash cancel, movimiento durante ataque y daño único.

## Comandos y resultados
```text
$ npx playwright test tests/e2e/player-room-prototype.spec.ts -g "el dash cancela la carga"
FAIL esperado (RED): effect x=0 while player x=700.
$ npm run typecheck
FAIL inicial: variable range no usada y GameObject.x/y no tipados; corregidos.
$ npm run typecheck
PASS
$ npx playwright test tests/e2e/player-room-prototype.spec.ts -g "el dash cancela la carga"
PASS: 1/1; carga siguió movimiento y orientación, dash canceló, máxima carga golpeó una vez y movimiento durante swing no duplicó daño.
```

## Tests
| E2E red/green | pass final | Detecta origen atrasado y valida corrección de pose/hitbox. |
| typecheck | pass | Tras resolver tipos y código no usado. |

## Observaciones
<!-- comportamiento observado en playtest, métricas, warnings -->

## Siguiente paso
Ejecutar Vitest, build y Playwright completos sobre la versión final.
