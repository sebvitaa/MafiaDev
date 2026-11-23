---
id: HIS-seba-20261123-094301
type: history
owner: seba
agent: claude
created: 2026-11-23T12:43:01.060Z
title: scaffold H0 en MafiaDev
status: pass             # pass | fail | partial
commit: 8d663e1          # hash del commit de código
refs: [PEN-seba-20261123-084330, HIS-seba-20261123-084310] # PEN-/SUP-/HIS- relacionados
---

## Objetivo
Ejecutar el setup de H0 (PEN-seba-20261123-084330) en el repo sebvitaa/MafiaDev: scaffold, contratos shared, stubs por dominio, tests, CI/Pages, docs.

## Cambios
- Base: phaserjs/template-vite-ts vía degit. Eliminados `log.js` (GET a gryzor.co en cada dev/build), `vite/`, escenas de ejemplo, LICENSE y screenshot de la plantilla.
- `package.json`: phaser ^4.2.1; devDeps typescript 7.0.2, vite 8.3.8, vitest 5.1.1, @playwright/test 1.65.1. Scripts dev/build/test/test:e2e/agents:*.
- `tsconfig.json` (strict, resolveJsonModule, include src+tests) · `vite.config.ts` (base './', config de vitest) · `playwright.config.ts` (webServer :8080).
- `src/core/`: EventBus (sin Phaser, offContext para SHUTDOWN), StateMachine (force re-entry, throw en estado desconocido), Input (acciones con pressed/held/released), GameState (localStorage con try/catch).
- `src/types/`: events (contrato §2.2), assets, character, items.
- `src/data/`: tuning, classes, abilities, items, loot, enemies.
- Dominios: world (geometría de prueba), exploration (stub), player (Ground/Air: coyote, buffer, doble salto, salto variable), character + abilities (stub AbilitySlots), items (rollLoot puro, rollTable, RARITY_COLOR), combat/enemies (vacíos), audio (AudioDirector por eventos, ignora claves sin asset), ui (HudScene + pausa ESC/P), escenas Boot/Preload(barra + placeholders con textures.createCanvas)/Title/Game/Pause.
- `src/main.ts`: 480×270, pixelArt, arcade gravity desde tuning; `window.__game` solo en DEV.
- Tests: `tests/unit/{statemachine,eventbus,loot}.test.ts`, `tests/e2e/smoke.spec.ts`.
- `.github/workflows/ci.yml`: build + unit + e2e en PR y push; deploy-pages en main.
- `.gitignore` propio: la plantilla ignoraba `logs/` y `*.log`, lo que excluía `agents/history/logs/` → negado explícitamente.
- `.mcp.json` (Playwright MCP), `.nvmrc` (22), `.claude/skills/` (28 skills).
- AGENTS.md: mapa del repo (§0.1), `data/` → `src/data/`, `installHud` → `installUi`, comandos reales, propiedad de tests y configs.
- README: guía de arranque + roles + protocolo de agentes + investigación convertida con pandoc. `investigacion-stack.html` en la raíz.

## Comandos y resultados
```text
$ npx tsc --noEmit                → exit 0
$ npm test
 Test Files  3 passed (3)
      Tests  9 passed (9)
$ npm run build
dist/assets/index-*.js  1,375.89 kB │ gzip: 360.60 kB    ✓ built in 245ms
$ npx playwright install chromium → chromium-headless-shell v1255
$ npm run test:e2e
  ✓  1 [chromium] › tests/e2e/smoke.spec.ts › arranca, entra al juego y el jugador se mueve (2.4s)
  1 passed (4.4s)
```

## Tests
| test | resultado | nota |
|---|---|---|
| statemachine.test.ts (3) | pass | orden exit/enter, force, estado desconocido |
| eventbus.test.ts (3) | pass | payload, once, offContext |
| loot.test.ts (3) | pass | límites de pesos, tabla vacía, integridad loot.json ↔ items.json |
| e2e smoke | pass | Title → Space → GameScene; ArrowRight 600 ms → Δx > 20; 0 errores de consola |

## Observaciones
- Phaser 4: `Graphics.generateTexture` existe según la skill, pero se usó `textures.createCanvas` (tipado claro, sin Graphics).
- Asset paths del build relativos (`./style.css`, `./assets/...`): válidos bajo el subpath de GitHub Pages.
- Local probado con Node 26.13; CI fija Node 22.
- Basti no es colaborador del repo todavía.

## Siguiente paso
Push + PR + merge a main, activar Pages (build_type=workflow), verificar primer deploy. Equipo: validar SUP-seba-20261123-08424[5-9] y añadir a Basti.
