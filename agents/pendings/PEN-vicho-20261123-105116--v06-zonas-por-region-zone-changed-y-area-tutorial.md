---
id: PEN-vicho-20261123-105116
type: pending
owner: vicho         # quien debe resolverlo (dueño del dominio)
created_by: vicho
agent: claude
created: 2026-11-23T13:51:16.462Z
title: V06 Zonas por región: zone:changed y área tutorial
priority: p1   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: done             # open | in_progress | blocked | done | wontfix
area: exploration
refs: []
closed_by: HIS-vicho-20261123-123651               # hash o HIS-ID al cerrar
---

## Contexto
Rectángulos de zona en la capa objects. zoneAt(x,y) puro con test. Emitir zone:changed {zone1|zone2|boss} y room:entered {roomId:"tutorial",zone:"zone1"}. Cubre puntos 2 y 3 de PEN-vicho-20261123-102354.
MoSCoW: MUST. Vista cenital, mundo abierto (no por salas).

## Repro / evidencia
```text
```

## Criterio de cierre
- [x] Test de zoneAt; eventos emitidos una vez por cruce

## Notas
