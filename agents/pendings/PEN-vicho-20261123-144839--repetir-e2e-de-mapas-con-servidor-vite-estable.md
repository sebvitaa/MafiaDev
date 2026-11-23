---
id: PEN-vicho-20261123-144839
type: pending
owner: vicho         # quien debe resolverlo (dueño del dominio)
created_by: vicho
agent: gpt
created: 2026-11-23T17:48:39.894Z
title: Repetir e2e de mapas con servidor Vite estable
priority: p1   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: done             # open | in_progress | blocked | done | wontfix
area: world              # combat | movement | world | exploration | character | abilities | items | audio | ui | shared
refs: []
closed_by: b5155c9
---

## Contexto
La verificación de mapas 1..3 no puede completarse de forma fiable mientras el servidor temporal de Playwright deja de aceptar conexiones entre casos.

## Repro / evidencia
```text
world-zones: mapa 1 pasó (18.6 s); mapas 2 y 3 fallaron con page.goto ERR_CONNECTION_REFUSED en localhost:5183.
smoke.spec.ts pasó por separado (1/1, 8.9 s).
```

## Criterio de cierre
- [ ] Ejecutar world-zones, exploration-secrets y smoke en mapas 1..3 con Vite 5183 estable; todos pasan.

## Notas
No se cambió la configuración compartida: otros agentes mantienen procesos Vite en paralelo.
