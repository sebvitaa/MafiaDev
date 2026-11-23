---
id: PEN-basti-20261123-134334
type: pending
owner: basti
created_by: alejandro
agent: gpt
created: 2026-11-23T16:43:34.000Z
title: revisar fallos e2e del laboratorio tras integrar ramas
priority: p2
status: done
area: movement
refs: [HIS-alejandro-20261123-134021]
closed_by: HIS-alejandro-20261123-134021
---

## Contexto
Integración local autorizada por Alejandro de origin/vicho/mundo-abierto (8231a37) y origin/feature/basti-movement-combat (5cd9c45). Merge sin conflictos; build y 97 unit tests pasan. Se observaron escrituras concurrentes de otra sesión en el personaje y las cinemáticas; verificar los fallos en una copia estable antes de atribuirlos al código.

## Repro / evidencia
Ejecutar los casos de tests/e2e/player-room-prototype.spec.ts en líneas 56, 125 y 351. En la ejecución con dos workers:
- Línea 82: velocidad Y esperada > 0, observada -15.045934671969313 al cambiar de dirección.
- Línea 130: posición X esperada 265 tras colisión, observada 480 (posición inicial).
- Línea 367: vida del muñeco esperada 100 antes del impacto, observada 50. La comprobación usa esperas de tiempo real.

Log completo: agents/history/logs/HIS-alejandro-20261123-134021-e2e.log.
Trazas locales: node_modules/.cache/codex-integracion/results/.

## Criterio de cierre
- [ ] Reproducir en copia estable y corregir el comportamiento o la sincronización de los casos.
- [ ] Los tres casos pasan; build y unit tests siguen pasando.

## Notas
Sin cambios manuales de esta sesión en código de combate o movimiento. Se preservaron los cambios locales concurrentes del sprite Ríos.

## Resolución
Los cuatro casos fallidos pasaron en la repetición aislada con un worker, sin cambios de código de esta sesión. Comando y log en HIS-alejandro-20261123-134021. Las discrepancias generales de integración siguen en PEN-basti-20261123-134231.
