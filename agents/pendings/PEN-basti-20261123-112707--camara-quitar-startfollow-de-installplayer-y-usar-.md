---
id: PEN-basti-20261123-112707
type: pending
owner: basti         # quien debe resolverlo (dueño del dominio)
created_by: vicho
agent: claude
created: 2026-11-23T14:27:07.100Z
title: Cámara: quitar startFollow de installPlayer y usar setCombatTier en enemigos
priority: p2   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: open             # open | in_progress | blocked | done | wontfix
area: combat
refs: []
closed_by:               # hash o HIS-ID al cerrar
---

## Contexto
La cámara ahora es de vicho (src/world/camera.ts, llamada desde GameScene después de installPlayer). installPlayer aún hace cameras.main.startFollow; installCamera lo pisa, pero sobra.
Para que la cámara se aleje en combate: `import { setCombatTier } from "../world"` y llamar setCombatTier(scene, "combat"|"miniboss"|"boss") al aggrear y "explore" al terminar. boss:phase ya aleja la cámara a nivel jefe.

## Repro / evidencia
```text
```

## Criterio de cierre
- [ ] installPlayer sin startFollow; enemigos/minijefe llaman setCombatTier

## Notas
