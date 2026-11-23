---
id: HIS-basti-20261123-160637
type: history
owner: basti
agent: gpt
created: 2026-11-23T19:06:37Z
title: la-nota-completa-pr-15-listo-para-equipo
status: pass
commit: 6f6f1ce
refs: [HIS-basti-20261123-160257, SUP-basti-20261123-150950, PEN-basti-20261123-160532]
---

## Objetivo
Conservar el main nuevo (PRs #12/#13/#14) y dejar la integración publicada con revisión transversal solicitada.

## Cambios
La Nota de 70 segundos, su nueva llegada al mundo y cine3 intactos. Se conserva tutorial real de movimiento, combo, dash, R e I y las fases del jefe. Ajustados tiempos del test de recorrido para observar la intro completa, sin saltarla.
PR https://github.com/sebvitaa/MafiaDev/pull/15 listo para revisión. Revisores VichoRamirez, Alejandr1no y sebvitaa solicitados por REST con autenticación Git existente. El conector devolvió 403 para crear PR; gh pr edit falló por scopes de lectura de org. Se usaron endpoints de PR sin cambiar permisos ni tokens.

## Comandos y resultados
| Comando | Resultado |
|---|---|
| npm run typecheck | PASS |
| npm test -- --run | PASS 137/137, 29 archivos |
| npm run build | PASS |
| npm run test:e2e (base anterior a nueva intro) | PASS 49/49, sin skips, 5.7 min |
| npx playwright test tests/e2e/integration-journey.spec.ts tests/e2e/seba-la-nota.spec.ts tests/e2e/cinematicas-lore.spec.ts --reporter=line | PASS 8/8, 3.3 min |

## Evidencia y límites
Apertura y películas vistas completas por la prueba integration-journey, hasta créditos y regreso al título. Usa fixtures de posición/daño para las fases: no se afirma una victoria manual sin ayudas. Capturas en test-results/integration-*.png y el-set-*.png. Preview de producción en http://127.0.0.1:5185/; pruebas aisladas en 5184.

## Estado de Git y publicación
Código y commits fuente preservados en basti/integracion-definitiva. Se integró origin/main 5d6b903. Rama original y archivos sin seguimiento preservados. Sin push directo ni force ni auto-merge.

## Siguiente paso
CI y revisión del equipo, luego merge protegido y verificación del despliegue oficial. Seguimiento PEN-basti-20261123-160532. El PR no se considera fusionado ni la URL oficial actualizada por esta integración todavía.
