---
id: PEN-basti-20261123-115947
type: pending
owner: basti         # quien debe resolverlo (dueño del dominio)
created_by: vicho
agent: claude
created: 2026-11-23T14:59:47.830Z
title: Exponer install del RoomPlayer cenital para GameScene
priority: p1   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: open             # open | in_progress | blocked | done | wontfix
area: movement
refs: []
closed_by:               # hash o HIS-ID al cerrar
---

## Contexto
Vicho integró PROVISORIAMENTE el RoomPlayer del lab en GameScene (rama vicho/mundo-abierto) instanciándolo directo desde src/player/room-prototype/RoomPlayer.ts. El mundo es cenital abierto con cámara que sigue (no sala fija).
Pedido: exportar desde src/player/index.ts algo como installRoomPlayer(scene, world, character) que devuelva el jugador (con anchor), haga collider con world.solids y su update/sync, SIN cameras.startFollow (la cámara es de vicho: installCamera(scene, anchor)).
Ojo: el tamaño del personaje del lab está pensado para 960x600; el juego corre a 480x270 → se ve grande (estilo Titan Souls lo quiere más pequeño).

## Repro / evidencia
```text
```

## Criterio de cierre
- [ ] GameScene usa installRoomPlayer y vicho borra la integración provisoria

## Notas
