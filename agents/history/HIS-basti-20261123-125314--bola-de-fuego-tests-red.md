---
id: HIS-basti-20261123-125314
type: history
owner: basti
agent: gpt
created: 2026-11-23T15:53:14.636Z
title: bola de fuego tests red
status: partial          # pass | fail | partial
commit:                  # hash del commit de código
refs: []                 # PEN-/SUP-/HIS- relacionados
---

## Objetivo
Definir reglas del proyectil, reloj de vuelo/cooldown, radio, daño y deduplicación por objetivo antes de implementarlo.

## Cambios
- `tests/unit/fireball-combat.test.ts`: agrega pruebas de impacto a 600 ms, cooldown 7 s, radio de blast y una aplicación de daño por ID.

## Comandos y resultados
```text
$ npm test -- tests/unit/fireball-combat.test.ts
FAIL esperado: el módulo FireballCombat no existe aún.
```

## Tests
| `npm test -- tests/unit/fireball-combat.test.ts` | fail esperado (RED) | No hay módulo de lógica todavía. |

## Observaciones
<!-- comportamiento observado en playtest, métricas, warnings -->

## Siguiente paso
Implementar FireballTimeline y FireballBlast puros, luego añadir la presentación Phaser y los eventos E/mouse.
