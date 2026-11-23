---
id: HIS-basti-20261123-140137
type: history
owner: basti
agent: gpt
created: 2026-11-23T17:01:37.000Z
title: publicar enemigos basicos balanceados
status: pass
commit: 87e11ba61f53d070c43b933576c9f32f2e2b8a13
refs: [HIS-basti-20261123-133221, PEN-basti-20261123-122352, SUP-basti-20261123-133221]
---

## Objetivo
El humano autorizó expresamente: "Pushea los enemigos que hicimos al repostiorio". Publicar basti/basic-enemies mediante el flujo oficial, conservando el reparto de rutas del dominio Basti y los cambios de sus compañeros.

## Revisión previa
Árbol de trabajo limpio, commits 87e11ba (código) y 4ea3d50 (registros). origin/main continúa en 0c3cd69 al empezar. La rama incluye el combate/laboratorio de Basti 5cd9c45, necesario para sus interfaces de espada y la sala de prueba.
Diff completo revisado: solo rutas de Basti, tests y memoria. Sin shared ni código ajeno al módulo de combate. GitHub autenticado como Alejandr1no.

## Contenido de la entrega
Slime HP50/daño25, Cobrador ágil HP100/daño25 y knight resistente HP150/daño50; jugador 125HP y espada 25/30/40. IA con anticipación, recuperación, colisiones y muerte única. Daño real al jugador, 600ms de protección, interrupción de ataque/dash y registro de enemigos para las cuatro marcas de TP.
Modo de combate del laboratorio: /src/player/room-prototype/?enemies=1. Los enemigos todavía no se instalan en los mapas de Vicho. No se implementa jefe en esta entrega.

## Verificación confirmada antes de publicar
| comando | resultado | referencia |
|---|---|---|
| npm run build | pass | TypeScript strict + Vite, 61 módulos |
| npm test | pass | 94 tests, 16 archivos |
| npm run test:e2e con configuración local 8083 | pass | 28 tests completos, sin omisiones |
| git diff --check origin/main...HEAD | pass | Sin problemas de whitespace |

Resultados completos previos en HIS-basti-20261123-133221. scripts/ship.mjs repetirá build, unit y e2e antes del push; el CI los repite en GitHub.

## Publicación
Se ejecuta scripts/ship.mjs --owner basti --agent gpt --e2e, con título convencional y refs de esta entrada. La cuenta y el correo noreply de Alejandr1no se usan solo en el entorno del proceso para los commits.
El adaptador Windows vive fuera del repo: únicamente resuelve npm mediante node + npm-cli.js y añade la configuración local de Playwright (127.0.0.1:8083, un worker). No altera guardas ni omite pruebas; evita interferir con otra copia que ocupa 8080. El CI usa la configuración normal del repositorio.
La URL/estado de la PR y el resultado de CI se consultan después de que termine el flujo.

## Siguiente paso
Comprobar CI y fusión de la PR, y comunicar la URL al humano. PEN-basti-20261123-122352 sigue en progreso para adopción/integración en mapas/jefe, aunque los enemigos básicos y TP del laboratorio ya están conectados.
