import Phaser from 'phaser';
import {
  AMBIENT_KEYS, AudioDirector, installAudio, MUSIC_EAGER, MUSIC_LAZY, settings, SFX_KEYS, VOICE_KEYS,
} from '../../audio';
import type { MusicKey, SfxKey, VoiceKey } from '../../types/assets';
import type { Rarity } from '../../types/items';
import { bus } from '../../core/EventBus';
import { SFX_VARIANTS } from '../../audio/mixing';
import { LabScene } from './LabScene';

const PANEL_ID = 'mafiadev-lab-panel';
const FLOAT_ID = 'mafiadev-lab-return';
const CHANNELS = ['master', 'music', 'sfx', 'ambient', 'ui'] as const;
let recentSounds: string[] = [];
let installedGame: Phaser.Game | null = null;
let installedAudioMapping = false;
let slowMotion = false;
const loadingMusic = new Set<MusicKey>();

export function getLabRecentSounds(): string[] {
  return [...recentSounds];
}

const styles = `
body.mafiadev-lab #app{width:calc(100vw - min(340px,100vw))}
#${PANEL_ID}{position:fixed;z-index:10000;top:0;right:0;width:min(340px,100vw);height:100vh;box-sizing:border-box;overflow:auto;padding:12px;background:#13111c;color:#ebe7f4;font:11px Silkscreen,monospace;border-left:1px solid #3a3352;scrollbar-color:#3a3352 #13111c}
#${PANEL_ID} *{box-sizing:border-box}#${PANEL_ID} h1{font:16px Silkscreen,monospace;color:#ff5fa2;margin:0 0 4px}#${PANEL_ID} p{margin:5px 0;color:#8a83a3;line-height:1.5}
#${PANEL_ID} details{background:#221d33;border:1px solid #3a3352;margin:8px 0;padding:7px}#${PANEL_ID} summary{cursor:pointer;color:#45d6c4;font-size:12px;padding:2px 0 6px}
#${PANEL_ID} button,#${PANEL_ID} select,#${PANEL_ID} input[type=number]{background:#3a3352;color:#ebe7f4;border:1px solid #655a81;border-radius:2px;font:11px Silkscreen,monospace;padding:5px;cursor:pointer}
#${PANEL_ID} button:hover:not(:disabled){border-color:#ff5fa2;color:#ff5fa2}#${PANEL_ID} button:disabled{opacity:.38;cursor:not-allowed}#${PANEL_ID} input[type=range]{accent-color:#ff5fa2;width:145px}#${PANEL_ID} input[type=checkbox]{accent-color:#ff5fa2;vertical-align:middle}
#${PANEL_ID} .lab-row{display:flex;align-items:center;justify-content:space-between;gap:5px;padding:3px 0;border-bottom:1px solid #3a335255}#${PANEL_ID} .lab-row:last-child{border:0}#${PANEL_ID} .lab-row>span{overflow-wrap:anywhere}#${PANEL_ID} .lab-actions{display:flex;gap:4px;flex-shrink:0}#${PANEL_ID} .lab-actions button{padding:4px}
#${PANEL_ID} .lab-mix label{display:flex;align-items:center;justify-content:space-between;gap:5px;padding:4px 0}#${PANEL_ID} .lab-mix output{width:32px;text-align:right;color:#45d6c4}
#${PANEL_ID} .lab-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px}#${PANEL_ID} .lab-grid button{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#${PANEL_ID} .lab-now{color:#45d6c4;overflow-wrap:anywhere}#${PANEL_ID} .lab-progress{height:4px;background:#3a3352;margin:5px 0 9px}#${PANEL_ID} .lab-progress>i{display:block;height:100%;width:0;background:#ff5fa2}
#${PANEL_ID} .lab-banner{padding:7px;background:#ffb347;color:#13111c;margin:8px 0}#${PANEL_ID} .lab-events-note{color:#8a83a3;font-size:10px}#${FLOAT_ID}{position:fixed;z-index:10001;left:10px;top:10px;background:#221d33;color:#45d6c4;border:1px solid #ff5fa2;padding:7px 10px;font:12px Silkscreen,monospace;cursor:pointer}
`;

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, textContent?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (textContent !== undefined) node.textContent = textContent;
  return node;
}

function recordSound(label: string): void {
  recentSounds = [label, ...recentSounds].slice(0, 6);
}

function formatTime(seconds: number): string {
  const value = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

function section(title: string, open = false): HTMLDetailsElement {
  const details = element('details');
  details.open = open;
  const summary = element('summary', undefined, title);
  details.append(summary);
  return details;
}

function button(label: string, onClick: () => void, title?: string): HTMLButtonElement {
  const result = element('button', undefined, label);
  result.type = 'button';
  if (title) result.title = title;
  result.addEventListener('click', onClick);
  return result;
}

function setUnavailable(buttons: HTMLButtonElement[], missing: boolean): void {
  for (const b of buttons) {
    b.disabled = missing;
    if (missing) b.title = 'sin cargar';
    else if (b.title === 'sin cargar') b.removeAttribute('title');
  }
}

function sceneKey(scene: Phaser.Scene): string {
  return scene.sys.settings.key;
}

function stopOtherScenes(game: Phaser.Game, except?: string): void {
  for (const scene of game.scene.getScenes(false)) {
    const key = sceneKey(scene);
    if (key !== except && (game.scene.isActive(key) || game.scene.isPaused(key))) game.scene.stop(key);
  }
}

export function goScene(game: Phaser.Game, key: string, data: object = {}): void {
  const overlay = key === 'CreditsScene' || key === 'OptionsScene' || key === 'GameOverScene';
  if (overlay) {
    if (!game.scene.keys.LabScene) game.scene.add('LabScene', LabScene, false);
    stopOtherScenes(game, 'LabScene');
    if (game.scene.isPaused('LabScene')) game.scene.resume('LabScene');
    else if (!game.scene.isActive('LabScene')) game.scene.start('LabScene');
    const lab = game.scene.getScene('LabScene');
    lab.scene.launch(key, { ...data, from: 'LabScene' });
    lab.scene.pause();
    return;
  }
  stopOtherScenes(game);
  game.scene.start(key, data);
}

function playMusic(game: Phaser.Game, key: MusicKey, fadeMs: number, playButton: HTMLButtonElement, status: HTMLElement): void {
  if (game.cache.audio.exists(key)) {
    AudioDirector.playMusic(key, fadeMs);
    recordSound(key);
    return;
  }
  if (!MUSIC_LAZY.includes(key) || loadingMusic.has(key)) return;
  const scene = game.scene.getScene('LabScene');
  loadingMusic.add(key);
  const play = () => {
    loadingMusic.delete(key);
    if (!game.cache.audio.exists(key)) {
      status.textContent = `${key}: sin cargar`;
      setUnavailable([playButton], true);
      return;
    }
    AudioDirector.playMusic(key, fadeMs);
    recordSound(key);
  };
  scene.load.audio(key, [`assets/audio/music/${key}.ogg`, `assets/audio/music/${key}.mp3`]);
  scene.load.once(Phaser.Loader.Events.COMPLETE, play);
  scene.load.start();
  status.textContent = `${key}: cargando…`;
}

interface EventAction { label: string; run: () => void; sound?: string }

function eventActions(): EventAction[] {
  return [
    { label: 'player:jump', run: () => bus.emit('player:jump', { air: false }), sound: 'sfx-jump' },
    { label: 'player:land', run: () => bus.emit('player:land', { vy: 320 }), sound: 'sfx-land' },
    { label: 'player:dash', run: () => bus.emit('player:dash', {}), sound: 'sfx-dash' },
    { label: 'player:attack', run: () => bus.emit('player:attack', { combo: 1 }), sound: 'sfx-swing' },
    { label: 'player:parry', run: () => bus.emit('player:parry', { success: true }), sound: 'sfx-parry' },
    { label: 'player:hit', run: () => bus.emit('player:hit', { dmg: 1, hp: 3, maxHp: 5 }), sound: 'sfx-hurt' },
    { label: 'player:died', run: () => bus.emit('player:died', {}), sound: 'sfx-death' },
    { label: 'player:respawned', run: () => bus.emit('player:respawned', {}) },
    { label: 'enemy:hit', run: () => bus.emit('enemy:hit', { id: 'lab-enemy', dmg: 1, x: 240, y: 130 }), sound: 'sfx-hit' },
    { label: 'enemy:killed', run: () => bus.emit('enemy:killed', { id: 'lab-boss', kind: 'boss', x: 240, y: 130 }), sound: 'sfx-enemy-death' },
    { label: 'boss:phase', run: () => bus.emit('boss:phase', { phase: 1 }), sound: 'sfx-boss-roar' },
    { label: 'ability:used', run: () => bus.emit('ability:used', { id: 'timestop' }), sound: 'sfx-timestop' },
    { label: 'ability:ready', run: () => bus.emit('ability:ready', { id: 'timestop' }), sound: 'sfx-ability-ready' },
    { label: 'ability:ended', run: () => bus.emit('ability:ended', { id: 'timestop' }) },
    { label: 'item:picked', run: () => bus.emit('item:picked', { itemId: 'lab-potion', rarity: 'common' }), sound: 'sfx-pickup' },
    { label: 'chest:opened', run: () => bus.emit('chest:opened', { id: 'lab-chest', hidden: false }), sound: 'sfx-chest' },
    { label: 'checkpoint:reached', run: () => bus.emit('checkpoint:reached', { id: 'lab-checkpoint' }), sound: 'sfx-checkpoint' },
    { label: 'room:entered', run: () => bus.emit('room:entered', { roomId: 'lab-room', zone: 'zone1' }) },
    { label: 'zone:changed', run: () => bus.emit('zone:changed', { zone: 'zone1' }) },
    { label: 'game:paused', run: () => bus.emit('game:paused', {}) },
    { label: 'game:resumed', run: () => bus.emit('game:resumed', {}) },
  ];
}

function appendEvents(container: HTMLElement, game: Phaser.Game): void {
  const mappingButton = button('Activar mapeo de eventos', () => {
    if (installedAudioMapping) return;
    const lab = game.scene.getScene('LabScene');
    installAudio(lab);
    installedAudioMapping = true;
    mappingButton.textContent = 'Mapeo de eventos activo';
    mappingButton.disabled = true;
    lab.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      installedAudioMapping = false;
      mappingButton.textContent = 'Activar mapeo de eventos';
      mappingButton.disabled = false;
    });
  });
  container.append(mappingButton);
  const note = element('p', 'lab-events-note', 'El mapeo inicia música de zona, como en el juego.');
  container.append(note);

  const fire = (label: string, run: () => void, sound?: string) => {
    run();
    recordSound(sound && installedAudioMapping ? `${sound} · ${label}` : label);
  };
  for (const action of eventActions()) {
    const b = button(action.label, () => fire(action.label, action.run, action.sound));
    b.className = 'lab-event-button';
    container.append(b);
  }

  const presets: EventAction[] = [
    ...([1, 2, 3] as const).map((combo) => ({ label: `Ataque · combo ${combo}`, run: () => bus.emit('player:attack', { combo }), sound: `sfx-swing-${combo}` })),
    { label: 'Parry · correcto', run: () => bus.emit('player:parry', { success: true }), sound: 'sfx-parry' },
    { label: 'Parry · fallo', run: () => bus.emit('player:parry', { success: false }), sound: 'sfx-swing-1' },
    { label: 'Golpe · HP 1 (latido)', run: () => bus.emit('player:hit', { dmg: 1, hp: 1, maxHp: 5 }), sound: 'sfx-low-hp' },
    { label: 'Golpe · HP 3', run: () => bus.emit('player:hit', { dmg: 1, hp: 3, maxHp: 5 }), sound: 'sfx-hurt' },
    ...(['common', 'rare', 'epic', 'legendary'] as const satisfies readonly Rarity[]).map((rarity) => ({ label: `Objeto · ${rarity}`, run: () => bus.emit('item:picked', { itemId: `lab-${rarity}`, rarity }), sound: 'sfx-pickup' })),
    { label: 'Cofre · normal', run: () => bus.emit('chest:opened', { id: 'lab-chest', hidden: false }), sound: 'sfx-chest' },
    { label: 'Cofre · oculto', run: () => bus.emit('chest:opened', { id: 'lab-hidden', hidden: true }), sound: 'sfx-chest' },
    { label: 'Jefe · fase 1', run: () => bus.emit('boss:phase', { phase: 1 }), sound: 'sfx-boss-roar' },
    { label: 'Habilidad · parar tiempo', run: () => bus.emit('ability:used', { id: 'timestop' }), sound: 'sfx-timestop' },
    { label: 'Habilidad · terminó', run: () => bus.emit('ability:ended', { id: 'timestop' }) },
    { label: 'Zona · 1', run: () => bus.emit('zone:changed', { zone: 'zone1' }) },
    { label: 'Zona · 2', run: () => bus.emit('zone:changed', { zone: 'zone2' }) },
    { label: 'Muerte + respawn', run: () => { bus.emit('player:died', {}); bus.emit('player:respawned', {}); }, sound: 'sfx-death' },
    { label: 'Pausa + continuar', run: () => { bus.emit('game:paused', {}); bus.emit('game:resumed', {}); } },
  ];
  const grid = element('div', 'lab-grid');
  for (const action of presets) grid.append(button(action.label, () => fire(action.label, action.run, action.sound)));
  container.append(grid);
}

export function mountLabPanel(game: Phaser.Game): void {
  if (installedGame === game && document.getElementById(PANEL_ID)) return;
  installedGame = game;
  recentSounds = [];
  installedAudioMapping = false;
  const previousPanel = document.getElementById(PANEL_ID);
  const previousFloat = document.getElementById(FLOAT_ID);
  previousPanel?.remove();
  previousFloat?.remove();
  document.getElementById('mafiadev-lab-styles')?.remove();

  const style = element('style');
  style.id = 'mafiadev-lab-styles';
  style.textContent = styles;
  document.head.append(style);
  // el canvas (Scale.FIT) se reajusta al espacio libre a la izquierda del panel
  document.body.classList.add('mafiadev-lab');
  // el panel estrecha #app: re-encaja el canvas cuando cambie su tamaño (rAF solo no basta: el layout llega después)
  const app = document.getElementById('app');
  if (app && typeof ResizeObserver !== 'undefined') new ResizeObserver(() => game.scale.refresh()).observe(app);
  requestAnimationFrame(() => game.scale.refresh());
  setTimeout(() => game.scale.refresh(), 300);

  const panel = element('aside');
  panel.id = PANEL_ID;
  panel.tabIndex = 0;
  panel.setAttribute('aria-label', 'Lab de audio y pantallas');
  const cachedButtons: { button: HTMLButtonElement; key: string }[] = [];
  const header = element('h1', undefined, 'LAB · MAFIADEV');
  panel.append(header, element('p', undefined, 'Pruebas de audio, eventos y escenas.'));
  const banner = element('div', 'lab-banner', 'Haz clic para activar el audio');
  banner.setAttribute('role', 'status');
  panel.append(banner);
  document.body.append(panel);

  const mixer = section('Mezcla', true);
  const mixControls = element('div', 'lab-mix');
  for (const key of CHANNELS) {
    const row = element('label');
    const name = element('span', undefined, key);
    const range = element('input');
    range.type = 'range';
    range.min = '0'; range.max = '1'; range.step = '0.01'; range.dataset.channel = key;
    const value = element('output');
    range.addEventListener('input', () => settings.set({ [key]: Number(range.value) }));
    row.append(name, range, value);
    mixControls.append(row);
  }
  const muteLabel = element('label');
  const mute = element('input'); mute.type = 'checkbox'; mute.dataset.setting = 'muted';
  mute.addEventListener('change', () => settings.set({ muted: mute.checked }));
  muteLabel.append(mute, document.createTextNode(' Silencio'));
  const mixActions = element('div', 'lab-grid');
  mixActions.append(
    button('Detener todo', () => { AudioDirector.stopAll(); game.sound.stopAll(); slowMotion = false; recentSounds = []; }),
    button('Duck 50% (pausa)', () => AudioDirector.duck(0.5, 900)),
    button('Quitar duck', () => AudioDirector.duck(1, 900)),
  );
  const slowLabel = element('label');
  const slow = element('input'); slow.type = 'checkbox';
  slow.addEventListener('change', () => { slowMotion = slow.checked; AudioDirector.slowmo(slowMotion); });
  slowLabel.append(slow, document.createTextNode(' Cámara lenta (parar el tiempo)'));
  mixControls.append(muteLabel, mixActions, slowLabel);
  mixer.append(mixControls);
  panel.append(mixer);

  const music = section('Música', true);
  const crossfadeLabel = element('label');
  crossfadeLabel.append(document.createTextNode('Crossfade ms '));
  const crossfade = element('input'); crossfade.type = 'number'; crossfade.min = '0'; crossfade.max = '10000'; crossfade.step = '100'; crossfade.value = '800'; crossfade.setAttribute('aria-label', 'Crossfade ms');
  crossfadeLabel.append(crossfade);
  music.append(crossfadeLabel);
  const nowPlaying = element('div', 'lab-now', 'Ahora: ninguna');
  nowPlaying.setAttribute('aria-live', 'polite');
  const progress = element('div', 'lab-progress');
  const progressFill = element('i'); progress.append(progressFill);
  music.append(nowPlaying, progress);
  const musicStatus = element('p'); musicStatus.setAttribute('role', 'status'); music.append(musicStatus);
  for (const key of [...MUSIC_EAGER, ...MUSIC_LAZY]) {
    const row = element('div', 'lab-row');
    row.append(element('span', undefined, key));
    const actions = element('div', 'lab-actions');
    const play = button(`▶ ${key}`, () => playMusic(game, key, Number(crossfade.value) || 0, play, musicStatus));
    play.setAttribute('aria-label', `▶ ${key}`);
    const jingle = button('Jingle', () => {
      if (!game.cache.audio.exists(key)) return;
      AudioDirector.playJingle(key, Number(crossfade.value) || 0); recordSound(`jingle ${key}`);
    }, 'Reproducir una vez');
    const stop = button('⏹', () => { AudioDirector.stopMusic(Number(crossfade.value) || 0); recordSound('stopMusic'); });
    stop.setAttribute('aria-label', `Detener música ${key}`);
    if (key !== 'music-gameover') jingle.disabled = true;
    actions.append(play, jingle, stop);
    row.append(actions); music.append(row);
  }
  panel.append(music);

  const ambient = section('Ambiente');
  for (const key of AMBIENT_KEYS) {
    const row = element('div', 'lab-row'); row.append(element('span', undefined, key));
    const actions = element('div', 'lab-actions');
    const play = button(`▶ ${key}`, () => { if (game.cache.audio.exists(key)) { AudioDirector.playAmbient(key); recordSound(key); } });
    const stop = button('⏹', () => { AudioDirector.playAmbient(null); recordSound('ambiente detenido'); });
    setUnavailable([play], !game.cache.audio.exists(key));
    cachedButtons.push({ button: play, key });
    actions.append(play, stop); row.append(actions); ambient.append(row);
  }
  const ambientStop = button('Detener ambiente', () => { AudioDirector.playAmbient(null); recordSound('ambiente detenido'); });
  ambient.append(ambientStop); panel.append(ambient);

  const voices = section('Voces');
  for (const key of VOICE_KEYS) {
    const play = button(`▶ ${key}`, () => { if (game.cache.audio.exists(key)) { AudioDirector.voice(key as VoiceKey); recordSound(key); } });
    setUnavailable([play], !game.cache.audio.exists(key));
    cachedButtons.push({ button: play, key });
    voices.append(play);
  }
  panel.append(voices);

  const effects = section('Efectos (SFX)', true);
  const toneLabel = element('label');
  const tone = element('input'); tone.type = 'checkbox';
  toneLabel.append(tone, document.createTextNode(' Variación de tono'));
  const channelSelect = element('select'); channelSelect.setAttribute('aria-label', 'Canal de efectos');
  for (const channel of ['sfx', 'ui'] as const) {
    const option = element('option', undefined, channel); option.value = channel; channelSelect.append(option);
  }
  const effectOptions = element('div'); effectOptions.append(toneLabel, channelSelect); effects.append(effectOptions);
  const effectGrid = element('div', 'lab-grid');
  for (const key of SFX_KEYS) {
    const variants = SFX_VARIANTS[key];
    const count = variants ?? 1;
    for (let variant = 1; variant <= count; variant += 1) {
      const fileKey = variants ? `${key}-${variant}` : key;
      const suffix = variants ? ` · ${variant}` : '';
      const play = button(`${key}${suffix}`, () => {
        if (!game.cache.audio.exists(fileKey)) return;
        AudioDirector.sfx(key as SfxKey, {
          ...(variants ? { variant } : {}),
          detune: tone.checked ? undefined : 0,
          channel: channelSelect.value as 'sfx' | 'ui',
        });
        recordSound(fileKey);
      });
      play.setAttribute('aria-label', fileKey);
      setUnavailable([play], !game.cache.audio.exists(fileKey));
      cachedButtons.push({ button: play, key: fileKey });
      effectGrid.append(play);
    }
  }
  effects.append(effectGrid); panel.append(effects);

  const events = section('Eventos del juego');
  appendEvents(events, game); panel.append(events);

  const screens = section('Pantallas', true);
  const screenButtons: [string, string, object?][] = [
    ['Splash + carga (completo, carga lenta 5 s)', 'PreloadScene', { replay: true, mode: 'full', fakeLoadMs: 5000 }],
    ['Splash corto (ya visto)', 'PreloadScene', { replay: true, mode: 'short', fakeLoadMs: 0 }],
    ['Splash con carga instantánea', 'PreloadScene', { replay: true, mode: 'full', fakeLoadMs: 0 }],
    ['Título (intro)', 'TitleScene', { menu: false }],
    ['Título (menú directo)', 'TitleScene', { menu: true }],
    ['Créditos', 'CreditsScene'],
    ['Opciones', 'OptionsScene'],
    ['Game over (overlay)', 'GameOverScene'],
    ['Juego', 'GameScene'],
  ];
  const screenGrid = element('div', 'lab-grid');
  for (const [label, key, data] of screenButtons) screenGrid.append(button(label, () => goScene(game, key, data)));
  screens.append(screenGrid); panel.append(screens);

  const floating = button('◀ LAB', () => {
    stopOtherScenes(game);
    game.scene.start('LabScene');
  });
  floating.id = FLOAT_ID;
  floating.hidden = true;
  document.body.append(floating);

  panel.addEventListener('click', () => panel.focus({ preventScroll: true }));
  panel.addEventListener('keydown', (event: KeyboardEvent) => {
    if (/^Digit[0-9]$/.test(event.code) || /^Numpad[0-9]$/.test(event.code)) event.stopPropagation();
  });
  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.code !== 'Backquote') return;
    event.preventDefault();
    stopOtherScenes(game);
    game.scene.start('LabScene');
  });

  const syncSettings = (value = settings.get()) => {
    for (const key of CHANNELS) {
      const input = panel.querySelector<HTMLInputElement>(`input[data-channel="${key}"]`);
      const output = input?.parentElement?.querySelector('output');
      if (!input || !output) continue;
      input.value = String(value[key]);
      output.value = `${Math.round(value[key] * 100)}%`;
      output.textContent = output.value;
    }
    mute.checked = value.muted;
  };
  syncSettings();
  settings.subscribe(syncSettings);

  window.setInterval(() => {
    const key = AudioDirector.currentMusic;
    for (const entry of cachedButtons) setUnavailable([entry.button], !game.cache.audio.exists(entry.key));
    if (!key) {
      nowPlaying.textContent = 'Ahora: ninguna';
      progressFill.style.width = '0%';
    } else {
      const current = game.sound.getAll<Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound>(key).find((sound) => sound.isPlaying);
      const duration = current?.duration ?? 0;
      const seek = current?.seek ?? 0;
      nowPlaying.textContent = `Ahora: ${key} · ${formatTime(seek)} / ${formatTime(duration)}`;
      progressFill.style.width = `${duration > 0 ? Math.min(100, seek / duration * 100) : 0}%`;
    }
    banner.hidden = !game.sound.locked;
    floating.hidden = game.scene.isActive('LabScene');
    for (const key of [...MUSIC_EAGER, ...MUSIC_LAZY]) {
      const play = panel.querySelector<HTMLButtonElement>(`button[aria-label="▶ ${key}"]`);
      const jingle = panel.querySelector<HTMLButtonElement>(`.lab-row:has(button[aria-label="▶ ${key}"]) button:nth-child(2)`);
      if (play && !MUSIC_LAZY.includes(key)) setUnavailable([play], !game.cache.audio.exists(key));
      if (jingle && !loadingMusic.has(key) && !game.cache.audio.exists(key)) {
        jingle.disabled = true; jingle.title = 'sin cargar';
      } else if (jingle && key === 'music-gameover' && game.cache.audio.exists(key)) {
        jingle.disabled = false; jingle.removeAttribute('title');
      }
    }
  }, 250);
}
