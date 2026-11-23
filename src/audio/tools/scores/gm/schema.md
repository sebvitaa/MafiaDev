# GM score format (MafiaDev v3 — rendered with FluidSynth + MuseScore_General.sf2)

One JSON object per piece. Rendered to a standard MIDI file, then to audio with sampled instruments
(General MIDI bank), then mastered. Think like an orchestrator/arranger for a professional game score.

```jsonc
{
  "name": "music-title",
  "bpm": 84,
  "beatsPerBar": 4,
  "bars": 16,                 // total length = bars * beatsPerBar beats
  "loop": true,               // true = must loop seamlessly (last bar leads back into bar 1)
  "swing": 0,                 // 0..0.33, delays off-beat 8ths (jazz ≈ 0.2)
  "tracks": [
    {
      "name": "strings",
      "program": 48,           // GM program 0-127 (ignored when drums=true)
      "drums": false,          // true → MIDI channel 10, notes are GM drum keys
      "kit": 0,                // drums only: 0 standard, 8 room, 16 power, 32 jazz, 40 brush, 48 orchestra
      "volume": 100,           // CC7 0-127
      "pan": 0,                // -64..63
      "reverb": 60,            // CC91 0-127
      "chorus": 0,             // CC93 0-127
      "humanize": { "timeMs": 6, "vel": 5 },   // optional random jitter (deterministic seed)
      "notes": [ [0, 4, "D3", 72], [0, 4, "A3", 68] ],   // [startBeat, durationBeats, pitch, velocity 1-127]
                                                         // pitch: "C#4"/"Eb3" (C4 = 60) or MIDI number
      "patterns": [            // optional: compact repetition
        { "notes": [[0, 0.5, 42, 50], [0.5, 0.5, 42, 38]], "start": 0, "everyBeats": 1, "times": 64 }
      ],
      "cc": [ [0, 11, 40], [8, 11, 110] ]   // [beat, controller, value]; CC11 expression is interpolated
                                             // linearly between consecutive CC11 points (swells/fades)
    }
  ]
}
```

Rules:
- Max 12 melodic tracks + 1 drum track. Velocities carry dynamics: use them (pp 30–45, mf 70–85, ff 100–120).
- Use CC11 for swells on sustained strings/brass/choir. Use sustain-like long notes for pads.
- Loops: the final bar must resolve back into bar 1 (same harmony/energy), no hard ending, no fade.
- Non-loop pieces (stings, jingles): end with a clear cadence; leave 1 bar of ringing time at the end.
- Useful GM programs: 0 Grand Piano, 4 E.Piano, 11 Vibraphone, 19 Church Organ, 24 Nylon Gtr, 32 Acoustic Bass,
  33 Fingered Bass, 40 Violin, 41 Viola, 42 Cello, 43 Contrabass, 44 Tremolo Strings, 45 Pizzicato Strings,
  46 Harp, 47 Timpani, 48 String Ensemble 1, 49 String Ensemble 2 (slow), 50 Synth Strings, 52 Choir Aahs,
  53 Voice Oohs, 56 Trumpet, 57 Trombone, 58 Tuba, 59 Muted Trumpet, 60 French Horn, 61 Brass Section,
  65 Alto Sax, 66 Tenor Sax, 68 Oboe, 70 Bassoon, 71 Clarinet, 73 Flute, 89 Pad Warm, 92 Pad Bowed,
  95 Pad Sweep, 98 Crystal, 112 Tinkle Bell, 116 Taiko Drum, 117 Melodic Tom.
- GM drum keys: 35/36 kick, 38 snare, 40 snare 2, 37 side stick, 42 closed hat, 44 pedal hat, 46 open hat,
  49 crash, 51 ride, 53 ride bell, 52 china, 55 splash, 41/43/45/47/48/50 toms, 39 clap, 54 tambourine,
  59 ride 2, 57 crash 2. With kit 40 (brush), 38 = brush swirl/tap feel. With kit 48 (orchestra): 35/36
  = concert bass drum, 38 = concert snare, 49/57 = concert cymbals, 41–50 = timpani-like toms.
