---
id: HIS-basti-20261123-124515
type: history
owner: basti
agent: gpt
created: 2026-11-23T15:45:15.662Z
title: carga movimiento prueba red
status: partial          # pass | fail | partial
commit:                  # hash del commit de código
refs: []                 # PEN-/SUP-/HIS- relacionados
---

## Objetivo
Reproducir el desfasaje de posición y orientación entre jugador/arma/efecto durante carga móvil.

## Cambios
- `tests/e2e/player-room-prototype.spec.ts`: amplía el flujo para mover al jugador durante la carga y verificar pose del efecto y espada.

## Comandos y resultados
```text
$ npx playwright test tests/e2e/player-room-prototype.spec.ts -g "el dash cancela la carga"
FAIL esperado: el efecto cargado permaneció en x=0 en vez de seguir al jugador en x=700.
```

## Tests
| e2e dirigido | fail esperado (RED) | El efecto no tiene transformación propia y queda dibujado en la posición inicial absoluta; prueba confirma el defecto. |

## Observaciones
<!-- comportamiento observado en playtest, métricas, warnings -->

## Siguiente paso
Hacer el efecto un contenedor local, actualizar pose en sincronización post-física y fijar el origen al soltar.
