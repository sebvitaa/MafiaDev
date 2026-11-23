---
id: PEN-vicho-20261123-105113
type: pending
owner: vicho         # quien debe resolverlo (dueño del dominio)
created_by: vicho
agent: claude
created: 2026-11-23T13:51:13.010Z
title: V03 Cargar el mapa de Tiled en GameScene y reemplazar el stub
priority: p1   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: done             # open | in_progress | blocked | done | wontfix
area: world
refs: []
closed_by: HIS-vicho-20261123-112712               # hash o HIS-ID al cerrar
---

## Contexto
Carga en GameScene.preload; installWorld construye capas y devuelve la interfaz World (solids = capa walls). Requiere gravedad 0 (ver SUP vista cenital).
MoSCoW: MUST. Vista cenital, mundo abierto (no por salas).

## Repro / evidencia
```text
```

## Criterio de cierre
- [x] npm run build ok; el juego arranca mostrando el mapa

## Notas
