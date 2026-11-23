---
id: PEN-basti-20261123-122352
type: pending
owner: basti
created_by: alejandro
agent: gpt
created: 2026-11-23T15:23:52.000Z
title: adoptar controles Q marcas y registrar enemigos TP
priority: p1
status: in_progress
area: abilities
refs: [SUP-alejandro-20261123-121806, PEN-basti-20261123-115351]
closed_by:
---

## Contexto
El humano reemplazó el TP corto por cuatro marcas reutilizables. Q sostenida + derecho lanza, Q + izquierdo hace TP a marca, izquierdo sin Q ataca. Espera 500 ms entre TP. El módulo abilities ya instala el input, visuales, colisiones y cleanup.
La rama local integration/teleport-room-local tiene el adaptador experimental autorizado de RoomPlayer: instala AbilitySlots, llama update(dtMs), elimina activación al pulsar Q sola y condiciona espada a !Q.isDown. No publicar esta rama mixta vía ship --owner alejandro.

## Repro / evidencia
src/enemies/index.ts es un stub y el laboratorio no contiene enemigos reales. Los e2e crean un cuerpo temporal etiquetado para probar el seguimiento; no es contenido permanente de la demo.

## Criterio de cierre
- [ ] Adoptar en la rama de Basti la conexión de RoomPlayer y documentar sus controles nuevos en el laboratorio.
- [ ] Registrar enemigos y jefe reales con registerTeleportTarget(enemy) desde src/abilities, después de crear su cuerpo Arcade dinámico.
- [ ] Desactivar/destruir el cuerpo al morir, o llamar a la función unregister devuelta por el registro.
- [ ] Probar durante combate real que Q + izquierdo no golpea, marca se mueve con objetivo y TP llega a su lado sin incrustarse.

## Notas
Contrato documentado en src/abilities/README.md. Conserva movimiento y combate dentro del dominio de Basti. Este pending sustituye los criterios antiguos de TP corto del PEN-basti-20261123-115351.


## Ampliación: teclas numéricas
El humano pidió también 1, 2, 3 y 4 para TP directo, sin mantener Q. Implementados en abilities con la misma recarga de 500 ms y limpieza propia, sin cambios adicionales a RoomPlayer. Los números de los papeles coinciden con esas teclas y son estables al retirar/reemplazar otros. Incluir este control al documentar el laboratorio. Validación: 29 unit y 6 e2e PASS; HIS-alejandro-20261123-123733 y SUP-alejandro-20261123-123733.


## Avance local de enemigos básicos
El humano pidió programar slime, Cobrador ágil y knight resistente. En basti/basic-enemies se integró el combate 5cd9c45 con main 0c3cd69, Q/pointerup/carga, los tres cuerpos dinámicos registrados para TP, daño y muerte reales. Ver HIS-basti-20261123-133221 (94 unit/28 e2e PASS). Falta adopción/publicación oficial y conexión con mapas/jefe; no cerrar este pending todavía.
