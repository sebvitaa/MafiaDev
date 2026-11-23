---
id: SUP-seba-20261123-122958
type: supuesto
owner: seba         # quien tomó la decisión
validator: seba # dueño del dominio afectado | equipo
agent: claude
created: 2026-11-23T15:29:58.397Z
title: menu-hd-dom-y-musica-con-samples
impact: medio       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [src/ui/hd/HdLayer.ts, src/ui/Menu.ts, src/audio/tools/gm/render.mjs, public/assets/audio/review.html]
refs: []
---

## Decisión
Pedido de seba: «un poco más realista el menú (muy poco), no tan pixelado; la música menos indie, más profesional; una página simple para revisar cada sonido con un botón, fuera del juego».

1. **Menú**: el canvas es de 480×270 y se escala sin suavizado (nearest-neighbour), así que ningún texto dibujado en Phaser puede verse nítido.
   - Menús, opciones, pausa, confirmación y controles se pintan en una capa DOM sobre el canvas (`src/ui/hd/`).
   - Fuente Barlow Condensed (OFL). Paneles con degradado, borde rosa al 55 % y sombra suave.
   - Siguen en pixel art: fondos, logo, HUD, créditos, apertura y el cursor fedora.
2. **Música**: GPT-5 compone para una orquesta sampleada. El render es FluidSynth con Sonatina Symphonic Orchestra (CC Sampling Plus 1.0) para la orquesta y MuseScore_General (MIT) para lo demás, más reverb de convolución con una respuesta de sala sintética y mastering a −16 LUFS.
   - El título deja el saxo y pasa a noir orquestal: trompeta solista, corno inglés, piano, contrabajos en pizzicato y escobillas.
3. **Página de revisión**: `public/assets/audio/review.html`, estática. Funciona tanto abierta con doble clic como desde el servidor de desarrollo. El catálogo se genera con `src/audio/tools/build-catalog.mjs`.

## Alternativas consideradas
- Subir la resolución interna del juego: es un cambio `shared` que afecta a todos los dominios.
- MusicGen / Stable Audio: licencias no comerciales o restringidas, y descargas de varios GB.
- Seguir con el sintetizador propio: el director de audio IA lo valoró en 4–6/10.

## Por qué
La escucha de control (gpt-audio-mini) subió de 4–6/10 con el banco GM a 7–8,5/10 con samples reales. Todo queda dentro del dominio de seba.

## Impacto si se rechaza
- Menú: revertir `src/ui/hd/` y los cambios de `Menu.ts` y las escenas de menú. La API de `Menu` no cambió.
- Música: volver a los .ogg/.mp3 de la v2 (git).
