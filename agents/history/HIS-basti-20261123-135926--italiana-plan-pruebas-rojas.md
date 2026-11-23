---
id: HIS-basti-20261123-135926
type: history
owner: basti
agent: gpt
created: 2026-11-23T16:59:26.357Z
title: italiana plan pruebas rojas
status: pass
commit:
refs: [SUP-basti-20261123-141140]
---

## Objetivo
Escribir primero pruebas puras para cantidad, dispersión y tiempos de la lluvia de completos.

## Cambios
- `tests/unit/italian-rain.test.ts`: comprobaciones de 7–10 trayectorias dentro del radio y del plazo total, con semilla reproducible y oleadas.

## Comandos y resultados
```text
$ npx vitest run tests/unit/italian-rain.test.ts (antes de implementar)
FAIL esperado: no se encontró `ItalianRain`.
$ npx vitest run tests/unit/italian-rain.test.ts (después de implementar)
PASS: 2/2
```

## Tests
| test | resultado | nota |
|---|---|---|
| Plan de lluvia | red→green | Módulo faltante confirmado; luego pasó con patrón determinista. |

## Observaciones
Sin cambios de dominio ajeno; el módulo de trayectorias no importa Phaser.

## Siguiente paso
Integrar la secuencia visual y verificar el daño único en navegador.
