---
id: HIS-basti-20261123-111412
type: history
owner: basti
agent: gpt
created: 2026-11-23T14:14:12.235Z
title: pickup espada y ataque simple del prototipo
status: pass             # pass | fail | partial
commit:                  # hash del commit de código
refs: [SUP-basti-20261123-111412]
---

## Objetivo
Añadir al prototipo aislado un pickup de espada brillante y un ataque frontal temporal controlado con click izquierdo.

## Cambios
- `src/player/room-prototype/SwordPickup.ts`: placeholder flotante con pulso de brillo, pickup por proximidad, desaparece al recoger.
- `src/player/room-prototype/SwordAttack.ts`: hitbox rectangular visible temporal que apunta según facing; aún no aplica daño.
- `src/player/room-prototype/RoomPlayer.ts`: estado `hasSword`, equipamiento local, input click izquierdo y limpieza del listener.
- `src/player/room-prototype/RoomScene.ts`: coloca la espada en sala y equipa al jugador al recogerla.
- `src/data/tuning.json`: radio, flotación, duración y medidas del hitbox bajo `roomPrototype`.
- `src/player/room-prototype/index.html`, `README.md`: instrucciones de prueba y límites.
- `tests/e2e/player-room-prototype.spec.ts`: regresión para bloquear ataque sin espada, recogerla y activar/terminar hitbox.

## Comandos y resultados
```text
$ npm run test:e2e -- --grep "la espada se recoge" # RED antes de implementar: pickup aún no existía
FAIL esperado: no se encontraba swordPickup
$ npm run test:e2e -- --grep "la espada se recoge" # después de implementar
PASS 1/1
$ npm run typecheck
PASS
$ npm test
PASS 46/46
$ npm run test:e2e
PASS 12/12
$ npm run build
PASS (tsc --noEmit + Vite)
$ git diff --check
PASS (solo avisos de conversión LF/CRLF de Git)
```

## Tests
| test | resultado | nota |
|---|---|---|
| Vitest | PASS 46/46 | Tests de lógica sin cambios regresivos |
| Playwright E2E | PASS 12/12 | Flujo de espada, input y duración del hitbox verificados |
| typecheck | PASS | TypeScript estricto |
| build | PASS | Vite + tsc |

## Observaciones
<!-- comportamiento observado en playtest, métricas, warnings -->
Vista de Playwright confirma espada diferenciada y flotante sobre el suelo. Avisos benignos de Git LF→CRLF y entorno `NO_COLOR`/`FORCE_COLOR`.

## Siguiente paso
Probar en `http://localhost:8080/src/player/room-prototype/`: avanzar hacia el pickup brillante, recogerlo y hacer click izquierdo. Integrar daño cuando haya enemigos y contrato acordado.
