---
id: SUP-alejandro-20261123-113037
type: supuesto
owner: alejandro         # quien tomó la decisión
validator: equipo # dueño del dominio afectado | equipo
agent: gpt
created: 2026-11-23T14:30:37.418Z
title: teleport atraviesa dinamicos y respeta solidos
impact: medio       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [src/abilities/Teleport.ts] # rutas con marcador // SUP-<id>
refs: []
---

## Decisión
El teletransporte avanza hasta 64 px hacia donde mira el Luchador, atraviesa cuerpos dinámicos (enemigos y jefe) y se detiene antes del primer cuerpo estático. Si no alcanza a desplazarse al menos un píxel, la activación falla y no consume cooldown.

## Alternativas consideradas
Atravesar paredes o usar invulnerabilidad durante el desplazamiento; ambas opciones añaden riesgo de saltarse el nivel o afectan el sistema de daño de Basti.

## Por qué
La regla hace útil el teletransporte en combate y mantiene las colisiones del nivel como límite. El alcance y el cooldown se leen de `src/data/abilities.json`.

## Impacto si se rechaza
Si el equipo quiere atravesar paredes o añadir invulnerabilidad, debe ajustarse la validación de destino y coordinarse con los dominios de mundo y combate.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
