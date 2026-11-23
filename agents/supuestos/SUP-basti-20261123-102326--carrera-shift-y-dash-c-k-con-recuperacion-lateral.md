---
id: SUP-basti-20261123-102326
type: supuesto
owner: basti         # quien tomó la decisión
validator: basti # dueño del dominio afectado | equipo
agent: gpt
created: 2026-11-23T13:23:26.892Z
title: Carrera Shift y dash C-K con recuperacion lateral
impact: bajo       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [src/player/Player.ts]
refs: []
---

## Decisión
Carrera manteniendo Shift, x1.65 de la velocidad actual, también durante el control aéreo. Dash con C/K, hacia el input horizontal o la última orientación. Se filtra SHIFT localmente de BINDINGS.dash en Player, sin cambiar Input ni sus contratos.

Dash de 140 ms a 360 px/s, con recuperación posterior de CharacterStats.dashCooldownMs (400 ms para Luchador). Los valores propios están en tuning.json. No hay cargas acumuladas ni reactivación al mantener una tecla o aterrizar. Se permite dash aéreo conservando saltos; mientras dura se suspende gravedad y al terminar se restaura el impulso vertical previo. No atraviesa obstáculos.

Player.isInvulnerable expone los primeros 100 ms para futura consulta del sistema de daño. No se implementa ni conecta daño, combate ni un contrato compartido nuevo. player:dash usa el payload existente.

## Alternativas consideradas
- Cambiar Input para añadir sprint y quitar Shift de dash: afecta shared, innecesario.
- Cooldown contado desde el inicio: permitiría una recuperación efectiva menor; se cuenta tras terminar el dash.

## Por qué
Cumple movilidad lateral y evita cambios en mapas, personajes, audio, progresión y contratos de compañeros. Los valores no especificados son reversibles dentro del dominio de Basti.

## Impacto si se rechaza
Modificar tuning o el adaptador local de Player. Cualquier futura modificación al input compartido requiere coordinación explícita previa.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
