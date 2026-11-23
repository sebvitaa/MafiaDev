---
id: PEN-alejandro-20261123-102354
type: pending
owner: alejandro         # quien debe resolverlo (dueño del dominio)
created_by: seba
agent: claude
created: 2026-11-23T13:23:54.196Z
title: Emitir ability:ended al terminar parar el tiempo
priority: p1   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: open             # open | in_progress | blocked | done | wontfix
area: abilities               # combat | movement | world | exploration | character | abilities | items | audio | ui | shared
refs: [SUP-seba-20261123-102354]
closed_by:               # hash o HIS-ID al cerrar
---

## Contexto
Al usar «parar el tiempo» (`ability:used {id}`) el audio baja la música a cámara lenta (rate 0.6, detune −600). Para restaurarla necesita `bus.emit('ability:ended', {id})` cuando termina el efecto (SUP-seba-20261123-102354). También conviene `ability:ready {id}` al terminar el cooldown (suena `sfx-ability-ready` y se actualiza el HUD).

## Repro / evidencia
```text
Mientras no llegue ability:ended, el audio restaura la música a los 3 s (fallback).
```

## Criterio de cierre
- [ ] `ability:ended` se emite una vez al terminar cada uso con duración, con el mismo `id` que `ability:used`.

## Notas
