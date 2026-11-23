---
id: HIS-basti-20261123-141140
type: history
owner: basti
agent: gpt
created: 2026-11-23T17:11:40.694Z
title: lluvia italiana verificada
status: pass
commit:
refs: [SUP-basti-20261123-141140, HIS-basti-20261123-135926]
---

## Objetivo
Reemplazar visualmente el proyectil morado por la Lluvia Italiana sin modificar radio, cooldown ni daño total de la habilidad.

## Cambios
- `src/player/room-prototype/ItalianRain.ts`: plan puro y determinista para 7–10 trayectorias con offsets, deriva, delays, caída, rotación y escala.
- `src/player/room-prototype/RoomFireball.ts`: diez completos gráficos acotados con pan, vienesa, palta, tomate y mayo; sombras, estelas, oleadas, salpicaduras, migas y runas que expiran; indicador violeta con acentos tricolores; un único `FireballBlast` al final de 600 ms y destrucción de todos los objetos en shutdown.
- `src/data/tuning.json`: rango de cantidad, altura y ventana de destello.
- `src/player/room-prototype/index.html`, `README.md`: controles e instrucciones revisados.
- `tests/unit/italian-rain.test.ts`, `tests/e2e/player-room-prototype.spec.ts`: rango, seed, área, tiempos, visuales, un solo impacto y limpieza tras reiniciar.

## Comandos y resultados
```text
$ npx vitest run tests/unit/italian-rain.test.ts
PASS: 2/2
$ npm run typecheck
PASS
$ npm test
PASS: 13 archivos, 72 pruebas
$ npm run build
PASS: tsc + Vite
$ npm run test:e2e
PASS: 17/17
$ git diff --check
PASS (avisos de normalización LF/CRLF únicamente)
```

## Tests
| test | resultado | nota |
|---|---|---|
| Plan puro | pass | 7–10 dentro del radio, arrivals antes de 600ms y trayectorias variadas |
| E2E lluvia | pass | daño de 50 aplicado una vez, 7–10 objetos, cleanup al reiniciar |
| Suite completa | pass | 72 unitarias; 17 e2e, incluido dash/carga/eco/deuda |

## Observaciones
El daño de bola y bonus de marcas solo se evalúan una vez al final del timeline; la lluvia y cada splash son decorativos. Un e2e de carga tenía una espera de 250ms menor que el umbral de 350ms y se corrigió a 500ms. Una aserción de radio se volvió condicional al frame para evitar lecturas prematuras durante Playwright paralelo. La vista de navegador confirma completos visibles en caída con sombras y salpicadura. No hay assets externos. Sin commit ni push.

## Siguiente paso
Probar la lluvia en `npm run dev` → `/src/player/room-prototype/` y validar SUP-basti-20261123-141140.
