---
id: SUP-basti-20261123-110158
type: supuesto
owner: basti         # quien tomó la decisión
validator: basti # dueño del dominio afectado | equipo
agent: gpt
created: 2026-11-23T14:01:58.167Z
title: ventana doble pulsacion dash mas tolerante
impact: medio       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [src/player/room-prototype/RoomPlayer.ts, src/data/tuning.json]
refs: []
---

## Decisión
Ampliar la ventana configurable para el doble toque WASD de 230 ms a 350 ms.

## Alternativas consideradas
Mantener 230 ms o aumentar a 350 ms. La prueba de navegador demostró que 300 ms entre pulsaciones no activaba el dash con 230 ms.

## Por qué
350 ms da margen para el ritmo de pulsación manual; la prueba unitaria y E2E verifican ese comportamiento y el cooldown sigue limitando la frecuencia.

## Impacto si se rechaza
La doble pulsación vuelve a ser más exigente y puede seguir percibiéndose como inconsistente.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
