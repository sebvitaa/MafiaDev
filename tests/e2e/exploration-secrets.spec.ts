import { expect, test, type Page } from '@playwright/test';

// Dominio vicho (V16, V17, V20, V23): pared ilusoria, atajo de un solo sentido, coleccionables y viaje rápido.
type Obj = { name: string; type: string; x: number; y: number; width?: number; height?: number; properties?: { name: string; value: unknown }[] };

const tp = (page: Page, x: number, y: number) =>
  page.evaluate(([x, y]) => (window as any).__game.scene.getScene('GameScene').player.body.reset(x, y), [x, y]);
const pos = (page: Page) =>
  page.evaluate(() => { const p = (window as any).__game.scene.getScene('GameScene').player; return { x: p.x, y: p.y }; });
const wallAt = (page: Page, x: number, y: number) =>
  page.evaluate(([x, y]) => (window as any).__game.scene.getScene('GameScene').children.list
    .some((o: any) => o.layer?.name === 'walls' && o.getTileAtWorldXY(x, y)), [x, y]);
const texts = (page: Page) =>
  page.evaluate(() => (window as any).__game.scene.getScene('GameScene').children.list.filter((o: any) => o.type === 'Text').map((o: any) => o.text as string) as string[]);
const press = async (page: Page, key: string) => { await page.keyboard.press(key); await page.waitForTimeout(150); };

for (const m of [1, 2, 3]) test(`pared ilusoria, atajo, coleccionable y viaje rápido (mapa ${m})`, async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto(`/?skipIntro=1&map=${m}&noEnemies=1`);
  await page.evaluate(() => localStorage.clear());
  await page.goto(`/?skipIntro=1&map=${m}&noEnemies=1`);
  await page.waitForFunction(() => (window as any).__game?.scene.isActive('TitleScene'));
  await page.keyboard.press('Space');
  await page.waitForFunction(() => (window as any).__game?.scene.isActive('GameScene'));
  await page.keyboard.press('KeyT');

  const objs: Obj[] = await page.evaluate(() =>
    (window as any).__game.cache.tilemap.get('world').data.layers.find((l: any) => l.name === 'objects').objects);
  const one = (name: string) => objs.find((o) => o.name === name)!;

  // V16: la pared ilusoria bloquea hasta interactuar con E.
  const fw = one('fw1');
  const fwc = { x: fw.x + fw.width! / 2, y: fw.y + fw.height! / 2 };
  expect(await wallAt(page, fwc.x, fwc.y)).toBe(true);
  await tp(page, fw.x - 10, fwc.y);
  await press(page, 'KeyE');
  expect(await wallAt(page, fwc.x, fwc.y)).toBe(false);

  // V17: el atajo no se abre desde el lado equivocado y sí desde el correcto ("from").
  const sc = one('sc1');
  const from = sc.properties!.find((p) => p.name === 'from')!.value as string;
  const scc = { x: sc.x + sc.width! / 2, y: sc.y + sc.height! / 2 };
  const side = (s: string, k: number) => s === 'east' ? { x: sc.x + sc.width! + k, y: scc.y } : s === 'west' ? { x: sc.x - k, y: scc.y }
    : s === 'north' ? { x: scc.x, y: sc.y - k } : { x: scc.x, y: sc.y + sc.height! + k };
  const opposite = { east: 'west', west: 'east', north: 'south', south: 'north' }[from]!;
  let p = side(opposite, 8); await tp(page, p.x, p.y); await press(page, 'KeyE');
  expect(await wallAt(page, scc.x, scc.y)).toBe(true);
  expect(await texts(page)).toContain('No se abre desde este lado');
  p = side(from, 8); await tp(page, p.x, p.y); await press(page, 'KeyE');
  expect(await wallAt(page, scc.x, scc.y)).toBe(false);

  // V20: tocar un coleccionable lo recoge.
  const col = objs.find((o) => o.type === 'collectible')!;
  await tp(page, col.x, col.y);
  await page.waitForTimeout(150);
  expect((await texts(page)).some((t) => /^Fragmento 1\/\d+$/.test(t))).toBe(true);

  // V23: con dos hogueras encendidas, F viaja de una a otra.
  const cp1 = one('cp1'), cp2 = one('cp2');
  await tp(page, cp2.x, cp2.y + 10); await press(page, 'KeyE');
  await tp(page, cp1.x, cp1.y + 10); await press(page, 'KeyE');
  await press(page, 'KeyF');
  await page.waitForTimeout(700);
  const at = await pos(page);
  expect(Math.hypot(at.x - cp2.x, at.y - cp2.y)).toBeLessThan(24);
});
