# SFX JSON format (offline sfxr-like layered synth)

Output: {"sfx":[ {name, layers:[...], reverb?, peak?}, ... ]}

Each sound = 1..4 layers mixed. Layer fields:
- wave: "square"|"pulse"(use duty)|"saw"|"triangle"|"sine"|"noise"(white, LFSR)|"metal"(periodic metallic noise)
- duty: 0.05..0.5 for pulse
- f0, f1: start/end frequency Hz (for noise: playback rate; 2000-20000 typical — higher = brighter)
- curve: "lin"|"exp" pitch slide from f0 to f1 over the layer duration
- t: start offset (s) inside the sound; dur: layer duration (s)
- a: attack (s); d: decay time scale (s) — envelope = exp decay with time constant d/4 after attack; s: sustain floor 0..1 (default 0)
- vib: {"rate":Hz,"depth":0..0.5}  (frequency modulation ratio)
- arp: [[time_s, freqMultiplier], ...] multiplies pitch from that time on (e.g. coin: [[0.06,1.5]])
- rep: seconds — restarts the pitch slide every rep seconds (for "laser"/"warble" retrigger effects)
- lp: lowpass Hz (default 18000); lp1: lowpass end Hz (sweeps lp→lp1 over the layer); hp: highpass Hz
- dist: 0..1 soft-clip drive; crush: 2..64 bit-crush steps (lower = crunchier)
- gain: 0..1 layer level; pan: -1..1
Sound-level: reverb: 0..0.6 wet mix (adds tail); peak: normalisation peak 0.3..0.95 (relative loudness of the asset; use it to balance: UI clicks ~0.5, hits ~0.85).

Guidelines: classic NES/sfxr vocabulary, punchy, short, no long silences. Frequent sounds (jump, swing, hit, ui-move) must be short (<0.25 s) and not fatiguing. Combine a tonal layer + a noise transient for impacts.
