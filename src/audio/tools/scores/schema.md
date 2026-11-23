# Song JSON format (rendered by an offline chiptune synth)

```json
{
  "bpm": 92,                 // tempo
  "swing": 0.15,             // 0..0.33, delays odd 16th steps (jazz/noir feel). 0 = straight
  "key": "D", "mode": "minor",   // mode: minor|harmonic|dorian|phrygian|major|mixolydian|blues
  "loop": true,              // false for one-shot jingles/stingers
  "lead": "pulse25",         // default lead: pulse25|pulse12|pulse50|triangle|saw|sine
  "bassOct": 2,              // bass octave (2 = D2 region)
  "fx": {"reverb":0.22, "delay":0.16, "delayFb":0.3, "lowpass":9000},
  "sections": [
    {
      "name": "A",
      "lead": "pulse25",            // optional per section
      "lead2": "pulse12",           // instrument for counter-melody m2
      "glide": false,               // portamento between close lead notes
      "acc": "padarp",              // accompaniment: arp8|arp16|pad|padarp|stab|none (auto-generated from chords)
      "harmOct": 4,                 // octave of accompaniment
      "bass": "walking",            // root8|rootfifth|walking|octave|pedal|line|none (auto from chords; "line" uses bar.b)
      "bassIns": "bass",            // bass (NES triangle) | bassSaw (darker, filtered saw)
      "drums": {                    // 16-char patterns, one per 16th step, repeated every bar of the section.
        "k": "x.......x.......",    // k kick, s snare, h closed hat, o open hat, b brush, r rimshot
        "s": "....x.......x...",    // chars: x hit, X accent, g ghost, . rest
        "h": "x.x.x.x.x.x.x.x."
      },
      "bars": [                     // ONE object per 4/4 bar (16 sixteenth-steps)
        {"c": "Dm7", "m": "D5:4 F5:2 A5:2 G5:4 F5:4", "m2": "r:8 A4:8", "b": "D2:4 A2:4 D3:4 C3:4"}
      ]
    }
  ],
  "order": ["A","A","B","A"]          // playback order of sections (the loop)
}
```

Rules:
- `c` chord symbols: root (C, C#, Db…) + quality: "", m, 7, m7, maj7, dim, dim7, m7b5, sus4, sus2, aug, 6, m6, add9, m9, 9, 5; optional slash bass "Dm/F".
- `m` melody tokens `NOTE:STEPS`, NOTE like `D5`, `Bb4`, `F#5`, or `r` for rest; STEPS = sixteenth notes; **tokens of a bar must sum to exactly 16**. Lead range C4–C6 (keep mostly in A4–A5 for comfort). Strong beats (steps 0 and 8) should land on chord tones.
- `m2` optional counter-melody (same rules), quieter; use sparingly.
- Write REAL music: a memorable 2-bar motif, repetition with variation, call & response, phrase endings that resolve, rests to breathe. Avoid random note soup and avoid constant 16th-note runs.
- Loops: the last bar must lead naturally back into the first (e.g., ends on V or a turnaround).
