---
id: HIS-basti-20261123-133246
type: history
owner: basti
agent: gpt
created: 2026-11-23T16:32:46.000Z
title: eco deuda logica verde
status: pass
commit:
refs: [SUP-basti-20261123-133012, HIS-basti-20261123-132419]
---

## Objetivo
Validar lógica sin Phaser para Eco del Reverso, marcas de deuda y consumo de marcas por la bola de fuego.

## Cambios
- `src/player/room-prototype/EchoDebtCombat.ts`: ventana de eco y ledger de marcas.
- `src/player/room-prototype/FireballCombat.ts`: consumo de marcas y bonus en un impacto.
- `tests/unit/echo-debt-combat.test.ts`: límites, timers, replay y detonación.

## Comandos y resultados
```text
$ npx vitest run tests/unit/echo-debt-combat.test.ts
PASS: 5/5
$ npm run typecheck
PASS
```

## Tests
| test | resultado | nota |
|---|---|---|
| Unit tests enfocados | pass | 5/5; incluye clonación de golpe cargado y expiración independiente |
| Typecheck | pass | Phaser/UI local también tipa correctamente |

## Observaciones
Daño de eco se redondea con `Math.round` al aplicar 35 %; el valor queda cuantizado a enteros como el resto del combate.

## Siguiente paso
Completar el e2e de dash→eco y espada→marca→bola de fuego.
