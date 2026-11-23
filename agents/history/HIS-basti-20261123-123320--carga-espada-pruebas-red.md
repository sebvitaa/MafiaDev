---
id: HIS-basti-20261123-123320
type: history
owner: basti
agent: gpt
created: 2026-11-23T15:33:20.318Z
title: carga espada pruebas red
status: partial          # pass | fail | partial
commit:                  # hash del commit de código
refs: []                 # PEN-/SUP-/HIS- relacionados
---

## Objetivo
Definir con pruebas la interpretación del clic corto, carga progresiva, carga máxima, cancelación y protección contra pointerdown repetido.

## Cambios
- `tests/unit/sword-charge.test.ts`: agrega cuatro casos contra una máquina pura `SwordCharge`.

## Comandos y resultados
```text
$ npm test -- tests/unit/sword-charge.test.ts
FAIL esperado (RED): 4 tests; SwordCharge no está implementado/exportado.
```

## Tests
| `npm test -- tests/unit/sword-charge.test.ts` | fail esperado | Cada caso falla por falta de la implementación requerida. |

## Observaciones
<!-- comportamiento observado en playtest, métricas, warnings -->

## Siguiente paso
Implementar lógica de carga pura en SwordCombat.ts, observar GREEN y conectarla al mouse de la escena.
