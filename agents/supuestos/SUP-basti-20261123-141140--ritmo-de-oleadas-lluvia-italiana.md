---
id: SUP-basti-20261123-141140
type: supuesto
owner: basti
validator: basti
agent: gpt
created: 2026-11-23T17:11:40.614Z
title: ritmo de oleadas lluvia italiana
impact: bajo
reversible: si
status: pendiente
code_refs: [src/player/room-prototype/ItalianRain.ts]
refs: []
---

## Decisión
El impacto visual de los completos se reparte determinísticamente entre 70 % y 95 % de los 600 ms de caída total; el inicio de cada caída se escalona. Esto deja el impacto lógico final para la habilidad en el mismo instante actual de 600 ms.

## Alternativas consideradas
Hacer caer todos a la vez; permitir que los últimos impactos excedan los 600 ms; usar oleadas con duración fija independiente del número de completos.

## Por qué
El pedido solicita oleadas rápidas con trayectorias distintas y conservar el daño/tiempo total. La llegada escalonada anterior al evento final mantiene ese contrato y mejora la lectura visual.

## Impacto si se rechaza
Ajustar el calendario puro de `ItalianRain.ts`; el hit timing y daño se mantienen en `FireballTimeline`/`FireballBlast`.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
