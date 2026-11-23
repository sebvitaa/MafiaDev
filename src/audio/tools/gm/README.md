# Render híbrido GM + orquesta

Convierte un score JSON a MIDI y audio a 48 kHz. FluidSynth renderiza secamente cada banco por separado; ffmpeg suma los lotes alineados, aplica una reverberación de sala de conciertos por convolución, masteriza y normaliza a EBU R128 en dos pasadas. Requiere `/opt/homebrew/bin/fluidsynth`, `/opt/homebrew/bin/ffmpeg` y un SoundFont GM `.sf2`.

```sh
node src/audio/tools/gm/render.mjs src/audio/tools/gm/example.json /tmp/example.wav \
  --sf "/ruta/MuseScore_General.sf2" \
  --sso "/ruta/Sonatina_Symphonic_Orchestra.sf2" \
  --stems /tmp/example-stems --lufs -16

node src/audio/tools/gm/render.mjs --validate src/audio/tools/gm/example.json
```

`--sso` activa el ruteo automático desde programas GM a los presets orquestales de Sonatina: las cuerdas de ensemble y el brass de sección se dividen por registro y ocupan canales MIDI propios. Una pista puede forzar un preset con `"sso": 12`, o conservar el banco GM con `"sso": false`. Flauta, flauta piccolo y flauta alto se transponen una octava hacia abajo por la particularidad documentada del banco. Las pistas no asignadas siguen usando el GM.

FluidSynth se ejecuta sin reverb ni chorus. El script genera un impulso estéreo determinista de 2,4 s, con pre-delay de 18 ms, reflexiones tempranas y cola de ruido decorrelacionado cuyo nivel y brillo decaen en el tiempo. La mezcla húmeda inicial es 32 % para SSO, 22 % para GM y 15 % para batería. La propiedad raíz opcional `"space": 0..1` escala esos niveles. El mastering conserva el pasa altos y compresor, atenúa 1,5 dB a 300 Hz, agrega 1,5 dB de aire a 10 kHz y usa loudnorm en dos pasadas.

Para loops se renderizan dos vueltas completas y se recorta la segunda después de la reverberación y el mastering. El JSON de salida informa duración, LUFS, pico y salto de muestra entre el último y primer frame del loop. `--stems dir` escribe WAV por banco (`*-gm.wav`, `*-sso.wav`) antes del mastering final. Si `--mid` genera varios lotes, añade al nombre los sufijos de banco, grupo y lote; con un solo lote conserva el nombre indicado.

Codificar el WAV estéreo a Ogg Opus 96 kbit/s:

```sh
/opt/homebrew/bin/ffmpeg -i musica.wav -c:a libopus -b:a 96k -ac 2 musica.ogg
```

Codificar a MP3 calidad VBR q5:

```sh
/opt/homebrew/bin/ffmpeg -i musica.wav -c:a libmp3lame -q:a 5 musica.mp3
```

## SoundFonts y licencias

- **MuseScore_General**: MIT License.
- **Sonatina Symphonic Orchestra**, de Mattias Westlund: Creative Commons Sampling Plus 1.0. Consulta los archivos de licencia y atribución distribuidos con cada SoundFont antes de redistribuir audio o muestras.

## Dónde conseguir los bancos (no se versionan, ≈630 MB)

```sh
brew install fluid-synth
curl -LO https://ftp.osuosl.org/pub/musescore/soundfont/MuseScore_General/MuseScore_General.sf2
curl -LO https://ftp.osuosl.org/pub/musescore/soundfont/Sonatina_Symphonic_Orchestra_SF2.zip && unzip Sonatina_Symphonic_Orchestra_SF2.zip
```

Partituras de la v3: `src/audio/tools/scores/gm/` (formato en `schema.md`, reglas de composición en `rules.md`).
Codificar: `ffmpeg -i x.wav -c:a libopus -b:a 96k x.ogg` y `ffmpeg -i x.wav -c:a libmp3lame -q:a 4 x.mp3`.
Revisar el resultado: `public/assets/audio/review.html`.
