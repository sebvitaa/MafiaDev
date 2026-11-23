---
id: HIS-seba-20261123-122942
type: history
owner: seba
agent: claude
created: 2026-11-23T15:29:42.327Z
title: lore-y-cinematicas
status: pass
commit: 4ff0342
refs: [SUP-seba-20261123-122921, HIS-seba-20261123-121801]
---

## Objetivo
Escribir el lore del juego para que conecte todo lo ya hecho: Bodoque como mentor que traiciona y jefe final, y 2 cinemáticas de 10 s (inicio y final) descritas para video IA y, como plan B, para cómic animado.

## Cambios
- `docs/LORE.md` (nuevo, `shared` según `ship.mjs`): cosmología (Aguacero, El Reverso, La Banca), personajes (Ríos, Bodoque, los 6 enviados), enemigos (Charcos, Cobradores, El Favorito), ítems, los 3 escenarios, el jefe en 3 fases, guion de las 2 cinemáticas con timeline, prompts de imagen y video, maquetación de cómic con viñetas y textos, epílogo e integración por dominio.
- `agents/supuestos/SUP-seba-20261123-122921`: decisiones de lore para que el equipo las valide.

## Comandos y resultados
```text
Sin cambios de código: no se ejecutaron build ni tests (último verde en HIS-seba-20261123-121801).
```

## Tests
| test | resultado | nota |
|---|---|---|
| — | n/a | solo documentación |

## Observaciones
- Fuentes del repo usadas: arte y música del título, `classes`, `abilities`, `items`, `loot`, `enemies.json`, `STAGES`, `TUTORIAL_STEPS` y el prototipo de basti (espada flotante y DashTrail).
- Los prompts describen a Bodoque sin nombrarlo, porque los generadores suelen rechazar personajes con derechos (31 minutos, Aplaplac). Voces TTS genéricas, sin clonar al actor.

## Siguiente paso
Que el equipo valide el SUP. Después, seba genera las hojas de referencia con gpt-image y prueba la cinemática 1 en video. Si falla, pasa al cómic e implementa `CinematicScene`.
