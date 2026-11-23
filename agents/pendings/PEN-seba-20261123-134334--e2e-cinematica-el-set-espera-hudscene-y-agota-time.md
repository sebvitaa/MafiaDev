---
id: PEN-seba-20261123-134334
type: pending
owner: seba
created_by: alejandro
agent: gpt
created: 2026-11-23T16:43:34.000Z
title: e2e cinematica El Set espera HudScene y agota timeout
priority: p2
status: done
area: ui
refs: [HIS-alejandro-20261123-134021, SUP-alejandro-20261123-133427]
closed_by: HIS-alejandro-20261123-134021
---

## Contexto
Tras integrar mundo y combate conservando las cinemáticas locales, dos pruebas de reproducción de video pasan. El caso de El Set no alcanza a probar pausa/reanudación porque espera la activación de HudScene después de seleccionar el escenario 2.

## Repro / evidencia
Test: tests/e2e/cinematicas-lore.spec.ts:39.
Timeout de 30000 ms en línea 45: page.waitForFunction(() => window.__game?.scene.isActive('HudScene')).
Log completo: agents/history/logs/HIS-alejandro-20261123-134021-e2e.log.
Trazas locales: node_modules/.cache/codex-integracion/results/.

## Criterio de cierre
- [ ] Verificar selección de escenario y activación del HUD en una copia estable, sin escrituras concurrentes.
- [ ] El caso de El Set pasa y comprueba pausa, reanudación y reproducción única.

## Notas
Las cinemáticas y el sprite recibieron cambios concurrentes de otra sesión durante la verificación. Se preservaron sus versiones más recientes. Esta sesión no modifica los módulos UI.

## Resolución
Los cuatro casos fallidos pasaron en la repetición aislada con un worker, sin cambios de código de esta sesión. Comando y log en HIS-alejandro-20261123-134021. Las discrepancias generales de integración siguen en PEN-basti-20261123-134231.
