---
id: SUP-basti-20261123-125357
type: supuesto
owner: basti
validator: basti
agent: gpt
created: 2026-11-23T15:53:57.903Z
title: bola fuego usa dano espada y caida visual
impact: medio
reversible: si
status: pendiente
code_refs: [src/player/room-prototype/RoomFireball.ts, src/player/room-prototype/TrainingDummy.ts]
refs: []
---

## Decisión
La bola causa 2× el daño base del ataque de espada. Se representa como invocada desde 180px por encima del punto apuntado y la explosión visual dura 300ms.

## Alternativas consideradas
Definir daño propio independiente; usar otra altura o duración de presentación.

## Por qué
El pedido especifica el multiplicador de daño, el tiempo de caída y el radio, pero no el daño base, la altura visual o cuánto dura el efecto. Reutilizar el daño base de espada reduce divergencia con el sistema de combate actual.

## Impacto si se rechaza
Ajustar tuning y expectativa del muñeco; los parámetros están aislados y son reversibles.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
