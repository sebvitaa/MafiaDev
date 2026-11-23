---
id: HIS-alejandro-20261123-151751
type: history
owner: alejandro
agent: gpt
created: 2026-11-23T18:17:51.147Z
title: El Set Bodoque y desenlace de Tulio en el juego local
status: pass          # pass | fail | partial
commit:                  # hash del commit de código
refs: [SUP-alejandro-20261123-151247]                 # PEN-/SUP-/HIS- relacionados
---

## Objetivo

Levantar en Windows una copia local con el mundo de Vicho y el combate de Basti, las cinemáticas y la música del juego.

## Cambios

- Base local main 3c75dfa, que contiene el escenario publicado por Vicho. Integración de los cambios de combate del commit 316a433 de Basti, conservando los controles de ratón del mundo.
- El Set conecta BodoqueBoss y sus objetivos de daño con el RoomPlayer. Las embestidas usan las coordenadas de la arena del mapa cargado. El selector final equipa la espada. La derrota da paso a una única reproducción del cierre y después a créditos.
- Las tres poses de Bodoque proceden del arte editable de La Última Apuesta. El tercer vídeo dura 39 segundos, con derrota, tres cartelas, pausa a negro, narración de Tulio y FIN. Los ajustes de volumen y silencio afectan al vídeo.
- Servidor de uso local en 127.0.0.1:4198. Lanzador Jugar final.cmd junto al repositorio.

## Verificación

| Comprobación | Resultado |
|---|---|
| node node_modules/typescript/bin/tsc --noEmit | Pasa |
| node node_modules/vite/bin/vite.js build | Pasa |
| node node_modules/vitest/vitest.mjs run | 122 pruebas pasan |
| Suite e2e de las ramas más regresión de El Set | 40 casos distintos pasan entre la ejecución inicial y las repeticiones dirigidas. Tres pruebas del controlador lateral están deshabilitadas en la rama de Vicho. |
| FFmpeg, cine3.webm, decodificación completa | 936 cuadros VP9, audio Opus, 39 s |

Playwright se ejecutó con node node_modules/@playwright/test/cli.js test y una configuración local apuntando al servidor de 4198. El primer recorrido detectó tres pruebas del laboratorio que dirigían el ataque con la orientación antigua. Tras apuntar mediante el cursor, las pruebas de eco, marcas y daño a Bodoque pasaron. En la verificación del mapa se comprobó un golpe real con el ratón, se aplicó daño controlado para recorrer los umbrales, y se verificaron la música, la reproducción del desenlace y la llegada a los créditos.

## Alcance

La integración usa los ataques publicados por Basti. Los patrones propios de fase 2 y 3 descritos en el lore siguen como trabajo de diseño. El trabajo es local.
