---
id: SUP-basti-20261123-130729
type: supuesto
owner: basti
validator: basti
agent: gpt
created: 2026-11-23T16:07:29.827Z
title: runa residual morada temporal
impact: bajo
reversible: si
status: pendiente
code_refs: [src/player/room-prototype/RoomFireball.ts]
refs: []
---

## Decisión
Después del impacto queda una marca de quemadura/runa morada decorativa durante 2800 ms; se desvanece en su tramo final y nunca causa daño. La paleta violeta, el borde brillante y el pulso de la mira se dibujan con Graphics de Phaser.

## Alternativas consideradas
Eliminar la marca al acabar la explosión; dejarla indefinidamente; usar un sprite externo.

## Por qué
El pedido pide una marca temporal y assets inexistentes; 2,8 s permite verla sin que persista en la habitación. Graphics evita agregar dependencias/assets y su vida está ligada al ciclo de RoomFireball.

## Impacto si se rechaza
Cambiar el parámetro `fireballResidueDurationMs` o el dibujo local. No cambia daño, input ni contratos.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
