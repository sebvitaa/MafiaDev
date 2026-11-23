# Créditos y licencias de audio y UI (dominio seba)

| Asset | Origen | Licencia / condiciones |
|---|---|---|
| `music/*` (title, zone1, zone2, boss, gameover), `sfx/sfx-title-sting`, `sfx/sfx-fanfare` | v3 «profesional»: partituras JSON de OpenAI GPT-5 (`src/audio/tools/scores/gm/`), renderizadas con `src/audio/tools/gm/render.mjs` (FluidSynth + reverb de convolución) usando **Sonatina Symphonic Orchestra** (Mattias Westlund, Creative Commons Sampling Plus 1.0) para la orquesta y **MuseScore_General.sf2** (S. Christian Collins; FluidR3 © Frank Wen; MIT) para lo demás | Música propia del equipo; los bancos de samples exigen atribución (en los créditos del juego). Los .sf2 no se versionan (≈630 MB): ver `src/audio/tools/gm/README.md` |
| `sfx/*` (24 efectos) | Parámetros diseñados con GPT-5 (`src/audio/tools/scores/sfx.json`, brief en `sfx-brief-v2.md`), sintetizados con `synth.mjs` y revisados con `gpt-audio-mini` (5 efectos rehechos tras la escucha) | Ídem |
| `amb/*` (ciudad con lluvia y viento; cueva de fantasía con goteo) | Generados por procedimiento con `synth.mjs amb` (`city-rain`, `fantasy-cave`) | Material propio |
| Apertura (sting del logo, golpe de flexión) | WebAudio en tiempo real (`src/audio/splashSting.ts`), 0 KB de archivos | Material propio |
| Marca de Codex en la apertura | Dibujada por código (`src/ui/logo.ts`) como homenaje a la herramienta usada | OpenAI y Codex son marcas de OpenAI |
| `vo/*` (narrador) | OpenAI `gpt-4o-mini-tts` (voz «onyx») con eco y ecualización en ffmpeg | **Voz generada por IA**: indicarlo a los jugadores (está en los créditos del juego) |
| Cinemática inicial «La Nota» | Montaje y animación por recortes del arte del juego. Voces sintéticas españolas de Windows (Helena, Laura y Pablo), jazz y ambiente del proyecto, efectos de sala sintetizados para el montaje | Las voces de la introducción son sintéticas. La música conserva los créditos de sus bancos de sonido indicados arriba. |
| `ui/title/*` (cielo, skyline, calle, logo) | OpenAI `gpt-image-1.5`, reducidos a 480×270 y a una paleta de 24 colores | Salida de la API de OpenAI |
| `ui/fonts/Silkscreen-Regular.ttf` | Jason Kottke, Google Fonts | SIL Open Font License 1.1 (`Silkscreen-OFL.txt`) |
| `ui/fonts/BarlowCondensed-*.ttf` (menús nítidos) | Jeremy Tribby, Google Fonts | SIL Open Font License 1.1 (`BarlowCondensed-OFL.txt`) |

Revisar todo el audio: abrir `public/assets/audio/review.html` (o http://localhost:8080/assets/audio/review.html); tras añadir archivos, `node src/audio/tools/build-catalog.mjs`.

Música v3: ver `src/audio/tools/gm/README.md`. Efectos y ambientes: `node src/audio/tools/synth.mjs song src/audio/tools/scores/music-title.json out.wav`, y después
`ffmpeg -i out.wav -c:a libopus -b:a 96k music-title.ogg` (SFX: `-ac 1 -b:a 64k`` y `ffmpeg -i out.wav -c:a libmp3lame -q:a 5 music-title.mp3`.
