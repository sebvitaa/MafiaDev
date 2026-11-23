---
id: PEN-seba-20261123-101157
type: pending
owner: seba         # quien debe resolverlo (dueño del dominio)
created_by: basti
agent: gpt
created: 2026-11-23T13:11:57.185Z
title: Indice de agentes omite registros con CRLF en Windows
priority: p1   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: open             # open | in_progress | blocked | done | wontfix
area: shared
refs: []
closed_by:               # hash o HIS-ID al cerrar
---

## Contexto
En Windows, el índice muestra cero P0 y cero supuestos del equipo aunque los archivos versionados contienen un P0 in_progress y cinco supuestos pendientes. Afecta la visibilidad de la coordinación; no bloquea el prototipo aislado de Basti.

## Repro / evidencia
```text
node scripts/agents.mjs status --owner basti -> P0 (0), supuestos equipo (0)
scripts/agents.mjs:103 usa /^---\n([\s\S]*?)\n---/
El archivo PEN-seba-20261123-084330 usa CRLF: el regex no reconoce el frontmatter.
La misma lectura normalizada en memoria de CRLF a LF reconoce priority=p0 y status=in_progress.
```

## Criterio de cierre
- [ ] El parser reconoce frontmatter LF y CRLF con idéntico resultado.
- [ ] Una prueba verifica que P0 y supuestos pendientes se muestran con ambos formatos.

## Notas
No se modifica scripts/agents.mjs por ser shared. La comprobación de normalización fue de solo lectura. No se han cambiado estados de supuestos existentes.
