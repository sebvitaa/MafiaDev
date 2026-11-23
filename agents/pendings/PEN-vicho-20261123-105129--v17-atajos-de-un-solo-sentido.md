---
id: PEN-vicho-20261123-105129
type: pending
owner: vicho         # quien debe resolverlo (dueño del dominio)
created_by: vicho
agent: claude
created: 2026-11-23T13:51:29.221Z
title: V17 Atajos de un solo sentido
priority: p2   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: done             # open | in_progress | blocked | done | wontfix
area: world
refs: []
closed_by: HIS-vicho-20261123-131122               # hash o HIS-ID al cerrar
---

## Contexto
Puerta/palanca que solo se abre desde un lado y queda abierta (persistente).
MoSCoW: SHOULD. Vista cenital, mundo abierto (no por salas).

## Repro / evidencia
```text
```

## Criterio de cierre
- [x] Atajo abierto reduce el camino de vuelta y persiste al recargar

## Notas
- 2026-11-23 (HIS-vicho-20261123-131122): hecho; persistencia entre partidas pendiente de SaveData.world (SUP-vicho-20261123-131052).
