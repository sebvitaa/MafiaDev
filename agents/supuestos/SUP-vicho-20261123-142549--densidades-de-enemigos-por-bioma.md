---
id: SUP-vicho-20261123-142549
type: supuesto
owner: vicho         # quien tomó la decisión
validator: vicho # dueño del dominio afectado | equipo
agent: gpt
created: 2026-11-23T17:25:49.218Z
title: densidades de enemigos por bioma
impact: medio       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [src/world/encounterDensity.ts, src/world/tools/genWorld.mjs]            # rutas con marcador // SUP-<id>
refs: []
---

## Decisión

Usar tasas deterministas por tile caminable: ruins 1/90 (slime/cobrador), forest 1/155 (slime), redforest 1/52 (cobrador/knight), bright 1/950 (slime) y arena sin encuentros normales.

## Alternativas consideradas

Una tasa única para todos los biomas, o encuentros totalmente manuales por sala.

## Por qué

La progresión sube desde el bosque seguro hacia redforest, la zona bright conserva el papel de respiro y la arena queda libre para el jefe. La semilla hash hace que las tres variantes mantengan una distribución reproducible al espejarse.

## Impacto si se rechaza

Cambiar solo las tasas/pools y regenerar los tres JSON; no altera geometría ni contratos compartidos.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
