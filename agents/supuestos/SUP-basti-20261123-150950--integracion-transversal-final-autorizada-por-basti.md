---
id: SUP-basti-20261123-150950
type: supuesto
owner: basti         # quien tomó la decisión
validator: equipo # dueño del dominio afectado | equipo
agent: gpt
created: 2026-11-23T18:09:50.660Z
title: integracion transversal final autorizada por basti
impact: alto       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [src/scenes/GameScene.ts, src/world/boss.ts, src/ui/index.ts, src/main.ts, src/abilities/index.ts]
refs: []
---

## Decisión
Preparar una rama transversal basada en main 3c75dfa, conservar mapas/assets/cinemáticas originales y fusionar el combate publicado de Basti manualmente por implementación. Se permite editar dominios ajenos y shared en esta rama por el pedido explícito del humano (archivo adjunto «MAFIADEV — INTEGRACIÓN DEFINITIVA DE LOS CUATRO INTEGRANTES»): «Tienes autorización para preparar y publicar una rama y Pull Request de integración que abarque los dominios del equipo».

R se dedica a Lluvia Italiana con 100 daño base y cooldown 20000 ms; T reinicia el lab; E interacción. Se completan I de clase, fases 2/3, único flujo de victoria y viñetas finales provisionales. La vida de Bodoque sigue siendo 600 y los últimos 100 son la misma reserva. El balance nuevo de patrones y la ráfaga de almas (3 × 25, 3 almas iniciales y coste 1) queda configurable para revisión del equipo.

## Alternativas consideradas
Reemplazar archivos completos por una sola rama (descartado: perdería salud/colisiones/TP del main nuevo); duplicar jugador/habilidades (descartado); volver a fusionar #11 (ya está en main); publicar directamente en main o sin review (descartado por la instrucción explícita y las protecciones).

## Por qué
El usuario exige una única versión jugable y preservar la presentación. Se prepara el cambio concreto en worktree y PR, dejando la aprobación del código compartido y ajeno como condición previa a fusionar.

## Impacto si se rechaza
El PR permanece sin fusionar; ajustar los puntos rechazados sin alterar el main actual ni borrar las ramas fuente.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
Autorización de preparación/publicación dada por Basti en el adjunto. La validación transversal final de los dueños del equipo aún está pendiente; el agente no la declara aprobada.
