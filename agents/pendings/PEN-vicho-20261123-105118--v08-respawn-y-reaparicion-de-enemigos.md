---
id: PEN-vicho-20261123-105118
type: pending
owner: vicho         # quien debe resolverlo (dueño del dominio)
created_by: vicho
agent: claude
created: 2026-11-23T13:51:18.791Z
title: V08 Respawn y reaparición de enemigos
priority: p1   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: open             # open | in_progress | blocked | done | wontfix
area: exploration
refs: []
closed_by:               # hash o HIS-ID al cerrar
---

## Contexto
Con player:died: mover al último checkpoint, pedir reset de enemigos y emitir player:respawned (punto 1 de PEN-vicho-20261123-102354). Necesita contrato con basti (spawnEnemy/resetEnemies o evento world:reset).
MoSCoW: MUST. Vista cenital, mundo abierto (no por salas).

## Repro / evidencia
```text
```

## Criterio de cierre
- [ ] Morir reaparece en checkpoint, enemigos reaparecen, player:respawned se emite exactamente una vez

## Notas
