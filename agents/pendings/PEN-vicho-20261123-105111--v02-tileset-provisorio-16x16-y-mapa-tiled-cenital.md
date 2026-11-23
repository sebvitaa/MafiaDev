---
id: PEN-vicho-20261123-105111
type: pending
owner: vicho         # quien debe resolverlo (dueño del dominio)
created_by: vicho
agent: claude
created: 2026-11-23T13:51:11.850Z
title: V02 Tileset provisorio 16x16 y mapa Tiled cenital
priority: p1   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: open             # open | in_progress | blocked | done | wontfix
area: world
refs: []
closed_by:               # hash o HIS-ID al cerrar
---

## Contexto
Capas: ground (suelo), walls (colisión), deco, objects (spawn, zones, checkpoints, chests, enemies, boss_arena).
MoSCoW: MUST. Vista cenital, mundo abierto (no por salas).

## Repro / evidencia
```text
```

## Criterio de cierre
- [ ] public/assets/maps/world.json y tileset en public/assets/tilesets/ abren en Tiled y cargan sin error

## Notas
- 2026-11-23 (vicho): Perspectiva estilo Titan Souls: cenital 3/4 en pixel art, muros con cara frontal visible, arenas amplias. Packs de referencia: Cainos Pixel Art Top Down Basic, Pix-Quest 16x16.
