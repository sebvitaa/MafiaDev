---
id: HIS-basti-20261123-143619
type: history
owner: basti
agent: gpt
created: 2026-11-23T17:36:19.374Z
title: jefe bodoque fase uno en room-prototype
status: pass
commit: none (sin commit por solicitud explícita)
refs: [SUP-basti-20261123-143619]
---

## Objetivo
Prototipar a Juan Carlos Bodoque como jefe local opcional, con FSM pura, ataques de Fase 1 «La Nota», conexiones a los ataques existentes y pruebas, preservando los cambios sin publicar del laboratorio.

## Cambios
- `src/enemies/BodoqueBrain.ts`, `src/enemies/BodoqueBoss.ts`, `src/enemies/index.ts`: secuencia Phaser-free, geometría, vida, umbrales, presentación noir y adaptadores locales de combate.
- `src/data/enemies.json`, `src/data/tuning.json`: vida 600, patrones y HP local del jugador configurables.
- `src/player/room-prototype/RoomScene.ts`, `index.html`, `README.md`: activación con B, muñeco conservado, HUD/vida/victoria y controles documentados.
- `tests/unit/bodoque-brain.test.ts`, `tests/e2e/player-room-prototype.spec.ts`: FSM/patrones/hit únicos/fases/derrota, integración espada-eco-deuda-lluvia y telegraph visible.
- No se modificaron los cambios locales previos de Eco V2/Lluvia Italiana en `RoomPlayer.ts`, `RoomEcho.ts`, `RoomFireball.ts` y módulos relacionados.

## Comandos y resultados
```text
$ git fetch origin
PASS: feature/basti-movement-combat sigue sincronizada (0 ahead / 0 behind); no se integró ni descartó nada.
$ node scripts/agents.mjs status --owner basti
PASS: sin pendings p0 ni pendings abiertos asignados a basti.
$ git show origin/main:docs/LORE.md
PASS: secciones 6, 7 y 11 leídas; docs/LORE.md no está presente en el checkout actual.
$ npm run typecheck
PASS
$ npm test
PASS: 14 archivos, 76 pruebas
$ npm run build
PASS: TypeScript y Vite
$ npm run test:e2e
PASS: 19/19
$ npm run test:e2e -- --grep Bodoque
PASS: 2/2
$ git diff --check
PASS (avisos LF/CRLF únicamente)
```

## Tests
| test | resultado | nota |
|---|---|---|
| `bodoque-brain.test.ts` | pass | Ataques, tiempos, zona, hit único, thresholds y derrota |
| E2E Bodoque | pass | Espada, eco, lluvia con marcas, victoria local y telegraph |
| Suite general | pass | 76 unitarias y 19 E2E |

## Observaciones
La sala mantiene el muñeco visible; Bodoque aparece solo con B. Los hooks tipados usan las formas existentes de `boss:phase`, `enemy:hit` y `enemy:killed`, pero el prototipo no publica en EventBus. No hay parry/bloqueo en `room-prototype`; el mazo se marca parryable y la evasión espacial funciona con la geometría local. `docs/LORE.md` se leyó desde `origin/main` porque no existe en el árbol de trabajo. La primera E2E de esquiva esperó más allá de la ventana del mazo; se aisló la verificación del telegraph y movimiento, mientras la geometría del hitbox queda cubierta por pruebas unitarias. La primera ejecución de typecheck detectó una constante no usada, eliminada antes del build final. Playwright mostró solo los avisos de entorno `NO_COLOR`/`FORCE_COLOR`; sin fallos finales. No commit/push/merge.

## Siguiente paso
Probar los valores de SUP-basti-20261123-143619 en sala, ajustar balance y definir Fases 2/3 antes de implementarlas.
