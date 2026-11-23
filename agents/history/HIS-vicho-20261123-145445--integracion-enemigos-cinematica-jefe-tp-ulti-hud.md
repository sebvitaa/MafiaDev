---
id: HIS-vicho-20261123-145500
type: history
owner: vicho
agent: claude
created: 2026-11-23T17:55:00.000Z
title: integracion enemigos cinematica jefe tp ulti hud
status: pass
commit: af4ed14, eec9add, 8d18319, de99394, a7ca41a, b5155c9
refs: [HIS-vicho-20261123-143041, HIS-vicho-20261123-144839, PEN-basti-20261123-144846, PEN-vicho-20261123-144839, SUP-vicho-20261123-142549]
---

## Objetivo
Pedido del humano: integrar enemigos de basti, cinemática de alejandro y jefe final en la zona de fuego; arreglar TP y ulti; mapear botones; obstáculos irregulares; 3 espadas; mensajes bajo el minimapa; título de bioma 4 s; merge a main.

## Cambios
- Merges: origin/basti/basic-enemies (conflicto RoomPlayer resuelto), origin/main (#9, #10 de seba: M/F del mundo, silencio 0), origin/alejandro/integracion-mundo-combate-local (cinemáticas).
- TP: había DOS Teleport en GameScene (character + RoomPlayer) → RoomPlayer recibe los slots del personaje. El papel ahora choca con muros de tilemap y el TP no aterriza dentro (Teleport.wallRects).
- Ulti: mantener clic derecho (sin Q) apunta al cursor cada frame; E queda para interactuar. Tajo de espada apunta al cursor.
- Controles: panel con las teclas reales; M mapa, F viaje, 0 silencio (alineado con #10).
- src/world/boss.ts: Bodoque (stats en enemies.json "boss") aparece al reanudar tras "La Última Apuesta" (room:entered set en la arena); HUD de seba usa su vida; créditos al morir.
- src/ui/gameStatus.ts: barra de recarga de ulti + estado TP en texto HD bajo el minimapa (el texto Phaser se oculta; los tests lo siguen leyendo).
- areaTitle: 4 s exactos y ya no queda pegado si se corta a medio fade.
- Codex (gpt): enemigos por zona/densidad (encounters.ts), obstáculos procedurales + 7 props nuevos, 3 espadas (spawn/cp2/cp4), roomId set.
- Tests: abilities-game adaptado al mundo cenital; player-lateral-movement en skip (PEN-basti-20261123-144846).

## Comandos y resultados
```text
$ npm run build → ok
$ npm test → 109 passed
$ npx playwright test -c playwright.local.tmp.config.ts → 34 passed, 3 skipped
```

## Tests
| test | resultado | nota |
|---|---|---|
| unit | 109 pass | |
| e2e completo | 34 pass / 3 skip | skip = Player lateral obsoleto |

## Observaciones
- Enemigos y jefe calculan línea de visión solo con cuerpos estáticos: ven a través de muros del tilemap.
- El jefe es provisional (knight con stats propios) hasta que basti implemente el combate final.
- El server en :8080 (proceso viejo) colgaba Playwright; se usó playwright.local.tmp.config.ts (puerto 5183).

## Siguiente paso
Playtest humano del jefe y densidades (SUP-vicho-20261123-142549); revisar visualmente los obstáculos nuevos.
