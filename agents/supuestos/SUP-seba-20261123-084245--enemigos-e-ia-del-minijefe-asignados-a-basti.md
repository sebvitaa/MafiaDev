---
id: SUP-seba-20261123-084245
type: supuesto
owner: seba         # quien tomó la decisión
validator: equipo # dueño del dominio afectado | equipo
agent: claude
created: 2026-11-23T11:42:45.419Z
title: Enemigos e IA del minijefe asignados a basti
impact: alto       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [AGENTS.md]   # rutas con marcador // SUP-<id>
refs: []
---

## Decisión
Enemigos (IA patrol/chase/windup/attack/stagger) y minijefe → `src/enemies/**`, owner `basti`.

## Alternativas consideradas
(a) alejandro (personaje/habilidades) · (b) vicho (exploración: los minijefes están en el nodo Exploración del tablero).

## Por qué
Enemigos comparten Health/Hitbox/Hurtbox/Knockback con el jugador; separar IA de combate obliga a dos dueños sobre el mismo contrato de daño. El rol de basti es «combate».

## Impacto si se rechaza
Carga alta para basti (movimiento + combate + enemigos). Si se rechaza: mover `src/enemies/**` a otro owner en AGENTS.md §2 y en este SUP; vicho conserva el spawn desde Tiled en cualquier caso.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
