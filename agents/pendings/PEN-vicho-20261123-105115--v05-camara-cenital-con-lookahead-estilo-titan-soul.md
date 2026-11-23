---
id: PEN-vicho-20261123-105115
type: pending
owner: vicho         # quien debe resolverlo (dueño del dominio)
created_by: vicho
agent: claude
created: 2026-11-23T13:51:15.315Z
title: V05 Cámara cenital con lookahead estilo Titan Souls
priority: p1   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: open             # open | in_progress | blocked | done | wontfix
area: world
refs: []
closed_by:               # hash o HIS-ID al cerrar
---

## Contexto
Seguir al jugador con lerp; desplazamiento suavizado hacia la dirección de movimiento (lookahead), vuelve al centro al detenerse. Limitada a los bordes del mapa. Lógica del offset pura y testeable.
MoSCoW: MUST. Vista cenital, mundo abierto (no por salas).

## Repro / evidencia
```text
```

## Criterio de cierre
- [ ] Test Vitest del cálculo de offset; a simple vista el jugador queda casi centrado y la cámara se adelanta al moverse

## Notas
- 2026-11-23 (vicho): Aprobado: lookahead ~40 px con suavizado; constantes en src/world/config.json (dominio vicho). Ajustar jugando.
