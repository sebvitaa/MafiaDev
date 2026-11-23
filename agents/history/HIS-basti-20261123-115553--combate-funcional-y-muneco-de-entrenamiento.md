---
id: HIS-basti-20261123-115553
type: history
owner: basti
agent: gpt
created: 2026-11-23T14:55:53.536Z
title: combate funcional y muñeco de entrenamiento
status: pass             # pass | fail | partial
commit:                  # hash del commit de código
refs: [SUP-basti-20261123-115553]
---

## Objetivo
Convertir el tajo visual aislado en daño funcional, con hitbox frontal, alcance, cooldown, un impacto por objetivo y muñeco de entrenamiento con vida/reacción.

## Cambios
- `src/player/room-prototype/SwordCombat.ts`: contrato local `SwordDamageTarget`, sector geométrico y tracker de objetivos ya golpeados por swing.
- `src/player/room-prototype/SwordAttack.ts`: conserva tajo/tween, captura orientación, aplica daño al entrar en alcance, una vez por ID, y bloquea inicio durante ataque+cooldown.
- `src/player/room-prototype/TrainingDummy.ts`: objetivo temporal con HP, barra, label, flash rojo, retroceso y número de daño.
- `src/player/room-prototype/RoomPlayer.ts`, `RoomScene.ts`: inyectan proveedor local y componen dummy; sin contratos globales.
- `src/data/tuning.json`: daño, rango, apertura, cooldown, HP y radio configurables.
- `tests/unit/sword-combat.test.ts`: sector/rango, daño y una colisión por objetivo por swing.
- `tests/e2e/player-room-prototype.spec.ts`: integra pickup, daño, feedback, bloqueo por cooldown y segundo hit tras recuperación.
- `src/player/room-prototype/README.md`, `index.html`: instrucciones y límites de la integración.

## Comandos y resultados
```text
$ npm test -- tests/unit/sword-combat.test.ts # RED: módulo de combate local ausente
FAIL esperado: no se resuelve SwordCombat
$ npm run test:e2e -- --grep "la espada se recoge" # RED antes del dummy
FAIL esperado: scene.trainingDummy ausente
$ npm run typecheck
PASS
$ npm test
PASS 53/53
$ npm run test:e2e
PASS 13/13
$ npm run build
PASS (tsc --noEmit + Vite)
$ git diff --check
PASS
```

## Tests
| test | resultado | nota |
|---|---|---|
| Vitest | PASS 53/53 | sector, alcance y hit once per swing |
| Playwright E2E | PASS 13/13 | daño 25, reacción, cooldown 280 ms y segundo impacto permitido después |
| typecheck/build | PASS | Phaser 4 + TypeScript |

## Observaciones
<!-- comportamiento observado en playtest, métricas, warnings -->
`src/combat/index.ts` confirma que aún no hay componentes reutilizables; mantuve toda la lógica y adapter dentro del dominio propio del prototipo. Los avisos NO_COLOR/FORCE_COLOR en Playwright y LF→CRLF de Git no bloquean.

## Siguiente paso
Para enemigos reales, implementar/adaptar `SwordDamageTarget` localmente o mapearlo a sus componentes cuando existan; no se tocaron contratos/eventos compartidos. `origin/main` avanzó a 0746559 durante fetch; no se integró.
