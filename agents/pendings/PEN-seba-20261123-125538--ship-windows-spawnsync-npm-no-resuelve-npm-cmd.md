---
id: PEN-seba-20261123-125538
type: pending
owner: seba
created_by: alejandro
agent: gpt
created: 2026-11-23T15:55:38.000Z
title: ship Windows spawnSync npm no resuelve npm.cmd
priority: p2
status: open
area: shared
refs: [HIS-alejandro-20261123-125538]
closed_by:
---

## Contexto
scripts/ship.mjs usa child_process.spawnSync('npm', args) sin shell. En esta máquina Windows solo hay npm.cmd y npm-cli.js; aun con nodejs en PATH la invocación devuelve ENOENT. Git y gh.exe funcionan.

## Repro / evidencia
```js
require('node:child_process').spawnSync('npm', ['--version'], { encoding: 'utf8' }).error.code
// 'ENOENT', incluso con C:\Program Files\nodejs en PATH
```

## Criterio de cierre
- [ ] Acordar un cambio shared y hacer el despacho de npm compatible con Windows y Linux.
- [ ] Verificar ship --dry-run --e2e en Windows sin adaptador externo y conservar guardas.

## Notas
Workaround usado solo en el proceso de publicación: preload local que delega la invocación de npm a process.execPath + ruta del npm-cli.js oficial. El archivo scripts/ship.mjs no se modificó y conserva todas sus guardas y pasos.
