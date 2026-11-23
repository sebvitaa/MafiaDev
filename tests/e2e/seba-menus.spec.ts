import { expect, test, type Page } from '@playwright/test';

// Flujo de seba: apertura → título → menú → juego → pausa → opciones → juego, sin errores de consola.
const SHOTS: string | undefined = (globalThis as any).process?.env?.SEBA_SHOTS; // carpeta opcional para capturas de revisión visual

const active = (page: Page, key: string) =>
  page.waitForFunction((k) => (window as any).__game?.scene.isActive(k), key, { timeout: 10_000 });
// Teclas con ritmo humano: Phaser procesa la cola de teclado una vez por frame.
const key = async (page: Page, k: string) => { await page.keyboard.press(k); await page.waitForTimeout(120); };
const shot = async (page: Page, name: string) => { if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png` }); };

test('apertura, título, menú, pausa y opciones', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/');
  await page.waitForTimeout(1300);
  await shot(page, '1-apertura');
  await active(page, 'TitleScene');
  await page.waitForTimeout(1600);
  await shot(page, '2-titulo');
  await key(page, 'Enter'); // «pulsa cualquier tecla»: desbloquea audio y muestra el menú
  await page.waitForTimeout(600);
  await shot(page, '3-menu');

  // Opciones desde el título y volver
  await key(page, 'ArrowDown'); // JUGAR → OPCIONES (CONTINUAR deshabilitado sin partida)
  await key(page, 'Enter');
  await active(page, 'OptionsScene');
  await key(page, 'ArrowDown'); // MUSICA
  await key(page, 'ArrowLeft');
  await page.waitForTimeout(200);
  await shot(page, '4-opciones');
  const music = await page.evaluate(() => JSON.parse(localStorage.getItem('mafiadev.settings.v1') ?? '{}').music);
  expect(music).toBeCloseTo(0.6);
  await key(page, 'Escape');
  await page.waitForFunction(() => !(window as any).__game.scene.isActive('OptionsScene'));

  await key(page, 'ArrowUp'); // JUGAR
  await key(page, 'Enter');
  await active(page, 'GameScene');
  await active(page, 'HudScene');
  await page.waitForTimeout(1500);
  await shot(page, '5-juego-tutorial');

  await key(page, 'Escape');
  await active(page, 'PauseScene');
  await page.waitForTimeout(250);
  await shot(page, '6-pausa');
  await key(page, 'Escape');
  await page.waitForFunction(() => !(window as any).__game.scene.isActive('PauseScene'));
  expect(await page.evaluate(() => (window as any).__game.scene.isActive('GameScene'))).toBe(true);

  expect(errors).toEqual([]);
});
