---
id: HIS-alejandro-20261123-152930
type: history
owner: alejandro
agent: gpt
created: 2026-11-23T18:29:30.415Z
title: Sello Codex y fractura del corazon de Bodoque
status: pass
commit:                  # hash del commit de código
refs: [HIS-alejandro-20261123-151751, SUP-alejandro-20261123-151247]
---

## Objetivo

Mostrar el logo adjunto de Alejandro en el corazón de Bodoque y romperlo con el último golpe.

## Cambios

El corazón se expone en los últimos 100 puntos de vida. A cero vuelve al pecho y se parte en cuatro pedazos que contienen el propio sello. La arena entrega el movimiento en el cuadro 14 de 48 al primer plano de cine3, con un golpe de cristal sincronizado. El laboratorio reproduce la secuencia completa por sí mismo. La hoja pequeña de Phaser procede del mismo original de 256 píxeles por cuadro usado en la cinemática.

## Verificación

- TypeScript y Vite compilan. Pasan las 122 pruebas unitarias.
- Playwright recorre la derrota en El Set hasta los créditos y comprueba en el laboratorio el emblema intacto, los fotogramas de rotura y la desaparición al terminar.
- FFmpeg decodifica las pistas de video y audio del desenlace completo. Coinciden las copias del juego y de lore. Se revisaron el primer plano, la ruptura, los fragmentos y la captura real del escenario.
- El archivo editable incluye el logo entregado, los dos atlas y las herramientas de renderizado.

## Alcance

Integración en la copia jugable local de Alejandro.
