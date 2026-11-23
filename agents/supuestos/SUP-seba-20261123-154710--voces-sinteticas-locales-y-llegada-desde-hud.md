---
id: SUP-seba-20261123-154710
type: supuesto
owner: seba         # quien tomó la decisión
validator: equipo # dueño del dominio afectado | equipo
agent: gpt
created: 2026-11-23T18:47:10.919Z
title: voces sinteticas locales y llegada desde HUD
impact: bajo       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [src/ui/laNotaArrival.ts]            # rutas con marcador // SUP-<id>
refs: [SUP-basti-20261123-153110, PEN-seba-20261123-153110]
---

## Decisión
El montaje utiliza 16 pistas habladas grabadas con tres voces sintéticas de Windows. Los recortes, lluvia, fichas, poses de escucha y movimientos de boca se componen en 13 planos a 24 fps. El HUD presenta el plano 14 sobre la cámara efectiva de la partida, suspende GameScene durante cinco segundos y conserva el objetivo seis segundos después de entregar control. ESC/ENTER permiten adelantar la llegada.

## Alternativas consideradas
La locución humana o un nuevo rodaje reemplazarían las pistas y el WebM. Un fondo prerenderizado para el cierre exigiría variantes por mapa.

## Por qué
Los recursos existentes conservan la identidad de los personajes y el jugador aparece en la posición elegida por el mapa. Basti autorizó el dominio de seba y la publicación en rama seba/* en este chat con «si, autorizado».

## Impacto si se rechaza
Se pueden cambiar voces o ritmo sin modificar los mapas. La aceptación de los valores de producción corresponde al equipo.

## Resolución
Pendiente.
