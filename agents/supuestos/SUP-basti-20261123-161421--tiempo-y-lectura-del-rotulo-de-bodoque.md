---
id: SUP-basti-20261123-161421
type: supuesto
owner: basti         # quien tomó la decisión
validator: basti # dueño del dominio afectado | equipo
agent: gpt
created: 2026-11-23T19:14:21.141Z
title: Tiempo y lectura del rotulo de Bodoque
impact: bajo       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [src/enemies/BodoqueBrain.ts]
refs: []
---

## Decisión

Mostrar las últimas palabras de Bodoque 5500 ms de juego en un rótulo fijo. Si el corazón llega a cero durante la frase, distribuir la ruptura sobre el tiempo restante, con un mínimo de 1600 ms. La identificación en vivo ocupa la esquina superior derecha, frente al minimapa. Los monitores conservan los dígitos a lo largo del encuentro y utilizan una franja inferior para el estado de señal.

## Alternativas consideradas

Acortar el texto en el remate o superponerlo al vídeo final.

## Por qué

Un golpe que cruza el umbral puede ser letal. Completar la lectura durante la ruptura deja libre el primer plano del vídeo y permite seguir golpeando mientras queden HP.

## Impacto si se rechaza

Ajustar el tiempo en enemies.json o la presentación del rótulo en el dominio de combate.

## Resolución

Pendiente de validación por basti.
