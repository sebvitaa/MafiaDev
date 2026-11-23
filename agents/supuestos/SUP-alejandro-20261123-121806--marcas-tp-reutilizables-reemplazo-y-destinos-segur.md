---
id: SUP-alejandro-20261123-121806
type: supuesto
owner: alejandro
validator: equipo
agent: gpt
created: 2026-11-23T15:18:06.539Z
title: marcas TP reutilizables reemplazo y destinos seguros
impact: medio
reversible: si
status: pendiente
code_refs: [src/abilities/Teleport.ts, src/data/abilities.json]
refs: [SUP-alejandro-20261123-112838, SUP-alejandro-20261123-113037]
---

## Decisión
El humano cambió la especificación: hasta cuatro marcas lanzadas al escenario/enemigos, Q sostenida + derecho para lanzar, Q + izquierdo para TP, izquierdo sin Q para espada; 500 ms entre TP.
Reglas adicionales reversibles: quinta marca reemplaza a la más antigua, incluyendo papeles en vuelo; marcas reutilizables y persistentes hasta reiniciar/salir; proyectiles detenidos por estáticos; TP comprueba solo destino y permite cruzar sólidos intermedios si la marca ya está al otro lado. Sin cooldown de lanzamiento adicional.
Velocidad del papel 780 px/s; radio 4 px; selección a 26 px; llegada libre buscada hasta 48 px en pasos de 4 px. Cerca de enemigos, llegada al lado del cuerpo con margen de 6 px. Destino imposible no gasta cooldown. Marca desaparece al desactivar/destruir/retirar el enemigo como objetivo.
Interfaz de integración: registerTeleportTarget(gameObject) etiqueta cuerpos Arcade dinámicos usando data.teleportTarget; así no se marca accidentalmente al jugador/pickups. El humano autorizó seguir usando la integración local del laboratorio, propiedad de Basti; publicar mediante Alejandro solo archivos de su dominio.

## Alternativas consideradas
Bloquear la quinta marca; consumir la marca tras cada TP; usar retardo de lanzamiento adicional; marcar todos los cuerpos dinámicos automáticamente.

## Por qué
Red reutilizable de cuatro destinos con controles explícitos y TP rápido, sin aparecer dentro de paredes/enemigos. El registro explícito evita acoplarse a una clase Enemy que todavía no existe en esta copia.

## Impacto si se rechaza
Los valores están en JSON. Cambiar reemplazo/reutilización no exige cambiar combate ni movimiento. La búsqueda del jugador continúa usando scene.player como antes.

## Resolución
Pendiente validar las reglas adicionales. Los controles y los 500 ms fueron especificados por el humano en este chat; no son supuestos.
