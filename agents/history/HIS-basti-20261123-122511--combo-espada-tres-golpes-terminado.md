---
id: HIS-basti-20261123-122511
type: history
owner: basti
agent: gpt
created: 2026-11-23T15:25:11.681Z
title: combo espada tres golpes terminado
status: partial          # pass | fail | partial
commit:                  # hash del commit de código
refs: []                 # PEN-/SUP-/HIS- relacionados
---

## Objetivo
Implementar combo de tres cortes con ventanas, dash cancel y muñeco que derrota y reaparece, manteniendo movimiento y cámara existentes.

## Cambios
- `src/player/room-prototype/SwordCombat.ts`: FSM pura del combo/ventanas/cancel y vida temporizada.
- `src/player/room-prototype/SwordAttack.ts`: perfiles de animación e hitbox por ataque, daño y knockback final.
- `src/player/room-prototype/RoomPlayer.ts`, `RoomScene.ts`, `TrainingDummy.ts`: exclusión y cancelación por dash, feedback visual y respawn del dummy.
- `src/data/tuning.json`: valores configurables del combo.
- `tests/unit/sword-combo.test.ts`, `tests/e2e/player-room-prototype.spec.ts`: reglas y flujo en navegador.
- `src/player/room-prototype/README.md`, `index.html`: instrucciones de controles actualizadas.
- `agents/supuestos/SUP-basti-20261123-121134--valores-de-combo-y-cancelacion-por-dash.md`: documenta tiempos y balance elegidos.

## Comandos y resultados
```text
$ npm run typecheck
PASS
$ npm test
PASS: 9 archivos, 58 pruebas.
$ npm run test:e2e
PASS: 13/13 en 30.4 s.
$ npm run build
PASS: tsc --noEmit + Vite build.
```

## Tests
| typecheck | pass | `npm run typecheck`. |
| unit | pass | 58/58. |
| e2e | pass | 13/13. Incluye combo, derrota y respawn. |
| build | pass | `npm run build`. |

## Observaciones
<!-- comportamiento observado en playtest, métricas, warnings -->

## Siguiente paso
Playtest manual del combo con espada recogida: clic rápido encadena; remate empuja; dash desde 90 ms cancela; derrotar dummy lo devuelve en 2 s. Sin commit/push por indicación del humano.
