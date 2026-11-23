---
id: HIS-vicho-20261123-121240
type: history
owner: vicho
agent: claude
created: 2026-11-23T15:12:40Z
title: biomas cofres espada mapa grande
status: pass
commit: 8825b4d
refs: [PEN-vicho-20261123-105121, PEN-vicho-20261123-105137, PEN-vicho-20261123-105131, SUP-vicho-20261123-121240]
---

## Objetivo
Pedido de vicho: cámara más lejana, biomas en pixel art, espada y cofre de prueba, mapa grande con tecla. Integración provisoria con el RoomPlayer de basti.

## Cambios
- `src/world/biomeTiles.ts`: tileset 128x96 dibujado pixel a pixel (4 biomas x 4 suelos, muros top/cara 3/4, 8 decoraciones).
- `public/assets/maps/world.json`: (Codex) tileset biomes, suelo por bioma con manchas, capa deco (1153), muros top/cara, objetos sword1 y chest0 cerca del spawn.
- `src/exploration/chests.ts`: cofres de Tiled, E cerca abre, rollTable('chest'), emite chest:opened e item:picked, texto flotante con color de rareza.
- `src/world/bigMap.ts`: M abre/cierra mapa completo con marcador del jugador.
- `src/world/config.json`: zoom explore 0.75 / combat 0.65 / miniboss 0.55 / boss 0.5.
- `src/scenes/GameScene.ts`: SwordPickup del lab en objetos sword; installExploration e installBigMap.

## Comandos y resultados
```text
npm run typecheck → ok
playwright (config temporal puerto 5183, spec temporal no versionado) → 1 passed
events: chest:opened {chest0} + item:picked {elixir_furia, epic}; sin errores de consola; 58 fps con el mapa grande abierto
```

## Observaciones
- Zoom no entero (0.75) con pixelArt: pixeles algo irregulares. Recomendado al equipo: resolución 960x540 en main.ts (shared) y zooms 1.5/1.25/1.
- El jugador se dibuja sobre los muros (sin orden de profundidad con tiles).
- Mapa grande sin niebla de guerra (V15 pendiente).

## Siguiente paso
V06 zonas + V15 exploración (Codex), V07 checkpoints tipo hoguera.
