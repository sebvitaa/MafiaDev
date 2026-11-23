---
id: HIS-basti-20261123-121550
type: history
owner: basti
agent: gpt
created: 2026-11-23T15:15:50.647Z
title: validar combo y recuperacion dummy
status: partial          # pass | fail | partial
commit:                  # hash del commit de código
refs: []                 # PEN-/SUP-/HIS- relacionados
---

## Objetivo
Verificar la máquina de combo, el buffer, el dash cancel y la vida con respawn del muñeco.

## Cambios
- `src/player/room-prototype/SwordCombat.ts`: añade estado puro de combo y salud/respawn.
- `tests/unit/sword-combo.test.ts`: valida los casos observables sin Phaser.

## Comandos y resultados
```text
$ npm test -- tests/unit/sword-combo.test.ts
FAIL: 1 test. El test esperaba iniciar el segundo golpe mediante press(); update(120) ya lo había iniciado y devuelto.
$ npm test -- tests/unit/sword-combo.test.ts tests/unit/sword-combat.test.ts
PASS: 2 archivos, 8 pruebas.
```

## Tests
| `npm test -- tests/unit/sword-combo.test.ts` | fail corregido | Ajustado el test al contrato observable de `update()` (inicio del ataque bufferizado). |
| `npm test -- tests/unit/sword-combo.test.ts tests/unit/sword-combat.test.ts` | pass | 8 pruebas. |

## Observaciones
<!-- comportamiento observado en playtest, métricas, warnings -->

## Siguiente paso
Integrar animaciones, daño variable, dash cancel y derrota visible; correr typecheck, suite y build.
