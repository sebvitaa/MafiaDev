---
id: HIS-basti-20261123-122131
type: history
owner: basti
agent: gpt
created: 2026-11-23T15:21:31.057Z
title: e2e derrota y respawn del muñeco
status: partial          # pass | fail | partial
commit:                  # hash del commit de código
refs: []                 # PEN-/SUP-/HIS- relacionados
---

## Objetivo
Estabilizar la prueba del combo completo, derrota visual y respawn del muñeco en navegador.

## Cambios
- `tests/e2e/player-room-prototype.spec.ts`: valida cadena de tres golpes, daño, derrota, y espera explícita para el respawn visible.

## Comandos y resultados
```text
$ npx playwright test tests/e2e/player-room-prototype.spec.ts -g "la espada se recoge"
FAIL: al consultar el respawn con expect.poll el estado quedó en 0 HP al exceder el timeout; una espera explícita de 2050 ms mostró HP=100, defeated=false y remaining<0.
$ npx playwright test tests/e2e/player-room-prototype.spec.ts -g "la espada se recoge"
PASS: 1/1; test usa espera explícita de 2100 ms tras verificar derrota.
```

## Tests
| Playwright dirigido | pass final | La recuperación del modelo está integrada con el update de escena y se confirma tras 2100 ms. |

## Observaciones
<!-- comportamiento observado en playtest, métricas, warnings -->

## Siguiente paso
Repetir la suite e2e completa, luego typecheck, Vitest y build en estado final.
