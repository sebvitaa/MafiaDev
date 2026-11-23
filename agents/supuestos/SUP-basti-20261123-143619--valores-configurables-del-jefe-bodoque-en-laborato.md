---
id: SUP-basti-20261123-143619
type: supuesto
owner: basti         # quien tomó la decisión
validator: basti # dueño del dominio afectado | equipo
agent: gpt
created: 2026-11-23T17:36:19.307Z
title: valores configurables del jefe bodoque en laboratorio
impact: medio       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [src/enemies/BodoqueBoss.ts, src/data/enemies.json, src/data/tuning.json]
refs: []
---

## Decisión
Para el primer laboratorio se fija activación con B, figura provisional y 100 HP locales para Ríos. Los valores tentativos de Fase 1 quedan configurables en `src/data/enemies.json`: mazo 12 daño/92 px/500 ms de anticipación, flash 18/190 px/760 ms y embestida 22/230 px/680 ms; cada patrón tiene ventana activa y recuperación configurables. Se usan límites de sala para que la embestida no salga del escenario. La vida del jefe es 600 y los umbrales 66%/33%, según solicitud/lore.

## Alternativas consideradas
Activación automática al entrar (descartada para conservar el muñeco y permitir test opt-in); controlar daño/tiempos en constantes del código (descartado por equilibrio configurable); implementar fases 2/3 (descartado explícitamente hasta acordar sus patrones).

## Por qué
Permite probar la pelea sin tocar la composición de `GameScene` ni contratos compartidos. Los ataques tienen timings legibles y se adaptan a una sala pequeña; los valores son de prototipo, no balance final.

## Impacto si se rechaza
Cambiar números en `src/data/enemies.json`/`src/data/tuning.json`, tecla de activación o presentación local. No requiere cambiar interfaces, hitboxes de jugador ni flujos de enemigos reales.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
