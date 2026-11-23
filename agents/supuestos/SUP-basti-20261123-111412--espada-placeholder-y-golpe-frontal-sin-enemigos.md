---
id: SUP-basti-20261123-111412
type: supuesto
owner: basti         # quien tomó la decisión
validator: basti # dueño del dominio afectado | equipo
agent: gpt
created: 2026-11-23T14:14:12.298Z
title: espada placeholder y golpe frontal sin enemigos
impact: medio       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [src/player/room-prototype/SwordPickup.ts, src/player/room-prototype/SwordAttack.ts]
refs: []
---

## Decisión
Ubicar una espada placeholder luminosa en (480, 330), equiparla al tocarla y habilitar click izquierdo para desplegar durante 140 ms un rectángulo frontal de 42×24 px como hitbox visible. No se aplica daño, pues el prototipo no tiene enemigos.

## Alternativas consideradas
Esperar sprite y enemigos finales, o representar el pickup/hitbox con figuras temporales Phaser dentro de la escena aislada.

## Por qué
El placeholder permite probar recogida, estado equipado y input de ataque sin depender de assets, mapas, contratos globales ni sistemas de compañeros.

## Impacto si se rechaza
Habría que mover el pickup o reemplazar las figuras temporales/duración del hitbox antes de integrar sprites, enemigos y daño.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
