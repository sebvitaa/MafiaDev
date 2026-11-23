---
id: SUP-basti-20261123-144553
type: supuesto
owner: basti         # quien tomó la decisión
validator: basti # dueño del dominio afectado | equipo
agent: gpt
created: 2026-11-23T17:45:53.585Z
title: presentacion local corazon codex y canal 23
impact: bajo       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [src/enemies/BodoqueFinale.ts]
refs: []
---

## Decisión
La interrupción dura 1500 ms y la ruptura final 1600 ms. El núcleo se expone a 48 px a la derecha y 18 px arriba del ancla, radio 16; la presentación y el objetivo usan las mismas coordenadas. Partículas y lluvia son Graphics acotados. Los 100 HP y 1200 ms de apertura y el umbral 23 están especificados por basti.

## Alternativas consideradas
Texto modal que pausa combate (descartado porque debe continuar), una segunda entidad con salud propia (descartada porque debe compartir los últimos HP), logo aproximado (descartado en favor de marcador explícito).

## Por qué
Mantiene el laboratorio aislado, la geometría coherente y el total de vida original. No requiere contratos nuevos ni cambios de UI/audio/mapas.

## Impacto si se rechaza
Ajustar presentación y tiempos locales; la FSM y los adaptadores siguen utilizables. Pendiente de asset: PEN-basti-20261123-144553.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
