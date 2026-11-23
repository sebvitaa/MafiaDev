---
id: HIS-basti-20261123-161911
type: history
owner: basti
agent: gpt
created: 2026-11-23T19:19:11.724Z
title: Rotulos de Canal 23 en la pelea final
status: pass
commit: b68e25d
refs: [SUP-basti-20261123-161421]
---

## Objetivo

Hacer legibles el 23 de los monitores y las últimas palabras de Bodoque. Identificar la transmisión en directo durante toda la pelea final, también en la versión integrada.

## Cambios

- `src/enemies/BodoqueFinale.ts` y `bodoque-broadcast.css` presentan el número en ambos monitores, el identificador fijo de la emisora y un subtítulo HD. Al reiniciar o cerrar la escena se retiran los elementos.
- `src/enemies/BodoqueBrain.ts` y `src/data/enemies.json` mantienen 5500 ms de lectura aunque un golpe lleve el corazón directamente a cero. Los 1600 ms normales de ruptura se amplían solo si queda más tiempo para la frase.
- Se actualizaron la documentación de integración, la prueba unitaria de combate y tres pruebas de navegador sobre la pelea y el reinicio.

## Comandos y resultados

```text
node scripts/agents.mjs status --owner basti
npm run build
npm test
npm run test:e2e -- --config ../LaNota-Produccion/playwright.rotulo.cjs
npm run test:e2e -- --config ../LaNota-Produccion/playwright.remate.cjs --grep "Bodoque se activa|Corazón Codex conserva"
git diff --check
```

## Tests

| Prueba | Resultado | Detalle |
|---|---|---|
| Producción | Pasa | TypeScript y Vite |
| Vitest | Pasa | 125 pruebas |
| Playwright | 46 casos activos verificados, 3 omitidos por la suite | 44 pasaron de inmediato, 1 de cinemática pasó al reintentar y 1 conservaba en memoria la espera anterior de 5 s. Se volvieron a ejecutar y pasaron ambos casos de remate con el código del commit. |
| Inspección de la pelea | Pasa | Captura a 1440×810 y verificación de los dos rótulos a 480×270 |

## Observaciones

El rótulo a resolución nativa mide 175×46 y queda entre y=181 e y=227, por encima de la barra del jefe. El identificador está a 9 px del borde derecho y a 8 px del borde superior. La captura de la pelea está en `../LaNota-Produccion/Bodoque-Canal-23.png`. Se descartó una primera ejecución de Playwright en el puerto predeterminado porque conectaba con otro servidor local.

## Siguiente paso

Publicar por el flujo de integración y comprobar el commit en main.
