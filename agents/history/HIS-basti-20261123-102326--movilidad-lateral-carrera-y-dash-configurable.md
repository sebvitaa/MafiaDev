---
id: HIS-basti-20261123-102326
type: history
owner: basti
agent: gpt
created: 2026-11-23T13:23:26.951Z
title: Movilidad lateral carrera y dash configurable
status: pass
commit: sin commit por instrucción explícita del humano
refs: [SUP-basti-20261123-102326]
---

## Objetivo
Implementar movilidad lateral de Basti conservando caminar, saltos y contratos; añadir carrera, dash limitado y consulta para daño futuro. Sin combate, cambios en dominios ajenos, commits, pushes ni merges.

## Cambios
- `src/player/Player.ts`: Shift local para correr, C/K para dash, temporización, integración FSM, evento existente y getter isInvulnerable.
- `src/player/states/Dash.ts`: movimiento lateral fijo con suspensión/restauración de gravedad y velocidad vertical; buffer de salto durante dash.
- `src/player/states/DashMotion.ts`: reglas puras de duración, recuperación, orientación e invulnerabilidad y cálculo de velocidad al correr.
- `src/data/tuning.json`: runMultiplier y parámetros de dash, sin alterar valores originales.
- `tests/unit/player-dash.test.ts`: cinco casos de reglas puras.
- `tests/e2e/player-lateral-movement.spec.ts`: tres escenarios de integración con Phaser real.
- SUP citado: valores y decisiones locales reversibles; permanece pendiente de validación humana.

## Comandos y resultados
```text
git status --short --branch -> feature/basti-movement-combat; solo los dos documentos previos sin seguimiento.
node scripts/agents.mjs status --owner basti -> ejecutado; limitación CRLF ya registrada en PEN-seba-20261123-101157.
npm test -- tests/unit/player-dash.test.ts -> RED inicial: módulo todavía inexistente.
npm test -- tests/unit/player-dash.test.ts -> GREEN: 5/5 tras implementar reglas.
npm run typecheck -> exit 0
npm test -> exit 0, 14/14
npm run test:e2e -> exit 0, 4/4
npm run build -> exit 0; 29 módulos; salida en dist/ ignorado.
git diff --check -> exit 0
```

## Tests
| test | resultado | nota |
|---|---|---|
| Typecheck | pass | TypeScript estricto |
| Unitarios | 14/14 pass | 9 existentes + 5 movilidad |
| Chromium | 4/4 pass | Smoke original + carrera/saltos, límites de dash e invulnerabilidad, dash aéreo/colisiones |
| Build | pass | Typecheck y Vite |

## Observaciones
Controles: A/D o flechas para caminar, Shift para correr, Espacio/Z para saltar y doble salto, C/K para dash. Ejecutar npm run dev y abrir http://localhost:8080; pulsar una tecla en título.

Duración 140 ms, velocidad 360 px/s, ventana consultable 100 ms. Recuperación posterior de stats.dashCooldownMs (400 ms Luchador). Mantener C no repite dash, intentos durante recuperación se descartan, y aterrizar no reinicia cooldown. El movimiento no desactiva colisiones. El daño futuro debe consultar isInvulnerable: no existe daño implementado en esta tarea.

Input, CharacterStats, AbilitySlots, eventos, mapas, GameScene y sistemas de compañeros intactos. Documentos sin seguimiento previos conservados con hashes SHA256 originales: HIS-basti-20261123-102042 = DB36BD7A29FA36A6549B7C82F9968AEB34875E38823FECF5427F01747377A6B3; PEN-seba-20261123-101157 = EBCE8232D0CFCAC229FAAC023683D264A36364CAD4D0DC2E64575212479E767F.

Playwright emite aviso NO_COLOR/FORCE_COLOR del entorno; no afecta a los resultados.

## Siguiente paso
Probar sensaciones y ajustar tuning con Basti. Integración de daño queda para una tarea posterior; cualquier cambio de contratos compartidos debe consultarse antes.
