---
id: SUP-basti-20261123-105329
type: supuesto
owner: basti         # quien tomó la decisión
validator: basti # dueño del dominio afectado | equipo
agent: gpt
created: 2026-11-23T13:53:29.357Z
title: Prototipo aceleracion y doble tap dash con estela
impact: bajo       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [src/player/room-prototype/RoomMotion.ts]
refs: [SUP-basti-20261123-103543]
---

## Decisión
Aplicar el 25 % de incremento solo al prototipo: velocidad base 150 y carrera 247,5 px/s. Aceleración 2400, frenada/giro 3000 px/s². Parámetros nuevos bajo roomPrototype en tuning.json, sin alterar player/combat.

Dash por doble pulsación WASD: soltar la misma tecla y pulsarla de nuevo en <=230 ms; descartar autorepetición y consumir el par aunque se rechace por cooldown. El eje seleccionado tiene prioridad sobre otras teclas mantenidas. C/K se conserva como alternativa y admite dirección diagonal. Dash de 150 ms, 540 px/s y recuperación posterior de 650 ms (800 ms entre inicios). No se acumulan cargas ni se ejecutan intentos rechazados después.

Estela con pool acotado, emisión cada 24 ms y vida de 160 ms, posiciones resueltas por Arcade y profundidad de pies. No se altera cámara, sala ni perspectiva. Se exponen state/dash.active/dirección/evento local para futuro arbitraje con combate; no se otorgan iFrames por defecto ni se implementa combate.

## Alternativas consideradas
- Cambiar Input o DashMotion compartido con el lateral: descartado; se encapsula lectura y configuración en el prototipo.
- Cooldown contado desde inicio: se conserva el criterio anterior de recuperación posterior; se explicita en instrucciones.
- Cambiar perspectiva, usar cámara de seguimiento o dejar inercia de dash tras los 150 ms: fuera del alcance.

## Por qué
El humano pidió estas mejoras dentro del prototipo. Los detalles no especificados de velocidad de dash, aceleración y ventana de tap son reversibles y se documentan para evaluación.

## Impacto si se rechaza
Modificar parámetros roomPrototype o retirar módulos locales. El juego lateral sigue consumiendo sus valores anteriores y las pruebas existentes permanecen verdes.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
