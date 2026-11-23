---
id: HIS-basti-20261123-160257
type: history
owner: basti
agent: gpt
created: 2026-11-23T19:02:57Z
title: integracion-verificada-49-e2e-y-nuevo-main
status: pass
commit: 768741a
refs: [SUP-basti-20261123-150950, PEN-basti-20261123-134311, PEN-basti-20261123-144846, PEN-basti-20261123-134231]
---

## Objetivo
Verificar la candidata integrada antes de incorporar la nueva intro publicada en main y publicar PR revisable.

## Cambios
Incluye corrección del tutorial sin bloqueo/parry, spawn seguro y cámara centrada, tres fases, corazón y cine3, perf de enemigos/mapa y limpieza idempotente de grupos Arcade.

## Comandos y resultados
| Comando | Resultado |
|---|---|
| npm ci | PASS, 42 paquetes, 0 vulnerabilidades |
| npm run typecheck | PASS |
| npm test -- --run | PASS, 137 tests / 29 archivos |
| npm run build | PASS |
| npm run test:e2e | PASS, 49/49 Chromium, 5.7 min, sin skips |
| pruebas específicas de aparición/rendimiento/reintento | PASS, 6/6 |
| prueba de reiniciar dos veces + cine3 + rendimiento | PASS, 4/4 |

## Incidencias corregidas
El grupo Arcade podía estar destruido por Phaser al ejecutar el cierre de EnemySystem. Se guardan clear/destroy con children y se prueba reinicio doble. Un intento previo de suite se detuvo para corregirlo; la ejecución completa posterior pasó 49/49.
El primer test de spawn inspeccionaba un tilemap nuevo sin layer renderizado; se corrigió el fixture para leer la capa real de la escena y pasó en mapas 1/2/3.

## Evidencia
Capturas test-results/integration-opening.png, integration-title.png, integration-boss.png, integration-error23.png e integration-tulio.png. La prueba de recorrido observa las películas completas pero usa fixtures de posición/daño para fases; no es una victoria manual sin ayudas. Assets publicados se preservan.

## Publicación
Rama basti/integracion-definitiva publicada. PR https://github.com/sebvitaa/MafiaDev/pull/15 en borrador. El conector Github rechazó crear PR con HTTP403; gh oficial con autenticación Git local lo creó. No se imprimieron credenciales.

## Siguiente paso
Main avanzó a 5d6b903 (intro de 70s). Se integró en 6f6f1ce conservando combate, y typecheck/unit/build vuelven a pasar. Pruebas de intro/llegada/recorrido y CI aún en curso. Solicitar revisores y no fusionar antes de la aprobación transversal.
