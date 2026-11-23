---
id: HIS-basti-20261123-144553
type: history
owner: basti
agent: gpt
created: 2026-11-23T17:45:53.648Z
title: corazon codex y transmision critica canal 23
status: partial          # pass | fail | partial
commit: none
refs: [PEN-basti-20261123-144553, SUP-basti-20261123-144553]
---

## Objetivo
Implementar apertura invulnerable del Corazón Codex a 100 HP y transmisión crítica CANAL 23 a 23 HP, sin tocar dominios ajenos ni perder cambios locales.

## Cambios
- `src/enemies/BodoqueBrain.ts`: clamp de overkill, estados finales dentro de fase 3, gate exclusivo cuerpo/corazón, aviso crítico y victoria consumible una sola vez.
- `src/enemies/BodoqueBoss.ts`, `BodoqueFinale.ts`: adaptador estable de núcleo, feedback, pecho mecánico, monitores CANAL 23, ERROR 23/APUESTA, efectos acotados y ruptura con lluvia normalizada; hook killed diferido hasta finalizar.
- `src/data/enemies.json`: 100 HP, 1200 ms apertura, 1600 ms derrota y 23 HP crítico configurables.
- `src/player/room-prototype/RoomScene.ts`: proveedor dinámico de targets válidos; conserva muñeco y habilidades.
- `src/enemies/BODOQUE-INTEGRATION.md`: controles, asset pendiente, hooks para integración principal y límites de dominio.
- `tests/unit/bodoque-brain.test.ts`, `tests/e2e/player-codex-finale.spec.ts`, `tests/e2e/player-room-prototype.spec.ts`: umbrales, overkill, invulnerabilidad, alcance y daño únicos, critical one-shot, reinicio, derrota diferida.

## Comandos y resultados
```text
$ node scripts/agents.mjs status --owner basti
Sin p0 abiertos.
$ git fetch origin
Sin merge/push. Rama feature/basti-movement-combat; 0 ahead/0 behind.
$ git show origin/main:docs/LORE.md
Lore leído desde remoto; no existe docs/LORE.md en el checkout.
$ npm test -- bodoque-brain.test.ts
RED: nuevos umbrales fallaron sobre el comportamiento anterior; GREEN tras implementar.
RED posterior: consumeVictory no existía; GREEN tras añadir gate comprobable de notificación única.
$ npm run typecheck
PASS
$ npm test
PASS: 78 pruebas, 14 archivos
$ npm run build
PASS: TypeScript + Vite
$ npm run test:e2e -- --grep 'Bodoque|Corazón Codex'
PASS: 3/3
$ npm run test:e2e
19/20: fallo temporal del test lateral Shift/salto/doble salto, airJumps esperado 0, recibido 1.
$ git diff --check
PASS, solo avisos LF/CRLF de archivos locales previos.
```

## Tests
| test | resultado | nota |
|---|---|---|
| Unit FSM/combate | pass | 78 pruebas; health floor, 1200 ms, body/core gate, ERROR23 único, daño por geometría, victoria única |
| E2E nuevos | pass | Corazón, texto/APUESTA, daño durante aviso, reinicio, cierre sin créditos |

## Observaciones
El asset oficial Codex no existe localmente: se usa CODEX/TEMP según autorización, con pending p2. Los efectos no incorporan timers/listeners ni partículas individuales. El bus principal no se usa desde el laboratorio. El pulso visual no desplaza el centro del hitbox. Cambios previos de espada/Eco/Lluvia intactos. No commit, push ni merge.

## Siguiente paso
Validar visual/balance con B; suministrar asset oficial local para reemplazar el marcador (PEN-basti-20261123-144553). Integrar presentación principal con los dueños según BODOQUE-INTEGRATION.md.
