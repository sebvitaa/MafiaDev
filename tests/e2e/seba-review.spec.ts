import { expect, test } from '@playwright/test';

// Página de revisión de audio (fuera del juego): lista todas las pistas, reproduce y filtra sin errores.
test('página de revisión de audio', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

  await page.goto('/assets/audio/review.html');
  const rows = page.locator('#track-list > *');
  await expect(rows.first()).toBeVisible();
  expect(await rows.count()).toBeGreaterThanOrEqual(30);

  await rows.first().locator('button').first().click();
  await page.waitForTimeout(300);
  await page.keyboard.press('Escape');

  await page.fill('#search', 'jefe');
  const visible = await rows.evaluateAll((els) => els.filter((e) => !(e as HTMLElement).hidden).length);
  expect(visible).toBeGreaterThan(0);
  expect(visible).toBeLessThan(await rows.count());

  expect(errors).toEqual([]);
});
