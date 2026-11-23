---
id: SUP-seba-20261123-122921
type: supuesto
owner: seba         # quien tomó la decisión
validator: equipo # dueño del dominio afectado | equipo
agent: claude
created: 2026-11-23T15:29:21.762Z
title: lore-bodoque-reverso-y-cinematicas
impact: medio       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [docs/LORE.md]
refs: []
---

## Decisión
`docs/LORE.md` define el lore completo, con decisiones que seba no especificó:
- Mundo: la ciudad noir del título se llama **Aguacero**. La «tierra extraña» es **El Reverso**, la ciudad bajo los charcos, dominada por **La Banca**, la casa que cobra en segundos y almas.
- Protagonista: **Ríos**, de aspecto neutro. Las clases Luchador y Mago son dos pasados posibles.
- Enemigos: `slime` son los Charcos, `knight` los Cobradores y `miniboss` es El Favorito, el caballo por el que Bodoque perdió todo.
- Ítems y cofres ocultos: las credenciales de los 6 enviados anteriores van como coleccionables de lore.
- Escenarios 1/2/3: Los Bajos del Muelle, El Hipódromo Hundido, La Torre y El Set.
- Jefe final: Juan Carlos Bodoque, con 3 fases propuestas («La Nota», «La Apuesta», «Sin Señal»).
- 2 cinemáticas de 10 s con guion, prompts para video IA y un plan B en cómic animado. Las voces son TTS genéricas, sin clonar al actor original.
- El archivo está en `docs/`, que no tiene dueño en el mapa de `ship.mjs` y por tanto es `shared`: publicarlo exige `--shared`.

## Alternativas consideradas
- Que La Banca fuera una «estática televisiva»: encajaba con el noticiero, pero no con el hipódromo ni con el loot como apuesta.
- Dejar el lore en `src/ui/`, dominio de seba: abarca los 4 dominios, así que `docs/` es más honesto.

## Por qué
Petición de seba: «al inicio juan carlos le de al protagonista una misión para ir a una tierra extraña dominada por algo… al final… viene él en persona, y esa sea la pelea final». Todo lo demás se dedujo de lo que ya existe en el repo: título noir con lluvia, saxo, clases, ítems, enemigos y STAGES.

## Impacto si se rechaza
Ninguno en el código: es solo documentación. Las propuestas a otros dominios (sección 11) no obligan a nada hasta que cada dueño las acepte.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
