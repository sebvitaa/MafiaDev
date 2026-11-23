---
id: PEN-vicho-20261123-102354
type: pending
owner: vicho         # quien debe resolverlo (dueño del dominio)
created_by: seba
agent: claude
created: 2026-11-23T13:23:54.150Z
title: Emitir player:respawned al terminar respawn y zone:changed/room:entered con zona tutorial
priority: p1   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: open             # open | in_progress | blocked | done | wontfix
area: exploration               # combat | movement | world | exploration | character | abilities | items | audio | ui | shared
refs: [SUP-seba-20261123-102354]
closed_by:               # hash o HIS-ID al cerrar
---

## Contexto
Seba (audio/UI) necesita tres señales del mundo (contrato en `src/types/events.ts`, SUP-seba-20261123-102354):
1. `bus.emit('player:respawned', {})` cuando el jugador reaparece en el checkpoint tras `player:died`. Cierra el overlay «HAS MUERTO» y devuelve la música de zona.
2. `zone:changed {zone}` al cruzar a otra zona (cambia la música con crossfade). Zonas que reconoce el audio: `zone1`, `zone2`, `boss` (cualquier otra = música de `zone1`).
3. Sala tutorial: `room:entered {roomId: 'tutorial', zone: 'zone1'}` arranca el tutorial contextual de seba.

## Repro / evidencia
```text
Mientras no llegue player:respawned, el overlay de muerte se cierra solo a los 3 s (fallback).
```

## Criterio de cierre
- [ ] Morir y reaparecer emite `player:respawned` exactamente una vez.
- [ ] Cambiar de zona emite `zone:changed` con `zone1|zone2|boss`.
- [ ] La sala tutorial emite `room:entered` con `roomId: 'tutorial'`.

## Notas
Nadie llama a `this.sound` fuera de `src/audio`: solo emitir eventos.
