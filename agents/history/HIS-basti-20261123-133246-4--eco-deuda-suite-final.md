---
id: HIS-basti-20261123-133246-4
type: history
owner: basti
agent: gpt
created: 2026-11-23T16:32:46.000Z
title: eco deuda suite final
status: pass
commit:
refs: [SUP-basti-20261123-133012, HIS-basti-20261123-132419]
---

## Objetivo
Terminar y verificar Eco del Reverso y marcas de deuda en el laboratorio de combate.

## Cambios
- `src/player/room-prototype/EchoDebtCombat.ts`: lógica pura de ventana/replay del eco y ledger de marcas temporizadas.
- `src/player/room-prototype/RoomEcho.ts`: silueta y corte morados, hitbox replicado y limpieza en shutdown.
- `src/player/room-prototype/RoomPlayer.ts`, `SwordAttack.ts`, `SwordCombat.ts`: registrar dash y clonar parámetros de ataques normales/cargados; aplicar marca por objetivo una vez por swing.
- `src/player/room-prototype/TrainingDummy.ts`, `FireballCombat.ts`, `RoomFireball.ts`: pips morados, expiración, consumo y bonus en un impacto, flash visual.
- `src/data/tuning.json`, `README.md`: tuning e instrucciones.
- `tests/unit/echo-debt-combat.test.ts`, `tests/e2e/player-room-prototype.spec.ts`: reglas puras e integración de navegador.

## Comandos y resultados
```text
$ npx vitest run tests/unit/echo-debt-combat.test.ts
PASS: 5/5
$ npm run typecheck
PASS
$ npm test
PASS: 12 archivos, 70 pruebas
$ npm run build
PASS: tsc + Vite
$ npm run test:e2e
PASS: 17/17
```

## Tests
| test | resultado | nota |
|---|---|---|
| Eco ventana/replay | pass | 800ms, retardo 120ms, una sola repetición por dash; captura combo/cargado; daño redondeado al 35% |
| Ledger de deuda | pass | límite 3, timers individuales de 4s, consumo por objetivo |
| Integración eco | pass | Espada original + eco desde dash; segundo golpe durante misma ventana no programa otro replay |
| Integración bola | pass | Una marca consumida; 50 base + 10 bonus, un hit al dummy y flash morado |
| Typecheck/unit/build/e2e | pass | 70 unitarias y 17 e2e; `git diff --check` limpio |

## Observaciones
El bonus de 10 por marca y la expiración individual/no-refresh al llegar al límite están documentados en SUP-basti-20261123-133012 para validación humana. Todo quedó en el dominio de Basti y adapters del prototipo; sin cambios shared, commit ni push.

## Siguiente paso
Probar la lectura visual en la sala y validar o ajustar SUP-basti-20261123-133012.
