# SFX JSON (offline layered synthesizer)

Render with `node src/audio/tools/synth.mjs sfx sounds.json outdir/`. Format: `{"sfx":[{"name":"hit", "layers":[...]}]}`. Each sound mixes 1..4 layers.

Layer fields: `wave`, `t` start seconds, `dur`, `f0`/`f1` Hz, `curve:"lin"|"exp"`, `a` attack, `d` decay time scale, `s` sustain 0..1, `gain`, `pan` -1..1, `lp`, `lp1`, `hp`, `dist` 0..1, `crush` 2..64, `vib:{rate,depth}`, `arp:[[time,mult],...]`, and `rep` retrigger period. Existing waves remain `square|pulse|saw|triangle|sine|noise|metal`.

New procedural waves:

- `ks`: plucked delay-line string, tuned to `f0` and sliding toward `f1`; optional `decay` seconds. Use for wood, string, or creak.
- `modal`: damped sine modes. Supply `modes:[[ratio,gain,decaySec],...]` relative to `f0`, or `preset:"bell"|"metal"|"wood"|"glass"|"anvil"`.
- `fm`: sine 2-operator FM; `ratio` is modulator/carrier ratio and `index` is modulation depth (it decays with the layer envelope).
- `pink` and `brown`: colored noise. Without `q`, `f0`/`f1` retain their noise-rate role; with `q` (0.5..12), they sweep a resonant bandpass center.
- `thump`: body impact with fast pitch drop `f0`→`f1` plus brown-noise burst; optional `pitchDrop` controls drop speed.

Sound fields: `reverb` 0..0.6 selects the legacy reverb, `hall` 0..1 adds the stereo hall, `room` 0..1 adds short early reflections, and `peak` sets normalized peak (default 0.85).

Example containing each new layer type:

```json
{"sfx":[
  {"name":"punch", "layers":[{"wave":"thump", "f0":125, "f1":42, "dur":0.28, "gain":0.8, "a":0.001}, {"wave":"brown", "f0":90, "f1":45, "q":2, "dur":0.2, "gain":0.28}]},
  {"name":"parry", "layers":[{"wave":"modal", "preset":"anvil", "f0":880, "dur":1.1, "gain":0.55}, {"wave":"modal", "preset":"bell", "f0":1320, "dur":0.8, "gain":0.35}], "hall":0.3},
  {"name":"chest-creak", "layers":[{"wave":"ks", "f0":180, "f1":118, "curve":"exp", "decay":0.5, "dur":0.55, "gain":0.45, "lp":2600}], "room":0.4},
  {"name":"whoosh", "layers":[{"wave":"pink", "f0":700, "f1":6200, "q":1.3, "dur":0.65, "a":0.08, "gain":0.7}]},
  {"name":"magic-chime", "layers":[{"wave":"fm", "f0":1046.5, "ratio":3.5, "index":2.8, "dur":0.9, "gain":0.42}]}
]}
```

Preset `modal` examples can also use `{ "wave":"modal", "f0":440, "modes":[[1,1,1.2],[2.76,0.5,0.8]], "dur":1 }`. Frequent gameplay sounds should stay short and moderate in level; combine tonal and noise layers for impacts.
