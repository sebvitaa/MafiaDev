import { expect, test } from '@playwright/test';

test('lab de audio, créditos y regreso al panel', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/?lab&skipIntro=1');
  await page.waitForFunction(() => window.__game?.scene.isActive('LabScene'), undefined, { timeout: 15_000 });

  await page.getByRole('button', { name: '▶ music-title' }).click();
  await page.getByRole('button', { name: 'sfx-jump' }).click();
  await page.getByRole('button', { name: 'Créditos' }).click();
  await page.waitForFunction(() => window.__game?.scene.isActive('CreditsScene'));
  await page.getByRole('button', { name: '◀ LAB' }).click();
  await page.waitForFunction(() => window.__game?.scene.isActive('LabScene'));

  expect(errors).toEqual([]);
});
