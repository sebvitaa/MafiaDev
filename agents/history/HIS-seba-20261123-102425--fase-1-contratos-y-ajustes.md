---
id: HIS-seba-20261123-102425
type: history
owner: seba
agent: claude
created: 2026-11-23T13:24:25.867Z
title: fase 1 contratos y ajustes
status: pass             # pass | fail | partial
commit: 8474b17          # hash del commit de código
refs: [SUP-seba-20261123-102354, PEN-vicho-20261123-102354, PEN-alejandro-20261123-102354, PEN-basti-20261123-102354]                 # PEN-/SUP-/HIS- relacionados
---

## Objetivo
Fase 1 del plan de seba: pedir todos los contratos shared antes de la congelación de H1 y crear los ajustes persistentes.

## Cambios
- `src/types/assets.ts`: 8 SfxKey nuevas, `music-gameover`, `AmbientKey`, `VoiceKey` (97d51ce).
- `src/types/events.ts`: `player:respawned`, `ability:ended` (4a5a92e).
- `src/main.ts`, `src/ui/index.ts`, `src/ui/scenes/*`: registra Options/GameOver/Credits (stubs); `tests/e2e/smoke.spec.ts` usa `?skipIntro=1` (a84c9d3).
- `src/audio/settings.ts` + `tests/unit/seba-settings.test.ts`: volúmenes por canal, mute, movimiento reducido, tutorial; clave `mafiadev.settings.v1` (8474b17).

## Comandos y resultados
```text
$ npm run build      → ok (tsc + vite, 1.37 MB)
$ npm test           → 4 files, 15 tests passed
$ npm run test:e2e   → 1 passed (smoke)
```

## Tests
| test | resultado | nota |
|---|---|---|
| unit (eventbus, loot, statemachine, seba-settings) | pass | 15/15 |
| e2e smoke | pass | con `?skipIntro=1` |

## Observaciones
Solo se añaden claves y eventos; ningún contrato existente cambia. Shared publicado con `--shared` (SUP validator equipo).

## Siguiente paso
Fase 2 (animación de despliegue) y generación de assets de audio/arte con la API de OpenAI (presupuesto en tools/oai).
