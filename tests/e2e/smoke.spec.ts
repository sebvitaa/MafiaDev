import { expect, test } from '@playwright/test';

// Smoke: boot → title → game → el jugador se mueve → sin errores de consola.
test('arranca, entra al juego y el jugador se mueve', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/');
  await page.waitForFunction(() => (window as any).__game?.scene.isActive('TitleScene'));
  await page.keyboard.press('Space');
  await page.waitForFunction(() => (window as any).__game?.scene.isActive('GameScene'));
  await page.waitForTimeout(300); // que el jugador aterrice

  const x0 = await page.evaluate(() => (window as any).__game.scene.getScene('GameScene').player.x as number);
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(600);
  await page.keyboard.up('ArrowRight');
  const x1 = await page.evaluate(() => (window as any).__game.scene.getScene('GameScene').player.x as number);

  expect(x1).toBeGreaterThan(x0 + 20);
  expect(errors).toEqual([]);
});
