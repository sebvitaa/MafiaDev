---
id: SUP-basti-20261123-112929
type: supuesto
owner: basti         # quien tomó la decisión
validator: basti # dueño del dominio afectado | equipo
agent: gpt
created: 2026-11-23T14:29:29.324Z
title: tajo con balanceo de arma y arco luminoso
impact: bajo       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [src/player/room-prototype/SwordAttack.ts, src/player/room-prototype/RoomPlayer.ts]
refs: [SUP-basti-20261123-111412]
---

## Decisión
Animar el arma equipada con un golpe de ida y vuelta mientras se barre un arco turquesa/dorado, usando Phaser Tweens locales por 220 ms. Mantener la ventana de ataque temporal y no aplicar daño todavía.

## Alternativas consideradas
Dejar quieta la espada y mostrar únicamente un recuadro de hitbox, mostrar solo un efecto independiente, o animar conjuntamente arma y arco.

## Por qué
La animación conjunta de 220 ms hace legible el golpe incluso a velocidad normal, conserva la orientación del jugador y no requiere sprites ni enemigos finales.

## Impacto si se rechaza
Cambiar los valores de rotación/color/duración o eliminar el arco y conectar las animaciones definitivas de personaje/arma cuando estén disponibles.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
