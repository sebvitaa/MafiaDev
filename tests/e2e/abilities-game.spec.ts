import { expect, test, type Page } from '@playwright/test';

async function playerX(page: Page): Promise<number> {
  return page.evaluate(() => (window.__game!.scene.getScene('GameScene') as any).player.x);
}

async function clickWorld(page: Page, x: number, y: number, button: 'left' | 'right') {
  const box = (await page.locator('canvas').boundingBox())!;
  await page.mouse.click(box.x + x * box.width / 480, box.y + y * box.height / 270, { button });
}

// Verificación independiente del laboratorio de Basti: usa el Player y GameScene reales de main.
test('Luchador usa cuatro marcas, teclas 1–4 y Q + mouse con recarga compartida', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?skipIntro=1');
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await page.keyboard.press('Space');
  await page.waitForFunction(() => window.__game?.scene.isActive('GameScene'));
  // Aislar la habilidad de gravedad/cámara durante el escenario de prueba.
  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('GameScene') as any;
    scene.player.body.setAllowGravity(false);
    scene.player.body.reset(48, 230);
    scene.cameras.main.stopFollow().setScroll(0, 0);
  });
  const ready = () => page.waitForFunction(() => {
    const scene = window.__game!.scene.getScene('GameScene') as any;
    return scene.children.getByName('teleport-status').text.includes('| TP LISTO');
  });

  await page.keyboard.down('q');
  for (const x of [80, 160, 240, 320]) await clickWorld(page, x, 230, 'right');
  await page.keyboard.up('q');
  await page.waitForFunction(() => {
    const scene = window.__game!.scene.getScene('GameScene') as any;
    return Math.abs((scene.children.getByName('teleport-mark-4')?.x ?? 0) - 320) < 3;
  });
  expect(await playerX(page)).toBeCloseTo(48);
  await page.keyboard.press('1');
  await expect.poll(() => playerX(page)).toBeCloseTo(80, -1);
  await page.keyboard.press('2');
  expect(await playerX(page)).toBeCloseTo(80, -1);
  for (const [key, x] of [['2', 160], ['3', 240], ['4', 320]] as const) {
    await ready();
    await page.keyboard.press(key);
    await expect.poll(() => playerX(page)).toBeCloseTo(x, -1);
  }
  await page.keyboard.down('q');
  await clickWorld(page, 80, 230, 'left');
  expect(await playerX(page)).toBeCloseTo(320, -1);
  await ready();
  await clickWorld(page, 80, 230, 'left');
  await expect.poll(() => playerX(page)).toBeCloseTo(80, -1);
  await page.keyboard.up('q');
  expect(errors).toEqual([]);
});
