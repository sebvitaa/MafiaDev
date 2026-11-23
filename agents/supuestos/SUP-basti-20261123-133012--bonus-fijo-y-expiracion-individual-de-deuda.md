---
id: SUP-basti-20261123-133012
type: supuesto
owner: basti
validator: basti
agent: gpt
created: 2026-11-23T16:30:12.000Z
title: bonus fijo y expiracion individual de deuda
impact: medio
reversible: si
status: pendiente
code_refs: [src/player/room-prototype/EchoDebtCombat.ts, src/player/room-prototype/RoomFireball.ts]
refs: []
---

## Decisión
Cada marca detona 10 puntos de daño bonus fijo. Las marcas mantienen expiración individual de 4000 ms; alcanzar el límite no renueva una marca existente ni amplía su duración.

## Alternativas consideradas
Bonus porcentual del daño de bola de fuego, bonus fijo distinto, refrescar duración al llegar al límite, o hacer expirar todas las marcas a la vez.

## Por qué
El pedido define cantidad máxima y duración, pero no cuantifica el bonus ni la política de apilado. Diez por marca permite distinguir el efecto en el muñeco y mantenerlo sencillo de ajustar. Expiración individual respeta que cada golpe aplica una marca nueva.

## Impacto si se rechaza
Cambiar `debtBonusDamagePerMark` o la política de expiración en los módulos locales; no afecta contratos ni otros sistemas.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
