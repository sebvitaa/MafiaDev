---
id: HIS-basti-20261123-132419
type: history
owner: basti
agent: gpt
created: 2026-11-23T16:24:19.000Z
title: eco deuda pruebas rojas
status: pass
commit:
refs: [SUP-basti-20261123-133012]
---

## Objetivo
Definir primero pruebas unitarias para Eco del Reverso, marcas de deuda y detonación con bola de fuego.

## Cambios
- `tests/unit/echo-debt-combat.test.ts`: pruebas para replay único y retardado, ventana temporal, marcas independientes/capadas y bonus en un único daño de fuego.

## Comandos y resultados
```text
$ npx vitest run tests/unit/echo-debt-combat.test.ts
FAIL esperado: falta `EchoDebtCombat`.
```

## Tests
| test | resultado | nota |
|---|---|---|
| Eco, marcas y detonación | red esperado | El módulo aún no existía; suite no pudo cargar los tests. |

## Observaciones
La falla confirmó que las pruebas detectan la API ausente, antes de implementar la lógica.

## Siguiente paso
Implementar módulos puros y conectar los adaptadores locales del prototipo.
