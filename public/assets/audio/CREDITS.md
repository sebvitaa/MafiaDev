# Créditos y licencias de audio y UI (dominio seba)

| Asset | Origen | Licencia / condiciones |
|---|---|---|
| `music/*` (title, zone1, zone2, boss, gameover) | Partituras JSON compuestas con OpenAI GPT-5 y renderizadas con el sintetizador chiptune propio `src/audio/tools/synth.mjs` | Material propio del equipo. Salida de la API de OpenAI: según los términos de OpenAI, los derechos sobre la salida pertenecen al usuario |
| `sfx/*` (24 efectos, sting y fanfarria) | Parámetros diseñados con GPT-5 (`src/audio/tools/scores/sfx.json`) y sintetizados con `synth.mjs` | Ídem |
| `amb/*` (ciudad lluviosa, catacumbas) | Generados por procedimiento con `synth.mjs amb` | Material propio |
| `vo/*` (narrador) | OpenAI `gpt-4o-mini-tts` (voz «onyx») con eco y ecualización en ffmpeg | **Voz generada por IA**: indicarlo a los jugadores (está en los créditos del juego) |
| `ui/title/*` (cielo, skyline, calle, logo) | OpenAI `gpt-image-1.5`, reducidos a 480×270 y a una paleta de 24 colores | Salida de la API de OpenAI |
| `ui/fonts/Silkscreen-Regular.ttf` | Jason Kottke, Google Fonts | SIL Open Font License 1.1 (`Silkscreen-OFL.txt`) |

Regenerar: `node src/audio/tools/synth.mjs song src/audio/tools/scores/music-title.json out.wav`, y después
`ffmpeg -i out.wav -c:a libopus -b:a 64k music-title.ogg` y `ffmpeg -i out.wav -c:a libmp3lame -q:a 5 music-title.mp3`.
