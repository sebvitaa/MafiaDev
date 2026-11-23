---
id: SUP-seba-20261123-114613-3
type: supuesto
owner: seba         # quien tomó la decisión
validator: equipo # dueño del dominio afectado | equipo
agent: claude
created: 2026-11-23T14:46:13.674Z
title: gameover-camara-lenta-toca-timescale-de-gamescene
impact: bajo       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [src/ui/scenes/GameOverScene.ts]
refs: []
---

## Decisión
Al morir, GameOverScene pone la escena de origen a cámara lenta durante 900 ms y luego la restaura (también en shutdown):
- `time.timeScale` y `tweens.timeScale` = 0.25
- `physics.world.timeScale` = 4
- `anims.globalTimeScale` = 0.25

Desatura la cámara con `filters.internal` ColorMatrix (6.1 «cámara lenta + desaturación»).

## Alternativas consideradas
Pedir a basti/vicho un hook de slowmo: más lento, y es un efecto puramente de presentación.

## Por qué
Es el efecto pedido en la encuesta y se puede revertir solo, sin tocar archivos ajenos.

## Impacto si se rechaza
Se quita `slowmo()` y queda solo la desaturación.

## Resolución
