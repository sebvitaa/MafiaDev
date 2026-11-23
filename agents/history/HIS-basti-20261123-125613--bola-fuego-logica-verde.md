---
id: HIS-basti-20261123-125613
type: history
owner: basti
agent: gpt
created: 2026-11-23T15:56:13.336Z
title: bola fuego logica verde
status: partial          # pass | fail | partial
commit:                  # hash del commit de código
refs: []                 # PEN-/SUP-/HIS- relacionados
---

## Objetivo
Implementar reloj de vuelo/explosión/cooldown y daño radial de la bola de fuego como lógica pura.

## Cambios
- `src/player/room-prototype/FireballCombat.ts`: añade `FireballTimeline` y `FireballBlast` sin dependencias de Phaser.
- `tests/unit/fireball-combat.test.ts`: valida impacto a 600 ms, cooldown de 7 s, radio y daño único.

## Comandos y resultados
```text
$ npm test -- tests/unit/fireball-combat.test.ts
PASS: 1 archivo, 3 pruebas.
```

## Tests
| `npm test -- tests/unit/fireball-combat.test.ts` | pass | 3/3. |

## Observaciones
<!-- comportamiento observado en playtest, métricas, warnings -->

## Siguiente paso
Verificar integración Phaser, input E/ratón, efectos, daño al muñeco y cooldown; ejecutar typecheck, test, e2e y build.
