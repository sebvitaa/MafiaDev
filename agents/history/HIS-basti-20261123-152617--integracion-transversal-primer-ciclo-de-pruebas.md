---
id: HIS-basti-20261123-152617
type: history
owner: basti
agent: gpt
created: 2026-11-23T18:26:17.837Z
title: integracion transversal primer ciclo de pruebas
status: partial
commit:                  # hash del commit de código
refs: [SUP-basti-20261123-150950]
---

## Objetivo
Integrar en worktree los cuatro dominios conservando main 3c75dfa y recuperar el combate avanzado aún pendiente.

## Cambios
- Mapa/cámara/exploración conservados; adaptador de Bodoque avanzado en arena existente.
- Player cenital con salud/TP/cursor de main más Eco/Deuda/Lluvia; R/20s/100dmg/T reset; espada y Echo respetan Tiled.
- Fases 2/3 configurables, corazón, broadcast HD, epílogo/viñetas EndingScene y créditos únicos.
- Registro CRLF reparado; archivos multimedia originales sin modificación. Detalle de decisiones y límites en docs/INTEGRACION-FINAL.md.

## Comandos y resultados
```text
$ npm ci
42 paquetes instalados, 0 vulnerabilidades.
$ npm run typecheck
PASS tras resolver el merge por implementación.
$ npm test
PASS (último ciclo: 130 pruebas).
$ npm run build
PASS.
$ npm run test:e2e
Primer ciclo 36/39. Fallos: dos tests seguían usando R para reinicio y un test de menú seleccionaba CLASE en vez de OPCIONES.
$ npm run test:e2e -- tests/e2e/abilities-marks.spec.ts tests/e2e/seba-menus.spec.ts tests/e2e/integration-classes.spec.ts
7/7 PASS tras adaptar controles/navegación de pruebas, sin omitir ni debilitar sus aserciones.
$ npm run test:e2e -- tests/e2e/integration-journey.spec.ts
PASS: apertura sin skipIntro, ambos videos, mapa/arena, fases, corazón/error23, epílogo, Tulio, créditos y regreso.
```

## Tests
| test | resultado | nota |
|---|---|---|
| Unit | pass | 130; FSM, todas las fases, daño único, eco, inventario, 3 mapas conectados |
| E2E seleccionado | pass | 7/7 de TP/clases/menús tras ajustes |
| E2E recorrido | pass | Fixture explícito de posición/daño para orquestación, no afirmación de victoria manual |

## Observaciones
Se vieron capturas del build y se probó en navegador de producción :5185: logo animado, menú noir, juego cenital y R con HUD 20s. No se modificaron BootScene, PreloadScene, logo.ts, CinematicScene ni multimedia original. La suite final ampliada a 42 casos está en curso; registrar resultado posterior en nueva history.

## Siguiente paso
Cerrar pruebas, documentar recursos provisionales y solicitar aprobación de los tres dominios ajenos mediante PR. Main protegido; sin publicación directa.
