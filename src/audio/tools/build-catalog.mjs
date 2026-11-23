import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, '../../..');
const audioDir = resolve(root, 'public/assets/audio');
const notesPath = resolve(scriptDir, 'catalog-notes.json');
const outputPath = resolve(audioDir, 'catalog.js');
const folders = {
  music: 'Música',
  amb: 'Ambiente',
  sfx: 'Efectos',
  vo: 'Voces',
};
const categoryOrder = ['Música', 'Ambiente', 'Efectos', 'Interfaz', 'Voces'];
const notes = JSON.parse(await readFile(notesPath, 'utf8'));
const catalog = [];

for (const [folder, defaultCategory] of Object.entries(folders)) {
  const dir = resolve(audioDir, folder);
  const entries = await readdir(dir, { withFileTypes: true });
  const keys = new Set(
    entries
      .filter((entry) => entry.isFile() && /\.(ogg|mp3)$/i.test(entry.name))
      .map((entry) => entry.name.replace(/\.(ogg|mp3)$/i, '')),
  );

  for (const key of keys) {
    const description = notes[key] ?? {};
    const file = relative(audioDir, resolve(dir, key)).split(sep).join('/');
    catalog.push({
      key,
      category: folder === 'sfx' && key.startsWith('sfx-ui-') ? 'Interfaz' : defaultCategory,
      file,
      note: description.note ?? 'Descripción pendiente.',
      trigger: description.trigger ?? 'sin uso actual',
    });
  }
}

catalog.sort((a, b) => {
  const categoryDelta = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
  return categoryDelta || a.key.localeCompare(b.key, 'es', { numeric: true, sensitivity: 'base' });
});

const contents = `// Generado por src/audio/tools/build-catalog.mjs. No editar a mano.\nwindow.MAFIADEV_AUDIO = ${JSON.stringify(catalog, null, 2)};\n`;
await writeFile(outputPath, contents, 'utf8');
console.log(`Catálogo generado: ${relative(root, outputPath)} (${catalog.length} pistas)`);
