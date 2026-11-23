---
id: HIS-basti-20261123-141815
type: history
owner: basti
agent: gpt
created: 2026-11-23T17:18:15.590Z
title: CI sincronizar pruebas combo y fuego
status: pass
commit: c082fc9be49dceee7f8b66873a6027fa6599eebd
refs: [HIS-basti-20261123-140137, HIS-basti-20261123-140533]
---

## Objetivo
Resolver dos comprobaciones del laboratorio que fallaron en el CI de la PR #9 por lecturas de animación entre viajes de IPC. No cambiar el combate ni el balance de enemigos.

## Cambios
- `tests/e2e/player-room-prototype.spec.ts`: el combo se ejecuta con clics nativos encadenados después de finalizar cada golpe; un observador postupdate registra índices, HP 75/45/5, impactos 1/2/3, visibilidad, reacción y rotaciones. El tercer golpe vuelve a índice 0 al finalizar, como especifica SwordCombo.
- La prueba de fuego captura en keyup-E el comienzo de caída y cooldown exacto 7000. En postupdate registra HP intacta durante caída, una sola explosión/hit de 50, animación, residuo y cooldown restante al desvanecerse. Conserva prueba de rechazo de otra invocación y cleanup al reiniciar.
- No se modifican gameplay, timers, configuración shared, concurrencia del CI ni cantidad de pruebas.

## Comandos y resultados
```text
gh run view 45224328012 --repo sebvitaa/MafiaDev --log-failed
  -> 26 e2e PASS, 2 FAIL en combo y fuego; build/unit PASS.
  -> Combo: se consumía la ventana de 500ms en lecturas/animaciones antes del siguiente clic.
  -> Fuego: entre consultar falling y volver a leer HP podía ocurrir el impacto de 600ms.
npm run build -> PASS
node node_modules/playwright/cli.js test --config <config local 8083> player-room-prototype.spec.ts --grep "la espada se recoge|E apunta la bola"
  -> 2 passed (13.0s)
git commit -m "test(combat): observar combo y fuego por frame en CI"
  -> c082fc9be49dceee7f8b66873a6027fa6599eebd
```

## Tests
| test | resultado | nota |
|---|---|---|
| Build | pass | TypeScript strict y Vite |
| Combo y animación | pass | Daño, orden 1–3, reacción, movimiento de arma/tajo y derrota/respawn |
| Bola de fuego | pass | Caída sin daño, cooldown 7000, un solo impacto, residuo y limpieza |

## Observaciones
PR https://github.com/sebvitaa/MafiaDev/pull/9. El CI protegió main y no se fusionó con fallos. Se corrigen las pruebas en esta tarea y se repite el flujo oficial; no se dejaron fallos pendientes ni se omitieron aserciones de gameplay. El flujo ship repetirá la suite completa antes de volver a subir la rama.

## Siguiente paso
Actualizar PR #9 mediante ship --e2e y verificar su nuevo CI antes de comunicar finalización.
