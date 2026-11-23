---
id: HIS-seba-20261123-104551
type: history
owner: seba
agent: claude
created: 2026-11-23T13:45:51.553Z
title: fases 2 a 6 audio y pantallas
status: pass             # pass | fail | partial
commit: b9470d4          # hash del commit de código
refs: [SUP-seba-20261123-104551, SUP-seba-20261123-102354, PEN-vicho-20261123-102354, PEN-alejandro-20261123-102354, PEN-basti-20261123-102354]                 # PEN-/SUP-/HIS- relacionados
---

## Objetivo
Fases 2–6 del plan de seba: apertura animada, motor de audio + SFX, título y menús, HUD + tutorial + música dinámica, pulido (game over, créditos, transiciones, mezcla). Assets delegados a la API de OpenAI con presupuesto controlado.

## Cambios
- `public/assets/audio/{music,sfx,amb,vo}`: 5 pistas, 24 SFX + sting + fanfarria, 2 ambientes en bucle, 2 voces. Opus .ogg + .mp3 (2,1 MB en ogg). `CREDITS.md` con licencias (95ccd1c).
- `src/audio/tools/`: sintetizador chiptune offline (`synth.mjs`) y partituras/parámetros JSON para regenerar todo.
- `src/audio/{AudioDirector,mixing,manifest,index}.ts`: canales music/sfx/ambient/ui/voice, limitador (4 voces, 40 ms), variantes (swing por combo, hit aleatorio), crossfade, ducking en pausa (0,3), cámara lenta con parar el tiempo, jefe (silencio → rugido → música), fanfarria, game over (jingle + voz), latido con 1 corazón, carga diferida de zone2/boss (c1020af).
- `src/scenes/{Boot,Preload,Title,Pause}Scene.ts`, `src/ui/**`: fuente Silkscreen, apertura CRT + letras + barra con corredor y consejos; título con parallax, lluvia, logo con squash/shake, sting + voz + música; menú (Continuar/Jugar/Opciones/Créditos); opciones con sliders por canal y vista previa; pausa con menú; HUD (corazones con juice, viñeta, barra del jefe con barra fantasma, cooldown, avisos por rareza); tutorial contextual de 6 pasos; overlay de muerte desaturado; créditos en rodillo; teclas M/F/T (b9470d4).
- Tests: `tests/unit/seba-audio.test.ts`, `tests/unit/seba-tutorial.test.ts`, `tests/e2e/seba-menus.spec.ts`.

## Comandos y resultados
```text
$ npm run build      → ok
$ npm test           → 6 files, 23 tests passed
$ npm run test:e2e   → 2 passed (smoke + seba-menus)
Playtest Playwright contra vite dev emitiendo eventos del bus: HUD, jefe, game over, apertura → sin errores de consola.
```

## Tests
| test | resultado | nota |
|---|---|---|
| unit seba-settings / seba-audio / seba-tutorial | pass | 6 + 5 + 3 |
| e2e smoke | pass | `?skipIntro=1` |
| e2e seba-menus | pass | apertura → título → opciones → juego → pausa |

## Observaciones
- Calidad musical revisada escuchando con `gpt-audio`: notas 8–9/10 (title 9, zone1 8, zone2 8, gameover 8, sting 8, fanfarria 8). El modelo rechaza a veces el audio (boss y el reel de SFX quedaron sin nota).
- Gasto OpenAI de este sprint: ≈ 1,32 USD de 50 (log en `Hackaton/tools/oai-usage.jsonl`, fuera del repo).
- Las teclas en e2e necesitan ~120 ms entre pulsaciones (Phaser procesa la cola de teclado por frame).
- Pendiente de otros: `player:respawned` (vicho), `ability:ended` (alejandro), `boss:phase`/`enemy:killed` del minijefe (basti). Hay fallbacks por tiempo.

## Siguiente paso
Escuchar en navegador real y ajustar la mezcla; minimapa de vicho en el HUD cuando exista; QA en Firefox/Safari.
