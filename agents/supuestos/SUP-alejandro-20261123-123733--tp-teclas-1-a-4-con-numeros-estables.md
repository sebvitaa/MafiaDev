---
id: SUP-alejandro-20261123-123733
type: supuesto
owner: alejandro
validator: alejandro
agent: gpt
created: 2026-11-23T15:37:33.000Z
title: TP teclas 1 a 4 con numeros estables
impact: bajo
reversible: si
status: pendiente
code_refs: [src/abilities/markGeometry.ts]
refs: [SUP-alejandro-20261123-121806]
---

## Decisión
El humano pidió TP mediante las teclas 1, 2, 3 y 4, correspondientes a los papeles y adicional a Q + mouse.
Regla reversible de numeración: los primeros cuatro lanzamientos ocupan 1, 2, 3, 4; cada papel conserva su número mientras existe. Al reemplazar la más antigua, el papel nuevo hereda esa tecla. Si una marca desaparece por muerte/retirada de enemigo, su número queda libre y el siguiente lanzamiento usa el menor número libre. No se renumeran otros papeles.
Los números activan directamente sin mantener Q; también funcionan con Q presionada. Mouse y números pasan por la misma recarga de 500 ms. Una pulsación produce un intento; sostener la tecla no repite TP automáticamente. Tecla vacía, papel en vuelo o destino imposible no gastan recarga.

## Alternativas consideradas
Renumerar cronológicamente todos los papeles al reemplazar/retirar uno. Exigir Q + número.

## Por qué
Evita cambiar la tecla de un destino que el jugador ya memorizó y permite una alternativa rápida al mouse. Los números visibles en los papeles coinciden con las teclas.

## Impacto si se rechaza
Se puede cambiar la asignación en MarkStore y la condición del callback numérico sin tocar movimiento ni combate. No hubo cambios en shared.

## Resolución
Pendiente validar regla de numeración estable y teclas directas sin Q. La existencia de los cuatro accesos numéricos fue solicitada explícitamente por el humano.
