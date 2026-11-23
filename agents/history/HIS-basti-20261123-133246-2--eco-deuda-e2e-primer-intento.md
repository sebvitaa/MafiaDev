---
id: HIS-basti-20261123-133246-2
type: history
owner: basti
agent: gpt
created: 2026-11-23T16:32:46.000Z
title: eco deuda e2e primer intento
status: partial
commit:
refs: [SUP-basti-20261123-133012]
---

## Objetivo
Probar la integración e2e de eco repetido y detonación de marcas.

## Cambios
- `tests/e2e/player-room-prototype.spec.ts`: añade flujos para dash→eco→un replay, y espada→marca→detonación con bola.

## Comandos y resultados
```text
$ npx playwright test tests/e2e/player-room-prototype.spec.ts -g "Eco del Reverso|la bola consume marcas"
FAIL: ambos flujos revelaron aserciones de integración.
```

## Tests
| test | resultado | nota |
|---|---|---|
| Eco | parcial | Replay impactó desde el inicio del dash, pero el ataque original falló porque el jugador acababa el dash detrás del muñeco; el setup se ajustó para aislar ambos golpes. |
| Deuda | parcial | Bonus y consumo se aplicaron; el test consultaba el efecto después de que acabara la animación de 300ms; se amplió la lectura visual a 600ms. |

## Observaciones
No hubo fallo de typecheck; los daños observados indicaron que la lógica de juego funcionaba.

## Siguiente paso
Repetir los dos e2e con posiciones/timing ajustados.
