import { expect, test, type Page } from '@playwright/test';

async function playerX(page: Page): Promise<number> {
  return page.evaluate(() => (window.__game!.scene.getScene('GameScene') as any).player.x);
}

// Mundo → pantalla con la cámara real (zoom 0.75 del mundo cenital).
async function toScreen(page: Page, x: number, y: number) {
  const box = (await page.locator('canvas').boundingBox())!;
  const s = await page.evaluate(([x, y]) => {
    const cam = window.__game!.scene.getScene('GameScene').cameras.main;
    return { x: (x - cam.worldView.x) * cam.zoom + cam.x, y: (y - cam.worldView.y) * cam.zoom + cam.y };
  }, [x, y]);
  return { x: box.x + s.x * box.width / 480, y: box.y + s.y * box.height / 270 };
}
async function clickWorld(page: Page, x: number, y: number, button: 'left' | 'right') {
  const p = await toScreen(page, x, y);
  await page.mouse.click(p.x, p.y, { button });
}

// Verificación independiente del laboratorio de Basti: usa el Player y GameScene reales de main.
test('Luchador usa cuatro marcas, teclas 1–4 y Q + mouse con recarga compartida', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?skipIntro=1&map=1&noEnemies=1');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/?skipIntro=1&map=1&noEnemies=1');
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await page.keyboard.press('Space');
  await page.waitForFunction(() => window.__game?.scene.isActive('GameScene'));
  await page.keyboard.press('KeyT'); // sin tutorial
  // Sala de inicio del mapa 1: marcas en fila a ambos lados del spawn, cámara fija centrada.
  const S = await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('GameScene') as any;
    const cam = scene.cameras.main.stopFollow();
    cam.centerOn(scene.player.x, scene.player.y);
    return { x: Math.round(scene.player.x), y: Math.round(scene.player.y) };
  });
  await page.waitForTimeout(100);
  const [A, B, C, D] = [S.x - 100, S.x - 50, S.x + 50, S.x + 100];
  const ready = async () => {
    // La posición cambia en el input; el HUD se sincroniza al terminar el frame.
    await page.evaluate(() => new Promise<void>((resolve) => {
      window.__game!.scene.getScene('GameScene').events.once('postupdate', () => resolve());
    }));
    await page.waitForFunction(() => {
      const scene = window.__game!.scene.getScene('GameScene') as any;
      return scene.children.getByName('teleport-status').text.includes('| TP LISTO');
    });
  };

  await page.keyboard.down('q');
  for (const x of [A, B, C, D]) await clickWorld(page, x, S.y, 'right');
  await page.keyboard.up('q');
  await page.waitForFunction((d) => Math.abs(((window.__game!.scene.getScene('GameScene') as any).children.getByName('teleport-mark-4')?.x ?? 0) - d) < 3, D);
  expect(await playerX(page)).toBeCloseTo(S.x, -1);
  await page.keyboard.press('1');
  await expect.poll(() => playerX(page)).toBeCloseTo(A, -1);
  for (const [key, x] of [['2', B], ['3', C], ['4', D]] as const) {
    await ready();
    await page.keyboard.press(key);
    // Sondeo por frame: expect.poll tarda ~400 ms y el clic siguiente debe caer dentro de la recarga de 500 ms.
    await page.waitForFunction((x) => Math.abs((window.__game!.scene.getScene('GameScene') as any).player.x - x) < 5, x, { polling: 'raf' });
  }
  await page.keyboard.down('q');
  // La recarga compartida tecla/clic se verifica sin carreras de tiempo en abilities-marks (lab).
  await ready();
  await clickWorld(page, A, S.y, 'left');
  await expect.poll(() => playerX(page)).toBeCloseTo(A, -1);
  await page.keyboard.up('q');
  expect(errors).toEqual([]);
});
