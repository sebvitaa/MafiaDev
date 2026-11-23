---
id: HIS-basti-20261123-140533
type: history
owner: basti
agent: gpt
created: 2026-11-23T17:05:33.789Z
title: publicacion validar seguimiento marca knight
status: pass
commit: b669817c3700bfe76f580e78f0e69e9af76b4bb8
refs: [HIS-basti-20261123-140137]
---

## Objetivo
Completar la publicación pedida por el humano después de estabilizar la prueba de seguimiento de una marca al knight.

## Cambios
- `tests/e2e/enemies-basic.spec.ts`: comparar desplazamientos de enemigo y marca dentro de postupdate. La IA se deja en recuperación durante la medición del fixture para no perder una coordenada fugaz mientras persigue al jugador. Se conserva el TP por tecla, distancia segura y comprobación de HP sin daño.
- Ningún cambio de gameplay, balance o habilidades.

## Comandos y resultados
```text
Primera ejecución ship --e2e: build PASS, 94 unit PASS, 27 e2e PASS, 1 e2e FAIL.
Fallo: se esperaba marca.x > 610 tras reposicionar knight a 650, pero en cinco segundos
el knight siguió persiguiendo al jugador y la marca estaba en x=430. La lectura de IPC
podía perder el breve intervalo sobre 610; se reemplazó por deltas del mismo frame.
npm run test:e2e -- --config <config local 8083> enemies-basic.spec.ts -g "marca sigue al knight"
  -> 1 passed (5.7s)
git commit -m "test(enemies): medir seguimiento de marca en el mismo frame"
  -> b669817c3700bfe76f580e78f0e69e9af76b4bb8
```

## Tests
| test | resultado | nota |
|---|---|---|
| Build + unit previos | pass | Sin cambios de código desde esa validación |
| Seguimiento de marca corregido | pass | 1 test; igualdad de desplazamientos y TP al lado del knight |

## Observaciones
El primer ship se detuvo antes de push/PR, como corresponde con tests en rojo. El fallo quedó resuelto en esta misma tarea; no se dejó pending. Se repetirá el flujo oficial completo con las guardas intactas y la misma suite, antes del push.

## Siguiente paso
Repetir ship --e2e, verificar CI y comunicar la PR al humano.
