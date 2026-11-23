---
id: HIS-seba-20261123-114613
type: history
owner: seba
agent: claude
created: 2026-11-23T14:46:13.840Z
title: fases-2-6-v2-apertura-titulo-menus-audio-lab
status: pass
commit: e74532a
refs: [SUP-seba-20261123-114613, SUP-seba-20261123-114613-2, SUP-seba-20261123-114613-3, SUP-seba-20261123-114613-4, PEN-vicho-20261123-114613, PEN-basti-20261123-114613]
---

## Objetivo
Aplicar las encuestas de seba: la encuesta 1 cubre la fase 2 (apertura y carga) y la encuesta 2 las fases 3–6 (sonido, título y menús, HUD, muerte, créditos), comparadas con la v1 de main. Además, montar un Lab para probar música, sonidos, carga, inicio y créditos.
El trabajo se delegó en Codex CLI y en la API de OpenAI; Claude revisó y aprobó cada entrega.

## Cambios
- `src/scenes/PreloadScene.ts`, `src/ui/logo.ts`, `src/ui/pushup.ts`, `src/audio/splashSting.ts`: apertura sin assets.
  - Píxel parpadeante, marca de Codex con sting WebAudio, letras a 40 ms con Back/Bounce, glitch, chispas y shake.
  - Pantalla de carga: tagline, brillo, barra rosa (mínimo 0,5 s), flexiones con X y contador con récord, un consejo por carga.
  - El logo se desliza al título. Versión corta si ya se vio la apertura.
- `src/scenes/TitleScene.ts`: ciudad noir con lluvia y squash + shake del logo. Prompt «PRESIONA CUALQUIER TECLA», que lanza sting, voz y jazz.
  - Menú: CONTINUAR (oculto sin partida), JUGAR < escenario 1/2/3 >, OPCIONES, CRÉDITOS.
  - Confirmación antes de sobrescribir; flash blanco + fundido al juego.
- Menús, delegados en Codex y revisados por Claude:
  - `Menu.ts`: cursor fedora, ratón, sonido de máquina de escribir, `hidden`.
  - `ConfirmDialog.ts`, `ControlsPanel.ts`, `pixelBar.ts`.
  - `OptionsScene.ts`: volúmenes 80/35/60 en pasos de 5 %, pantalla completa, menos movimiento, vibración, restaurar.
  - `PauseScene.ts`: desaturada, con Controles y confirmación al salir.
  - `ui/index.ts`: autopausa al perder el foco, cursor oculto en el juego, fin de demo (jefe → créditos).
  - `globalKeys.ts`: helper `shake`.
- `src/audio/*`:
  - Paneo estéreo; los enemigos fuera de cámara no suenan.
  - Ducking en parry (con microsilencio), jefe y loot raro. Tono del pickup según rareza.
  - Pausa al 50 % con degradado de 900 ms. Doble salto +400 cents.
  - La mezcla se recalibró para los nuevos valores por defecto.
- `src/audio/tools/synth.mjs` (Codex): instrumentos orgánicos por modelado físico, kits jazz y orquesta, SFX modal/KS/FM, ambientes `city-rain` y `fantasy-cave`.
- `public/assets/audio/**`: música, SFX y ambientes v2. Partituras y SFX en `src/audio/tools/scores/`.
- `src/ui/scenes/GameOverScene.ts`: «HAS MUERTO» estilo Elden Ring, con cámara lenta y desaturación.
- `src/ui/scenes/CreditsScene.ts`: equipo, IA usada, herramientas, licencias y agradecimientos. Se puede acelerar y tiene easter egg de flexiones.
- `src/ui/lab/**` (Codex, más un arreglo de layout de Claude) y `src/scenes/BootScene.ts`: con `?lab` aparece un panel de mezcla, música, ambiente, voces, SFX, eventos del juego y todas las pantallas.
- Tests:
  - `tests/e2e/seba-lab.spec.ts`: nuevo.
  - `tests/e2e/seba-menus.spec.ts`: flujo nuevo con flexión, música al 35 % −5 % y escenario 2.
  - `tests/unit/seba-audio.test.ts` (panFor, RARITY_DETUNE) y `seba-settings.test.ts`.

## Comandos y resultados
```text
$ npx tsc --noEmit                       → ok
$ npm test                               → 6 files, 28 tests passed
$ npm run build                          → ok (lab en chunk aparte, 14.9 kB)
$ SEBA_SHOTS=... npx playwright test     → 3 passed (smoke, seba-menus, seba-lab)
$ node tools/oai.mjs listen (QA audio)   → música 8–9/10; SFX 7/10 → 5 rehechos → 6–8/10
```

## Tests
| test | resultado | nota |
|---|---|---|
| unit (vitest) | 28/28 pass | incluye settings (pasos de 5 %, reset conserva el tutorial) |
| e2e smoke | pass | ESPACIO en el título sigue empezando (por eso el selector va en la fila) |
| e2e seba-menus | pass | apertura → flexión → título → opciones → escenario 2 → pausa |
| e2e seba-lab | pass | música, SFX, créditos y regreso al Lab sin errores de consola |

## Observaciones
- Revisión visual con capturas de Playwright a 960×540: marca de Codex (nudo hexagonal pixelado), logo letra a letra, pantalla de flexiones, título con ciudad, menú, selector de escenario, opciones, pausa desaturada y Lab. Los acentos se ven bien en Silkscreen.
- Arreglado en el Lab: el canvas no se reajustaba al estrecharse `#app`. Ahora lo hace con un ResizeObserver.
- Peso del audio: unos 4 MB por formato descargado (ogg), por debajo del tope de 8 MB.
- Gasto de la API de OpenAI en este sprint: unos $2,1 de $15.
- Codex no puede abrir puertos en su sandbox; Claude ejecutó Playwright.

## Siguiente paso
- vicho: PEN-vicho-20261123-114613 (leer `stage`).
- basti: PEN-basti-20261123-114613 (usar `shake`).
- seba: validar los SUP 114613 a 114613-4.
