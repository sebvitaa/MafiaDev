---
id: SUP-basti-20261123-133221
type: supuesto
owner: basti
validator: equipo
agent: gpt
created: 2026-11-23T16:32:21.000Z
title: enemigos basicos tres tipos escala de combate
impact: medio
reversible: si
status: pendiente
code_refs: [src/combat/balance.ts, src/data/enemies.json, src/data/tuning.json, src/player/room-prototype/RoomScene.ts]
refs: [PEN-basti-20261123-122352]
---

## Decisión
El humano pidió programar enemigos básicos y nivelar daño/vida. Confirmó explícitamente: "Dos tipos: Cobrador ágil y knight resistente"; junto con slime forman tres tipos distintos, ampliando la equivalencia original del lore Cobrador=knight.
Balance inicial reversible: un corazón=25 puntos; un atk=12,5 puntos. Luchador con stats existentes maxHp=5/atk=2 tiene 125 HP y espada base 25 (combo 25/30/40 y carga máxima 50). No se cambian CharacterStats, classes.json ni GameState. Eventos de vida convierten puntos a corazones al emitir player:hit.
Slime HP50/daño25/vel65/anticipación350; Cobrador HP100/daño25/vel105/anticipación450; knight HP150/daño50/vel55/anticipación750. Knight no interrumpe su anticipación/impacto por recibir daño, pero recibe el mismo daño en puntos. Perfiles en enemies.json.
Jugador tiene 600 ms de protección postgolpe, retroceso y bloqueo de movimiento de 150 ms. Recibir daño cancela ataque/carga y dash, conservando recuperación. Salto sigue su trayectoria durante hurt; no se añade invulnerabilidad de dash/salto.
Cada enemigo tiene cuerpo Arcade dinámico, identidad única, interfaz de espada/fuego existente y registro TP. Muere una sola vez; cuerpo desactivado y registro retirado liberan la marca. No se generan jefes ni créditos.
Modo de enemigos activado mediante ?enemies=1 en el mismo laboratorio; entrada sin parámetro conserva la prueba de movilidad/muñeco. Enemigos empiezan fuera de detección para permitir recoger espada. R reinicia todo el combate.

## Alternativas consideradas
Cambiar stats compartidos a puntos directamente, reinterpretar silenciosamente daño antiguo 1/2, o reemplazar el laboratorio de Basti y sus pruebas. Se mantiene conversión explícita y modo de combate accesible mediante enlace.

## Por qué
Daño y vida de ambos bandos pasan por la misma escala de combate sin convertir el HUD general de corazones a cientos de corazones. Perfiles distinguibles y TP conservado; el knight anuncia su golpe más fuerte.

## Impacto si se rechaza
Todos los valores están en JSON; el factor de conversión está centralizado en combat/balance.ts. La instalación de enemigos es optativa por escena. La IA/Health están separadas de Phaser y cubiertas por tests.

## Resolución
La separación Cobrador/knight fue confirmada por el humano en este chat. Los valores iniciales y políticas adicionales se registran para playtest y ajuste. El cambio de alcance de esta tarea autoriza programación de enemigos; la publicación de código del dominio Basti no se realizó en este turno.
