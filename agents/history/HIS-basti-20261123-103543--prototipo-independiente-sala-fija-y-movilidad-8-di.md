---
id: HIS-basti-20261123-103543
type: history
owner: basti
agent: gpt
created: 2026-11-23T13:35:43.559Z
title: Prototipo independiente sala fija y movilidad 8 direcciones
status: pass
commit: sin commit por instrucción del humano
refs: [SUP-basti-20261123-103543]
---

## Objetivo
Prototipo independiente Isaac + Hades: sala rectangular con cámara superior fija, profundidad visual 3/4, movilidad de ocho direcciones, carrera, dash, salto y doble salto. Sin reemplazar el juego lateral ni tocar sistemas de compañeros.

## Cambios
- Nuevos `src/player/room-prototype/RoomMotion.ts`, `RoomPlayer.ts`, `RoomScene.ts`, `main.ts`, `index.html`, `README.md`.
- Nuevas pruebas `tests/unit/player-room-motion.test.ts` y `tests/e2e/player-room-prototype.spec.ts`.
- SUP citado documenta decisiones reversibles. No se modifica ningún archivo versionado existente, configuración compartida, mapa, sprite ni contrato.
- Se reutilizan como lectura Input, CharacterStats, clases/tuning y DashMotion. No se emiten eventos globales ni se guarda progreso.

## Comandos y resultados
```text
git status --short --branch; git branch --show-current; git fetch origin
git rev-list --left-right --count HEAD...origin/main -> 2 0 (nada pendiente de integrar)
git rev-list --left-right --count HEAD...origin/feature/basti-movement-combat -> 3 0
node scripts/agents.mjs status --owner basti -> ejecutado; limitación CRLF documentada anteriormente
npm test -- tests/unit/player-room-motion.test.ts -> RED por módulo todavía inexistente; luego GREEN 15/15
npm run typecheck -> detectó Vector2 exigido por fillPoints; corregido en el renderer local
npm run typecheck -> detectó propiedad rotation omitida en tipos Camera de Phaser; comprobada en fuente instalada y acotada mediante intersección local en test
npm test -> 35/35 pass
npm run test:e2e -> 8/8 pass
npm run typecheck -> exit 0 final
npm run build -> exit 0; build original, 32 módulos
npx vite build src/player/room-prototype --outDir ../../../dist/room-prototype --base ./ --emptyOutDir -> exit 0; 13 módulos
npm run dev -- --strictPort -> servidor disponible en localhost:8080
npm run preview -- --port 8081 --strictPort -> paquete disponible en localhost:8081
node -e <Playwright: Chromium headless, goto http://localhost:8081/room-prototype/, waitForLoadState(networkidle), wait canvas, screenshot> -> HTTP 200, canvas=1, errors=[]
git diff --check -> exit 0; git diff --stat -> vacío (solo archivos nuevos sin seguimiento)
Get-FileHash -LiteralPath <los seis documentos sin seguimiento previos> -> hashes idénticos antes/después
```

## Tests
| test | resultado | nota |
|---|---|---|
| Reglas unitarias | 35/35 pass | 20 existentes y 15 propias |
| Chromium | 8/8 pass | 4 existentes, 4 nuevas de sala |
| Typecheck | pass | src y tests |
| Build juego lateral | pass | dist/index.html |
| Build prototipo | pass | dist/room-prototype/index.html |
| Carga paquete independiente | pass | HTTP 200, canvas visible, sin errores |

## Observaciones
Captura de Chromium revisada visualmente: test-results/room-prototype.png. Captura del build: test-results/room-prototype-build.png. Ambas ignoradas por Git.

Se comprobó: WASD/flechas y rapidez diagonal, Shift sin dash accidental, cámara fija en ambos ejes con zoom/rotación constantes, altura independiente y sombra sobre suelo, doble salto, cooldown sin autorepetición al mantener C, obstáculos que bloquean dash y salto, orden por Y de pies y reinicio R sin errores. La cámara encuadra toda la sala; no hay seguimiento.

Limitaciones deliberadas: arte y geometría provisionales; no superficies elevadas, combate, navegación por otras salas ni salto sobre paredes. La puerta es decorativa. No se cambiaron main, Player lateral, Input, tipos, tuning, package.json ni configuración de builds. Los seis documentos previos fueron conservados byte por byte.

Playwright emite el aviso de entorno NO_COLOR/FORCE_COLOR; sin fallos de pruebas. No se ejecutó ship, merge, commit ni push.

## Siguiente paso
Probar http://localhost:8080/src/player/room-prototype/ (desarrollo) o http://localhost:8081/room-prototype/ (build). Ajustar sensaciones solo si el humano lo solicita. La integración al juego actual requeriría otro alcance y coordinación.
