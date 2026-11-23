import { expect, test, type Page } from '@playwright/test';

async function startIntro(page: Page, map: number) {
  await page.goto(`/?skipIntro=1&map=${map}`);
  const play = page.getByRole('menuitem', { name: /JUGAR/ });
  await expect(play).toBeVisible();
  await page.evaluate(n => history.replaceState(null, '', `?map=${n}`), map);
  await play.click();
}

for (const map of [1, 2, 3]) {
  test(`la llegada usa el mapa ${map} y devuelve el control`, async ({ page }) => {
    await startIntro(page, map);
    const video = page.locator('video');
    await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.duration)).toBeCloseTo(70, 0);
    await video.evaluate((el: HTMLVideoElement) => { el.currentTime = el.duration - .4; });
    const objective = page.getByRole('status').filter({ hasText: 'Consigue pruebas y regresa.' });
    await expect(objective).toBeVisible();
    await expect(page.getByText('EL REVERSO', { exact: true })).toBeVisible();
    await page.waitForFunction(() => window.__game?.scene.isPaused('GameScene'));
    if (map === 2) await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.__game?.scene.isActive('GameScene'));
    await expect(objective).toBeVisible();
    const x = () => page.evaluate(() => (window.__game!.scene.getScene('GameScene') as import('../../src/scenes/GameScene').GameScene).player.x);
    const initial = await x();
    await page.keyboard.down('ArrowRight');
    try {
      await expect.poll(x).toBeGreaterThan(initial + 1);
    } finally { await page.keyboard.up('ArrowRight'); }
  });
}

test('un error de video conserva el encargo al entrar al juego', async ({ page }) => {
  await page.route('**/cine1.webm', r => r.abort());
  await startIntro(page, 1);
  await expect(page.getByRole('status').filter({ hasText: 'Investiga a La Banca.' })).toBeVisible();
  await page.waitForFunction(() => window.__game?.scene.isActive('GameScene'));
  await expect(page.locator('video')).toHaveCount(0);
});
