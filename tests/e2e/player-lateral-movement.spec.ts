import { expect, test, type Page } from '@playwright/test';
import type { GameScene } from '../../src/scenes/GameScene';

async function playerState(page: Page) {
  return page.evaluate(() => {
    const p = (window.__game!.scene.getScene('GameScene') as GameScene).player;
    return { x: p.x, y: p.y, vx: p.body.velocity.x, vy: p.body.velocity.y,
      state: p.fsm.current, invulnerable: p.isInvulnerable, airJumps: p.airJumps,
      gravity: p.body.allowGravity, cooldown: p.dash.cooldownRemainingMs };
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await page.keyboard.press('Space');
  await page.waitForFunction(() => window.__game?.scene.isActive('GameScene'));
  await expect.poll(async () => (await playerState(page)).vy).toBe(0);
});

test('Shift corre sin disparar dash y conserva salto y doble salto', async ({ page }) => {
  await page.keyboard.down('d');
  await expect.poll(async () => (await playerState(page)).vx).toBe(120);
  await page.keyboard.down('Shift');
  await expect.poll(async () => (await playerState(page)).vx).toBe(198);
  expect((await playerState(page)).state).not.toBe('dash');
  await page.keyboard.up('Shift');
  await expect.poll(async () => (await playerState(page)).vx).toBe(120);
  await page.keyboard.up('d');
  await page.keyboard.down('Space');
  await expect.poll(async () => (await playerState(page)).vy).toBeLessThan(0);
  await page.keyboard.up('Space');
  await page.waitForTimeout(40);
  await page.keyboard.down('z');
  await expect.poll(async () => (await playerState(page)).airJumps).toBe(0);
  await page.keyboard.up('z');
});

test('dash tiene fin, invulnerabilidad temporal y no se repite al mantener C', async ({ page }) => {
  const before = await playerState(page);
  await page.keyboard.down('c');
  await expect.poll(async () => (await playerState(page)).state, { intervals: [10] }).toBe('dash');
  const active = await playerState(page);
  expect(active.vx).toBe(360);
  expect(active.gravity).toBe(false);
  expect(active.invulnerable).toBe(true);
  await expect.poll(async () => (await playerState(page)).state).not.toBe('dash');
  const ended = await playerState(page);
  expect(ended.gravity).toBe(true);
  expect(ended.invulnerable).toBe(false);
  expect(ended.cooldown).toBeGreaterThan(0);
  await page.keyboard.press('k');
  expect((await playerState(page)).state).not.toBe('dash');
  await page.waitForTimeout(600);
  const held = await playerState(page);
  expect(held.state).not.toBe('dash');
  expect(held.x - before.x).toBeGreaterThan(25);
  expect(held.x - before.x).toBeLessThan(75);
  await page.keyboard.up('c');
  await page.keyboard.down('a');
  await page.keyboard.down('k');
  await expect.poll(async () => (await playerState(page)).vx, { intervals: [10] }).toBe(-360);
  await page.keyboard.up('k');
  await page.keyboard.up('a');
});

test('dash aéreo conserva saltos y restaura gravedad; las paredes siguen bloqueando', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.keyboard.down('Space');
  await expect.poll(async () => (await playerState(page)).vy).toBeLessThan(0);
  const jumping = await playerState(page);
  await page.keyboard.down('c');
  await expect.poll(async () => (await playerState(page)).state, { intervals: [10] }).toBe('dash');
  expect((await playerState(page)).airJumps).toBe(jumping.airJumps);
  await page.keyboard.up('c');
  await page.keyboard.up('Space');
  await expect.poll(async () => (await playerState(page)).gravity).toBe(true);
  await expect.poll(async () => (await playerState(page)).cooldown).toBe(0);
  await page.evaluate(() => {
    const p = (window.__game!.scene.getScene('GameScene') as GameScene).player;
    p.body.reset(950, 230);
  });
  await page.keyboard.down('d');
  await page.keyboard.press('k');
  await page.waitForTimeout(250);
  expect((await playerState(page)).x).toBeLessThanOrEqual(954);
  await page.keyboard.up('d');
  expect(errors).toEqual([]);
});
