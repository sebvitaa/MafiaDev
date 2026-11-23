#!/usr/bin/env node
// ship: rama → guardas → commit → merge de main → build+tests → push → PR → auto-merge.
// Es el ÚNICO camino para que un agente publique trabajo (AGENTS.md §6).
// Uso:
//   npm run ship -- --owner seba --agent claude --title "feat(audio): crossfade de música" \
//     [--message "chore(agents): HIS-..."] [--refs HIS-...,PEN-...] [--body "texto"] \
//     [--e2e] [--draft] [--no-auto] [--shared] [--dry-run]
// Sin dependencias. Node >= 18. Requiere `gh` autenticado.

import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';

const OWNERS = ['vicho', 'basti', 'alejandro', 'seba'];
const AGENTS = ['claude', 'gpt', 'otro', 'humano'];
const CONVENTIONAL = /^(feat|fix|chore|refactor|test|docs|perf|style|build|ci|revert)(\([\w./-]+\))?!?: \S.{2,}$/;

// Propiedad de rutas (AGENTS.md §2). Primer prefijo que coincide gana.
const OWNERSHIP = [
  ['agents/', 'libre'],
  ['tests/e2e/smoke.spec.ts', 'shared'],
  ['tests/', 'libre'],
  ['src/scenes/GameScene.ts', 'vicho'],
  ['src/world/', 'vicho'],
  ['src/exploration/', 'vicho'],
  ['public/assets/maps/', 'vicho'],
  ['public/assets/tilesets/', 'vicho'],
  ['public/assets/backgrounds/', 'vicho'],
  ['src/player/', 'basti'],
  ['src/combat/', 'basti'],
  ['src/enemies/', 'basti'],
  ['src/data/tuning.json', 'basti'],
  ['src/data/enemies.json', 'basti'],
  ['public/assets/sprites/enemies/', 'basti'],
  ['src/character/', 'alejandro'],
  ['src/abilities/', 'alejandro'],
  ['src/items/', 'alejandro'],
  ['src/data/items.json', 'alejandro'],
  ['src/data/loot.json', 'alejandro'],
  ['src/data/classes.json', 'alejandro'],
  ['src/data/abilities.json', 'alejandro'],
  ['public/assets/sprites/player/', 'alejandro'],
  ['src/scenes/BootScene.ts', 'seba'],
  ['src/scenes/PreloadScene.ts', 'seba'],
  ['src/scenes/TitleScene.ts', 'seba'],
  ['src/scenes/PauseScene.ts', 'seba'],
  ['src/audio/', 'seba'],
  ['src/ui/', 'seba'],
  ['public/assets/audio/', 'seba'],
  ['public/assets/ui/', 'seba'],
  // Todo lo demás (src/core, src/types, src/main.ts, configs, .github, scripts, AGENTS.md…) = shared.
];

const SECRET_FILES = [/(^|\/)\.env(\..*)?$/, /\.(pem|key|p12|pfx)$/, /(^|\/)id_(rsa|ed25519|ecdsa)/, /credentials.*\.json$/, /(^|\/)\.claude\/settings\.local\.json$/, /(^|\/)\.npmrc$/];
const SECRET_CONTENT = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\b(ghp|gho|ghu|ghs|ghr|github_pat)_[A-Za-z0-9_]{20,}/,
  /\bsk-(ant-|proj-)?[A-Za-z0-9_-]{20,}/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bAIza[0-9A-Za-z_-]{35}\b/,
  /\bxox[abprs]-[A-Za-z0-9-]{10,}/,
];

const opts = parseArgs(process.argv.slice(2));
try {
  main();
} catch (e) {
  console.error(`\n✖ ship abortado: ${e.message}`);
  process.exit(1);
}

function main() {
  if (opts.help || opts.h) return usage(0);
  const owner = need('owner', OWNERS);
  const agent = need('agent', AGENTS);
  const title = need('title');
  if (!CONVENTIONAL.test(title)) throw new Error(`--title debe ser convencional, p. ej. "feat(audio): crossfade" (recibido: "${title}")`);
  const message = opts.message && opts.message !== true ? String(opts.message) : title;
  if (!CONVENTIONAL.test(message.split('\n')[0])) throw new Error(`--message debe empezar con una línea convencional (recibido: "${message}")`);
  const dry = Boolean(opts['dry-run']);
  const autoMerge = !opts['no-auto'] && !opts.draft;

  step('Comprobando entorno');
  if (git('rev-parse', '--is-inside-work-tree') !== 'true') throw new Error('no es un repo git');
  if (fileExists('.git/MERGE_HEAD') || fileExists('.git/rebase-merge') || fileExists('.git/rebase-apply')) {
    throw new Error('hay un merge o rebase a medias; resuélvelo antes de hacer ship');
  }
  run('gh', ['auth', 'status'], { quiet: true });
  git('fetch', '--quiet', 'origin', 'main');

  // 1. Rama
  let branch = git('rev-parse', '--abbrev-ref', 'HEAD');
  if (branch === 'HEAD') throw new Error('HEAD desacoplado; cámbiate a una rama');
  if (branch === 'main' || branch === 'master') {
    branch = `${owner}/${slugify(title.replace(/^[^:]+:\s*/, ''))}`;
    step(`Estás en main → creando rama ${branch}`);
    if (!dry) git('switch', '-c', branch);
  } else if (!branch.startsWith(`${owner}/`)) {
    throw new Error(`la rama "${branch}" no es de ${owner} (debe ser ${owner}/<slug>). Cámbiate a main o a una rama tuya.`);
  }

  // 2. Preparar cambios y guardas (sobre TODO lo que llevará el PR, no solo lo nuevo)
  step('Preparando cambios');
  if (!dry) git('add', '-A');
  const staged = lines(dry ? git('diff', '--name-only', 'HEAD') + '\n' + git('ls-files', '--others', '--exclude-standard') : git('diff', '--cached', '--name-only'));
  const ahead = lines(git('diff', '--name-only', 'origin/main...HEAD'));
  const files = [...new Set([...ahead, ...staged])].sort();
  if (!files.length) throw new Error('no hay nada que enviar (sin cambios ni commits respecto a origin/main)');
  console.log(files.map((f) => `   ${f}`).join('\n'));

  guardOwnership(files, owner);
  // En dry-run nada está en el índice: los archivos nuevos no salen en `git diff`, se leen a mano.
  const untrackedText = dry ? lines(git('ls-files', '--others', '--exclude-standard')).map(readAsAdded).join('\n') : '';
  const diffText = (dry ? git('diff', 'HEAD') : git('diff', '--cached')) + '\n' + untrackedText + '\n' + git('diff', 'origin/main...HEAD');
  guardSecrets(files, diffText);

  // 3. Commit de lo pendiente
  if (staged.length) {
    step(`Commit: ${message.split('\n')[0]}`);
    if (!dry) git('commit', '--quiet', '-m', message);
  }

  // 4. Integrar main (merge, nunca rebase: así nunca hace falta push --force)
  step('Integrando origin/main');
  if (!dry) {
    const r = spawnSync('git', ['merge', '--no-edit', '--quiet', 'origin/main'], { encoding: 'utf8' });
    if (r.status !== 0) {
      spawnSync('git', ['merge', '--abort']);
      throw new Error(`conflicto al integrar origin/main. Merge abortado; tu commit sigue en la rama.\n` +
        `  Resuélvelo: git merge origin/main → arregla SOLO archivos de tu dominio → git commit → npm run ship de nuevo.\n` +
        `  Si el conflicto es en un dominio ajeno: crea un pending p0 a su dueño.\n${r.stdout}${r.stderr}`);
    }
  }

  // 5. Verificación local (el CI repite build + unit + e2e y es el que decide el auto-merge)
  step('npm run build');
  run('npm', ['run', 'build', '--silent']);
  step('npm test');
  run('npm', ['test', '--silent']);
  if (opts.e2e) {
    step('npm run test:e2e');
    run('npm', ['run', 'test:e2e', '--silent']);
  }

  if (dry) {
    step(`[dry-run] Todo OK. Se haría push de ${branch}, PR a main${autoMerge ? ' y auto-merge (squash) al pasar el CI' : ''}.`);
    return;
  }

  // 6. Push (nunca a main, nunca forzado)
  step(`git push origin ${branch}`);
  git('push', '--quiet', '-u', 'origin', `HEAD:refs/heads/${branch}`);

  // 7. PR: crear o reutilizar
  let pr = findPr(branch);
  if (pr) {
    step(`PR #${pr.number} ya existe; actualizado con el push`);
  } else {
    step('Creando PR');
    const args = ['pr', 'create', '--base', 'main', '--head', branch, '--title', title, '--body', prBody({ owner, agent, files })];
    if (opts.draft) args.push('--draft');
    run('gh', args, { quiet: true });
    pr = findPr(branch);
    if (!pr) throw new Error('gh pr create no devolvió un PR');
  }

  // 8. Auto-merge cuando el CI esté verde
  if (autoMerge) {
    const r = spawnSync('gh', ['pr', 'merge', String(pr.number), '--auto', '--squash', '--delete-branch'], { encoding: 'utf8' });
    if (r.status === 0) step('Auto-merge activado: se fusionará (squash) cuando el CI pase');
    else console.warn(`⚠ No se pudo activar el auto-merge (el PR queda abierto):\n${r.stderr.trim()}`);
  }

  console.log(`\n✔ ${pr.url}`);
  console.log('  Seguimiento: gh pr checks --watch   ·   Estado: gh pr view');
}

// ───────────────────────── guardas ─────────────────────────

function ownerOf(file) {
  for (const [prefix, who] of OWNERSHIP) if (file === prefix || file.startsWith(prefix)) return who;
  return 'shared';
}

function guardOwnership(files, owner) {
  const foreign = files.filter((f) => !['libre', owner, 'shared'].includes(ownerOf(f)));
  const shared = files.filter((f) => ownerOf(f) === 'shared');
  if (foreign.length) {
    throw new Error(`archivos de otro dominio (AGENTS.md §2). Sácalos del commit y crea un pending a su dueño:\n` +
      foreign.map((f) => `   ${f}  → ${ownerOf(f)}`).join('\n'));
  }
  if (shared.length && !opts.shared) {
    throw new Error(`archivos shared. Solo con aviso explícito del humano en el chat del equipo + supuesto validator=equipo; entonces repite con --shared:\n` +
      shared.map((f) => `   ${f}`).join('\n'));
  }
}

function guardSecrets(files, diffText) {
  const badFiles = files.filter((f) => SECRET_FILES.some((re) => re.test(f)));
  if (badFiles.length) throw new Error(`archivos que no se versionan nunca:\n${badFiles.map((f) => `   ${f}`).join('\n')}`);
  const added = diffText.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++'));
  const hits = added.filter((l) => SECRET_CONTENT.some((re) => re.test(l)));
  if (hits.length) throw new Error(`posible secreto en el diff (${hits.length} línea(s)). Quítalo; si es un falso positivo, avisa al humano.`);
}

// ───────────────────────── utilidades ─────────────────────────

function prBody({ owner, agent, files }) {
  const refs = opts.refs && opts.refs !== true ? String(opts.refs).split(',').map((s) => s.trim()).filter(Boolean) : [];
  const extra = opts.body && opts.body !== true ? `${opts.body}\n\n` : '';
  return `${extra}| | |\n|---|---|\n| Owner | ${owner} |\n| Agente | ${agent} |\n| Refs | ${refs.join(', ') || '—'} |\n` +
    `| Verificado en local | build · unit${opts.e2e ? ' · e2e' : ''} |\n\n` +
    `<details><summary>${files.length} archivo(s)</summary>\n\n${files.map((f) => `- \`${f}\``).join('\n')}\n</details>\n\n` +
    `_PR creado con \`npm run ship\`. Se fusiona solo (squash) cuando el CI pasa; para pararlo: \`gh pr merge --disable-auto\`._`;
}

function findPr(branch) {
  const out = run('gh', ['pr', 'list', '--head', branch, '--state', 'open', '--json', 'number,url', '--limit', '1'], { quiet: true, capture: true });
  const list = JSON.parse(out || '[]');
  return list[0] ?? null;
}

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function run(cmd, args, { quiet = false, capture = false } = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', stdio: quiet || capture ? ['ignore', 'pipe', 'pipe'] : 'inherit' });
  if (r.error) throw new Error(`${cmd}: ${r.error.message}`);
  if (r.status !== 0) throw new Error(`falló: ${cmd} ${args.join(' ')}${r.stderr ? `\n${r.stderr.trim()}` : ''}`);
  return capture ? r.stdout.trim() : '';
}

function fileExists(p) {
  return fs.existsSync(p);
}

function readAsAdded(file) {
  try {
    if (fs.statSync(file).size > 1_000_000) return '';
    return fs.readFileSync(file, 'utf8').split('\n').map((l) => `+${l}`).join('\n');
  } catch {
    return '';
  }
}

function lines(s) {
  return s.split('\n').map((l) => l.trim()).filter(Boolean);
}

function slugify(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'cambios';
}

function step(msg) {
  console.log(`▸ ${msg}`);
}

function need(k, allowed) {
  const v = opts[k];
  if (!v || v === true) throw new Error(`falta --${k}${allowed ? ` (${allowed.join('|')})` : ''}`);
  if (allowed && !allowed.includes(v)) throw new Error(`--${k} debe ser uno de: ${allowed.join('|')} (recibido: ${v})`);
  return String(v);
}

function usage(code) {
  console.log(`Uso: npm run ship -- --owner <${OWNERS.join('|')}> --agent <${AGENTS.join('|')}> --title "feat(dominio): qué"
  --message "..."   mensaje del commit de lo pendiente (por defecto = --title)
  --refs A,B        IDs HIS/PEN/SUP para el cuerpo del PR
  --body "..."      texto extra para el cuerpo del PR
  --e2e             corre también Playwright en local (el CI lo corre siempre)
  --draft           PR en borrador, sin auto-merge
  --no-auto         PR normal sin auto-merge (lo fusiona un humano)
  --shared          permite archivos shared (solo con aviso explícito del humano)
  --dry-run         guardas + build + tests, sin commit, push ni PR`);
  process.exit(code);
}

function parseArgs(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) o[k] = true;
      else { o[k] = next; i++; }
    } else o._.push(a);
  }
  return o;
}
