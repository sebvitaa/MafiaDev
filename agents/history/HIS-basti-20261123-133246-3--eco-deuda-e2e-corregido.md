---
id: HIS-basti-20261123-133246-3
type: history
owner: basti
agent: gpt
created: 2026-11-23T16:32:46.000Z
title: eco deuda e2e corregido
status: pass
commit:
refs: [SUP-basti-20261123-133012, HIS-basti-20261123-133246-2]
---

## Objetivo
Reverificar ambos flujos reales tras corregir la posición de prueba y lectura del flash.

## Cambios
- `src/player/room-prototype/TrainingDummy.ts`: mantiene flash de detonación visible hasta 600ms para que se lea mejor.
- `tests/e2e/player-room-prototype.spec.ts`: coloca al jugador en alcance para golpes original y eco.

## Comandos y resultados
```text
$ npx playwright test tests/e2e/player-room-prototype.spec.ts -g "Eco del Reverso|la bola consume marcas"
PASS: 2/2
```

## Tests
| test | resultado | nota |
|---|---|---|
| Dash→eco→swing adicional | pass | Primer swing da 25+9; replay usa inicio del dash; siguiente ataque no causa replay adicional. |
| Espada→marca→bola | pass | Marca consumida; fuego aplica 50+10; flash morado visible. |

## Observaciones
El máximo de tres marcas se cubre con la lógica unitaria; la escena muestra hasta tres pips morados.

## Siguiente paso
Ejecutar suites completas y guardar resultado final.
