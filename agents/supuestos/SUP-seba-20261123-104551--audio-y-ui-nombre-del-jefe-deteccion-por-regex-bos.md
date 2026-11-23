---
id: SUP-seba-20261123-104551
type: supuesto
owner: seba         # quien tomó la decisión
validator: equipo # dueño del dominio afectado | equipo
agent: claude
created: 2026-11-23T13:45:51.484Z
title: Audio y UI: nombre del jefe, deteccion por regex boss, teclas M F T, assets generados con OpenAI
impact: medio       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [src/ui/HudScene.ts, src/audio/index.ts, src/ui/globalKeys.ts, src/ui/tutorial/TutorialOverlay.ts, public/assets/audio/CREDITS.md]            # rutas con marcador // SUP-<id>
refs: []
---

## Decisión
- Jefe: el HUD lo rotula «EL PADRINO» y toma su vida de `enemies.json → miniboss.hp` (30). Se considera jefe cualquier `enemy:hit/killed` cuyo `id` o `kind` contenga `boss` (cubre `miniboss`). Mientras la barra está visible, cualquier `enemy:hit` la reduce (no hay evento con la vida del jefe).
- Cámara lenta de la música solo si el `id` de `ability:used` contiene `time|tiempo|stop` (`time_stop` en abilities.json). Fallback 3 s sin `ability:ended`; 4–4,5 s sin `player:respawned`.
- Teclas globales de UI: **M** silencio, **F** pantalla completa, **T** saltar el tutorial. No chocan con `BINDINGS`.
- Assets: música, SFX y voces generados con la API de OpenAI (GPT-5 compone partituras/parámetros; sintetizador propio; TTS) y arte del título con gpt-image-1.5. Detalle y licencias en `public/assets/audio/CREDITS.md`. La voz del narrador es IA y así figura en los créditos.
- Mezcla base: música 0,42 · SFX 0,75 · ambiente 0,32 · UI 0,6 (`src/audio/mixing.ts`), parry ×1,25.
- Tipografía: Silkscreen (OFL) en 8/16/24 px.

## Alternativas consideradas
Música de BeepBox hecha a mano (más lenta); packs de Kenney (genéricos); Suno/Udio (licencias dudosas en plan gratuito).

## Por qué
Cohesión sonora (una sola paleta de síntesis), licencias limpias y reproducibles (`src/audio/tools/`), y coste bajo (≈ 1,3 USD en API).

## Impacto si se rechaza
Todo es local al dominio seba: cambiar nombre/regex/teclas es una línea; los assets se sustituyen manteniendo las claves de `src/types/assets.ts`.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
