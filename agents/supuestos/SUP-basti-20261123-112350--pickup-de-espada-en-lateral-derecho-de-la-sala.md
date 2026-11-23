---
id: SUP-basti-20261123-112350
type: supuesto
owner: basti         # quien tomó la decisión
validator: basti # dueño del dominio afectado | equipo
agent: gpt
created: 2026-11-23T14:23:50.460Z
title: pickup de espada en lateral derecho de la sala
impact: bajo       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [src/player/room-prototype/RoomScene.ts]
refs: []
---

## Decisión
Ubicar el pickup en (760, 400), en el lado derecho abierto de la sala, lejos del spawn, pilares y margen de ataque.

## Alternativas consideradas
Dejarlo en centro o acercarlo al borde derecho. El lado derecho da recorrido para probar caminar/correr y permite ver el ataque sin recortar su efecto por el muro.

## Por qué
Es un punto despejado a mitad de camino del borde; sirve para comprobar recogida y conserva espacio visual al frente del jugador.

## Impacto si se rechaza
Solo requiere cambiar la coordenada de creación y la expectativa E2E.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
