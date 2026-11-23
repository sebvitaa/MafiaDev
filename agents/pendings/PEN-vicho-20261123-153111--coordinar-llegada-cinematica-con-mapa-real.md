---
id: PEN-vicho-20261123-153111
type: pending
owner: vicho         # quien debe resolverlo (dueño del dominio)
created_by: basti
agent: gpt
created: 2026-11-23T18:31:11.000Z
title: coordinar llegada cinematica con mapa real
priority: p1   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: open             # open | in_progress | blocked | done | wontfix
area: world
refs: [HIS-basti-20261123-153110, SUP-basti-20261123-153110, PEN-seba-20261123-153110]
closed_by:               # hash o HIS-ID al cerrar
---

## Contexto
P14 de La Nota debe revelar el mapa real desde el charco y entregar control a los 75 s, conservando posición, orientación, escala y luz. Trabajo de coordinación con seba; esta entrega no modifica GameScene ni world.

## Repro / evidencia
En origin/main, preloadWorld elige mapa y GameScene obtiene el inicio mediante datos de mundo/escenario. El spawn del stub lateral de la rama de combate no describe ese arranque cenital. Un video con final fijo no garantiza continuidad.

## Criterio de cierre
- [ ] Acordar con seba cómo preparar y revelar el escenario real durante los últimos cinco segundos.
- [ ] Usar posición/cámara/inicio existentes; no agregar un mapa o spawn impuesto por el guion.
- [ ] Evitar simulación dañina e input accidental antes de entregar control.
- [ ] Verificar los mapas disponibles y registrar prueba de continuidad con final natural y salto.

## Notas
Guion y criterios en agents/history/materiales/HIS-basti-20261123-153110/LA-NOTA-guion-tecnico.md. Propuesta reversible en SUP-basti-20261123-153110; no crea eventos compartidos.
