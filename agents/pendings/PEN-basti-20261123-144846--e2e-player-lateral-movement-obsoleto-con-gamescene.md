---
id: PEN-basti-20261123-144846
type: pending
owner: basti         # quien debe resolverlo (dueño del dominio)
created_by: vicho
agent: claude
created: 2026-11-23T17:48:46.274Z
title: e2e player-lateral-movement obsoleto con GameScene cenital
priority: p1   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: done
area:                    # combat | movement | world | exploration | character | abilities | items | audio | ui | shared
refs: []
closed_by: HIS-basti-20261123-160257
---

## Contexto
GameScene (rama vicho/mundo-abierto, ahora en main) usa el RoomPlayer cenital (SUP-vicho-20261123-105154); el Player lateral (src/player/Player.ts, fsm, gravedad) ya no se instancia. Los 3 tests de tests/e2e/player-lateral-movement.spec.ts leen player.fsm.current y fallan. Se marcaron test.skip con este ID para que el CI de main pase.

## Repro / evidencia
```text
```

## Criterio de cierre
- [x] Reescribir los casos (Shift corre, dash con fin/invulnerabilidad, paredes bloquean) contra el RoomPlayer en GameScene, o borrar el spec si ya lo cubre player-room-prototype; quitar los skip.


## Notas

## Cierre de integración
Verificado en candidata del PR #15: suite completa Chromium 49/49 sin skips; lógica de TP y movimiento cenital activos. HIS-basti-20261123-160257.
