---
id: HIS-basti-20261123-124958
type: history
owner: basti
agent: gpt
created: 2026-11-23T15:49:58.310Z
title: carga sincronizada verificada
status: partial          # pass | fail | partial
commit:                  # hash del commit de código
refs: []                 # PEN-/SUP-/HIS- relacionados
---

## Objetivo
Completar ataque cargado y corregir desfase de animación/hitbox al cargar en movimiento.

## Cambios
- `src/player/room-prototype/SwordAttack.ts`: seguimiento de pose de carga y trayectoria sincronizada del sector visual y hitbox.
- `src/player/room-prototype/RoomPlayer.ts`: sigue arma/efecto tras física y usa pose de mouse-up.
- `src/player/room-prototype/SwordCombat.ts`, `src/data/tuning.json`: estado puro progresivo, 200% daño, alcance ampliado.
- `tests/unit/sword-charge.test.ts`, `tests/e2e/player-room-prototype.spec.ts`: reglas puras y regresión cargar–mover–soltar / movimiento durante golpe.
- `src/player/room-prototype/README.md`, `src/player/room-prototype/index.html`: controles del cargado.
- `agents/supuestos/SUP-basti-20261123-123408--alcance-y-animacion-del-ataque-cargado.md`: balance local y duración.

## Comandos y resultados
```text
$ npm run typecheck
PASS
$ npm test
PASS: 10 archivos, 62 pruebas.
$ npm run build
PASS: tsc y Vite.
$ npm run test:e2e
PASS: 14/14 en 36.2 s.
```

## Tests
| typecheck | pass | `npm run typecheck`. |
| Vitest | pass | 62/62. |
| Playwright | pass | 14/14; prueba nueva sigue la carga/arma, no daña antes de soltar, se mueve durante golpe y registra un solo hit. |
| build | pass | `npm run build`. |

## Observaciones
<!-- comportamiento observado en playtest, métricas, warnings -->

## Siguiente paso
Playtest el charged slash en el navegador. Sin commit ni push por instrucción del humano.
