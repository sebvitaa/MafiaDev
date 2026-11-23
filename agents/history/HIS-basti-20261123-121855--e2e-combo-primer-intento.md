---
id: HIS-basti-20261123-121855
type: history
owner: basti
agent: gpt
created: 2026-11-23T15:18:55.266Z
title: e2e combo primer intento
status: partial          # pass | fail | partial
commit:                  # hash del commit de código
refs: []                 # PEN-/SUP-/HIS- relacionados
---

## Objetivo
Ejecutar typecheck, Vitest y Playwright tras integrar combo y derrota del muñeco.

## Cambios
- `src/player/room-prototype/SwordAttack.ts`, `RoomPlayer.ts`, `RoomScene.ts`, `TrainingDummy.ts`, `SwordCombat.ts`: implementación de combate y recuperación.
- `tests/e2e/player-room-prototype.spec.ts`: recorrido de combo, derrota y recuperación.

## Comandos y resultados
```text
$ npm run typecheck
PASS
$ npm test
PASS: 9 archivos, 58 pruebas.
$ npm run test:e2e
FAIL: 12/13. La prueba esperó buffered=true tras 170 ms desde un poll; el ataque 2 podía terminar antes de observar el buffer, dentro de la semántica válida de cadena tras completar golpe.
```

## Tests
| typecheck | pass | `npm run typecheck`. |
| Vitest | pass | `npm test`: 58 pruebas. |
| Playwright | partial | 12/13; expectativa de sincronización frágil en buffer; ajustar y repetir. |

## Observaciones
<!-- comportamiento observado en playtest, métricas, warnings -->

## Siguiente paso
Hacer determinista la verificación e2e de la ventana de combo, y repetir todos los comandos incluyendo build.
