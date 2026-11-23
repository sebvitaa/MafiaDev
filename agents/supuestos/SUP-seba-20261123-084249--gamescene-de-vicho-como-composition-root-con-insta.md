---
id: SUP-seba-20261123-084249
type: supuesto
owner: seba         # quien tomó la decisión
validator: equipo # dueño del dominio afectado | equipo
agent: claude
created: 2026-11-23T11:42:49.784Z
title: GameScene de vicho como composition root con install por dominio
impact: medio       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [AGENTS.md]   # rutas con marcador // SUP-<id>
refs: []
---

## Decisión
`src/scenes/GameScene.ts` → vicho, solo como composition root: llama `installWorld`, `installPlayer`, `installCharacter`, `installHud` e `installAudio` exportados por el `index.ts` de cada dominio. Sin lógica de juego en GameScene.

## Alternativas consideradas
(a) GameScene en shared (congelado) · (b) cada dominio edita GameScene directamente.

## Por qué
GameScene es el archivo con más riesgo de conflictos; con `install*` cada dominio cambia su propio index.ts y GameScene apenas se toca. Vicho es dueño natural porque la escena de juego es el mundo.

## Impacto si se rechaza
Pasar GameScene a shared y exigir aviso para cada cambio.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
