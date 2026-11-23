---
id: SUP-vicho-20261123-131052
type: supuesto
owner: vicho         # quien tomó la decisión
validator: equipo # dueño del dominio afectado | equipo
agent: claude
created: 2026-11-23T16:10:52.731Z
title: SaveData.world para persistir cofres abiertos, atajos, coleccionables y hogueras
impact: medio       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [src/exploration/chests.ts, src/exploration/passages.ts, src/exploration/collectibles.ts, src/exploration/checkpoints.ts]            # rutas con marcador // SUP-<id>
refs: []
---

## Decisión
PROPUESTA (no implementada, toca shared src/core/GameState.ts): agregar a SaveData `world: { openedChests: string[]; openedPassages: string[]; collected: string[]; litFires: string[] }` con default vacío. Mientras tanto esos estados viven solo durante la partida (shortcuts marcados en chests.ts, passages.ts, collectibles.ts, checkpoints.ts).

## Alternativas consideradas
(a) clave propia en localStorage en el dominio vicho (rompe "único singleton"); (b) reutilizar inventory/visitedRooms (mezcla semánticas).

## Por qué
Souls: lo abierto/encendido/recogido debe seguir así al recargar; hoy solo persisten la hoguera guardada y la niebla.

## Impacto si se rechaza
Se queda en memoria de partida; al recargar se reabren cofres y atajos.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
