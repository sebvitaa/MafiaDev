---
id: HIS-basti-20261123-125950
type: history
owner: basti
agent: gpt
created: 2026-11-23T15:59:50.000Z
title: bola fuego verificada
status: pass
commit:
refs: [SUP-basti-20261123-125357, HIS-basti-20261123-125314, HIS-basti-20261123-125613]
---

## Objetivo
Implementar bola de fuego local en room-prototype, apuntada con E + mouse y lanzada al soltar, sin tocar sistema de habilidades compartido.

## Cambios
- `src/player/room-prototype/FireballCombat.ts`: timeline configurable para apuntado, caída, explosión y cooldown, y blast con impacto único por objetivo.
- `src/player/room-prototype/RoomFireball.ts`: indicador, proyectil visual, explosión y sincronización del daño al llegar.
- `src/player/room-prototype/RoomPlayer.ts`: input E/mouse, cancelación al perder foco y actualización del hechizo.
- `src/player/room-prototype/TrainingDummy.ts`: adaptador al daño del muñeco.
- `src/player/room-prototype/RoomScene.ts`, `README.md`, `index.html`: estado HUD e instrucciones.
- `src/data/tuning.json`: parámetros configurables; supuesto reversible en SUP asociado.
- `tests/unit/fireball-combat.test.ts`, `tests/e2e/player-room-prototype.spec.ts`: reglas puras y flujo navegador.

## Comandos y resultados
```text
$ npm run typecheck
PASS
$ npm test
PASS: 11 archivos, 65 pruebas
$ npm run build
PASS: tsc y Vite production build
$ npm run test:e2e
PASS: 15 pruebas (incluye espada/carga, dash y bola de fuego)
```

## Tests
| test | resultado | nota |
|---|---|---|
| Unit suite | pass | 65/65 |
| E2E suite | pass | 15/15; E no causa daño antes de soltar; daño único al completar 600ms; cooldown bloquea re-apuntado |
| Typecheck/build | pass | ambos completados |

## Observaciones
El test E2E verifica 50 HP de daño usando el daño base de espada (25) por multiplicador 2. La caída visual se configura a 180px y la presentación de explosión a 300ms; supuestos documentados para validación humana. Se preservó el prototipo/código local ya existente; working tree contiene cambios previos de espada/carga y memoria de sesiones, sin commit ni push.

## Siguiente paso
Probar la sensación visual del lanzamiento y validar o ajustar SUP-basti-20261123-125357.
