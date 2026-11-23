(() => {
  'use strict';

  const catalog = Array.isArray(window.MAFIADEV_AUDIO) ? window.MAFIADEV_AUDIO : [];
  const categories = ['Todas', 'Música', 'Ambiente', 'Efectos', 'Interfaz', 'Voces'];
  const list = document.getElementById('track-list');
  const tabs = document.getElementById('category-tabs');
  const search = document.getElementById('search');
  const emptyState = document.getElementById('empty-state');
  const status = document.getElementById('status');
  const volume = document.getElementById('master-volume');
  const volumeValue = document.getElementById('volume-value');
  const stopAllButton = document.getElementById('stop-all');
  const sequenceButton = document.getElementById('play-effects');
  const rows = [];
  let activeCategory = 'Todas';
  let selectedKey = null;
  let activeRow = null;
  let animationFrame = 0;
  let sequenceTimer = 0;
  let sequenceToken = 0;
  let sequenceRows = [];
  let sequenceIndex = 0;

  function setStatus(message) {
    status.textContent = message;
  }

  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function formatDuration(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }

  function setRowSelected(row, focus) {
    rows.forEach((candidate) => candidate.element.classList.toggle('is-selected', candidate === row));
    selectedKey = row ? row.item.key : null;
    if (focus && row) row.element.focus();
  }

  function syncRow(row) {
    const playing = activeRow === row;
    row.element.classList.toggle('is-playing', playing);
    row.playButton.textContent = playing ? '■' : '▶';
    row.playButton.setAttribute('aria-label', `${playing ? 'Detener' : 'Reproducir'} ${row.item.key}`);
    row.playButton.setAttribute('aria-pressed', String(playing));
  }

  function stopCurrent() {
    if (!activeRow) return;
    const previous = activeRow;
    activeRow = null;
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    previous.audio.pause();
    try { previous.audio.currentTime = 0; } catch { /* metadata todavía no disponible */ }
    previous.progress.style.transform = 'scaleX(0)';
    syncRow(previous);
  }

  function stopSequence() {
    sequenceToken += 1;
    window.clearTimeout(sequenceTimer);
    sequenceTimer = 0;
    sequenceRows = [];
    sequenceIndex = 0;
    sequenceButton.setAttribute('aria-pressed', 'false');
  }

  function stopEverything() {
    stopSequence();
    stopCurrent();
    setStatus('Reproducción detenida.');
  }

  function updateProgress() {
    if (!activeRow) return;
    const duration = activeRow.audio.duration;
    const ratio = Number.isFinite(duration) && duration > 0 ? activeRow.audio.currentTime / duration : 0;
    activeRow.progress.style.transform = `scaleX(${Math.max(0, Math.min(1, ratio))})`;
    animationFrame = requestAnimationFrame(updateProgress);
  }

  function startRow(row, fromSequence = false) {
    if (!fromSequence) stopSequence();
    stopCurrent();
    setRowSelected(row, false);
    activeRow = row;
    row.audio.loop = Boolean(row.loopInput && row.loopInput.checked);
    row.audio.volume = Number(volume.value);
    syncRow(row);
    setStatus(`Reproduciendo ${row.item.key}.`);
    animationFrame = requestAnimationFrame(updateProgress);

    const playResult = row.audio.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(() => {
        if (activeRow === row) stopCurrent();
        setStatus(`No se pudo reproducir ${row.item.key}; comprueba el formato de audio del navegador.`);
        if (fromSequence) scheduleNextSequence();
      });
    }
  }

  function scheduleNextSequence() {
    const token = sequenceToken;
    window.clearTimeout(sequenceTimer);
    sequenceTimer = window.setTimeout(() => {
      if (token !== sequenceToken) return;
      sequenceIndex += 1;
      playSequenceItem(token);
    }, 400);
  }

  function playSequenceItem(token) {
    if (token !== sequenceToken) return;
    if (sequenceIndex >= sequenceRows.length) {
      stopSequence();
      setStatus('Secuencia de efectos terminada.');
      return;
    }
    startRow(sequenceRows[sequenceIndex], true);
  }

  function beginSequence() {
    stopSequence();
    stopCurrent();
    sequenceRows = rows.filter((row) => row.item.category === 'Efectos' || row.item.category === 'Interfaz');
    if (!sequenceRows.length) {
      setStatus('No hay efectos para reproducir.');
      return;
    }
    sequenceIndex = 0;
    sequenceButton.setAttribute('aria-pressed', 'true');
    const token = sequenceToken;
    setStatus(`Secuencia de ${sequenceRows.length} efectos e interfaces.`);
    playSequenceItem(token);
  }

  function onEnded(row) {
    if (activeRow !== row) return;
    if (sequenceRows.length && sequenceRows[sequenceIndex] === row) {
      stopCurrent();
      scheduleNextSequence();
    } else {
      stopCurrent();
      setStatus(`${row.item.key} terminó.`);
    }
  }

  function addSources(audio, file) {
    const probe = document.createElement('audio');
    const formats = [
      { ext: 'ogg', type: 'audio/ogg; codecs="vorbis"' },
      { ext: 'mp3', type: 'audio/mpeg' },
    ];
    formats.sort((a, b) => {
      const aSupported = probe.canPlayType(a.type);
      const bSupported = probe.canPlayType(b.type);
      if (aSupported && !bSupported) return -1;
      if (!aSupported && bSupported) return 1;
      return 0;
    });
    for (const format of formats) {
      const source = document.createElement('source');
      source.src = `./${file}.${format.ext}`;
      source.type = format.type;
      audio.append(source);
    }
  }

  function createRow(item) {
    const element = make('article', 'track');
    element.tabIndex = 0;
    element.setAttribute('aria-label', `${item.key}, ${item.category}`);
    const playButton = make('button', 'play-button', '▶');
    playButton.type = 'button';
    playButton.setAttribute('aria-label', `Reproducir ${item.key}`);
    playButton.setAttribute('aria-pressed', 'false');
    const key = make('div', 'track-key', item.key);
    const description = make('div', 'track-description');
    description.append(make('p', 'track-note', item.note));
    description.append(make('p', 'track-trigger', item.trigger));
    const duration = make('span', 'track-duration', '…');
    duration.setAttribute('aria-label', 'Duración');
    const audio = make('audio');
    audio.preload = 'metadata';
    audio.setAttribute('aria-hidden', 'true');
    audio.tabIndex = -1;
    addSources(audio, item.file);

    let loopInput = null;
    if (item.category === 'Música' || item.category === 'Ambiente') {
      const loopLabel = make('label', 'loop-toggle');
      loopInput = document.createElement('input');
      loopInput.type = 'checkbox';
      loopInput.checked = !/gameover|sting|fanfare/.test(item.key); // jingles: una sola vez
      loopInput.setAttribute('aria-label', `Repetir ${item.key}`);
      loopLabel.append(loopInput, document.createTextNode('Bucle'));
      loopInput.addEventListener('change', () => { audio.loop = loopInput.checked; });
      element.append(playButton, key, description, duration, loopLabel);
    } else {
      element.append(playButton, key, description, duration, make('span', 'loop-spacer'));
    }

    const progressTrack = make('div', 'progress-track');
    progressTrack.setAttribute('aria-hidden', 'true');
    const progress = make('div', 'progress-fill');
    progressTrack.append(progress);
    element.append(progressTrack, audio);

    const row = { item, element, playButton, duration, audio, loopInput, progress };
    rows.push(row);
    list.append(element);
    audio.addEventListener('loadedmetadata', () => { duration.textContent = formatDuration(audio.duration); });
    audio.addEventListener('durationchange', () => { duration.textContent = formatDuration(audio.duration); });
    audio.addEventListener('ended', () => onEnded(row));
    audio.addEventListener('error', () => {
      if (activeRow === row) {
        stopCurrent();
        setStatus(`No se pudo cargar ${item.key}; revisa la ruta o el formato disponible.`);
        if (sequenceRows.length && sequenceRows[sequenceIndex] === row) scheduleNextSequence();
      }
    });
    playButton.addEventListener('click', () => {
      setRowSelected(row, false);
      if (activeRow === row) stopEverything();
      else startRow(row);
    });
    element.addEventListener('focus', () => setRowSelected(row, false));
    element.addEventListener('click', (event) => {
      if (event.target === element || event.target === key || event.target === description) setRowSelected(row, false);
    });
    return row;
  }

  function renderTabs() {
    tabs.replaceChildren();
    for (const category of categories) {
      const button = make('button', '', category);
      button.type = 'button';
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', String(activeCategory === category));
      button.addEventListener('click', () => {
        activeCategory = category;
        renderTabs();
        filterRows();
      });
      tabs.append(button);
    }
  }

  function filterRows() {
    const query = search.value.trim().toLocaleLowerCase('es');
    let visibleCount = 0;
    for (const row of rows) {
      const matchesCategory = activeCategory === 'Todas' || row.item.category === activeCategory;
      const text = `${row.item.key} ${row.item.category} ${row.item.note} ${row.item.trigger}`.toLocaleLowerCase('es');
      const visible = matchesCategory && (!query || text.includes(query));
      row.element.hidden = !visible;
      if (visible) visibleCount += 1;
    }
    emptyState.hidden = visibleCount > 0;
  }

  function focusRelativeRow(direction) {
    const visibleRows = rows.filter((row) => !row.element.hidden);
    if (!visibleRows.length) return;
    const focused = document.activeElement && document.activeElement.closest
      ? document.activeElement.closest('.track')
      : null;
    let index = visibleRows.findIndex((row) => row.element === focused);
    if (index < 0) index = visibleRows.findIndex((row) => row.item.key === selectedKey);
    const next = index < 0 ? (direction > 0 ? 0 : visibleRows.length - 1) : (index + direction + visibleRows.length) % visibleRows.length;
    setRowSelected(visibleRows[next], true);
  }

  stopAllButton.addEventListener('click', stopEverything);
  sequenceButton.addEventListener('click', () => {
    if (sequenceRows.length) stopEverything();
    else beginSequence();
  });
  volume.addEventListener('input', () => {
    const value = Number(volume.value);
    volumeValue.value = `${Math.round(value * 100)}%`;
    volumeValue.textContent = `${Math.round(value * 100)}%`;
    if (activeRow) activeRow.audio.volume = value;
  });
  search.addEventListener('input', filterRows);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      stopEverything();
      return;
    }
    const target = event.target;
    if (target instanceof HTMLInputElement) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (target !== document.body && !(target && target.closest && target.closest('.track'))) return;
      event.preventDefault();
      focusRelativeRow(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.code === 'Space' && !event.repeat) {
      const focusedTrack = target && target.closest ? target.closest('.track') : null;
      if (!focusedTrack && target !== document.body) return;
      const row = rows.find((candidate) => candidate.element === focusedTrack) || rows.find((candidate) => candidate.item.key === selectedKey);
      if (!row) return;
      event.preventDefault();
      setRowSelected(row, false);
      if (activeRow === row) stopEverything();
      else startRow(row);
    }
  });

  if (catalog.length) {
    catalog.forEach((item) => createRow(item));
    renderTabs();
    filterRows();
    setStatus(`${catalog.length} pistas listas.`);
  } else {
    setStatus('No se encontró el catálogo. Ejecuta src/audio/tools/build-catalog.mjs para generarlo.');
    emptyState.textContent = 'El catálogo de audio no está disponible.';
    emptyState.hidden = false;
  }
})();
