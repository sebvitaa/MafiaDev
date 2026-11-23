---
id: HIS-alejandro-20261123-134126
type: history
owner: alejandro
agent: gpt
created: 2026-11-23T16:41:26.308Z
title: cinematicas La Nota y La Ultima Apuesta verificadas
status: partial
commit: 14dc9b5
refs: [SUP-alejandro-20261123-133427, PEN-basti-20261123-134231]
---

## Objetivo

Entregar ambos videos de docs/LORE.md e integrarlos localmente por encargo de Alejandro.

## Cambios
- Dos WebM VP9/Opus en public/assets/ui/cinematics, con 300 fotogramas y audio estéreo cada uno. Los originales se entregan también en la carpeta lore del proyecto de trabajo.
- CinematicScene, TitleScene y la entrada de UI conectan INICIO, FINAL y room:entered con el juego, con salida natural, salto y recuperación de la partida.
- El sprite de Ríos conserva el tamaño lateral de 12 × 24 y también se usa en el mapa cenital. La selección con el ratón usa el estado interactivo del menú.

## Comandos y resultados
```text
$ npm run build
tsc y Vite: correcto.
$ npm test
97 pruebas aprobadas.
$ playwright test --workers=2
18 aprobadas, 10 fallidas en la integración local de mundo y combate.
$ playwright test cinematicas-lore.spec.ts --workers=1
3 aprobadas en la verificación final, con directorio de resultados aislado.
```

## Tests
| Prueba | Resultado | Evidencia |
|---|---|---|
| WebM | Correcto | Se decodificaron las dos pistas y se contrastaron por HTTP los archivos compilados con los originales |
| Cinemáticas | 3/3 | Selección con ratón, ESC, ENTER, final natural y reanudación de El Set |
| Compilación servida en 4187 | Correcto | Chromium reprodujo La Nota hasta el final, regresó al mapa y abrió el menú de pausa |
| Suite conjunta de navegador | Parcial | PEN-basti-20261123-134231 |

## Observaciones
La rama de integración incorpora la arena del minijefe. El Set y el combate final de Bodoque todavía no están implementados. El selector FINAL y la prueba del evento de sala permiten probar el desenlace.

## Siguiente paso

Al incorporar El Set, emitir room:entered con roomId set en su entrada y verificar la transición junto al combate final.
