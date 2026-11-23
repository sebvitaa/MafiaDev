---
id: PEN-seba-20261123-084330
type: pending
owner: seba         # quien debe resolverlo (dueño del dominio)
created_by: seba
agent: claude
created: 2026-11-23T11:43:30.797Z
title: Setup H0: scaffold Phaser 4, skills, contratos shared
priority: p0   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: in_progress      # open | in_progress | blocked | done | wontfix
area: shared             # combat | movement | world | exploration | character | abilities | items | audio | ui | shared
refs: []
closed_by:               # hash o HIS-ID al cerrar
---

## Contexto
Bloqueante para todos los dominios. Scaffold hecho el 2026-11-23 en sebvitaa/MafiaDev (ver HIS de seba de esa fecha). Queda lo organizativo.

## Repro / evidencia
```text
npm run build  → ok · npm test → 9/9 · npm run test:e2e → 1/1 (local)
gh api repos/sebvitaa/MafiaDev/collaborators → VichoRamirez, sebvitaa, Alejandr1no  (falta Basti)
```

## Criterio de cierre
- [x] Scaffold Phaser 4.2 + TS + Vite desde phaserjs/template-vite-ts (sin log.js de telemetría); `npm run build` pasa
- [x] `.claude/skills/` con las 28 skills de phaserjs/phaser
- [x] Vitest (`npm test`) y Playwright (`npm run test:e2e`) con tests que pasan
- [x] `src/core/` (EventBus, StateMachine, Input, GameState) y `src/types/` (events, assets, character, items)
- [x] Carpetas por dominio con `install*(scene)` en su `index.ts`
- [x] CI (build + unit + e2e) y despliegue a GitHub Pages en push a main
- [ ] Basti añadido como colaborador del repo (falta su usuario de GitHub)
- [ ] Primer deploy verde en GitHub Pages
- [ ] SUP-seba-20261123-08424[5-9] validados o rechazados por el equipo

## Notas
- Versiones resueltas por npm: phaser 4.2.1, typescript 7.0.2, vite 8.3.8, vitest 5.1.1, @playwright/test 1.65.1.
- CI usa Node 22 (`.nvmrc`); localmente se probó con Node 26.
