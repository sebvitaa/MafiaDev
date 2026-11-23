---
id: SUP-basti-20261123-103543
type: supuesto
owner: basti         # quien tomó la decisión
validator: basti # dueño del dominio afectado | equipo
agent: gpt
created: 2026-11-23T13:35:43.500Z
title: Prototipo sala fija Isaac-Hades aislado
impact: bajo       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [src/player/room-prototype/RoomScene.ts]
refs: []
---

## Decisión
Entrada independiente /src/player/room-prototype/ dentro del dominio de Basti. Cámara 2D fija que encuadra una sala 960x600. Plano X/Y sin gravedad, altura de salto separada y profundidad por pies. Geometría, puerta y personaje provisionales: no se sustituye el mundo de Vicho.

Se reutilizan datos de Luchador y tuning existentes (120 px/s, carrera x1.65, dash 360 px/s durante 140 ms y recuperación posterior de 400 ms). Shift local para correr, C/K para dash. Se reutilizan reglas puras DashMotion, sin modificarlo. Los obstáculos bloquean siempre, incluso durante salto y dash. No se emiten eventos globales ni se toca guardado. No se integra combate.

## Alternativas consideradas
- Cambiar GameScene/main/Input/física compartida: innecesario y podría afectar al equipo.
- Cámara de seguimiento: descartada porque el humano pidió encuadre fijo de Isaac.
- Proyección isométrica real o cámara 3D: descartada; la profundidad es presentación 2D.

## Por qué
El humano autorizó expresamente un prototipo independiente para evaluar cámara y movilidad Isaac + Hades. Mantener módulos y entrada separados evita comprometer el diseño del juego lateral.

## Impacto si se rechaza
Retirar solo los módulos y pruebas nuevos. No hay dependencias desde el juego principal hacia el prototipo. Integrarlo en producción requeriría una tarea de coordinación diferente.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
