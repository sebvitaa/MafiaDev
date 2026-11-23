---
id: SUP-seba-20261123-114613
type: supuesto
owner: seba         # quien tomó la decisión
validator: seba # dueño del dominio afectado | equipo
agent: claude
created: 2026-11-23T14:46:13.581Z
title: fases-2-6-decisiones-de-pantallas
impact: medio       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [src/ui/logo.ts, src/scenes/PreloadScene.ts, src/scenes/TitleScene.ts, src/ui/scenes/GameOverScene.ts]
refs: []
---

## Decisión
Conflictos y huecos de las encuestas de fases 2–6, resueltos así:
1. **Tagline** (2.27 sin respuesta): «BAJO LA CIUDAD, LA VERDAD», elegido entre 6 propuestas de GPT-5-mini.
2. **«Cualquier tecla salta» vs «X = flexión»**: X hace una flexión; cualquier otra tecla salta la apertura.
3. **Logo continuo vs «el logo cae con squash»**: el logo se desliza desde la apertura y al llegar al título hace squash + shake. Sin apertura (`?skipIntro`, volver al título), cae desde arriba.
4. **Música**: el título es noir jazz (4.4); las zonas son de fantasía (3.1 «sin tema mafia, fantasía pura»).
5. **Muerte**: solo «HAS MUERTO» en rojo, estilo Elden Ring, sin subtítulo de humor.
6. **Marca de Codex/OpenAI** dibujada por código como homenaje (2.x pide «solo el logo de OpenAI con fondo negro»). Los créditos aclaran que son marcas de OpenAI.
7. **Sting de la apertura**: el navegador bloquea el audio hasta la primera interacción. Suena solo si el audio ya estaba desbloqueado o si se pulsa una tecla durante el logo. En el Lab suena siempre.
8. **Ambiente/UI**: sus sliders quedan fuera de Opciones (solo general, música y efectos). Siguen en el Lab.
9. **Créditos sin capturas** del juego (solo texto y easter egg de flexiones).

## Alternativas consideradas
- Logo de OpenAI como imagen: descartado por la regla de 0 KB de assets en la apertura.
- Submenú de escenarios: rompía el smoke compartido (ESPACIO en el título debe empezar).

## Por qué
Respetar la regla de 0 KB, la duración de ~2.5–4 s y el smoke compartido, con la intención de la encuesta intacta.

## Impacto si se rechaza
Cada punto es local a un archivo de seba: tagline en `src/ui/logo.ts`; X/skip, marca y sting en `PreloadScene.ts`; muerte en `GameOverScene.ts`.

## Resolución
