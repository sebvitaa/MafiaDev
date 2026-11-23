---
id: PEN-basti-20261123-115351
type: pending
owner: basti         # quien debe resolverlo (dueño del dominio)
created_by: alejandro
agent: gpt
created: 2026-11-23T14:53:51.688Z
title: integrar teleport en laboratory RoomPlayer
priority: p1   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: wontfix
area: movement           # combat | movement | world | exploration | character | abilities | items | audio | ui | shared
refs: [SUP-alejandro-20261123-112838, SUP-alejandro-20261123-113037]
closed_by: HIS-alejandro-20261123-122352
---

## Contexto
`src/player/room-prototype/RoomPlayer.ts` es un jugador independiente: usa `anchor`/`body` y `motion.facing` en ocho direcciones. No instala ni invoca `AbilitySlots`; la habilidad actual resuelve el jugador desde la escena y está pensada para el Player lateral.
La rama local `integration/teleport-room-local` tiene una integración experimental para probarlo; `ship --owner alejandro` no puede publicar archivos del dominio de Basti.

## Repro / evidencia
```text
En `RoomScene.update`, `RoomPlayer.update` no procesa la acción `ability`; el README del laboratorio no lista Q/I.
```

## Criterio de cierre
- [ ] Al pulsar Q/I en el laboratorio, `teleport` usa el facing 2D de `RoomMotion`.
- [ ] La habilidad conserva el cooldown, respeta obstáculos estáticos y puede atravesar cuerpos dinámicos.
- [ ] El nivel principal y el prototipo de laboratorio siguen independientes.
- [ ] Basti revisa y adopta la integración en su rama/prototipo, o el equipo acuerda otro dueño para esos archivos.

## Notas


## Cambio de alcance 2026-11-23
El humano sustituyó TP corto por red de marcas. Criterios reemplazados por PEN-basti-20261123-122352; la integración definitiva sigue pendiente allí.
