# Créditos y licencias de audio y UI (dominio seba)

| Asset | Origen | Licencia / condiciones |
|---|---|---|
| `music/*` (title, zone1, zone2, boss, gameover) | v2 «realista/orgánico»: partituras JSON de OpenAI GPT-5 (reglas y leitmotiv en `scores/composition-rules.md`) renderizadas con el sintetizador propio `src/audio/tools/synth.mjs` (modelado físico Karplus-Strong, modal y FM; contrabajo, piano, saxo, cuerdas, coro, arpa…) | Material propio del equipo. Salida de la API de OpenAI: según los términos de OpenAI, los derechos sobre la salida pertenecen al usuario |
| `sfx/*` (24 efectos, sting y fanfarria) | Parámetros diseñados con GPT-5 (`src/audio/tools/scores/sfx.json`, brief en `sfx-brief-v2.md`), sintetizados con `synth.mjs` y revisados con `gpt-audio-mini` (5 efectos rehechos tras la escucha) | Ídem |
| `amb/*` (ciudad con lluvia y viento; cueva de fantasía con goteo) | Generados por procedimiento con `synth.mjs amb` (`city-rain`, `fantasy-cave`) | Material propio |
| Apertura (sting del logo, golpe de flexión) | WebAudio en tiempo real (`src/audio/splashSting.ts`), 0 KB de archivos | Material propio |
| Marca de Codex en la apertura | Dibujada por código (`src/ui/logo.ts`) como homenaje a la herramienta usada | OpenAI y Codex son marcas de OpenAI |
| `vo/*` (narrador) | OpenAI `gpt-4o-mini-tts` (voz «onyx») con eco y ecualización en ffmpeg | **Voz generada por IA**: indicarlo a los jugadores (está en los créditos del juego) |
| `ui/title/*` (cielo, skyline, calle, logo) | OpenAI `gpt-image-1.5`, reducidos a 480×270 y a una paleta de 24 colores | Salida de la API de OpenAI |
| `ui/fonts/Silkscreen-Regular.ttf` | Jason Kottke, Google Fonts | SIL Open Font License 1.1 (`Silkscreen-OFL.txt`) |

Regenerar: `node src/audio/tools/synth.mjs song src/audio/tools/scores/music-title.json out.wav`, y después
`ffmpeg -i out.wav -c:a libopus -b:a 96k music-title.ogg` (SFX: `-ac 1 -b:a 64k`` y `ffmpeg -i out.wav -c:a libmp3lame -q:a 5 music-title.mp3`.
