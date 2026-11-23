---
id: SUP-seba-20261123-084246
type: supuesto
owner: seba         # quien tomó la decisión
validator: equipo # dueño del dominio afectado | equipo
agent: claude
created: 2026-11-23T11:42:46.512Z
title: Items rareza y loot asignados a alejandro; cofres en el mundo a vicho
impact: medio       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [AGENTS.md]   # rutas con marcador // SUP-<id>
refs: []
---

## Decisión
Definición de items, rareza, tablas de loot, consumibles, buffs, inventario y equipo → alejandro (`src/items/**`, `data/{items,loot}.json`). Cofres como objetos del mundo (posición, oculto, apertura, evento `chest:opened`) → vicho. Drop de enemigos: basti emite `enemy:killed`; el LootSystem de alejandro tira la tabla y spawnea el pickup.

## Alternativas consideradas
(a) todo el loot en vicho (exploración) · (b) cofres + loot en un solo owner.

## Por qué
Items modifican stats del personaje (rol de alejandro). Cofres son geometría y descubrimiento (rol de vicho). El bus evita dependencia directa.

## Impacto si se rechaza
Reasignar rutas en AGENTS.md §2. Ningún código aún depende de esto.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
