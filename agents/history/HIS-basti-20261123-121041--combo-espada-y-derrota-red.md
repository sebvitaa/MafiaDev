---
id: HIS-basti-20261123-121041
type: history
owner: basti
agent: gpt
created: 2026-11-23T15:10:41.130Z
title: combo espada y derrota red
status: partial          # pass | fail | partial
commit:                  # hash del commit de código
refs: []                 # PEN-/SUP-/HIS- relacionados
---

## Objetivo
Definir primero con pruebas la lógica pura del combo de espada y la derrota/recuperación del muñeco.

## Cambios
- `tests/unit/sword-combo.test.ts`: agrega cinco pruebas de combo, buffer, reinicio, cancelación por dash y recuperación del muñeco.

## Comandos y resultados
```text
$ npm test -- tests/unit/sword-combo.test.ts
FAIL esperado (RED): 5 pruebas; SwordCombo y TrainingDummyHealth aún no existen.
```

## Tests
| `npm test -- tests/unit/sword-combo.test.ts` | fail esperado | RED: faltan las APIs nuevas, no error de sintaxis del test. |

## Observaciones
<!-- comportamiento observado en playtest, métricas, warnings -->

## Siguiente paso
Implementar el mínimo de lógica pura hasta que las cinco pruebas pasen; después integrar las animaciones y el dummy.
