---
id: HIS-vicho-20261123-131122
type: history
owner: vicho
agent: claude
created: 2026-11-23T16:11:24Z
title: biomas inmersivos mapa mazmorra secretos
status: pass
commit: 289f4a9
refs: [PEN-vicho-20261123-105123, PEN-vicho-20261123-105128, PEN-vicho-20261123-105129, PEN-vicho-20261123-105130, PEN-vicho-20261123-105131, PEN-vicho-20261123-105132, PEN-vicho-20261123-105136, PEN-vicho-20261123-114613, SUP-vicho-20261123-131052]
---

## Objetivo
Pedidos de vicho: mapa tipo mazmorra sin patrones repetidos; biomas en pixel art (bosque frondoso, volcán, zona muerta, bosque rojizo, cueva luminosa); áreas no pisables decoradas (estilo Minecraft Dungeons); personaje más pequeño; viñeta más suave; integrar main; seguir con tareas.

## Cambios
- Generador (Codex + ajustes míos): 15 salas de formas distintas, pasillos ortogonales, bosque carmesí, manchas de suelo con ruido suave; carteles, coleccionables, pared ilusoria con cofre oculto y atajo.
- `src/world/biomeTiles.ts`: 5 biomas por fila (suelos, muro top/cara, terreno exterior) + 16 decoraciones.
- `src/world/props.ts`: objetos grandes con variantes (árboles, pinos, arbustos, troncos, árboles secos, lápidas, columnas, basalto, chimeneas, cristales, hongos, estalagmitas).
- `src/world/surroundings.ts`: BFS desde lo pisable; capa 'outer' y objetos hasta 12 tiles fuera del camino.
- `src/exploration/`: pasajes (E), carteles, coleccionables, cofre oculto, viaje rápido (F), inicio por escenario (PEN seba).
- `src/world/areaTitle.ts`: título de área por bioma. Viñeta más suave. Personaje al 60 %. Llama de hoguera corregida.
- Integración de origin/main (2cfd7a0: menús/música de seba y docs/LORE.md).

## Comandos y resultados
```text
npm run build → ok · npm test → 76 passed
playwright (puerto 5183): exploration-secrets + world-zones → 2 passed
captura de 5 biomas: sin errores de consola; 48 fps (Chromium headless) con ~2000 objetos
```

## Observaciones
- Dos commits entraron con typecheck rojo en e2e (tail ocultó el exit code); corregidos en commits siguientes. Ahora se valida sin tail.
- docs/LORE.md (seba, SUP-seba-20261123-122921) propone checkpoints = teléfonos públicos y escenarios Muelle/Hipódromo/Torre; los biomas actuales no los siguen: decidir en equipo.
- Persistencia de cofres/atajos/coleccionables/hogueras: SUP-vicho-20261123-131052 (shared).

## Siguiente paso
Bloqueados por basti: V09 spawns, V11 arena del jefe, reaparición de enemigos. V14 logo de Codex (pospuesto). Medir FPS en navegador real.
