---
id: HIS-alejandro-20261123-122352
type: history
owner: alejandro
agent: gpt
created: 2026-11-23T15:23:52.000Z
title: TP cuatro marcas controles Q y mouse
status: pass
commit:
refs: [HIS-alejandro-20261123-115622, SUP-alejandro-20261123-121806, PEN-basti-20261123-122352, PEN-basti-20261123-115351, PEN-alejandro-20261123-113311]
---

## Objetivo
Reemplazar TP corto por red de cuatro marcas según el humano: Q sostenida + derecho lanza, Q + izquierdo hace TP, izquierdo sin Q golpea. Espera 500 ms entre TP. Probar en el laboratorio local de Basti.

## Cambios
- src/abilities/Teleport.ts: lanzamiento animado, selección bajo el mouse, fijación a escenario/enemigos, seguimiento, destinos seguros, destellos, HUD propio con contador y recarga, limpieza al cambiar escena.
- src/abilities/markGeometry.ts: registro limitado, selección de marcas aterrizadas, barrido contra AABB y búsqueda de llegada libre. Corrige contacto saliente desde una pared (no detener un papel que se aleja).
- src/abilities/TeleportTarget.ts: registro explícito de enemigos/jefes; la marca se retira al destruir, desactivar o desregistrar objetivo.
- src/abilities/index.ts: ciclo install/update/destroy opcional, input delegado a AbilitySlots sin cambiar contrato shared; bus conserva ability:used/ready por TP efectivo.
- src/data/abilities.json: 4 marcas y cooldown 500 ms; valores configurables del proyectil, selección y búsqueda de llegada.
- src/player/room-prototype/RoomPlayer.ts (adaptador SOLO LOCAL previamente autorizado): espada comprueba !Q; update del sistema de marcas; Q sola ya no hace TP.
- src/abilities/README.md: controles, reglas y contrato de integración de enemigos reales.
- tests/unit/abilities-marks.test.ts y tests/e2e/abilities-marks.spec.ts: límite/reemplazo/reuso, contacto saliente, barrido, destinos seguros; controles, cooldown, paredes, seguimiento/muerte y reinicio.
- No se tocaron movimiento, tuning ni otros archivos del laboratorio respecto al trabajo previo de la rama.

## Comandos y resultados
Entorno Windows; ante falta de npm en PATH se antepuso C:\Program Files\nodejs al PATH del proceso. Repositorio fuera de sandbox: comandos de escritura y verificación ejecutados con elevación autorizada.
```text
node scripts/agents.mjs status --owner alejandro
npm run build
  Primer intento: TS2339, Set<Body>.contains -> corregido a has.
  Tras agregar e2e: TS7006 en snapshot de prueba -> tipo explícito RoomState.
  Última ejecución: tsc --noEmit + vite build PASS (47 módulos).
npm test
  7 archivos, 27 tests PASS.
node node_modules/playwright/cli.js install chromium
  Chromium oficial de Playwright instalado; primera ejecución e2e carecía del ejecutable.
npm run test:e2e -- abilities-marks.spec.ts
  Iteraciones corrigieron orden de display por profundidad, tolerancia por escalado del canvas,
  esperas por estado real y contacto saliente del proyectil. Último resultado 3 passed (37.0s).
npm run test:e2e
  Última ejecución completa: 5 passed (11.7s).
git diff --check
  PASS; únicamente avisos de normalización LF/CRLF.
```

## Tests
| test | resultado | nota |
|---|---|---|
| Build completo | pass | TypeScript strict y bundle principal |
| Unit completa | pass | 27 tests en 7 archivos |
| E2E Q/marcas/cooldown | pass | Q no golpea, sin Q golpea; quinta reemplaza; reuso y 500 ms |
| E2E estáticos y destino sellado | pass | papel choca, llegada libre, fallo sin gastar recarga |
| E2E objetivo móvil y reinicio | pass | marca sigue enemigo simulado, TP sin solapar, muerte limpia; sin listeners duplicados |
| E2E smoke y menús previos | pass | juego principal, movimiento, apertura/menús/pausa/opciones |

## Observaciones
Rama integration/teleport-room-local. Código aún sin commit/push/PR: rama de integración mixta con archivos del dominio de Basti; el humano ya indicó que Alejandro publica. No cambiar identidad ni publicar archivos ajenos.
Enemigos reales siguen ausentes de esta copia; los e2e crean un objetivo temporal, sin agregar contenido al laboratorio. La adopción de controles y registro de enemigos queda en PEN-basti-20261123-122352.
Se cierra PEN-alejandro-20261123-113311 al disponer ya de compilación correcta. PEN-basti-20261123-115351 queda reemplazado por el nuevo alcance (wontfix, ver pending nuevo).
Los registros antiguos con CRLF no aparecen en el índice de scripts/agents.mjs (parser espera LF); fueron consultados directamente. No se modificó el script shared.
Advertencias de entorno no bloqueantes: localStorage experimental de Node en Vitest y NO_COLOR/FORCE_COLOR en Playwright.

## Siguiente paso
Playtest humano en http://127.0.0.1:8081/src/player/room-prototype/; validar reglas adicionales del SUP y que Basti adopte la conexión con sus enemigos/jefe antes de publicación definitiva por dominio.
