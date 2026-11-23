---
id: SUP-vicho-20261123-105154
type: supuesto
owner: vicho         # quien tomó la decisión
validator: equipo # dueño del dominio afectado | equipo
agent: claude
created: 2026-11-23T13:51:54.877Z
title: Vista cenital mundo abierto en vez de plataformas laterales
impact: alto       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: []            # rutas con marcador // SUP-<id>
refs: []
---

## Decisión
Vicho (humano) decide: el juego es de vista cenital (top-down, cámara como The Binding of Isaac) y mundo abierto continuo inspirado en Elden Ring, NO salas ni plataformas laterales. Cámara centrada en el jugador con lookahead suave hacia la dirección de movimiento (estilo Titan Souls).

## Alternativas consideradas
(a) Metroidvania lateral con gravedad (README/AGENTS actual). (b) Lateral con cámara fija por sala.

## Por qué
Preferencia de diseño del dueño del mundo (vicho).

## Impacto si se rechaza
Si se acepta: src/main.ts (shared) necesita gravity y=0; basti rehace movimiento (sin saltar/doble salto/coyote → mover en 8 direcciones, dash); README y AGENTS dicen "scroll lateral". Si se rechaza: vicho vuelve a mundo lateral y los PEN V01-V24 se ajustan.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
