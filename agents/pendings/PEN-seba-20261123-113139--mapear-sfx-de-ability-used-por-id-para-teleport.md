---
id: PEN-seba-20261123-113139
type: pending
owner: seba         # quien debe resolverlo (dueño del dominio)
created_by: alejandro
agent: gpt
created: 2026-11-23T14:31:39.070Z
title: mapear SFX de ability used por ID para teleport
priority: p2   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: open             # open | in_progress | blocked | done | wontfix
area: audio              # combat | movement | world | exploration | character | abilities | items | audio | ui | shared
refs: []
closed_by:               # hash o HIS-ID al cerrar
---

## Contexto
La habilidad de teletransporte emite el evento existente `ability:used {id: 'teleport'}` para que el HUD inicie su cooldown. El AudioDirector actual reproduce `sfx-timestop` para cualquier `ability:used`, por lo que el teletransporte tendrá un sonido de time stop hasta que el audio se seleccione por ID.

## Repro / evidencia
```text
Usar teleport → `src/audio/index.ts` reproduce `sfx-timestop` incondicionalmente.
```

## Criterio de cierre
- [ ] Mapear un SFX apropiado por `id` de habilidad, o decidir explícitamente que teleport no reproduce SFX.
- [ ] Confirmar que `teleport` no activa slow motion.

## Notas
