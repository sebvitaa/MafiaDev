---
id: PEN-vicho-20261123-105121
type: pending
owner: vicho         # quien debe resolverlo (dueño del dominio)
created_by: vicho
agent: claude
created: 2026-11-23T13:51:21.096Z
title: V10 Cofres en el mundo
priority: p1   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: open             # open | in_progress | blocked | done | wontfix
area: exploration
refs: []
closed_by:               # hash o HIS-ID al cerrar
---

## Contexto
Objeto chest en Tiled; abrir (contacto o tecla de interacción) llama rollLoot de alejandro, emite chest:opened {id,hidden:false}; estado abierto persiste en GameState.
MoSCoW: MUST. Vista cenital, mundo abierto (no por salas).

## Repro / evidencia
```text
```

## Criterio de cierre
- [ ] Abrir suelta un item; recargar mantiene el cofre abierto

## Notas
- 2026-11-23 (vicho): Cofres se abren INTERACTUANDO (misma acción que checkpoints).
