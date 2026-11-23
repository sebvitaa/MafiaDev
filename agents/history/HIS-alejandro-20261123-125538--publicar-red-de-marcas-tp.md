---
id: HIS-alejandro-20261123-125538
type: history
owner: alejandro
agent: gpt
created: 2026-11-23T15:55:38.000Z
title: publicar red de marcas TP
status: pass
commit: 428e1648acf1b0f941c409658d5b4d43e53219f1
refs: [HIS-alejandro-20261123-123733, PEN-basti-20261123-122352, PEN-seba-20261123-125538]
---

## Objetivo
El humano dio por terminada esta entrega de habilidades y pidió subirla al repositorio. Otras habilidades quedan fuera del alcance actual. Publicar bajo Alejandro, preservando la integración local de Basti.

## Cambios
- Worktree alejandro/teleport-marks desde origin/main actualizado (2cfd7a0), sin modificar ni publicar src/player, tuning o la rama local integration/teleport-room-local.
- Commit 428e164: red de cuatro marcas reutilizables, papeles proyectiles y adhesión a objetivos registrados, Q + mouse, teclas 1–4 estables, 500 ms compartidos, llegada segura, indicadores y cleanup.
- Corrección detectada al probar sobre main: indicador y autorización usaban relojes distintos (scene.time.now y dtMs). Teleport ahora consulta el contador real de AbilitySlots para que el indicador no anuncie LISTO antes de permitir TP. Corrección copiada también al laboratorio local.
- E2E nuevo abilities-game.spec.ts prueba el módulo con Player y GameScene reales de main. Cuatro e2e del laboratorio se omiten con motivo explícito únicamente si la entrada de Basti no está integrada; siguen disponibles al integrar su rama. Los escenarios de laboratorio ya pasaron en la validación local previa.
- Documentación de integración y registros acumulados del trabajo de habilidades. Identidad de commit: Alejandr1no, correo noreply público verificado, solo variables del proceso (sin cambiar configuración global).

## Comandos y resultados
```text
git fetch origin --prune
git worktree add -b alejandro/teleport-marks <worktree> origin/main
npm ci --prefer-offline -> PASS; 42 paquetes, 0 vulnerabilidades
npm run build -> PASS; 59 módulos
npm test -> PASS; 36 tests, 8 archivos
npm run test:e2e -- abilities-game.spec.ts -> PASS; 1 test (GameScene real)
node --import <adaptador local Windows> scripts/ship.mjs --owner alejandro --agent gpt ... --dry-run --e2e
  -> Guardas de dominio/secretos, build, unit y e2e PASS.
git diff --cached --check -> PASS
git commit -m "feat(abilities): red de cuatro marcas TP con Q y teclas 1-4"
  -> 428e1648acf1b0f941c409658d5b4d43e53219f1
```

## Tests
| test | resultado | nota |
|---|---|---|
| Build sobre main actualizado | pass | TypeScript strict y Vite |
| Unit completa | pass | 36 tests, 8 archivos |
| E2E de main | pass | TP por 1–4, Q + mouse, cooldown compartido; smoke, menús, Lab/audio y revisión |
| E2E laboratorio de Basti | skip en esta rama | 4 casos requieren src/player/room-prototype, aún en la rama de Basti; no publicar sus archivos por Alejandro |
| Flujo ship dry-run | pass | Conserva todas las guardas oficiales |

## Observaciones
El script oficial hace spawnSync('npm'), que en Windows falla ENOENT. Se usó un adaptador LOCAL, fuera del repo, que redirige esa invocación a process.execPath + npm-cli.js; para e2e añade --workers=1 en esta PC. No cambia guardas, commits, merges, push ni creación de PR, ni omite tests. Bug original registrado en PEN-seba-20261123-125538. No hubo cambios shared.
Una corrida local paralela con seis Chromium saturó la GPU (GPU stall due to ReadPixels) y produjo timeouts generales, incluyendo pruebas existentes de audio y smoke. Se repitió la misma suite secuencialmente antes de publicar.
La publicación continúa por scripts/ship.mjs; este registro describe las verificaciones previas al push. La URL del PR y su CI se consultan después de publicar.
El laboratorio del usuario permanece en 127.0.0.1:8081. Se detuvo únicamente el servidor de pruebas anterior iniciado por esta sesión en 8080 para verificar el worktree correcto.
PEN-basti-20261123-122352 continúa abierto para adopción de RoomPlayer y registro de enemigos/jefe reales.

## Siguiente paso
Ejecutar ship --e2e, comprobar PR/CI y comunicar URL. Validación local del laboratorio con el contador unificado al finalizar publicación.
