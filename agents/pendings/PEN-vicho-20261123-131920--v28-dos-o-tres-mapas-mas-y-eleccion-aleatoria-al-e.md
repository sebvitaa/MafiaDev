---
id: PEN-vicho-20261123-131920
type: pending
owner: vicho         # quien debe resolverlo (dueño del dominio)
created_by: vicho
agent: claude
created: 2026-11-23T16:19:20.268Z
title: V28 Dos o tres mapas más y elección aleatoria al empezar
priority: p1   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: open             # open | in_progress | blocked | done | wontfix
area: world
refs: []
closed_by:               # hash o HIS-ID al cerrar
---

## Contexto
genWorld.mjs con semilla/variante produce public/assets/maps/world-1.json..world-3.json (mismo estilo: salas de formas distintas, 5 biomas, mismos nombres de objetos y validaciones). preloadWorld carga uno al azar en la clave de caché 'world'; ?map=N lo fuerza (para tests).

## Repro / evidencia
```text
```

## Criterio de cierre
- [ ] Recargar da mapas distintos; ?map=N fuerza uno; e2e world-zones y exploration-secrets pasan en cada mapa

## Notas
