---
id: SUP-vicho-20261123-121240
type: supuesto
owner: vicho         # quien tomó la decisión
validator: equipo # dueño del dominio afectado | equipo
agent: claude
created: 2026-11-23T15:12:40.250Z
title: Tecla E local para interactuar y M para mapa hasta tener acciones en Input
impact: bajo       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [src/exploration/chests.ts, src/world/bigMap.ts]            # rutas con marcador // SUP-<id>
refs: []
---

## Decisión
src/exploration/chests.ts lee la tecla E y src/world/bigMap.ts la tecla M directamente del teclado de Phaser, sin pasar por src/core/Input.ts (shared, sin acciones interact/map).

## Alternativas consideradas
Agregar acciones interact: [E] y map: [M, TAB] a BINDINGS (cambio shared).

## Por qué
No bloquear V07/V10/V24 por un cambio shared; mismo patrón que basti con SHIFT (SUP-basti-20261123-102326).

## Impacto si se rechaza
Migrar ambos a controls.justDown("interact"/"map") cuando exista la acción; 2 líneas.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
