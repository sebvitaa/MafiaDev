# Song JSON (offline procedural synthesizer)

Render with `node src/audio/tools/synth.mjs song score.json out.wav`. Output is stereo 44.1 kHz; loops wrap the effect tail unless `loop:false`.

```json
{
  "bpm": 72, "swing": 0.12, "key": "D", "mode": "minor", "loop": true,
  "lead": "sax", "bassOct": 1,
  "fx": {"reverb": 0.16, "hall": 0.24, "delay": 0.08, "lowpass": 9000},
  "sections": [{
    "name": "A", "lead": "sax", "lead2": "flute", "acc": "pad", "accIns": "piano",
    "harmOct": 4, "bass": "walking", "bassIns": "upright", "kit": "jazz",
    "drums": {"k":"X.......x.......", "s":"....g.......x...", "h":"x.x.x.x.x.x.x.x.", "r":"........x......."},
    "bars": [{"c":"Dm7", "m":"r:4 D5:4 F5:2 A5:2 C6:4", "m2":"r:12 A4:4"}]
  }],
  "order": ["A"]
}
```

- `sections[].bars` has one object per 4/4 bar (16 sixteenth steps by default). `c` is the chord; `m`, optional `m2`, and optional bass line `b` use `NOTE:STEPS` tokens (`D5:4 r:4`). Durations in each line should total 16. Chord qualities: `m`, `7`, `m7`, `maj7`, `dim`, `dim7`, `m7b5`, `sus4`, `sus2`, `aug`, `6`, `m6`, `add9`, `m9`, `9`, `5`; optional slash bass, e.g. `Dm/F`.
- Modes: `minor|harmonic|dorian|phrygian|major|mixolydian|blues`. `snap:false` disables scale/chord snapping. `glide:true` slides close lead notes. `bass`: `root8|rootfifth|walking|octave|pedal|line|none`; `line` reads `b`.
- `lead`, `lead2`, `bassIns`, and section `accIns` accept `pulse25|pulse12|pulse50|triangle|saw|sine|arp|pad|bass|bassSaw|upright|piano|epiano|sax|strings|choir|harp|celesta|flute|cello`. `acc`: `arp8|arp16|pad|padarp|stab|none`; `accIns` selects the generated chord voicing instrument.
- Section `kit`: `chip` (default; unchanged legacy drums), `jazz` (felt kick, brushes, ride on `h/o`, rim on `r`), or `orch` (timpani, orchestral snare, shaker, cymbal, frame drum, woodblock). Drum patterns are 16 chars repeated per bar: `x` hit, `X` accent, `g` ghost, `.` rest; keys `k s h o b r`.
- `fx.reverb` keeps the legacy reverb; optional `fx.hall` adds the wider comb/allpass hall at wet 0..1. `fx.delay`, `fx.delayFb`, and `fx.lowpass` retain their existing meanings. Old scores without these new instrument/kit/hall keys render through their existing paths.
- Ambient CLI also accepts `rain|wind|cave|city-rain|fantasy-cave`, e.g. `node src/audio/tools/synth.mjs amb city-rain out.wav 20`; legacy `zone1|zone2` output is unchanged.

Instrument examples:

```json
{"lead":"sax", "sections":[{"name":"A", "bass":"walking", "bassOct":1, "bassIns":"upright", "acc":"pad", "accIns":"piano", "bars":[{"c":"Dm7", "m":"D5:4 F5:4 A5:8"}]}]}
```

Kit and hall example:

```json
{"fx":{"hall":0.3}, "sections":[{"name":"A", "kit":"orch", "drums":{"k":"X.......x.......", "s":"....x.......x...", "h":"x.x.x.x.x.x.x.x."}, "bars":[{"c":"Cm", "m":"r:16"}]}]}
```
