---
id: HIS-seba-20261123-084310
type: history
owner: seba
agent: claude
created: 2026-11-23T11:43:10.130Z
title: kit de agentes inicial
status: pass             # pass | fail | partial
commit:                  # hash del commit de código
refs: [PEN-seba-20261123-084330, SUP-seba-20261123-084245, SUP-seba-20261123-084246, SUP-seba-20261123-084247, SUP-seba-20261123-084248, SUP-seba-20261123-084249] # PEN-/SUP-/HIS- relacionados
---

## Objetivo
Crear kit de coordinación multi-agente (Claude + GPT) previo al scaffold: reglas, dominios por persona, memoria persistente (history/pendings/supuestos).

## Cambios
- `AGENTS.md`: fuente de verdad (dominios vicho/basti/alejandro/seba, contrato de eventos, reglas Phaser 4, protocolo §4).
- `CLAUDE.md`: `@AGENTS.md` + específicos de Claude Code.
- `agents/_templates/{history,pending,supuesto}.md`: plantillas con frontmatter.
- `scripts/agents.mjs`: `new` (IDs únicos, validación de owner/agent/priority/impact) y `status` (índice compacto por owner).
- 5 SUP de reparto de dominios (validator: equipo) y PEN-seba-20261123-084330 (setup H0).

## Comandos y resultados
```text
$ node scripts/agents.mjs new pending --owner nadie ...
error: --owner debe ser uno de: vicho|basti|alejandro|seba (recibido: nadie)   # exit 1, esperado
$ node scripts/agents.mjs bogus
<usage>   # exit 1, esperado
$ node scripts/agents.mjs status --owner basti
5 supuestos de equipo pendientes listados; resto vacío   # esperado
```

## Tests
| test | resultado | nota |
|---|---|---|
| validación de --owner | pass | rechaza valor fuera de lista |
| comando desconocido | pass | imprime uso, exit 1 |
| creación de 5 SUP en segundos consecutivos | pass | IDs únicos |
| status por owner | pass | SUP con validator=equipo aparecen a todos |

## Observaciones
- Sin git todavía; sin `commit:`.
- IDs usan hora local (UTC-3); `created` en ISO UTC.

## Siguiente paso
Equipo valida los 5 SUP; ejecutar PEN-seba-20261123-084330 en H0.
