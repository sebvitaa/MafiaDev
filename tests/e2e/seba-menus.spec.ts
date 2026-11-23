import { expect, test, type Page } from '@playwright/test';

// Flujo de seba: apertura (logo Codex → logo → flexiones) → título → menú → opciones → escenario 1 → pausa → juego, sin errores.
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
  await page.waitForTimeout(2300);
  await key(page, 'x'); // flexión en la pantalla de carga (X no salta la apertura)
  expect(await page.evaluate(() => Number(localStorage.getItem('mafiadev.pushups.best') ?? 0))).toBeGreaterThanOrEqual(0);
  await active(page, 'TitleScene');
  await page.waitForTimeout(1600);
  await shot(page, '2-titulo');
  await key(page, 'Enter'); // «pulsa cualquier tecla»: desbloquea audio y muestra el menú
  await page.waitForTimeout(600);
  await shot(page, '3-menu');

  // Opciones desde el título y volver
  await key(page, 'ArrowDown'); // JUGAR → OPCIONES (CONTINUAR oculto sin partida)
  await key(page, 'Enter');
  await active(page, 'OptionsScene');
  await key(page, 'ArrowDown'); // MÚSICA (por defecto 35 %)
  await key(page, 'ArrowLeft'); // −5 %
  await page.waitForTimeout(200);
  await shot(page, '4-opciones');
  const music = await page.evaluate(() => JSON.parse(localStorage.getItem('mafiadev.settings.v1') ?? '{}').music);
  expect(music).toBeCloseTo(0.3);
  await key(page, 'Escape');
  await page.waitForFunction(() => !(window as any).__game.scene.isActive('OptionsScene'));

  await key(page, 'ArrowUp'); // JUGAR
  await key(page, 'ArrowRight'); // escenario 2
  await key(page, 'ArrowRight'); // escenario 3
  await key(page, 'ArrowRight'); // vuelve al 1 (cíclico)
  await key(page, 'ArrowRight'); // escenario 2
  await shot(page, '4b-escenario');
  await key(page, 'Enter'); // sin partida: no pide confirmación
  await active(page, 'GameScene');
  expect(await page.evaluate(() => (window as any).__game.registry.get('stage'))).toBe(2);
  await active(page, 'HudScene');
  await page.waitForTimeout(1500);
  await shot(page, '5-juego-tutorial');

  await key(page, 'Escape');
  await active(page, 'PauseScene');
  await page.waitForTimeout(250);
  await shot(page, '6-pausa');
  await key(page, 'Escape'); // ESC = continuar (vuelve degradando la música)
  await page.waitForFunction(() => !(window as any).__game.scene.isActive('PauseScene'));
  expect(await page.evaluate(() => (window as any).__game.scene.isActive('GameScene'))).toBe(true);

  expect(errors).toEqual([]);
});
