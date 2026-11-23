---
id: PEN-basti-20261123-102354
type: pending
owner: basti         # quien debe resolverlo (dueño del dominio)
created_by: seba
agent: claude
created: 2026-11-23T13:23:54.237Z
title: Minijefe: boss:phase 1 al iniciar combate y enemy:killed con kind boss al morir
priority: p2   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: open             # open | in_progress | blocked | done | wontfix
area: combat               # combat | movement | world | exploration | character | abilities | items | audio | ui | shared
refs: [SUP-seba-20261123-102354]
closed_by:               # hash o HIS-ID al cerrar
---

## Contexto
Música del jefe (SUP-seba-20261123-102354): con `boss:phase {phase: 1}` el audio funde a silencio, suena `sfx-boss-roar` y entra `music-boss`. Con `enemy:killed` y `kind: 'boss'` suena la fanfarria y vuelve la música de zona. La barra de vida del jefe del HUD escucha `enemy:hit` con el `id` del jefe.

## Repro / evidencia
```text
```

## Criterio de cierre
- [ ] Al empezar el combate se emite `boss:phase {phase: 1}` (y 2, 3… en cada cambio de fase).
- [ ] La muerte del minijefe emite `enemy:killed` con `kind: 'boss'`.

## Notas
Si el `kind` del minijefe tiene otro nombre, avisa a seba en un pending.
