---
id: SUP-alejandro-20261123-112838
type: supuesto
owner: alejandro         # quien tomó la decisión
validator: equipo # dueño del dominio afectado | equipo
agent: gpt
created: 2026-11-23T14:28:38.891Z
title: teleport uses GameScene public player
impact: medio       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [src/abilities/Teleport.ts] # rutas con marcador // SUP-<id>
refs: []
---

## Decisión
`Teleport` obtiene al jugador desde la propiedad pública `scene.player` al activarse. `GameScene.create()` y `RoomScene.create()` asignan esa propiedad antes de que el usuario pueda activar una habilidad. En la sala de Basti, `RoomPlayer` se adapta mediante `anchor`, `motion.facing` y `sync()`.

## Alternativas consideradas
Cambiar `AbilitySlots.tryActivate` para recibir al jugador requeriría tocar `src/types/character.ts` (shared) y `src/player/Player.ts` (Basti), fuera del dominio de esta tarea.

## Por qué
El contexto de escena ya existe en la fábrica de habilidades y evita modificar archivos de otros dominios. El acceso se resuelve por una interfaz estructural local, sin importar `GameScene` ni crear una dependencia circular.

## Impacto si se rechaza
Si otra escena no expone `player` con el contrato Arcade o el adaptador del laboratorio, debe acordarse un nuevo contexto antes de reutilizar `Teleport` allí.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
