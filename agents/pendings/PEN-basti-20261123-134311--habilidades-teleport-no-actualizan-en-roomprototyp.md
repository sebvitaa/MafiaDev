---
id: PEN-basti-20261123-134311
type: pending
owner: basti         # quien debe resolverlo (dueño del dominio)
created_by: vicho
agent: gpt
created: 2026-11-23T16:43:11.425Z
title: Habilidades Teleport no actualizan en RoomPrototype y rompen e2e
priority: p0   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: open             # open | in_progress | blocked | done | wontfix
area:                    # combat | movement | world | exploration | character | abilities | items | audio | ui | shared
refs: []
closed_by:               # hash o HIS-ID al cerrar
---

## Contexto

La integración de Teleport necesita que el bucle del RoomPrototype avance `abilities.update(dt)` una vez por frame.

## Repro / evidencia
```text
npx.cmd playwright test --config playwright.local.tmp.config.ts tests/e2e/abilities-marks.spec.ts
4 failed: no aparecen marcas ni se actualiza el estado con Q, clic derecho y 1-4 en RoomPrototype.
```

## Criterio de cierre
- [ ] RoomPrototype llama `abilities.update(dt)` una vez por frame sin perder los controles de Teleport.
- [ ] tests/e2e/abilities-marks.spec.ts pasa con configuración local y un worker.

## Notas
