---
id: HIS-alejandro-20261123-123733
type: history
owner: alejandro
agent: gpt
created: 2026-11-23T15:37:33.000Z
title: TP accesos directos 1 a 4
status: pass
commit:
refs: [HIS-alejandro-20261123-122352, SUP-alejandro-20261123-123733, PEN-basti-20261123-122352]
---

## Objetivo
Añadir TP con las teclas 1, 2, 3, 4 según el papel correspondiente, conservando Q + mouse.

## Cambios
- src/abilities/markGeometry.ts: slot estable 0–3 por marca, reutilización de número libre o del reemplazo más antiguo, consulta bySlot; los ids únicos de dibujo siguen separados del número de tecla.
- src/abilities/Teleport.ts: listeners de teclas ONE/TWO/THREE/FOUR sin auto-repeat; método común teleportTo para mouse y números, mismo AbilitySlots/cooldown/destinos seguros; etiquetas y HUD muestran 1–4. Limpieza de listeners propios en shutdown sin destruir teclas compartidas.
- src/abilities/README.md: controles numéricos y numeración estable.
- tests/unit/abilities-marks.test.ts: reemplazo y retirada conservan las teclas de las otras marcas.
- tests/e2e/abilities-marks.spec.ts: TP por cada tecla sin Q y con Q, etiquetas coincidentes, quinta marca hereda 1, recarga entre teclas y mouse, reutilización y reinicio.
- Memoria: nuevo supuesto sobre numeración estable y ampliación del pending de integración de Basti. Sin cambios en dominios ajenos o shared.

## Comandos y resultados
```text
node scripts/agents.mjs status --owner alejandro
npm run build -> PASS (TypeScript strict + Vite, 47 módulos)
npm test -> PASS (29 tests, 7 archivos)
npm run test:e2e -> PASS (6 tests, 26.3 s)
git diff --check -> PASS
```
Se antepuso C:\Program Files\nodejs al PATH solo del proceso para ejecutar npm.cmd. La escritura/ejecución sobre la copia fuera del sandbox se realizó con elevación autorizada.

## Tests
| test | resultado | nota |
|---|---|---|
| Build | pass | Todos los archivos y tests tipados |
| Unit completa | pass | 29 tests; slots no se renumeran |
| E2E teclas 1–4 | pass | Cada número llega a su papel; quinta hereda la tecla 1 |
| E2E cooldown mixto | pass | 500 ms entre números y Q + clic |
| E2E previos | pass | Mouse/espada, obstáculos, enemigo móvil, reinicio, smoke y menús |

## Observaciones
Cambios locales en integration/teleport-room-local, sin commit/push/PR; publicación bajo Alejandro como indicó el humano y adopción de integración por Basti siguen vigentes. Ningún pending nuevo por fallos de pruebas.
Teclas numéricas no activan ataques ni lanzamientos y no requieren cursor sobre la marca. Números de papeles se conservan tras retirar otra marca. SUP-alejandro-20261123-123733 registra la regla reversible.
Avisos no bloqueantes de entorno ya presentes: localStorage experimental de Node y NO_COLOR/FORCE_COLOR de Playwright.

## Siguiente paso
Playtest humano en el laboratorio: 1–4 para TP directo y Q + mouse como antes. Integrar con enemigos reales al resolver PEN-basti-20261123-122352.
