#!/usr/bin/env node
// Memoria persistente de agentes: history / pendings / supuestos.
// Uso:
//   node scripts/agents.mjs new history  --owner basti --agent claude --title "parry window"
//   node scripts/agents.mjs new pending  --owner vicho --by basti --agent gpt --priority p0 --title "colision sala 2"
//   node scripts/agents.mjs new supuesto --owner alejandro --validator equipo --agent claude --impact medio --title "mana del mago"
//   node scripts/agents.mjs status [--owner basti] [--all]
// Sin dependencias. Node >= 18.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = { history: 'agents/history', pending: 'agents/pendings', supuesto: 'agents/supuestos' };
const PREFIX = { history: 'HIS', pending: 'PEN', supuesto: 'SUP' };
const OWNERS = ['vicho', 'basti', 'alejandro', 'seba'];
const AGENTS = ['claude', 'gpt', 'otro'];

const [cmd, ...rest] = process.argv.slice(2);
const opts = parseArgs(rest);

try {
  if (cmd === 'new') cmdNew(opts._[0], opts);
  else if (cmd === 'status') cmdStatus(opts);
  else usage();
} catch (e) {
  console.error(`error: ${e.message}`);
  process.exit(1);
}

function usage() {
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 8).join('\n').replace(/^\/\/ ?/gm, ''));
  process.exit(cmd ? 1 : 0);
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

function need(o, k, allowed) {
  const v = o[k];
  if (!v || v === true) throw new Error(`falta --${k}${allowed ? ` (${allowed.join('|')})` : ''}`);
  if (allowed && !allowed.includes(v)) throw new Error(`--${k} debe ser uno de: ${allowed.join('|')} (recibido: ${v})`);
  return v;
}

function stamp(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function slugify(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'entrada';
}

function cmdNew(type, o) {
  if (!DIR[type]) throw new Error('tipo debe ser history | pending | supuesto');
  const owner = need(o, 'owner', OWNERS);
  const agent = need(o, 'agent', AGENTS);
  const title = need(o, 'title');
  const vars = { owner, agent, title: title.replace(/\n/g, ' '), created: new Date().toISOString() };
  if (type === 'pending') {
    vars.by = need(o, 'by', OWNERS);
    vars.priority = need(o, 'priority', ['p0', 'p1', 'p2']);
  }
  if (type === 'supuesto') {
    vars.validator = need(o, 'validator', [...OWNERS, 'equipo']);
    vars.impact = need(o, 'impact', ['bajo', 'medio', 'alto']);
  }
  const base = `${PREFIX[type]}-${owner}-${stamp()}`;
  const dir = path.join(ROOT, DIR[type]);
  fs.mkdirSync(dir, { recursive: true });
  // colisión improbable (mismo owner, mismo segundo): sufijo incremental
  const taken = (id) => fs.readdirSync(dir).some((f) => f.startsWith(id + '--'));
  let id = base;
  for (let n = 2; taken(id); n++) id = `${base}-${n}`;
  vars.id = id;
  const tpl = fs.readFileSync(path.join(ROOT, 'agents/_templates', `${type}.md`), 'utf8');
  const out = tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '');
  const file = path.join(dir, `${id}--${slugify(title)}.md`);
  fs.writeFileSync(file, out, { flag: 'wx' });
  console.log(path.relative(ROOT, file));
}

function readEntries(type) {
  const dir = path.join(ROOT, DIR[type]);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => {
    const txt = fs.readFileSync(path.join(dir, f), 'utf8');
    const fm = {};
    const m = txt.match(/^---\n([\s\S]*?)\n---/);
    if (m) for (const line of m[1].split('\n')) {
      const kv = line.match(/^([\w-]+):\s*(.*)$/);
      if (kv) fm[kv[1]] = kv[2].replace(/\s+#.*$/, '').trim();
    }
    return { file: path.join(DIR[type], f), ...fm };
  }).sort((a, b) => String(a.created).localeCompare(String(b.created)));
}

function cmdStatus(o) {
  const owner = o.owner && o.owner !== true ? need(o, 'owner', OWNERS) : null;
  const pend = readEntries('pending');
  const sup = readEntries('supuesto');
  const his = readEntries('history');
  const prio = { p0: 0, p1: 1, p2: 2 };
  const open = (p) => !['done', 'wontfix'].includes(p.status);
  const line = (e, extra = '') => `  ${e.id}  ${extra}${e.title}\n      ${e.file}`;

  const section = (title, list, fmt) => {
    console.log(`\n## ${title} (${list.length})`);
    if (!list.length) console.log('  —');
    for (const e of list) console.log(fmt(e));
  };

  console.log(`# agents status${owner ? ` — owner=${owner}` : ''} — ${new Date().toISOString()}`);

  const pendOpen = pend.filter(open).sort((a, b) => (prio[a.priority] ?? 9) - (prio[b.priority] ?? 9));
  const p0 = pendOpen.filter((p) => p.priority === 'p0');
  section('P0 abiertos (todo el equipo)', p0, (e) => line(e, `[${e.owner}|${e.status}] `));

  if (owner) {
    section(`Pendings asignados a ${owner}`, pendOpen.filter((p) => p.owner === owner && p.priority !== 'p0'), (e) => line(e, `[${e.priority}|${e.status}] `));
    section(`Pendings creados por ${owner} y aún abiertos (asignados a otros)`, pendOpen.filter((p) => p.created_by === owner && p.owner !== owner), (e) => line(e, `[→${e.owner}|${e.priority}] `));
    section(`Supuestos que ${owner} debe validar`, sup.filter((s) => s.status === 'pendiente' && s.validator === owner), (e) => line(e, `[de ${e.owner}|${e.impact}] `));
    section('Supuestos de equipo pendientes', sup.filter((s) => s.status === 'pendiente' && s.validator === 'equipo'), (e) => line(e, `[de ${e.owner}|${e.impact}] `));
    section(`Supuestos propios de ${owner} sin resolver`, sup.filter((s) => s.status === 'pendiente' && s.owner === owner && s.validator !== 'equipo'), (e) => line(e, `[→${e.validator}] `));
    section(`Supuestos rechazados que afectan a ${owner}`, sup.filter((s) => s.status === 'rechazado' && s.owner === owner), (e) => line(e));
    section(`Últimas history de ${owner}`, his.filter((h) => h.owner === owner).slice(-(Number(o.last) || 3)), (e) => line(e, `[${e.status}] `));
  } else {
    section('Pendings abiertos', pendOpen.filter((p) => p.priority !== 'p0'), (e) => line(e, `[${e.owner}|${e.priority}|${e.status}] `));
    section('Supuestos pendientes de validar', sup.filter((s) => s.status === 'pendiente'), (e) => line(e, `[${e.owner}→${e.validator}|${e.impact}] `));
    section('Últimas history (equipo)', his.slice(-(Number(o.last) || 8)), (e) => line(e, `[${e.owner}|${e.status}] `));
  }

  if (o.all) {
    section('Pendings cerrados', pend.filter((p) => !open(p)), (e) => line(e, `[${e.owner}|${e.status}|${e.closed_by || '?'}] `));
    section('Supuestos resueltos', sup.filter((s) => s.status !== 'pendiente'), (e) => line(e, `[${e.status}] `));
  }

  const failsSinPen = his.filter((h) => h.status === 'fail' && !(h.refs || '').includes('PEN-'));
  if (failsSinPen.length) section('⚠ history con status=fail sin PEN en refs (incumple AGENTS.md §4.1)', failsSinPen, (e) => line(e));
}
