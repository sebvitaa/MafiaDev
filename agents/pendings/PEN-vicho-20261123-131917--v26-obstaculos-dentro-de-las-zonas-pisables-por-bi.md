---
id: PEN-vicho-20261123-131917
type: pending
owner: vicho         # quien debe resolverlo (dueño del dominio)
created_by: vicho
agent: claude
created: 2026-11-23T16:19:17.673Z
title: V26 Obstáculos dentro de las zonas pisables por bioma
priority: p1   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: open             # open | in_progress | blocked | done | wontfix
area: world
refs: []
closed_by:               # hash o HIS-ID al cerrar
---

## Contexto
Árboles (bosques), roca volcánica y charcos de lava (volcán), tumbas (muerta), piedras/cristales (cueva) DENTRO de las salas, con colisión. El generador los coloca como objetos type obstacle (prop kind) sin romper la conectividad (validar flood fill tratándolos como bloqueados) y lejos de otros objetos; runtime en src/world/obstacles.ts reutilizando texturas de props.ts y cuerpos estáticos Arcade con collider al jugador.

## Repro / evidencia
```text
```

## Criterio de cierre
- [ ] Obstáculos visibles en las 5 zonas, el jugador choca con ellos, el generador sigue validando conectividad 100%

## Notas
