---
id: HIS-basti-20261123-105329
type: history
owner: basti
agent: gpt
created: 2026-11-23T13:53:29.424Z
title: Mejorar movilidad top-down y analizar combate futuro
status: pass
commit: sin commit por instrucción explícita del humano
refs: [SUP-basti-20261123-105329]
---

## Objetivo
Mejorar aceleración, rapidez y dash por doble WASD del prototipo sin cambiar cámara/perspectiva o sistemas ajenos. Analizar ataque, combos, bloqueo, parry y contraataque sin implementarlos.

## Cambios
- `src/data/tuning.json`: sección roomPrototype nueva, sin cambios en player/combat.
- `src/player/room-prototype/RoomMotion.ts`: aceleración, incremento de rapidez, dash de 150 ms/recuperación 650 ms y estado local para futuro combate.
- `RoomPlayer.ts`: lectura local de doble pulsación, limpieza al perder foco/reiniciar y estela.
- Nuevos `DoubleTapDash.ts` y `DashTrail.ts`: detección pura y pool de siluetas temporal.
- `index.html`, `README.md`: controles y sensaciones actualizados. Nuevo `COMBAT-NOTES.md`: análisis solicitado, dependencias y coordinación necesaria.
- `tests/unit/player-room-motion.test.ts`, nuevo `tests/unit/player-double-tap.test.ts` y `tests/e2e/player-room-prototype.spec.ts`.
- Solo HIS/SUP nuevos; historial previo y sistemas de compañeros intactos. RoomScene/main/cámara y jugador lateral sin ediciones.

## Comandos y resultados
```text
git status --short --branch; git branch --show-current; git fetch origin
-> feature/basti-movement-combat; rama remota no cambió desde la comprobación anterior
git log --oneline HEAD..origin/main -> e4f113c (audio/UI pendiente ya comunicado; no integrado)
node scripts/agents.mjs status --owner basti -> ejecutado; limitación CRLF conocida
npm test -- tests/unit/player-room-motion.test.ts tests/unit/player-double-tap.test.ts
-> RED: 14 assertions fallan por valores/reglas antiguas y detector nuevo aún ausente
-> GREEN tras implementación: 25/25
npm run typecheck -> exit 0
npm test -> exit 0, 45/45
npm run test:e2e -> exit 0, 10/10
npm run build -> exit 0
npx vite build src/player/room-prototype --outDir ../../../dist/room-prototype --base ./ --emptyOutDir -> exit 0
node -e <Playwright Chromium, cargar localhost:8081/room-prototype/, esperar canvas y verificar instrucciones nuevas> -> HTTP 200, canvas=true, updatedInstructions=true, errors=[]
git diff --check -> exit 0; git diff --cached --stat -> vacío
```

## Tests
| test | resultado | nota |
|---|---|---|
| Typecheck | pass | Código y pruebas |
| Unitarios | 45/45 pass | Incluye doble tap, tiempos, aceleración y no autorepetición |
| Chromium | 10/10 pass | Movimiento, cámara, sombra, colisión, dash, estela y juego lateral |
| Build principal | pass | Sin cambios de comportamiento del juego lateral |
| Build prototipo | pass | Entrada independiente |
| Carga producción | pass | Canvas e instrucciones actualizadas, sin errores |

## Observaciones
Se revisó visualmente test-results/room-prototype-dash.png: estela visible detrás del personaje. La estela termina y se desvanece, sin crear objetos ilimitados. Las paredes bloquean también el doble tap dash.

El código no implementa combate. COMBAT-NOTES.md propone fases de ataque, dirección fija por golpe, buffer de combo, guardia frontal, parry temporal y oportunidad de contraataque de un uso; identifica cambios shared que requerirían coordinación antes de ejecutarse.

Avisos no bloqueantes del entorno NO_COLOR/FORCE_COLOR y tamaño de bundle Phaser al construir el prototipo. No se hizo commit, merge, push ni ship. Los servidores dev/preview previos siguen disponibles.

## Siguiente paso
Abrir localhost:8080/src/player/room-prototype/, recargar si estaba abierto y probar doble WASD (soltar entre taps), Shift, C/K y Espacio/Z. Evaluar sensaciones y elegir siguiente paso de combate antes de implementarlo.
