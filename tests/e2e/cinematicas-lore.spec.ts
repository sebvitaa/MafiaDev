import { expect, test, type Page } from '@playwright/test';

async function menu(page: Page) {
  await page.goto('/?skipIntro=1');
  await expect(page.getByRole('menuitem', { name: /JUGAR/ })).toBeVisible();
  // Only skip the boot animation for this test. Exercise normal game selection below.
  await page.evaluate(() => history.replaceState(null, '', location.pathname));
}
async function playing(page: Page) {
  await page.waitForFunction(() => window.__game?.scene.isActive('GameScene'));
  await expect(page.locator('video')).toHaveCount(0);
}

test('La Nota reproduce video y Escape devuelve el control al jugador', async ({ page }) => {
  await menu(page);
  await page.getByRole('menuitem', { name: /JUGAR/ }).click();
  const video = page.locator('video');
  await expect(video).toHaveAttribute('aria-label', 'La Nota');
  await expect.poll(() => video.evaluate(v => (v as HTMLVideoElement).currentTime)).toBeGreaterThan(.3);
  await page.keyboard.press('Escape');
  await playing(page);
  expect(await page.evaluate(() => window.__game?.scene.isActive('PauseScene'))).toBe(false);
});

test('el acceso al escenario final reproduce los diez segundos y continúa', async ({ page }) => {
  await menu(page);
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('menuitem', { name: /2 · MITAD/ })).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('menuitem', { name: /3 · FINAL/ })).toBeVisible();
  await page.keyboard.press('Enter');
  const video = page.locator('video');
  await expect(video).toHaveAttribute('aria-label', 'La Última Apuesta');
  await expect.poll(() => video.evaluate(v => (v as HTMLVideoElement).currentTime)).toBeGreaterThan(.3);
  await playing(page);
  expect(await page.evaluate(() => window.__game?.registry.get('stage'))).toBe(3);
});

test('El Set pausa y reanuda la partida una sola vez', async ({ page }) => {
  await menu(page);
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('menuitem', { name: /2 · MITAD/ })).toBeVisible();
  await page.keyboard.press('Enter');
  await playing(page);
  await page.waitForFunction(() => window.__game?.scene.isActive('HudScene'));
  const enter = (roomId: string) => page.evaluate(async (roomId) => {
    const url = '/src/core/EventBus.ts';
    const { bus } = await import(/* @vite-ignore */ url);
    bus.emit('room:entered', { roomId, zone: 'zone1' });
  }, roomId);
  await enter('tutorial');
  await expect(page.locator('video')).toHaveCount(0);
  await enter('set');
  await expect(page.locator('video')).toHaveAttribute('aria-label', 'La Última Apuesta');
  expect(await page.evaluate(() => window.__game?.scene.isPaused('GameScene'))).toBe(true);
  await page.keyboard.press('Enter');
  await playing(page);
  await enter('set');
  await expect(page.locator('video')).toHaveCount(0);
  expect(await page.evaluate(() => window.__game?.scene.isActive('HudScene'))).toBe(true);
});
