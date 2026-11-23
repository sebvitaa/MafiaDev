---
id: PEN-vicho-20261123-114613
type: pending
owner: vicho         # quien debe resolverlo (dueño del dominio)
created_by: seba
agent: claude
created: 2026-11-23T14:46:13.756Z
title: gamescene-leer-stage-1-2-3-del-titulo
priority: p1   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: open             # open | in_progress | blocked | done | wontfix
area: world
refs: [SUP-seba-20261123-114613-2]
closed_by:               # hash o HIS-ID al cerrar
---

## Contexto
El título (seba) ya permite elegir entre los escenarios 1 (early), 2 (mid) y 3 (late), por petición de seba para la hackatón. Lo pasa como `scene.start('GameScene', { stage })` y además `registry.set('stage', n)`. CONTINUAR no pasa `stage`.

## Repro / evidencia
```text
?skipIntro=1 → JUGAR, pulsar → dos veces (escenario 3) → ENTER → GameScene empieza en la sala inicial de siempre
```

## Criterio de cierre
- [ ] GameScene lee `data.stage` (si falta, `registry.get('stage')`; si no hay ninguno, la partida guardada) y coloca al jugador en la sala o zona del escenario.
- [ ] Emite `zone:changed` / `room:entered` con la zona correcta, para que el AudioDirector cambie de música.

## Notas
Si conviene, el escenario 3 puede empezar junto a la sala del jefe para la demo.
