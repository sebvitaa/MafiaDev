---
id: SUP-seba-20261123-114613-2
type: supuesto
owner: seba         # quien tomó la decisión
validator: equipo # dueño del dominio afectado | equipo
agent: claude
created: 2026-11-23T14:46:13.627Z
title: escenario-1-2-3-via-registry-stage
impact: medio       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [src/scenes/TitleScene.ts]
refs: [PEN-vicho-20261123-114613]
---

## Decisión
JUGAR lleva un selector `< 1 · INICIO | 2 · MITAD | 3 · FINAL >` que se cambia con ←/→. Al empezar se hace `registry.set('stage', n)` y se llama a `scene.start('GameScene', { stage: n })`. CONTINUAR no pasa `stage`, así que se carga la partida guardada.
Interfaz entre dominios: GameScene (vicho) debe leer `data.stage` (o `registry.get('stage')`) y llevar al jugador a la zona early/mid/late.

## Alternativas consideradas
- Submenú de escenarios: rompía `tests/e2e/smoke.spec.ts` (shared), que espera que ESPACIO en el título empiece la partida.
- Evento nuevo en el bus: es un cambio `shared`; no hace falta porque los datos de escena bastan.

## Por qué
Petición explícita de seba: «se pueda escoger el escenario… 1 early, 2 mid, 3 late». Es la forma menos invasiva.

## Impacto si se rechaza
Mientras GameScene no lea `stage`, los tres escenarios empiezan igual. No rompe nada.

## Resolución
