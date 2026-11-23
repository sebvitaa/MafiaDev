---
id: SUP-basti-20261123-115553
type: supuesto
owner: basti         # quien tomó la decisión
validator: basti # dueño del dominio afectado | equipo
agent: gpt
created: 2026-11-23T14:55:53.647Z
title: parametros iniciales de espada y muñeco
impact: medio       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [src/player/room-prototype/SwordCombat.ts, src/player/room-prototype/SwordAttack.ts, src/player/room-prototype/TrainingDummy.ts]
refs: [SUP-basti-20261123-112929]
---

## Decisión
Configurar el tajo del prototipo con 72 px de alcance, sector frontal de ±38°, 25 de daño, 220 ms activo y 280 ms de cooldown adicional. El muñeco empieza con 100 HP y radio de 18 px. Usar la interfaz local `SwordDamageTarget` con ID/posición/radio/método de daño y un tracker que limita a un hit por ID y swing.

## Alternativas consideradas
Esperar sistemas de `src/combat` (actualmente es un stub vacío), cambiar contratos/eventos compartidos o encapsular el área/damage target solo en el prototipo.

## Por qué
Permite verificar hitbox direccional, daño, cooldown y feedback sin conectar código de compañeros. El interface local da a enemigos reales una adaptación sencilla y reversible.

## Impacto si se rechaza
Balancear alcance, ángulo, daño, recuperación y HP/radio del muñeco mediante `src/data/tuning.json`; el adapter puede envolverse al conectarlo con los componentes de combate definitivos.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
