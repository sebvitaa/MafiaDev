---
id: PEN-basti-20261123-153111
type: pending
owner: basti         # quien debe resolverlo (dueño del dominio)
created_by: basti
agent: gpt
created: 2026-11-23T18:31:11.071Z
title: publicar guion La Nota cuando gh este disponible
priority: p2   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: done
area: shared
refs: [HIS-basti-20261123-153110]
closed_by: a1906a6
---

## Contexto
La entrega está aislada en la rama basti/la-nota-guion, worktree C:/Users/bgonc/Documents/ChatGPT/11/MafiaDev-la-nota. No publicar la rama original de combate como parte de este encargo.

## Repro / evidencia
Se intentó npm run ship (también --dry-run). Ambos abortan antes de staging/push con: gh: spawnSync gh ENOENT. GitHub CLI no está disponible en PATH. No se creó PR ni se ejecutó push; no hubo rechazo de aprobación.

## Criterio de cierre
- [x] Disponer de gh autenticado en PATH.
- [x] Ejecutar el flujo ship de AGENTS.md desde basti/la-nota-guion, confirmar guardas, build y tests, y registrar la URL del PR.

## Notas
Comando exacto de reintento en HIS-basti-20261123-153110. No eludir ship ni publicar archivos del trabajo de combate. No cambiar ajustes del repositorio.

## Publicación
El flujo ship pasó las guardas de dominio/secretos, build y 109 pruebas unitarias. La rama se subió y se creó https://github.com/sebvitaa/MafiaDev/pull/14 con auto-merge. Localmente pasaron las pruebas de navegador de la nueva cinemática. El estado final de CI y merge queda en el PR.
