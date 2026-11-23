---
id: HIS-basti-20261123-155304
type: history
owner: basti
agent: gpt
created: 2026-11-23T18:53:04.529Z
title: integracion-cine3-tutorial-aparicion-y-rendimiento
status: partial
commit: bdef24e
refs: [SUP-basti-20261123-150950, HIS-basti-20261123-152617]
---

## Objetivo
Integrar el mundo y combate publicados, retirar tutorial de bloqueo/parry inexistentes, conservar nuevos recursos de Alejandro y reforzar aparición/rendimiento de FINAL.

## Cambios
- Integración preserva ramas feature/basti-movement-combat y alejandro/final-jugable; datos y adaptadores resuelven conflictos conservando salud, TP, combos/carga, Eco V2/deuda y lluvia.
- Tres fases jugables, transición de 100 HP, núcleo exclusivo, ERROR 23 y victoria única. Sprites/sello/cine3 de Alejandro; no se reconstruyen videos ni apertura.
- Tutorial, controles y consejos coinciden con acciones reales; no hay bloqueo/parry implementados.
- Aparición segura y cámara centrada; selector FINAL equipa espada. Hurt direction se normaliza para evitar expulsión por vectores largos.
- Optimización publicada alejandro/publicar-optimizaciones: grupos Arcade, suspensión distante, caché navegación/obstáculos, overview de mapa y niebla compactada. Se conserva deuda, TimeStop y reinicio de refuerzos. Efectos finales limitan solo redibujado a 30Hz; FSM/daño no cambian cadencia.

## Comandos y resultados
| Comando | Resultado |
|---|---|
| npm ci | pass, 42 paquetes, 0 vulnerabilidades |
| npm run typecheck | pass (último ciclo) |
| npm test -- --run | pass: 137 tests / 29 archivos |
| npm run build | pass (último ciclo) |
| npx playwright test tests/e2e/el-set-final.spec.ts tests/e2e/integration-journey.spec.ts tests/e2e/player-codex-finale.spec.ts --reporter=line | cierre/corazón/recorrido pasan; ejecución posterior independiente de journey y corazón: 2 pass |
| npx playwright test tests/e2e/integration-final-spawn.spec.ts tests/e2e/enemies-performance.spec.ts tests/e2e/integration-boss-retry.spec.ts --reporter=line | 6 pass / 28 s tras corrección de fixture |
| npm run test:e2e | 48 casos, en ejecución; registrar resultado en nueva history |

## Diagnóstico de ciclos anteriores
- El fixture journey permanecía inmóvil en la arena y moría; se aleja para probar orquestación, conservando tests separados de daño/movimiento.
- Fixture nuevo de spawn consultaba tilemap temporal en vez de layer renderizada y saltaba dos veces el video; corregido, tres mapas pasan.
- Hubo interrupción de un ciclo al resolver merge; se repitieron los seis casos después de resolver.
- Typecheck detectó dos variables no usadas durante la adaptación; eliminadas y build repetido en verde.

## Observaciones
Preview producción: http://127.0.0.1:5185/. Apertura original observada sin skipIntro; lluvia/control con teclado; nuevo video final observado. No se afirma victoria manual sin fixtures: journey usa posición/daño explícitos para orquestación. No hay benchmark universal de FPS.
Main avanzó a 0f68477 (#12) después de iniciar la suite: integrar/revisar antes del PR definitivo. Autorización transversal por usuario; aprobación de equipo y protección siguen vigentes. Rama original intacta.

## Siguiente paso
Finalizar suite de 48, sincronizar origin/main, publicar PR de integración y solicitar revisiones a Vicente, Alejandro y Seba. No fusionar sin checks/aprobaciones exigidas.
