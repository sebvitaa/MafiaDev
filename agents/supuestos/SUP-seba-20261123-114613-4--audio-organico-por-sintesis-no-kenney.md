---
id: SUP-seba-20261123-114613-4
type: supuesto
owner: seba         # quien tomó la decisión
validator: seba # dueño del dominio afectado | equipo
agent: claude
created: 2026-11-23T14:46:13.715Z
title: audio-organico-por-sintesis-no-kenney
impact: bajo       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [src/audio/tools/synth.mjs]
refs: []
---

## Decisión
El estilo «realista/orgánico» (3.1) se consigue con síntesis por modelado físico en `synth.mjs`, ampliado por Codex (Karplus-Strong, modal, FM, cuerda, coro…). No se usan packs CC0 de Kenney.
La música y los SFX v2 se compusieron con GPT-5 y los revisó `gpt-audio-mini`, con notas de 8–9/10 en música. Cinco SFX se rehicieron tras la primera escucha.

## Alternativas consideradas
Kenney CC0 (Impact/RPG Audio): la descarga automática da 403, porque el sitio necesita JS.

## Por qué
Sin licencias de terceros, regenerable desde JSON y 4 MB en un solo formato (tope 8 MB).

## Impacto si se rechaza
Se sustituyen los archivos `public/assets/audio/**` por samples reales, con los mismos nombres y claves.

## Resolución
