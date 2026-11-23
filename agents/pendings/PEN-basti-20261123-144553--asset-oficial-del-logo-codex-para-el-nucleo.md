---
id: PEN-basti-20261123-144553
type: pending
owner: basti         # quien debe resolverlo (dueño del dominio)
created_by: basti
agent: gpt
created: 2026-11-23T17:45:53.519Z
title: asset oficial del logo codex para el nucleo
priority: p2   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: open             # open | in_progress | blocked | done | wontfix
area: combat
refs: []
closed_by:               # hash o HIS-ID al cerrar
---

## Contexto
El usuario permite un marcador temporal si no existe un logo oficial local de Codex. Se implementó un núcleo circular con la etiqueta explícita CODEX / TEMP; no pretende reproducir el logo oficial.

## Repro / evidencia
```text
rg --files public/assets | Select-String 'codex|openai|logo'
Sin candidatos locales para el núcleo.
```

## Criterio de cierre
- [ ] Incorporar un asset oficial aprobado en una ruta del dominio basti y reemplazar el marcador en BodoqueFinale.

## Notas
No bloquea el prototipo jugable. No descargar assets ni modificar dominios ajenos para cerrar este pendiente sin acordar la fuente.
