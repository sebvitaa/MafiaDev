---
id: SUP-seba-20261123-102354
type: supuesto
owner: seba         # quien tomó la decisión
validator: equipo # dueño del dominio afectado | equipo
agent: claude
created: 2026-11-23T13:23:54.108Z
title: Contratos fase 1 de seba: claves de audio, ability:ended, player:respawned, escenas de UI y smoke con skipIntro
impact: medio       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [src/types/assets.ts, src/types/events.ts, src/main.ts, tests/e2e/smoke.spec.ts]            # rutas con marcador // SUP-<id>
refs: []
---

## Decisión
Cambios en `shared` antes de la congelación de H1 (plan de seba, fase 1):
- `src/types/assets.ts`: SfxKey += `sfx-ui-move|sfx-title-sting|sfx-boss-roar|sfx-death|sfx-ability-ready|sfx-low-hp|sfx-tutorial-ok|sfx-fanfare`; MusicKey += `music-gameover`; tipos nuevos `AmbientKey` (`amb-zone1|amb-zone2`) y `VoiceKey` (`vo-title|vo-gameover`).
- `src/types/events.ts`: `player:respawned {}` (lo emite vicho tras el respawn; cierra el overlay de muerte) y `ability:ended {id}` (lo emite alejandro al terminar una habilidad con duración; restaura la música tras parar el tiempo).
- `src/main.ts`: registra `OptionsScene`, `GameOverScene` y `CreditsScene` (viven en `src/ui/scenes/`, dominio seba; hoy son stubs).
- `tests/e2e/smoke.spec.ts`: `page.goto('/?skipIntro=1')`. Con ese parámetro el título salta las animaciones y Space = «Jugar».
- Fin del jefe: el AudioDirector detecta `enemy:killed` con `kind === 'boss'` (sin evento nuevo).

## Alternativas consideradas
(a) Temporizadores en lugar de `ability:ended`/`player:respawned`: frágil si cambian las duraciones. (b) Escenas nuevas en `src/scenes/`: serían `shared` según `scripts/ship.mjs`.

## Por qué
Tras H1 los contratos quedan congelados; se piden todos de una vez. Solo se AÑADEN claves y eventos: nada existente cambia de semántica.

## Impacto si se rechaza
Revertir los 3 commits de `shared`. El AudioDirector usa temporizadores como fallback si los eventos nuevos nunca llegan.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
