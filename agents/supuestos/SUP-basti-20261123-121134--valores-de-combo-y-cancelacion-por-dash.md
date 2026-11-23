---
id: SUP-basti-20261123-121134
type: supuesto
owner: basti         # quien tomó la decisión
validator: basti # dueño del dominio afectado | equipo
agent: gpt
created: 2026-11-23T15:11:34.627Z
title: valores de combo y cancelacion por dash
impact: medio       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [src/player/room-prototype/SwordAttack.ts, src/player/room-prototype/TrainingDummy.ts]
refs: []
---

## Decisión
Combo prototype-local con duraciones [220, 280, 400] ms; multiplicadores [1, 1.2, 1.6] sobre los 25 de daño actuales; alcance [72, 80, 90] y semiancho [32°, 54°, 40°]. El buffer dura 150 ms, la cadena permanece abierta 500 ms tras un ataque y dash cancela después de 90 ms. El remate empuja 20 px. El muñeco vuelve a su vida máxima tras 2000 ms.

## Alternativas consideradas
Mantener el ataque único; fijar valores fuera de tuning; permitir dash-cancel desde el primer frame.

## Por qué
El pedido define los multiplicadores y buffer, pero no duración/alcance precisos, cuándo se abre el cancel ni cómo mostrar la recuperación. Se aprovechan los 25 puntos de daño actuales como base; se hacen configurables todos los valores de feel y alcance en el bloque local de tuning. El umbral evita cancelar antes de que el golpe se haya comprometido.

## Impacto si se rechaza
Se pueden ajustar solamente las propiedades del combo en `src/data/tuning.json`; no cambia contratos compartidos ni el combate lateral.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
