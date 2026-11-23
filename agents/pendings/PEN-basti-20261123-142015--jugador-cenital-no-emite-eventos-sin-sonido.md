---
id: PEN-basti-20261123-142015
type: pending
owner: basti         # quien debe resolverlo (dueño del dominio)
created_by: seba
agent: claude
created: 2026-11-23T17:20:15.386Z
title: jugador-cenital-no-emite-eventos-sin-sonido
priority: p1   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: open             # open | in_progress | blocked | done | wontfix
area: movement           # combat | movement | world | exploration | character | abilities | items | audio | ui | shared
refs: [HIS-seba-20261123-142015]
closed_by:               # hash o HIS-ID al cerrar
---

## Contexto
`GameScene` usa de forma provisional el `RoomPlayer` del lab (rama de vicho), y el lab «no emite eventos globales» (README). Por eso en el juego **no suena ninguna acción del jugador**, aunque el AudioDirector ya tiene SFX para todas: `sfx-jump`, `sfx-land`, `sfx-dash`, `sfx-swing` (combo 1-3), `sfx-hit`, `sfx-enemy-death` y `sfx-hurt`.

## Repro / evidencia
```text
grep bus.emit src/player/room-prototype → 0 resultados
Acciones mudas en el juego: salto, doble salto, aterrizaje, dash, tajo y combo de espada,
ataque cargado, bola de fuego (E), recoger la espada, golpes y muerte del dummy.
```

## Criterio de cierre
- [ ] `RoomPlayer` (o el `installPlayer` definitivo) emite `player:jump {air}`, `player:land {vy}`, `player:dash`, `player:attack {combo}` y `enemy:hit` / `enemy:killed` al golpear. Ataque cargado y bola de fuego: usar `player:attack` o pedir eventos nuevos (cambio `shared`).

## Notas
No hay enemigos en el juego (`src/enemies` es un stub), así que slime, knight, miniboss y jefe no existen todavía y no pueden sonar.
