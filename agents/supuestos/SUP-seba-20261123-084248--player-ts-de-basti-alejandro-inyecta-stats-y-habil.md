---
id: SUP-seba-20261123-084248
type: supuesto
owner: seba         # quien tomó la decisión
validator: equipo # dueño del dominio afectado | equipo
agent: claude
created: 2026-11-23T11:42:48.692Z
title: Player.ts de basti; alejandro inyecta stats y habilidades por interfaz
impact: alto       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [AGENTS.md]   # rutas con marcador // SUP-<id>
refs: []
---

## Decisión
`src/player/Player.ts` y `src/player/states/**` → basti. Alejandro expone `CharacterStats` (atk, def, speed, maxHp, airJumps, dash) y `AbilitySlots` (`tryActivate(slot)`) en `src/character`, con interfaz en `src/types/character.ts`. Player lee stats cada frame y delega el input de habilidad a AbilitySlots. Sprites/animaciones del personaje → alejandro; claves en `src/types/assets.ts`.

## Alternativas consideradas
(a) Player.ts de alejandro y estados de basti (dos dueños en una clase) · (b) Player completo de basti con habilidades incluidas.

## Por qué
Una clase con un solo dueño evita conflictos de merge. La interfaz permite que cada uno trabaje con un stub: basti con stats fijos y alejandro probando habilidades en una escena de test.

## Impacto si se rechaza
Riesgo alto de solape si se rechaza sin definir la frontera. Alternativa mínima: mantener la interfaz y cambiar solo quién es dueño de Player.ts.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
