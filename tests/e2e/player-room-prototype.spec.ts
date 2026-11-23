import { expect, test, type Page } from '@playwright/test';
import type { RoomScene } from '../../src/player/room-prototype/RoomScene';
import type Phaser from 'phaser';

const errors = new WeakMap<Page, string[]>();
async function state(page: Page) {
  return page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
    const { player: p } = scene;
    return { x: p.anchor.x, y: p.anchor.y, vx: p.body.velocity.x, vy: p.body.velocity.y,
      z: p.motion.height, visualY: p.visual.y, shadowX: p.shadow.x, shadowY: p.shadow.y,
      depth: p.visual.depth, obstacleDepth: scene.obstacles[0].depth,
      airJumps: p.motion.airJumpsRemaining, dash: p.motion.dash.active,
      cooldown: p.motion.dash.cooldownRemainingMs,
      trails: scene.children.list.filter((o) => o.name === 'room-dash-trail' && (o as Phaser.GameObjects.Graphics).visible).length,
      scrollX: scene.cameras.main.scrollX, scrollY: scene.cameras.main.scrollY,
      zoom: scene.cameras.main.zoom,
      // Phaser 4.2.1 exposes rotation at runtime but omits it from the Camera declaration.
      rotation: (scene.cameras.main as typeof scene.cameras.main & { rotation: number }).rotation };
  });
}
async function place(page: Page, x: number, y: number) {
  await page.evaluate(({ x, y }) => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
    scene.player.body.reset(x, y);
  }, { x, y });
}

test.beforeEach(async ({ page }) => {
  const messages: string[] = [];
  errors.set(page, messages);
  page.on('pageerror', (e) => messages.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') messages.push(m.text()); });
  await page.goto('/src/player/room-prototype/');
  await page.waitForFunction(() => window.__game?.scene.isActive('RoomPrototype'));
});
test.afterEach(async ({ page }) => { expect(errors.get(page)).toEqual([]); });

test('cámara fija encuadra la sala mientras WASD, flechas y carrera mueven al personaje', async ({ page }) => {
  await page.screenshot({ path: 'test-results/room-prototype.png', fullPage: true });
  const before = await state(page);
  await page.keyboard.down('w');
  await page.keyboard.down('d');
  await expect.poll(async () => {
    const s = await state(page); return Math.hypot(s.vx, s.vy);
  }).toBeCloseTo(150);
  let s = await state(page);
  expect(Math.hypot(s.vx, s.vy)).toBeCloseTo(150);
  await page.keyboard.down('Shift');
  await expect.poll(async () => {
    const s = await state(page); return Math.hypot(s.vx, s.vy);
  }).toBeCloseTo(247.5);
  expect((await state(page)).dash).toBe(false);
  await page.waitForTimeout(250);
  await page.keyboard.up('w');
  await page.keyboard.up('d');
  await page.keyboard.up('Shift');
  s = await state(page);
  expect(s.x).toBeGreaterThan(before.x + 20);
  expect(s.y).toBeLessThan(before.y - 20);
  expect([s.scrollX, s.scrollY, s.zoom, s.rotation]).toEqual([0, 0, 1, 0]);
  await page.keyboard.down('ArrowLeft');
  await page.keyboard.down('ArrowDown');
  await expect.poll(async () => (await state(page)).vx).toBeLessThan(0);
  expect((await state(page)).vy).toBeGreaterThan(0);
});

test('salto visual, doble salto y sombra conservan el plano y la cámara', async ({ page }) => {
  const before = await state(page);
  await page.keyboard.down('Space');
  await expect.poll(async () => (await state(page)).z).toBeGreaterThan(5);
  const s = await state(page);
  expect([s.x, s.y]).toEqual([before.x, before.y]);
  expect(s.shadowX).toBe(s.x);
  expect(s.shadowY).toBe(s.y);
  expect(s.visualY).toBeCloseTo(s.y - s.z);
  expect([s.scrollX, s.scrollY]).toEqual([0, 0]);
  await page.keyboard.up('Space');
  await page.keyboard.down('z');
  await expect.poll(async () => (await state(page)).airJumps).toBe(0);
  await page.keyboard.up('z');
  await page.keyboard.press('Space');
  expect((await state(page)).airJumps).toBe(0);
  await expect.poll(async () => (await state(page)).z).toBe(0);
});

test('dash diagonal conserva rapidez y no repite al mantener pulsado', async ({ page }) => {
  await page.keyboard.down('w');
  await page.keyboard.down('d');
  await page.keyboard.down('c');
  await expect.poll(async () => (await state(page)).dash, { intervals: [10] }).toBe(true);
  const s = await state(page);
  expect(Math.hypot(s.vx, s.vy)).toBeCloseTo(540);
  expect(s.vy).toBeLessThan(0);
  await page.keyboard.up('w');
  await page.keyboard.up('d');
  await expect.poll(async () => (await state(page)).dash).toBe(false);
  await page.keyboard.press('k');
  expect((await state(page)).dash).toBe(false);
  await page.waitForTimeout(800);
  expect((await state(page)).dash).toBe(false);
  await page.keyboard.up('c');
  await page.keyboard.down('k');
  await expect.poll(async () => (await state(page)).dash, { intervals: [10] }).toBe(true);
  await page.keyboard.up('k');
});

test('obstáculos bloquean salto y dash, profundidad ordena por pies y R reinicia', async ({ page }) => {
  await place(page, 240, 270);
  await page.keyboard.down('ArrowRight');
  await page.keyboard.down('Shift');
  await page.waitForTimeout(300);
  expect((await state(page)).x).toBeCloseTo(265, 0);
  await page.keyboard.down('Space');
  await page.keyboard.press('c');
  await expect.poll(async () => (await state(page)).z).toBeGreaterThan(5);
  expect((await state(page)).x).toBeCloseTo(265, 0);
  await page.keyboard.up('ArrowRight');
  await page.keyboard.up('Shift');
  await page.keyboard.up('Space');
  await expect.poll(async () => (await state(page)).z).toBe(0);
  await place(page, 320, 240);
  await expect.poll(async () => (await state(page)).shadowY).toBe(240);
  expect((await state(page)).depth).toBeLessThan((await state(page)).obstacleDepth);
  await place(page, 320, 310);
  await expect.poll(async () => (await state(page)).shadowY).toBe(310);
  expect((await state(page)).depth).toBeGreaterThan((await state(page)).obstacleDepth);
  await place(page, 70, 120);
  await page.keyboard.down('ArrowLeft');
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(250);
  await page.keyboard.up('ArrowLeft');
  await page.keyboard.up('ArrowUp');
  expect((await state(page)).x).toBeGreaterThanOrEqual(63);
  expect((await state(page)).y).toBeGreaterThanOrEqual(108);
  await page.keyboard.press('r');
  await expect.poll(async () => (await state(page)).x).toBe(480);
  await page.keyboard.down('d');
  await expect.poll(async () => (await state(page)).vx).toBe(150);
  await page.keyboard.up('d');
});

test('doble D desliza hacia D, genera estela y respeta cooldown sin cambiar cámara', async ({ page }) => {
  await page.keyboard.press('d', { delay: 35 });
  await page.waitForTimeout(60);
  await page.keyboard.down('d');
  await expect.poll(async () => (await state(page)).dash, { intervals: [10] }).toBe(true);
  expect((await state(page)).vx).toBe(540);
  await page.waitForTimeout(60);
  expect((await state(page)).trails).toBeGreaterThan(0);
  await page.screenshot({ path: 'test-results/room-prototype-dash.png', fullPage: true });
  await page.keyboard.up('d');
  await expect.poll(async () => (await state(page)).dash).toBe(false);
  // A second pair during recovery is discarded rather than queued for later.
  await page.keyboard.press('a', { delay: 20 });
  await page.waitForTimeout(30);
  await page.keyboard.press('a', { delay: 20 });
  expect((await state(page)).dash).toBe(false);
  await page.waitForTimeout(800);
  expect((await state(page)).trails).toBe(0);
  expect((await state(page)).dash).toBe(false);
  expect([(await state(page)).scrollX, (await state(page)).scrollY]).toEqual([0, 0]);
});

test('mantener WASD no esquiva y el dash por doble pulsación no atraviesa obstáculos', async ({ page }) => {
  await page.keyboard.down('w');
  await page.waitForTimeout(300);
  await page.keyboard.down('w'); // repeat, not a second physical press
  expect((await state(page)).dash).toBe(false);
  await page.keyboard.up('w');
  await place(page, 240, 270);
  await page.keyboard.press('d', { delay: 20 });
  await page.waitForTimeout(40);
  await page.keyboard.down('d');
  await expect.poll(async () => (await state(page)).dash, { intervals: [10] }).toBe(true);
  await page.waitForTimeout(220);
  expect((await state(page)).x).toBeCloseTo(265, 0);
  await page.keyboard.up('d');
});

test('el doble toque tolera 300 ms entre pulsaciones y conserva la dirección elegida', async ({ page }) => {
  await page.keyboard.down('ArrowLeft');
  await page.keyboard.press('d');
  await page.waitForTimeout(300);
  await page.keyboard.press('d');
  await expect.poll(async () => (await state(page)).dash, { intervals: [10] }).toBe(true);
  expect((await state(page)).vx).toBe(540);
  expect((await state(page)).vy).toBe(0);
  await page.keyboard.up('d');
});

test('doble pulsación de flecha derecha también activa dash', async ({ page }) => {
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(100);
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => (await state(page)).dash, { intervals: [10] }).toBe(true);
  expect((await state(page)).vx).toBe(540);
  expect((await state(page)).vy).toBe(0);
});

test('la espada se recoge en el lateral, se equipa visible y ejecuta un tajo animado', async ({ page }) => {
  const swordState = () => page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as RoomScene & {
      swordPickup: { collected: boolean; visual: Phaser.GameObjects.Container };
    };
    const player = scene.player as typeof scene.player & {
      hasSword: boolean;
      equippedSword: Phaser.GameObjects.Graphics;
      attack: { active: boolean; slash: Phaser.GameObjects.Container };
    };
    return { collected: scene.swordPickup.collected, visible: scene.swordPickup.visual.visible,
      pickupX: scene.swordPickup.visual.x, pickupY: scene.swordPickup.visual.y,
      hasSword: player.hasSword, equipped: player.equippedSword.visible,
      equippedRotation: player.equippedSword.rotation,
      active: player.attack.active, slashVisible: player.attack.slash.visible,
      slashRotation: player.attack.slash.rotation };
  });

  await page.locator('canvas').click({ position: { x: 480, y: 300 } });
  expect((await swordState()).active).toBe(false);
  expect((await swordState()).pickupX).toBe(760);
  await page.keyboard.down('Shift');
  await page.keyboard.down('ArrowRight');
  await expect.poll(async () => (await swordState()).collected).toBe(true);
  await page.keyboard.up('ArrowRight');
  await page.keyboard.up('Shift');
  let s = await swordState();
  expect(s).toMatchObject({ visible: false, hasSword: true, equipped: true, active: false });
  const restingSwordRotation = s.equippedRotation;
  await page.locator('canvas').click({ position: { x: 480, y: 300 } });
  s = await swordState();
  expect(s).toMatchObject({ active: true, slashVisible: true });
  const startingRotation = s.slashRotation;
  const swordStartingRotation = s.equippedRotation;
  await expect.poll(async () => (await swordState()).slashRotation, { intervals: [10, 20, 30] })
    .not.toBeCloseTo(startingRotation, 2);
  await expect.poll(async () => (await swordState()).equippedRotation, { intervals: [10, 20, 30] })
    .not.toBeCloseTo(swordStartingRotation, 2);
  await expect.poll(async () => (await swordState()).active).toBe(false);
  expect((await swordState()).slashVisible).toBe(false);
  expect((await swordState()).equippedRotation).toBeCloseTo(restingSwordRotation, 2);
});
