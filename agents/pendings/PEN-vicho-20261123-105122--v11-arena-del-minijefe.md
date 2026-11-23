---
id: PEN-vicho-20261123-105122
type: pending
owner: vicho         # quien debe resolverlo (dueño del dominio)
created_by: vicho
agent: claude
created: 2026-11-23T13:51:22.261Z
title: V11 Arena del minijefe
priority: p1   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: open             # open | in_progress | blocked | done | wontfix
area: world
refs: []
closed_by:               # hash o HIS-ID al cerrar
---

## Contexto
Al entrar a boss_arena se cierran muros temporales y zone:changed boss; al recibir enemy:killed del jefe se abren.
MoSCoW: MUST. Vista cenital, mundo abierto (no por salas).

## Repro / evidencia
```text
```

## Criterio de cierre
- [ ] Entrar cierra la arena; matar al jefe la abre

## Notas
