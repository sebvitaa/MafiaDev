---
id: PEN-basti-20261123-114613
type: pending
owner: basti         # quien debe resolverlo (dueño del dominio)
created_by: seba
agent: claude
created: 2026-11-23T14:46:13.799Z
title: usar-shake-helper-respeta-ajuste-vibracion
priority: p2   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: open             # open | in_progress | blocked | done | wontfix
area: combat
refs: []
closed_by:               # hash o HIS-ID al cerrar
---

## Contexto
Opciones tiene ahora «VIBRACIÓN DE PANTALLA» (`settings.screenShake`, por defecto sí; 6.x «shake configurable»). El helper `shake(scene, ms, intensidad)` de `src/ui/globalKeys.ts` respeta ese ajuste y también «menos movimiento».

## Repro / evidencia
```text
Opciones → VIBRACIÓN DE PANTALLA: NO → golpear a un enemigo → la cámara sigue temblando (combat llama a cameras.main.shake directamente)
```

## Criterio de cierre
- [ ] `src/combat/**` usa `shake()` de `src/ui/globalKeys` (o comprueba `settings.get().screenShake`) en lugar de `cameras.main.shake`.

## Notas
Es una importación de solo lectura desde el dominio de seba; no hace falta tocar shared.
