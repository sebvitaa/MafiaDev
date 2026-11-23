import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const W = 240, H = 180, TILE = 16;
const here = dirname(fileURLToPath(import.meta.url));
const output = resolve(here, '../../../public/assets/maps/world.json');
let seed = 0x4d616669;
const rand = () => ((seed = (seed + 0x6D2B79F5) | 0), ((seed = Math.imul(seed ^ seed >>> 15, seed | 1)) ^ seed + Math.imul(seed ^ seed >>> 7, seed | 61)) >>> 0) / 4294967296;
const hash = (x, y, salt = 0) => { let n = (Math.imul(x + 37, 374761393) ^ Math.imul(y + 71, 668265263) ^ salt) >>> 0; n = Math.imul(n ^ n >>> 13, 1274126177); return (n ^ n >>> 16) >>> 0; };
const idx = (x, y) => y * W + x;
const inside = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
const ground = Array(W * H).fill(0), deco = Array(W * H).fill(0), walls = Array(W * H).fill(0), biome = Array(W * H).fill('');
const regions = [
  ['start', 'ruins', 42, 88, 15, 12], ['hub', 'ruins', 112, 88, 19, 15],
  ['forestWest', 'forest', 63, 43, 17, 13], ['forestNorth', 'forest', 121, 42, 18, 13],
  ['forestSouth', 'forest', 49, 133, 17, 14], ['ruinsSouth', 'ruins', 91, 126, 15, 14],
  ['ruinsEast', 'ruins', 165, 82, 16, 14], ['ruinsSouthEast', 'ruins', 163, 130, 16, 14],
  ['bright', 'bright', 207, 30, 25, 21], ['forestEast', 'forest', 205, 104, 14, 13],
  ['arena', 'arena', 199, 153, 21, 17],
].map(([name, kind, cx, cy, rx, ry]) => ({ name, kind, cx, cy, rx, ry, minX: cx - rx, minY: cy - ry, maxX: cx + rx, maxY: cy + ry }));
const byName = Object.fromEntries(regions.map(r => [r.name, r]));
const bases = { ruins: 1, forest: 9, bright: 17, arena: 25 };
const wallGids = { ruins: [33, 34], forest: [35, 36], bright: [37, 38], arena: [39, 40] };

function paint(x, y, kind) { if (inside(x, y)) biome[idx(x, y)] = kind; }
for (const r of regions) {
  for (let y = r.minY; y <= r.maxY; y++) for (let x = r.minX; x <= r.maxX; x++) {
    const dx = (x - r.cx) / r.rx, dy = (y - r.cy) / r.ry;
    const edge = 1 + ((hash(x, y, r.cx) % 100) / 100 - .5) * .28 + Math.sin(x * .7 + y * .31) * .06;
    if (dx * dx + dy * dy < edge) paint(x, y, r.kind);
  }
}

function corridor(from, to, kind, width = 4, bend = 0) {
  const points = bend ? [from, { x: Math.round((from.x + to.x) / 2) + bend, y: from.y }, { x: Math.round((from.x + to.x) / 2) + bend, y: to.y }, to] : [from, { x: to.x, y: from.y }, to];
  for (let p = 0; p < points.length - 1; p++) {
    const a = points[p], b = points[p + 1], steps = Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
    for (let s = 0; s <= steps; s++) {
      const x = Math.round(a.x + (b.x - a.x) * s / steps), y = Math.round(a.y + (b.y - a.y) * s / steps);
      for (let oy = -Math.floor(width / 2); oy <= Math.floor((width - 1) / 2); oy++) for (let ox = -Math.floor(width / 2); ox <= Math.floor((width - 1) / 2); ox++) paint(x + ox, y + oy, kind);
    }
  }
}
const c = name => ({ x: byName[name].cx, y: byName[name].cy });
const links = [
  ['start', 'hub', 4, 5], ['hub', 'forestWest', 4, -6], ['forestWest', 'forestNorth', 4, 4], ['forestNorth', 'hub', 4, -5],
  ['hub', 'ruinsSouth', 5, -8], ['ruinsSouth', 'forestSouth', 4, 4], ['forestSouth', 'start', 4, -5],
  ['hub', 'ruinsEast', 4, 5], ['ruinsSouth', 'ruinsSouthEast', 4, 6], ['ruinsEast', 'ruinsSouthEast', 4, -4], ['ruinsEast', 'bright', 3, 4],
  ['ruinsSouthEast', 'forestEast', 4, 3],
];
for (const [a, b, width, bend] of links) corridor(c(a), c(b), byName[a].kind, width, bend);
// The arena is intentionally gated through one tile after its long three-tile tunnel.
const arena = byName.arena;
for (let y = arena.minY - 1; y <= arena.maxY + 1; y++) for (let x = arena.minX - 1; x <= arena.maxX + 1; x++) if (x < arena.minX || x > arena.maxX || y < arena.minY || y > arena.maxY) biome[idx(x, y)] = '';
corridor(c('forestEast'), { x: arena.minX - 8, y: arena.cy }, 'forest', 3, -35);
corridor({ x: arena.minX - 8, y: arena.cy }, { x: arena.minX - 1, y: arena.cy }, 'forest', 1);
paint(arena.minX, arena.cy, 'arena');
// A dead-end treasure spur from the eastern ruins.
corridor({ x: 175, y: 76 }, { x: 188, y: 63 }, 'ruins', 3, -2);

// Trim only noise fragments that are not part of the connected world.
const connectedFloor = new Set([idx(byName.start.cx, byName.start.cy)]), flood = [idx(byName.start.cx, byName.start.cy)];
for (let q = 0; q < flood.length; q++) { const p = flood[q], x = p % W, y = Math.floor(p / W); for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + ox, ny = y + oy, n = idx(nx, ny); if (inside(nx, ny) && biome[n] && !connectedFloor.has(n)) { connectedFloor.add(n); flood.push(n); } } }
for (let i = 0; i < biome.length; i++) if (biome[i] && !connectedFloor.has(i)) biome[i] = '';

for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (biome[idx(x, y)]) {
  const kind = biome[idx(x, y)], h = hash(Math.floor(x / 3), Math.floor(y / 3), 9);
  ground[idx(x, y)] = bases[kind] + (h % 100 < 70 ? 0 : h % 4 + 1);
}
// Ruin islands provide interior cover without cutting the room routes.
for (const [x0, y0] of [[106, 83], [116, 94], [86, 121], [160, 78]]) for (let y = y0; y < y0 + 3; y++) for (let x = x0; x < x0 + 4; x++) if (ground[idx(x, y)]) walls[idx(x, y)] = 34;

for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!ground[idx(x, y)]) {
  let nearest = '';
  for (let oy = -1; oy <= 1 && !nearest; oy++) for (let ox = -1; ox <= 1; ox++) if (inside(x + ox, y + oy) && biome[idx(x + ox, y + oy)]) { nearest = biome[idx(x + ox, y + oy)]; break; }
  if (nearest) walls[idx(x, y)] = wallGids[nearest][ground[idx(x, y + 1)] ? 1 : 0];
}

function nearestWalkable(x, y) {
  for (let d = 0; d < 80; d++) for (let oy = -d; oy <= d; oy++) for (let ox = -d; ox <= d; ox++) {
    const nx = x + ox, ny = y + oy; if (inside(nx, ny) && ground[idx(nx, ny)] && !walls[idx(nx, ny)]) return { x: nx, y: ny };
  }
  throw Error(`No walkable tile near ${x},${y}`);
}
let objectId = 1;
const objects = [];
function point(name, type, x, y) { const p = nearestWalkable(x, y); objects.push({ id: objectId++, name, type, x: p.x * TILE + 8, y: p.y * TILE + 8, width: 0, height: 0, point: true, rotation: 0, visible: true }); return p; }
function rect(name, type, x, y, width, height, properties = []) { objects.push({ id: objectId++, name, type, x: x * TILE, y: y * TILE, width: width * TILE, height: height * TILE, rotation: 0, visible: true, ...(properties.length ? { properties } : {}) }); }
const spawn = point('spawn', 'spawn', 49, 88);
point('sword1', 'sword', spawn.x + 4, spawn.y + 1); point('chest0', 'chest', spawn.x + 2, spawn.y + 5);
[['chest1', 61, 43], ['chest2', 121, 42], ['chest3', 91, 126], ['chest4', 168, 85], ['chest5', 163, 130], ['chest6', 210, 33], ['chest7', 188, 63]].forEach(([n, x, y]) => point(n, 'chest', x, y));
[['cp1', 49, 88], ['cp2', 112, 88], ['cp3', 207, 30], ['cp4', 184, 139], ['cp5', 63, 43], ['cp6', 165, 82]].forEach(([n, x, y]) => point(n, 'checkpoint', x, y));
rect('arena', 'boss_arena', arena.minX, arena.minY, arena.maxX - arena.minX + 1, arena.maxY - arena.minY + 1);
rect('zone1', 'zone', 0, 0, W, H, [{ name: 'zone', type: 'string', value: 'zone1' }]);
const bright = byName.bright;
rect('zone2', 'zone', bright.minX, bright.minY, bright.maxX - bright.minX + 1, bright.maxY - bright.minY + 1, [{ name: 'zone', type: 'string', value: 'zone2' }]);
rect('boss', 'zone', arena.minX, arena.minY, arena.maxX - arena.minX + 1, arena.maxY - arena.minY + 1, [{ name: 'zone', type: 'string', value: 'boss' }]);
const start = byName.start;
rect('tutorial', 'zone', start.minX, start.minY, start.maxX - start.minX + 1, start.maxY - start.minY + 1, [{ name: 'zone', type: 'string', value: 'zone1' }, { name: 'roomId', type: 'string', value: 'tutorial' }]);

for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (ground[idx(x, y)] && !walls[idx(x, y)] && hash(x, y, 27) % 100 < 4) {
  if (objects.every(o => !o.point || Math.max(Math.abs(o.x / TILE - 0.5 - x), Math.abs(o.y / TILE - 0.5 - y)) >= 2)) {
    const options = { ruins: [42, 44, 48, 47], forest: [41, 42, 43], bright: [45, 46, 41], arena: [44, 47] }[biome[idx(x, y)]];
    deco[idx(x, y)] = options[hash(x, y, 31) % options.length];
  }
}

function assert(ok, message) { if (!ok) throw Error(message); }
const walkable = ground.map((g, i) => g !== 0 && walls[i] === 0);
const queue = [idx(spawn.x, spawn.y)], seen = new Set(queue);
for (let q = 0; q < queue.length; q++) { const p = queue[q], x = p % W, y = Math.floor(p / W); for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const n = idx(x + ox, y + oy); if (inside(x + ox, y + oy) && walkable[n] && !seen.has(n)) { seen.add(n); queue.push(n); } } }
const unreachable = walkable.map((ok, i) => ok && !seen.has(i) ? `${i % W},${Math.floor(i / W)}` : '').filter(Boolean);
assert(!unreachable.length, `Flood fill did not reach every walkable tile (${seen.size}/${walkable.filter(Boolean).length}; ${unreachable.slice(0, 8).join(' ')})`);
for (const o of objects.filter(o => o.point)) { const x = Math.floor(o.x / TILE), y = Math.floor(o.y / TILE); assert(walkable[idx(x, y)], `Point ${o.name} is not walkable`); }
for (let i = 0; i < deco.length; i++) assert(!(deco[i] && walls[i]), 'Deco overlaps a wall');
const arenaEntranceTiles = [];
for (let y = arena.minY; y <= arena.maxY; y++) for (let x = arena.minX; x <= arena.maxX; x++) if (walkable[idx(x, y)]) for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (x + ox < arena.minX || x + ox > arena.maxX || y + oy < arena.minY || y + oy > arena.maxY) if (walkable[idx(x + ox, y + oy)]) arenaEntranceTiles.push(`${x},${y}`);
assert(arenaEntranceTiles.length === 1, `Arena has ${arenaEntranceTiles.length} entrances, expected 1 (${arenaEntranceTiles.join(' ')})`);
assert(regions.filter(r => r.kind === 'bright').length === 1, 'Bright biome must have one region');
const cycles = links.length - regions.length + 1;
const ascii = Array.from({ length: Math.ceil(H / 4) }, (_, sy) => Array.from({ length: Math.ceil(W / 4) }, (_, sx) => {
  let floor = '', wall = false; for (let y = sy * 4; y < Math.min(H, sy * 4 + 4); y++) for (let x = sx * 4; x < Math.min(W, sx * 4 + 4); x++) { floor ||= biome[idx(x, y)]; wall ||= !!walls[idx(x, y)]; }
  return floor ? ({ ruins: 'r', forest: 'f', bright: 'b', arena: 'a' }[floor]) : wall ? '#' : ' ';
}).join('')).join('\n');
const layer = (id, name, data) => ({ id, name, type: 'tilelayer', x: 0, y: 0, width: W, height: H, opacity: 1, visible: true, data });
const map = { compressionlevel: -1, height: H, width: W, infinite: false, layers: [layer(1, 'ground', ground), layer(2, 'deco', deco), layer(3, 'walls', walls), { id: 4, name: 'objects', type: 'objectgroup', x: 0, y: 0, opacity: 1, visible: true, draworder: 'topdown', objects }], nextlayerid: 5, nextobjectid: objectId, orientation: 'orthogonal', renderorder: 'right-down', tiledversion: '1.10.2', tileheight: TILE, tilewidth: TILE, tilesets: [{ firstgid: 1, source: undefined, columns: 8, image: 'biomes.png', imageheight: 96, imagewidth: 128, margin: 0, name: 'biomes', spacing: 0, tilecount: 48, tileheight: TILE, tilewidth: TILE }], type: 'map', version: '1.10' };
delete map.tilesets[0].source;
mkdirSync(dirname(output), { recursive: true }); writeFileSync(output, `${JSON.stringify(map, null, 2)}\n`);
console.log(`tiles jugables: ${seen.size}`); console.log(`nº regiones: ${regions.length}`); console.log(`ciclos: ${cycles}`); console.log(ascii);
