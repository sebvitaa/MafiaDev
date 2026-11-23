---
id: SUP-seba-20261123-084247
type: supuesto
owner: seba         # quien tomó la decisión
validator: equipo # dueño del dominio afectado | equipo
agent: claude
created: 2026-11-23T11:42:47.602Z
title: HUD y menus asignados a seba; logica del minimapa a vicho
impact: medio       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [AGENTS.md]   # rutas con marcador // SUP-<id>
refs: []
---

## Decisión
HUD (corazones, barra de vida de jefe, cooldown de habilidades, contador de almas) y menús → seba (`src/ui/**`), junto con Title/Pause/Loading. Lógica del minimapa (salas visitadas, niebla) → vicho (`src/exploration/`); el render del minimapa dentro del HUD lo hace vicho como componente que seba solo posiciona.

## Alternativas consideradas
(a) HUD por partes: cada dueño su widget · (b) HUD entero en vicho.

## Por qué
Seba ya tiene las pantallas/escenas UI; centralizar el estilo de UI en una persona da coherencia visual. El HUD solo escucha eventos (`player:hit`, `ability:ready`, `boss:phase`).

## Impacto si se rechaza
Reasignar `src/ui/**`. El HUD consume solo el bus: el cambio de owner no rompe contratos.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
