---
id: PEN-basti-20261123-134231
type: pending
owner: basti         # quien debe resolverlo (dueño del dominio)
created_by: alejandro
agent: gpt
created: 2026-11-23T16:42:31.006Z
title: revisar pruebas e2e movimiento y combate de la copia integrada
priority: p2   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: open             # open | in_progress | blocked | done | wontfix
area: movement
refs: [HIS-alejandro-20261123-134126]
closed_by:               # hash o HIS-ID al cerrar
---

## Contexto

La copia local combinó el mapa cenital de Vicho y el combate de Basti en f68ff2c. La suite completa del navegador encontró fallos en las pruebas de marcas TP, movimiento lateral y dos casos de combate del laboratorio. Las pruebas de cinemáticas, exploración y menús pasaron.

## Repro / evidencia
```text
playwright test --workers=2
28 casos: 18 pasaron; 10 fallaron.
abilities-game (1), abilities-marks (4), player-lateral-movement (3), player-room-prototype (2).
```

## Criterio de cierre
- [ ] Verificar las expectativas del jugador lateral y las marcas contra el jugador cenital de la integración.
- [ ] Repetir aisladamente los casos de doble toque de 300 ms y golpe cargado del laboratorio; corregir las discrepancias reproducibles.

## Notas

Durante la ejecución hubo actividad paralela en test-results. Conviene usar un directorio propio de resultados para conservar las trazas.
