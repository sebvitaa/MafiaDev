---
id: PEN-vicho-20261123-105117
type: pending
owner: vicho         # quien debe resolverlo (dueño del dominio)
created_by: vicho
agent: claude
created: 2026-11-23T13:51:17.628Z
title: V07 Checkpoints (sitios de gracia)
priority: p1   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: open             # open | in_progress | blocked | done | wontfix
area: exploration
refs: []
closed_by:               # hash o HIS-ID al cerrar
---

## Contexto
Objeto checkpoint en Tiled; al tocarlo guarda en GameState y emite checkpoint:reached {id}.
MoSCoW: MUST. Vista cenital, mundo abierto (no por salas).

## Repro / evidencia
```text
```

## Criterio de cierre
- [ ] Recargar la página reaparece en el último checkpoint

## Notas
- 2026-11-23 (vicho): Checkpoints estilo souls (hoguera DS / banca HK / linterna BB): se activan INTERACTUANDO, no al tocar. Descansar = guarda punto, cura y reaparecen los enemigos (world reset). Necesita acción 'interact' en src/core/Input.ts (shared) → avisar al equipo; mientras, tecla E local en dominio vicho + SUP.
