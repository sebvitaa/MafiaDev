---
id: PEN-vicho-20261123-142015
type: pending
owner: vicho         # quien debe resolverlo (dueño del dominio)
created_by: seba
agent: claude
created: 2026-11-23T17:20:15.432Z
title: mapa-grande-tapa-el-juego-y-exploracion-sin-eventos
priority: p2   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: open             # open | in_progress | blocked | done | wontfix
area: world              # combat | movement | world | exploration | character | abilities | items | audio | ui | shared
refs: [HIS-seba-20261123-142015]
closed_by:               # hash o HIS-ID al cerrar
---

## Contexto
1. El mapa grande (M, `src/world/bigMap.ts`) es una cámara opaca a pantalla completa (`#07070d`). El juego sigue corriendo debajo, pero no se ve: no se puede seguir jugando con el mapa abierto. Seba ya arregló que M silenciara la música (commit `fix(ui)`, teclas globales).
2. Acciones de exploración sin evento en el bus, así que no pueden sonar: viaje rápido (F), coleccionables, pared ilusoria y atajo, carteles, abrir y cerrar el mapa, y el título de área.

## Repro / evidencia
```text
Playwright: M abre el mapa; music-zone1 sigue sonando; el jugador se mueve (x 408→459) pero la pantalla solo muestra el mapa.
grep bus.emit src/exploration → solo chest:opened, item:picked, checkpoint:reached, player:respawned, zone:changed, room:entered
```

## Criterio de cierre
- [ ] Mapa semitransparente o en recuadro, de forma que el juego se vea detrás (o pausar a propósito, decidido con seba).
- [ ] Eventos para las acciones de exploración. Los nuevos son un cambio `shared`; propuesta: `travel:fast`, `collectible:picked`, `secret:found`. Seba los mapea a SFX.
