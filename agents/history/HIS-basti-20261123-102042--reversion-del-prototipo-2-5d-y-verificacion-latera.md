---
id: HIS-basti-20261123-102042
type: history
owner: basti
agent: gpt
created: 2026-11-23T13:20:42.057Z
title: Reversion del prototipo 2-5D y verificacion lateral
status: pass
commit: sin commit por instrucción del humano
refs: [PEN-seba-20261123-101157]
---

## Objetivo
Cancelar la movilidad 2.5D por instrucción explícita del humano y restaurar únicamente los cambios propios, conservando el juego lateral y el trabajo ajeno.

## Cambios
- Restaurado `src/data/tuning.json`: el diff solo contenía el bloque propio movementPrototype.
- Retirados los archivos nuevos propios `src/player/prototype/{MovementModel.ts,MovementPrototypeScene.ts,PrototypePlayer.ts,README.md,index.html,main.ts}` y el directorio vacío.
- Retiradas las pruebas propias `tests/unit/player-movement.test.ts` y `tests/e2e/player-movement.spec.ts`.
- Retirado el supuesto nuevo SUP-basti-20261123-101157, exclusivo del prototipo cancelado.
- Conservado el pending independiente de CRLF, sin modificar scripts compartidos.
- Los archivos originales Player, estados Ground/Air, Input, GameScene, main, mapas y contratos nunca se editaron.
- Sin commit, push, merge, reset ni limpieza global. Se conserva feature/basti-movement-combat.

## Comandos y resultados
```text
git status --short --branch
git diff -- src/data/tuning.json
git diff --stat
git ls-files --others --exclude-standard
Lectura completa de los archivos nuevos: coinciden con los creados por este agente; sin cambios mezclados.
git restore --worktree -- src/data/tuning.json
Remove-Item -LiteralPath <cada uno de los nueve archivos propios enumerados arriba>
Remove-Item -LiteralPath src/player/prototype  # vacío, sin -Recurse
node scripts/agents.mjs new history --owner basti --agent gpt --title "Reversion del prototipo 2-5D y verificacion lateral"
npm run typecheck -> exit 0
npm test -> exit 0; 9/9
npm run test:e2e -> exit 0; 1/1
npm run build -> exit 0
```

## Tests
| test | resultado | nota |
|---|---|---|
| TypeScript | pass | tsc --noEmit |
| Unitarios existentes | 9/9 pass | EventBus, StateMachine, loot |
| Smoke Chromium existente | 1/1 pass | título, entrada al juego, movimiento lateral y sin errores de consola |
| Build producción | pass | Vite genera dist, ignorado por Git |

## Observaciones
La ejecución pendiente del prototipo terminó antes de la retirada: 4/4 e2e. Ya no quedan procesos de implementación activos.

Registro de verificaciones del intento cancelado: primer unitario RED por módulo inexistente; después 17/17 reglas propias y 26/26 suite. Primer e2e RED por escena inexistente. La primera suite e2e tuvo 4 pass/1 fail por flanco de salto entre frames; tras corregir exclusivamente el adaptador local pasó 4/4. Todo el adaptador y sus pruebas fueron retirados; ninguna corrección se trasladó al juego lateral.

Playwright avisa de NO_COLOR/FORCE_COLOR; no afecta al resultado. No se corrigió el parser CRLF porque pertenece a shared y existe el pending citado. Las dependencias instaladas y los resultados generados están ignorados por Git.

## Siguiente paso
Continuar exclusivamente con movilidad y combate lateral 2D cuando el humano lo solicite. Ningún desarrollo 2.5D pendiente.
