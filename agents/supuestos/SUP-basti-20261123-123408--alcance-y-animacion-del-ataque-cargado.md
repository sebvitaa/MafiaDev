---
id: SUP-basti-20261123-123408
type: supuesto
owner: basti         # quien tomó la decisión
validator: basti # dueño del dominio afectado | equipo
agent: gpt
created: 2026-11-23T15:34:08.908Z
title: alcance y animacion del ataque cargado
impact: medio       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [src/player/room-prototype/SwordAttack.ts]
refs: []
---

## Decisión
Máximo alcance 150% del primer corte (108 px) y daño 200%; animación de salida 480 ms, ventana de impacto 190 ms y semiancho del sector 46°. El brillo crece de 13 a 33 px. Carga empieza después de 350 ms, alcanza techo a 1200 ms del inicio y no aplica daño antes de soltar. Carga y tajo guardan la pose de su propio fotograma; recorrido/velocidad del slash y hitbox usan la misma curva Cubic.Out.

## Alternativas consideradas
Hacer carga instantánea al superar 350 ms; usar el mismo rango que el remate; dejar el hitbox estacionario en el origen durante toda la animación.

## Por qué
Se requiere carga progresiva, daño doble, mayor alcance y seguimiento del jugador. Los 50% adicionales hacen que el corte alcance un blanco a 120 px con radio 18, fuera del rango normal; 480/190 ms reservan recuperación visual después de una ventana activa corta. La misma curva de interpolación evita divergencia espacial.

## Impacto si se rechaza
Reversible desde los parámetros `swordCharge*` en `src/data/tuning.json`; mover o cancelar la carga no cambia cámara, física ni contratos compartidos.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
