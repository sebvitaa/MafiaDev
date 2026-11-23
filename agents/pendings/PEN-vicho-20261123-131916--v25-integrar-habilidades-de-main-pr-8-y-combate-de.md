---
id: PEN-vicho-20261123-131916
type: pending
owner: vicho         # quien debe resolverlo (dueño del dominio)
created_by: vicho
agent: claude
created: 2026-11-23T16:19:16.238Z
title: V25 Integrar habilidades de main (PR 8) y combate de basti en vicho/mundo-abierto
priority: p1   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: open             # open | in_progress | blocked | done | wontfix
area: world
refs: []
closed_by:               # hash o HIS-ID al cerrar
---

## Contexto
Merge de origin/main (feat(abilities): red de cuatro marcas TP con Q y teclas 1-4, PR 8) y origin/feature/basti-movement-combat (combos, ataque cargado, bola de fuego). GameScene usa provisoriamente RoomPlayer de src/player/room-prototype; conectar lo que exporten (installCharacter/abilities, ataques) sin editar archivos ajenos.

## Repro / evidencia
```text
```

## Criterio de cierre
- [ ] Merge sin conflictos pendientes; npm run build y npm test en verde; las habilidades (Q/1-4) funcionan en el mundo abierto

## Notas
