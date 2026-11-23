import { expect, test, type Page } from '@playwright/test';

const room = '/src/player/room-prototype/';

interface RoomState {
  x: number; y: number; attacks: number; status: string;
  marks: { name: string; x: number; y: number; number: string }[];
}

async function state(page: Page): Promise<RoomState> {
  return page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as any;
    return {
      x: scene.player.anchor.x as number, y: scene.player.anchor.y as number,
      attacks: scene.__attackCount as number,
      marks: scene.children.list.filter((child: any) => child.name?.startsWith('teleport-mark-'))
        .map((child: any) => ({ name: child.name as string, x: child.x as number, y: child.y as number,
          number: child.getByName('teleport-mark-number').text as string })),
      status: scene.children.getByName('teleport-status')?.text as string,
    };
  });
}

async function clickWorld(page: Page, x: number, y: number, button: 'left' | 'right') {
  const box = (await page.locator('canvas').boundingBox())!;
  await page.mouse.click(box.x + x * box.width / 960, box.y + y * box.height / 600, { button });
}

test.beforeEach(async ({ page }) => {
  const response = await page.request.get(room);
  test.skip(!(await response.text()).includes('id="room-prototype"'),
    'El laboratorio de Basti todavía no está integrado en esta rama; ver PEN-basti-20261123-122352.');
  await page.goto(room);
  await page.waitForFunction(() => (window.__game?.scene.getScene('RoomPrototype') as any)?.player);
  await page.waitForFunction(() => window.__game!.loop.frame > 5);
  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as any;
    scene.__attackCount = 0;
    const start = scene.player.attack.start.bind(scene.player.attack);
    scene.player.attack.start = (...args: any[]) => {
      const result = start(...args);
      if (result) scene.__attackCount++;
      return result;
    };
  });
});

test('1–4 hacen TP directo con números estables y comparten recarga con Q + clic', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const ready = () => expect.poll(async () => (await state(page)).status).toContain('| TP LISTO');
  await page.keyboard.press('1');
  expect((await state(page)).x).toBeCloseTo(480);
  await expect.poll(async () => (await state(page)).status).toContain('No hay una marca');

  await page.keyboard.down('q');
  for (const [x, y] of [[200, 400], [240, 480], [520, 480], [850, 400]]) {
    await clickWorld(page, x, y, 'right');
  }
  await page.keyboard.up('q');
  await expect.poll(async () => (await state(page)).marks.find((mark) => mark.number === '4')?.x).toBeCloseTo(850, -1);
  expect((await state(page)).marks.map((mark) => mark.number).sort()).toEqual(['1', '2', '3', '4']);
  await page.keyboard.press('1');
  await expect.poll(async () => (await state(page)).x).toBeCloseTo(200, -1);
  await page.keyboard.press('2');
  expect((await state(page)).x).toBeCloseTo(200, -1); // Comparte cooldown, no encadena de inmediato.
  await ready();
  await page.keyboard.press('2');
  await expect.poll(async () => (await state(page)).x).toBeCloseTo(240, -1);
  await ready();
  await page.keyboard.press('3');
  await expect.poll(async () => (await state(page)).x).toBeCloseTo(520, -1);

  await page.keyboard.down('q');
  await clickWorld(page, 480, 400, 'right'); // Quinta marca reemplaza la tecla 1.
  await expect.poll(async () => (await state(page)).marks.find((mark) => mark.name === 'teleport-mark-5')?.x).toBeCloseTo(480, -1);
  const replacement = (await state(page)).marks.find((mark) => mark.name === 'teleport-mark-5')!;
  expect(replacement.number).toBe('1');
  expect((await state(page)).marks.find((mark) => mark.name === 'teleport-mark-2')?.number).toBe('2');
  await ready();
  await page.keyboard.press('4'); // También funciona manteniendo Q.
  await expect.poll(async () => (await state(page)).x).toBeCloseTo(850, -1);
  await clickWorld(page, 240, 480, 'left');
  expect((await state(page)).x).toBeCloseTo(850, -1);
  await ready();
  await clickWorld(page, 240, 480, 'left');
  await expect.poll(async () => (await state(page)).x).toBeCloseTo(240, -1);
  await page.keyboard.up('q');
  await ready();
  await page.keyboard.press('1');
  await expect.poll(async () => (await state(page)).x).toBeCloseTo(480, -1);

  await page.keyboard.press('r');
  await expect.poll(async () => (await state(page)).marks.length).toBe(0);
  await page.keyboard.press('1');
  expect((await state(page)).x).toBeCloseTo(480);
  await page.keyboard.down('q');
  await clickWorld(page, 200, 400, 'right');
  await page.keyboard.up('q');
  await expect.poll(async () => (await state(page)).marks[0]?.x).toBeCloseTo(200, -1);
  await page.keyboard.press('1');
  await expect.poll(async () => (await state(page)).x).toBeCloseTo(200, -1);
  expect(errors).toEqual([]);
});

test('Q reserva los clics; cuatro marcas, quinta reemplaza, TP reutilizable con 500 ms', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.evaluate(() => (window.__game!.scene.getScene('RoomPrototype') as any).player.equipSword());
  await clickWorld(page, 200, 400, 'right');
  expect((await state(page)).marks).toHaveLength(0);
  await clickWorld(page, 200, 400, 'left');
  await expect.poll(async () => (await state(page)).attacks).toBe(1);
  await page.waitForTimeout(300);

  await page.keyboard.down('q');
  await clickWorld(page, 200, 400, 'left');
  expect((await state(page)).attacks).toBe(1);
  expect((await state(page)).x).toBeCloseTo(480);
  const points = [[200, 400], [240, 480], [520, 480], [850, 400], [480, 300]];
  for (const [x, y] of points) await clickWorld(page, x, y, 'right');
  await expect.poll(async () => (await state(page)).marks.length).toBe(4);
  await expect.poll(async () => (await state(page)).marks.find((mark) => mark.name === 'teleport-mark-4')?.x).toBeCloseTo(850, -1);
  expect((await state(page)).marks.map((mark) => mark.name).sort()).toEqual([
    'teleport-mark-2', 'teleport-mark-3', 'teleport-mark-4', 'teleport-mark-5',
  ]);
  await clickWorld(page, 240, 480, 'left');
  await expect.poll(async () => (await state(page)).x).toBeCloseTo(240, -1);
  expect((await state(page)).y).toBeCloseTo(480, -1);
  await clickWorld(page, 520, 480, 'left');
  expect((await state(page)).x).toBeCloseTo(240, -1);
  await page.waitForTimeout(550);
  await clickWorld(page, 520, 480, 'left');
  await expect.poll(async () => (await state(page)).x).toBeCloseTo(520, -1);
  await page.waitForTimeout(550);
  await clickWorld(page, 240, 480, 'left');
  await expect.poll(async () => (await state(page)).x).toBeCloseTo(240, -1);
  expect((await state(page)).marks).toHaveLength(4);
  expect((await state(page)).attacks).toBe(1);
  await page.keyboard.up('q');
  await clickWorld(page, 100, 400, 'left');
  await expect.poll(async () => (await state(page)).attacks).toBe(2);
  expect(errors).toEqual([]);
});

test('papel se detiene en el pilar; llegada libre y rechazo si se sella el destino', async ({ page }) => {
  await page.keyboard.down('q');
  await clickWorld(page, 320, 270, 'right');
  await page.waitForTimeout(500);
  const mark = (await state(page)).marks[0];
  expect(mark.x).not.toBeCloseTo(320); // Se quedó en el borde del obstáculo.
  await clickWorld(page, mark.x, mark.y, 'left');
  const landed = await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as any;
    const a = scene.player.body;
    return [...scene.physics.world.staticBodies].some((b: any) => a.x < b.x + b.width
      && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y);
  });
  expect(landed).toBe(false);
  await page.waitForTimeout(550);
  await clickWorld(page, 500, 400, 'right');
  await expect.poll(async () => (await state(page)).marks.find((mark) => mark.name === 'teleport-mark-2')?.x).toBeCloseTo(500, -1);
  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as any;
    const blocker = scene.add.rectangle(500, 400, 180, 180, 0x443344);
    scene.physics.add.existing(blocker, true);
  });
  const before = await state(page);
  await clickWorld(page, 500, 400, 'left');
  const after = await state(page);
  expect(after.x).toBeCloseTo(before.x);
  expect(after.y).toBeCloseTo(before.y);
  await expect.poll(async () => (await state(page)).status).toContain('No hay espacio seguro');
  expect(after.status).toContain('TP LISTO');
});

test('marca sigue al enemigo, TP llega a su lado, limpia muerte y reinicio', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as any;
    const enemy = scene.add.rectangle(760, 400, 40, 40, 0xd56a68).setName('test-enemy');
    scene.physics.add.existing(enemy);
    enemy.setData('teleportTarget', true); // Contrato de registerTeleportTarget.
    enemy.body.setAllowGravity(false);
  });
  await page.keyboard.down('q');
  await clickWorld(page, 850, 400, 'right');
  await page.waitForTimeout(500);
  const initial = (await state(page)).marks[0];
  expect(initial.x).toBeLessThan(760);
  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as any;
    scene.children.getByName('test-enemy').body.setVelocityY(60);
  });
  await page.waitForTimeout(400);
  const moved = (await state(page)).marks[0];
  expect(moved.y).toBeGreaterThan(initial.y + 10);
  await clickWorld(page, moved.x, moved.y, 'left');
  expect((await state(page)).x).toBeGreaterThan(700);
  const overlap = await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as any;
    const a = scene.player.body, b = scene.children.getByName('test-enemy').body;
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  });
  expect(overlap).toBe(false);
  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as any;
    scene.children.getByName('test-enemy').body.enable = false;
  });
  await expect.poll(async () => (await state(page)).marks.length).toBe(0);
  await page.keyboard.up('q');
  await page.keyboard.press('r');
  await expect.poll(async () => (await state(page)).x).toBeCloseTo(480);
  await page.keyboard.down('q');
  await clickWorld(page, 200, 400, 'right');
  await expect.poll(async () => (await state(page)).marks.length).toBe(1);
  expect(errors).toEqual([]);
});
