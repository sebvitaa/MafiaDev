import { expect, test, type Page } from '@playwright/test';

// Dominio vicho (V13): mundo abierto — zonas, hoguera y respawn. Teletransporta el punto de suelo del jugador.
const scene = 'GameScene';
const BUS = '/src/core/EventBus.ts'; // módulo servido por Vite; ruta en variable para que tsc no la resuelva
const tp = (page: Page, x: number, y: number) =>
  page.evaluate(([x, y]) => (window as any).__game.scene.getScene('GameScene').player.body.reset(x, y), [x, y]);
const pos = (page: Page) =>
  page.evaluate(() => { const p = (window as any).__game.scene.getScene('GameScene').player; return { x: p.x, y: p.y }; });
const events = (page: Page) => page.evaluate(() => (window as any).__ev as [string, any][]);

for (const m of [1, 2, 3]) test(`cruzar zonas emite zone:changed; descansar y morir reaparece en la hoguera (mapa ${m})`, async ({ page }) => {
  await page.goto(`/?skipIntro=1&map=${m}`);
  await page.evaluate(() => localStorage.clear());
  await page.goto(`/?skipIntro=1&map=${m}`);
  await page.waitForFunction(() => (window as any).__game?.scene.isActive('TitleScene'));
  await page.evaluate(async (path) => {
    const { bus } = await import(/* @vite-ignore */ path);
    const ev: [string, unknown][] = ((window as any).__ev = []);
    for (const e of ['zone:changed', 'room:entered', 'checkpoint:reached', 'player:respawned'] as const) bus.on(e, (p: unknown) => ev.push([e, p]));
  }, BUS);
  await page.keyboard.press('Space');
  await page.waitForFunction((s) => (window as any).__game?.scene.isActive(s), scene);
  await page.waitForTimeout(300);

  const map = await page.evaluate(() => (window as any).__game.cache.tilemap.get('world').data);
  const objs = map.layers.find((l: any) => l.name === 'objects').objects as any[];
  const byName = (n: string) => objs.find((o) => o.name === n);

  // El spawn está en el área tutorial y sobre la hoguera cp1.
  await page.keyboard.press('KeyE');
  await page.waitForTimeout(200);
  const zone2 = byName('zone2');
  await tp(page, zone2.x + zone2.width / 2, byName('cp3').y + 20);
  await page.waitForTimeout(300);

  const ev = await events(page);
  expect(ev).toContainEqual(['room:entered', { roomId: 'tutorial', zone: 'zone1' }]);
  expect(ev).toContainEqual(['checkpoint:reached', { id: 'cp1' }]);
  expect(ev).toContainEqual(['zone:changed', { zone: 'zone2' }]);

  await page.evaluate(async (path) => (await import(/* @vite-ignore */ path)).bus.emit('player:died', {}), BUS);
  await expect.poll(async () => (await events(page)).filter(([e]) => e === 'player:respawned').length, { timeout: 8000 }).toBe(1);
  const cp1 = byName('cp1');
  const p = await pos(page);
  expect(Math.hypot(p.x - cp1.x, p.y - cp1.y)).toBeLessThan(24);
});
