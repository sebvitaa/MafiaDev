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
      comboAttack: p.attack.currentAttack,
      charge: p.attack.chargeProgress,
      chargeEffect: scene.children.list.some((o) => o.name === 'room-sword-charge'
        && (o as Phaser.GameObjects.Graphics).visible),
      chargeEffectX: (scene.children.list.find((o) => o.name === 'room-sword-charge') as Phaser.GameObjects.Container | undefined)?.x ?? null,
      chargeEffectY: (scene.children.list.find((o) => o.name === 'room-sword-charge') as Phaser.GameObjects.Container | undefined)?.y ?? null,
      facingX: p.motion.facing.x, facingY: p.motion.facing.y, swordRotation: p.equippedSword.rotation,
      slashX: p.attack.slash.x, slashY: p.attack.slash.y, slashVisible: p.attack.slash.visible,
      fireballPhase: p.fireball.phase, fireballCooldown: p.fireball.cooldownRemainingMs,
      fireballAiming: p.fireball.aiming, fireballAimX: p.fireball.aimPoint.x,
      fireballAimY: p.fireball.aimPoint.y, fireballY: p.fireball.projectile.y,
      fireballExplosion: p.fireball.explosion.visible, fireballRadius: p.fireball.explosionRadius,
      fireballBurnVisible: p.fireball.burnMark.visible,
      fireballItalianRain: p.fireball.isItalianRain,
      fireballCompletos: p.fireball.activeProjectileCount,
      fireballVisibleCompletos: p.fireball.visibleProjectileCount,
      fireballLandedCompletos: p.fireball.landedCount,
      fireballSplashes: p.fireball.visibleSplashCount,
      echoVisible: p.echo.visible, echoRemaining: p.echo.remainingMs,
      echoPending: p.echo.replayPending, echoUsed: p.echo.replayUsed,
      echoSlash: p.echo.slash.visible,
      dummyHp: scene.trainingDummy?.hp ?? null,
      dummyDefeated: scene.trainingDummy?.defeated ?? false,
      dummyHits: scene.trainingDummy?.hitCount ?? null,
      dummyDebtMarks: scene.trainingDummy?.debtMarkCount ?? null,
      dummyDebtDetonation: scene.trainingDummy?.debtDetonationVisible ?? false,
      dummyReaction: scene.trainingDummy?.reactionActive ?? false,
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
  await page.waitForTimeout(500);
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
      trainingDummy: { hp: number; hitCount: number; reactionActive: boolean };
    };
    const player = scene.player as typeof scene.player & {
      hasSword: boolean;
      equippedSword: Phaser.GameObjects.Graphics;
      attack: { active: boolean; currentAttack: number; buffered: boolean; slash: Phaser.GameObjects.Container };
    };
    return { collected: scene.swordPickup.collected, visible: scene.swordPickup.visual.visible,
      pickupX: scene.swordPickup.visual.x, pickupY: scene.swordPickup.visual.y,
      hasSword: player.hasSword, equipped: player.equippedSword.visible,
      equippedRotation: player.equippedSword.rotation,
      active: player.attack.active, slashVisible: player.attack.slash.visible,
      comboAttack: player.attack.currentAttack,
      buffered: player.attack.buffered,
      slashRotation: player.attack.slash.rotation,
      dummyHp: scene.trainingDummy.hp, dummyHits: scene.trainingDummy.hitCount,
      dummyReaction: scene.trainingDummy.reactionActive,
      dummyDefeated: scene.trainingDummy.defeated };
  });

  await page.locator('canvas').click({ position: { x: 480, y: 300 } });
  expect((await swordState()).active).toBe(false);
  expect((await swordState()).pickupX).toBe(760);
  await page.keyboard.down('Shift');
  await page.keyboard.down('ArrowRight');
  await expect.poll(async () => (await swordState()).collected).toBe(true);
  await page.keyboard.up('ArrowRight');
  await page.keyboard.up('Shift');
  await place(page, 760, 400);
  let s = await swordState();
  expect(s).toMatchObject({ visible: false, hasSword: true, equipped: true, active: false, dummyHp: 100 });
  const restingSwordRotation = s.equippedRotation;
  await page.locator('canvas').click({ position: { x: 480, y: 300 } });
  s = await swordState();
  expect(s).toMatchObject({ active: true, slashVisible: true });
  const startingRotation = s.slashRotation;
  const swordStartingRotation = s.equippedRotation;
  await expect.poll(async () => (await state(page)).dummyHp).toBe(75);
  expect((await state(page)).dummyHits).toBe(1);
  await expect.poll(async () => (await swordState()).slashRotation, { intervals: [10, 20, 30] })
    .not.toBeCloseTo(startingRotation, 2);
  await expect.poll(async () => (await swordState()).equippedRotation, { intervals: [10, 20, 30] })
    .not.toBeCloseTo(swordStartingRotation, 2);
  await page.waitForTimeout(100);
  await page.locator('canvas').click({ position: { x: 480, y: 300 } });
  await expect.poll(async () => (await swordState()).comboAttack).toBe(2);
  await expect.poll(async () => (await state(page)).dummyHp).toBe(45);
  expect((await state(page)).dummyHits).toBe(2);
  await expect.poll(async () => (await swordState()).active).toBe(false);
  await page.locator('canvas').click({ position: { x: 480, y: 300 } });
  await expect.poll(async () => (await swordState()).comboAttack).toBe(3);
  await expect.poll(async () => (await state(page)).dummyHp).toBe(5);
  expect((await state(page)).dummyHits).toBe(3);
  await expect.poll(async () => (await swordState()).active).toBe(false);
  expect((await swordState()).slashVisible).toBe(false);
  expect((await swordState()).equippedRotation).toBeCloseTo(restingSwordRotation, 2);

  await page.locator('canvas').click({ position: { x: 480, y: 300 } });
  await expect.poll(async () => (await state(page)).dummyHp).toBe(0);
  expect((await state(page)).dummyDefeated).toBe(true);
  await page.waitForTimeout(2100);
  expect((await state(page)).dummyHp).toBe(100);
  expect((await state(page)).dummyDefeated).toBe(false);
});

test('el dash cancela la carga y soltar una carga máxima hace un golpe de largo alcance una sola vez', async ({ page }) => {
  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
    scene.player.equipSword();
    scene.player.body.reset(700, 400);
    scene.player.motion.facing = { x: 1, y: 0 };
    scene.player.motion.velocity = { x: 0, y: 0 };
  });
  const box = await page.locator('canvas').boundingBox();
  if (!box) throw new Error('No se encontró el canvas del prototipo');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(500);
  const charging = await state(page);
  expect(charging.charge).toBeGreaterThan(0);
  expect(charging.chargeEffect).toBe(true);
  expect(charging.dummyHp).toBe(100);
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(140);
  await page.keyboard.up('ArrowUp');
  const movedWhileCharging = await state(page);
  expect(movedWhileCharging.y).toBeLessThan(charging.y);
  expect(movedWhileCharging.chargeEffectX).toBeCloseTo(movedWhileCharging.x, 0);
  expect(movedWhileCharging.chargeEffectY).toBeCloseTo(movedWhileCharging.y - 18, 0);
  expect(movedWhileCharging.swordRotation).toBeCloseTo(Math.atan2(movedWhileCharging.facingY, movedWhileCharging.facingX), 1);
  expect(movedWhileCharging.dummyHp).toBe(100);
  await page.keyboard.press('c');
  await expect.poll(async () => (await state(page)).dash).toBe(true);
  await expect.poll(async () => (await state(page)).charge).toBe(0);
  await page.mouse.up();
  await page.waitForTimeout(200);
  expect((await state(page)).dummyHp).toBe(100);

  await page.waitForTimeout(800);
  await place(page, 680, 400);
  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
    scene.player.motion.facing = { x: 1, y: 0 };
    scene.player.motion.velocity = { x: 0, y: 0 };
  });
  await page.mouse.down();
  await page.waitForTimeout(1050);
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(160);
  await page.keyboard.up('ArrowRight');
  expect((await state(page)).charge).toBe(1);
  const releasePose = await state(page);
  expect(releasePose.x).toBeGreaterThan(680);
  expect(releasePose.chargeEffectX).toBeCloseTo(releasePose.x, 0);
  expect(releasePose.chargeEffectY).toBeCloseTo(releasePose.y - 18, 0);
  await page.mouse.up();
  await expect.poll(async () => (await state(page)).dummyHp).toBe(50);
  const swingPose = await state(page);
  expect(swingPose.slashVisible).toBe(true);
  await page.keyboard.down('ArrowLeft');
  await page.waitForTimeout(130);
  await page.keyboard.up('ArrowLeft');
  expect((await state(page)).x).toBeLessThan(swingPose.x);
  expect((await state(page)).slashVisible).toBe(true);
  expect((await state(page)).dummyHp).toBe(50);
  await page.mouse.up();
  expect((await state(page)).dummyHits).toBe(1);
});

test('E apunta la bola con mouse, cae 600 ms, explota con daño doble y entra en cooldown', async ({ page }) => {
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('No se encontró el canvas del prototipo');
  await page.mouse.move(box.x + box.width * 820 / 960, box.y + box.height * 400 / 600);
  await page.keyboard.down('e');
  await expect.poll(async () => (await state(page)).fireballAiming).toBe(true);
  const aimed = await state(page);
  expect(aimed.fireballAimX).toBeCloseTo(820, 0);
  expect(aimed.fireballAimY).toBeCloseTo(400, 0);
  expect(aimed.dummyHp).toBe(100);
  await page.keyboard.up('e');
  expect((await state(page)).fireballPhase).toBe('falling');
  expect((await state(page)).fireballItalianRain).toBe(true);
  expect((await state(page)).fireballCompletos).toBeGreaterThanOrEqual(7);
  expect((await state(page)).fireballCompletos).toBeLessThanOrEqual(10);
  expect((await state(page)).fireballVisibleCompletos).toBeGreaterThan(0);
  expect((await state(page)).fireballCooldown).toBeGreaterThan(6800);
  await page.waitForTimeout(250);
  await page.screenshot({ path: 'test-results/room-prototype-italian-rain.png', fullPage: true });
  expect((await state(page)).fireballPhase).toBe('falling');
  expect((await state(page)).fireballVisibleCompletos).toBeGreaterThan(0);
  expect((await state(page)).dummyHp).toBe(100);
  expect((await state(page)).dummyHits).toBe(0);
  await expect.poll(async () => (await state(page)).dummyHp).toBe(50);
  expect((await state(page)).dummyHits).toBe(1);
  expect((await state(page)).fireballExplosion).toBe(true);
  await expect.poll(async () => (await state(page)).fireballRadius).toBeGreaterThan(0);
  expect((await state(page)).fireballLandedCompletos).toBe((await state(page)).fireballCompletos);
  expect((await state(page)).fireballSplashes).toBeGreaterThan(0);
  expect((await state(page)).fireballBurnVisible).toBe(true);
  await page.waitForTimeout(350);
  expect((await state(page)).dummyHp).toBe(50);
  expect((await state(page)).dummyHits).toBe(1);
  await page.waitForTimeout(1800);
  expect((await state(page)).fireballBurnVisible).toBe(true);
  await expect.poll(async () => (await state(page)).fireballBurnVisible).toBe(false);
  expect((await state(page)).fireballCooldown).toBeGreaterThan(2500);
  await page.keyboard.down('e');
  expect((await state(page)).fireballAiming).toBe(false);
  await page.keyboard.up('e');
  await page.keyboard.press('r');
  await expect.poll(async () => page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype');
    return scene.children.list.filter((object: Phaser.GameObjects.GameObject) =>
      object.name.startsWith('room-fireball-')).length;
  })).toBe(3);
  expect(await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype');
    return scene.children.list.filter((object: Phaser.GameObjects.GameObject) =>
      object.name.startsWith('room-italian-')).length;
  })).toBe(40);
});

test('Eco del Reverso repite una sola vez el golpe desde el dash con daño reducido', async ({ page }) => {
  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
    scene.player.equipSword();
    scene.player.body.reset(760, 400);
    scene.player.motion.facing = { x: 1, y: 0 };
    scene.player.motion.velocity = { x: 0, y: 0 };
  });
  await page.keyboard.down('c');
  await expect.poll(async () => (await state(page)).dash).toBe(true);
  expect((await state(page)).echoVisible).toBe(true);
  await page.keyboard.up('c');
  await expect.poll(async () => (await state(page)).dash).toBe(false);
  await place(page, 760, 400);
  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
    scene.player.motion.facing = { x: 1, y: 0 };
  });
  await page.mouse.click(480, 300);
  await expect.poll(async () => (await state(page)).dummyHits).toBe(2);
  const replayed = await state(page);
  expect(replayed.echoPending).toBe(false);
  expect(replayed.echoUsed).toBe(true);
  expect(replayed.echoSlash).toBe(true);
  expect(replayed.dummyHp).toBe(66); // 25 original + round(25 × 0.35) echo.
  expect(replayed.dummyDebtMarks).toBe(2);
  await page.waitForTimeout(300);
  expect((await state(page)).dummyHits).toBe(2); // Neither hitbox leaves a ghost hit after its window.

  await expect.poll(async () => page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
    return scene.player.attack.active;
  })).toBe(false);
  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
    scene.player.body.reset(760, 400);
    scene.player.motion.facing = { x: 1, y: 0 };
  });
  await page.mouse.click(480, 300);
  await expect.poll(async () => (await state(page)).dummyHits).toBe(3);
  await page.waitForTimeout(150);
  expect((await state(page)).dummyHp).toBe(36);
  expect((await state(page)).dummyDebtMarks).toBe(3);
  await page.keyboard.press('r');
  await expect.poll(async () => page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype');
    return scene.children.list.filter((object: Phaser.GameObjects.GameObject) =>
      object.name.startsWith('room-reversal-echo')).length;
  })).toBe(2);
});

test('la bola consume marcas de deuda y suma bonus en una detonación visual', async ({ page }) => {
  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
    scene.player.equipSword();
    scene.player.body.reset(760, 400);
    scene.player.motion.facing = { x: 1, y: 0 };
    scene.player.motion.velocity = { x: 0, y: 0 };
  });
  await page.mouse.click(480, 300);
  await expect.poll(async () => (await state(page)).dummyDebtMarks).toBe(1);
  expect((await state(page)).dummyHp).toBe(75);

  const box = await page.locator('canvas').boundingBox();
  if (!box) throw new Error('No se encontró el canvas del prototipo');
  await page.mouse.move(box.x + box.width * 820 / 960, box.y + box.height * 400 / 600);
  await page.keyboard.down('e');
  await expect.poll(async () => (await state(page)).fireballAiming).toBe(true);
  await page.keyboard.up('e');
  await expect.poll(async () => (await state(page)).dummyHits).toBe(2);
  const detonated = await state(page);
  expect(detonated.dummyHp).toBe(15); // 50 base + 10 bonus for the consumed mark.
  expect(detonated.dummyDebtMarks).toBe(0);
  expect(detonated.dummyDebtDetonation).toBe(true);
});

test('Bodoque se activa sin reemplazar al muñeco y recibe espada, eco y lluvia italiana', async ({ page }) => {
  const bossState = () => page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as RoomScene & {
      bodoque: {
        hp: number; maxHp: number; state: string; active: boolean; defeated: boolean;
        debtMarkCount: number; visual: Phaser.GameObjects.Container;
        healthBar: Phaser.GameObjects.Graphics; victoryLabel: Phaser.GameObjects.Text;
      };
      playerHp: number; localBossEvents: { phases: number[]; hits: number; killed: boolean };
    };
    return { hp: scene.bodoque.hp, maxHp: scene.bodoque.maxHp, state: scene.bodoque.state,
      active: scene.bodoque.active, visible: scene.bodoque.visual.visible,
      healthVisible: scene.bodoque.healthBar.visible, dummyHp: scene.trainingDummy.hp,
      dummyVisible: scene.trainingDummy.visual.visible, marks: scene.bodoque.debtMarkCount,
      defeated: scene.bodoque.defeated,
      playerHp: scene.playerHp, phases: [...scene.localBossEvents.phases],
      hitEvents: scene.localBossEvents.hits, killed: scene.localBossEvents.killed,
      victory: scene.bodoque.victoryLabel.visible };
  });

  expect(await bossState()).toMatchObject({ hp: 600, maxHp: 600, state: 'inactive', active: false,
    visible: false, dummyHp: 100, dummyVisible: true, playerHp: 100 });
  await page.keyboard.press('b');
  await expect.poll(async () => bossState()).toMatchObject({ state: 'idle', active: true,
    visible: true, healthVisible: true, phases: [1] });

  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
    scene.player.equipSword();
    scene.player.body.reset(700, 232);
    scene.player.motion.facing = { x: 1, y: 0 };
    scene.player.motion.velocity = { x: 0, y: 0 };
  });
  await page.mouse.click(480, 300);
  await expect.poll(async () => bossState()).toMatchObject({ hp: 575, marks: 1, hitEvents: 1 });

  const box = await page.locator('canvas').boundingBox();
  if (!box) throw new Error('No se encontró el canvas del prototipo');
  await page.mouse.move(box.x + box.width * 780 / 960, box.y + box.height * 232 / 600);
  await page.keyboard.down('e');
  await page.keyboard.up('e');
  await expect.poll(async () => bossState()).toMatchObject({ hp: 515, marks: 0, hitEvents: 2 });

  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
    scene.player.echo.startDash({ x: 700, y: 232, height: 0 });
  });
  await page.mouse.click(480, 300);
  await expect.poll(async () => bossState()).toMatchObject({ hp: 481, marks: 2, hitEvents: 4 });

  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as RoomScene & { bodoque: {
      takeSwordDamage(damage: number, direction: { x: number; y: number }): void;
    } };
    scene.bodoque.takeSwordDamage(85, { x: 1, y: 0 });
  });
  await expect.poll(async () => bossState()).toMatchObject({ hp: 396, phases: [1, 2] });
  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as RoomScene & { bodoque: {
      takeSwordDamage(damage: number, direction: { x: number; y: number }): void;
    } };
    scene.bodoque.takeSwordDamage(198, { x: 1, y: 0 });
  });
  await expect.poll(async () => bossState()).toMatchObject({ hp: 198, phases: [1, 2, 3] });
  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as RoomScene & { bodoque: {
      takeSwordDamage(damage: number, direction: { x: number; y: number }): void;
    } };
    scene.bodoque.takeSwordDamage(198, { x: 1, y: 0 });
  });
  await expect.poll(async () => bossState()).toMatchObject({ hp: 100, state: 'opening', killed: false });
  await expect.poll(async () => bossState()).toMatchObject({ hp: 100, state: 'heart' });
  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
    scene.bodoque.heartTarget.takeSwordDamage(100, { x: 1, y: 0 });
  });
  await expect.poll(async () => bossState()).toMatchObject({ hp: 0, active: false, defeated: true,
    visible: true, victory: true, killed: true, dummyHp: 100, dummyVisible: true });
});

test('Bodoque telegrafía el micrófono-mazo parryable y conserva el movimiento para esquivarlo', async ({ page }) => {
  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
    scene.player.body.reset(720, 232);
    scene.player.motion.velocity = { x: 0, y: 0 };
    scene.player.motion.facing = { x: -1, y: 0 };
  });
  await page.keyboard.press('b');
  const inspect = () => page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as RoomScene & { bodoque: {
      state: string; attackLabel: Phaser.GameObjects.Text; brain: { currentAttack?: { id: string; parryable: boolean } };
    } };
    return { state: scene.bodoque.state, attack: scene.bodoque.brain.currentAttack?.id,
      parryable: scene.bodoque.brain.currentAttack?.parryable,
      telegraph: scene.bodoque.attackLabel.visible, label: scene.bodoque.attackLabel.text,
      hp: scene.playerHp, playerY: scene.player.anchor.y };
  });
  await expect.poll(async () => inspect()).toMatchObject({ state: 'telegraph', attack: 'microphoneMallet',
    parryable: true, telegraph: true });
  await page.keyboard.down('Shift');
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(140);
  await page.keyboard.up('ArrowUp');
  await page.keyboard.up('Shift');
  const moved = await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as RoomScene & { bodoque: {
      state: string; brain: { state: string };
    } };
    const result = { playerY: scene.player.anchor.y };
    // Unit tests exercise the hit-zone boundary; keep this browser check isolated to the visible tell and evasive movement.
    scene.bodoque.brain.state = 'inactive';
    return result;
  });
  expect(moved.playerY).toBeLessThan(232);
});
