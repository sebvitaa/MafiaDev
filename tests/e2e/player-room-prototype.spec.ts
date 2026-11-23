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
  // Controlar el intervalo DOM exacto: una espera del runner más el IPC puede
  // exceder la ventana de 350 ms bajo carga. Los otros casos usan teclas nativas.
  const dash = await page.evaluate(async () => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
    const keyboard = scene.input.keyboard!;
    const stamps: number[] = [];
    const observeTap = (event: KeyboardEvent) => { stamps.push(event.timeStamp); };
    keyboard.on('keydown-D', observeTap);
    const start = performance.now();
    for (const [type, offset] of [['keydown', 0], ['keyup', 1], ['keydown', 300], ['keyup', 301]] as const) {
      const event = new KeyboardEvent(type, { key: 'd', code: 'KeyD', keyCode: 68, which: 68, bubbles: true });
      Object.defineProperty(event, 'timeStamp', { value: start + offset });
      window.dispatchEvent(event);
      await new Promise<void>((resolve) => scene.events.once('postupdate', resolve));
    }
    keyboard.off('keydown-D', observeTap);
    return { taps: stamps.length, gap: stamps[1] - stamps[0], active: scene.player.motion.dash.active,
      vx: scene.player.body.velocity.x, vy: scene.player.body.velocity.y };
  });
  expect(dash).toEqual({ taps: 2, gap: 300, active: true, vx: 540, vy: 0 });
  await page.keyboard.up('ArrowLeft');
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
  const s = await swordState();
  expect(s).toMatchObject({ visible: false, hasSword: true, equipped: true, active: false, dummyHp: 100 });
  const restingSwordRotation = s.equippedRotation;
  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
    const probe = { steps: [] as { step: number; hp: number; hits: number }[],
      activeSeen: false, reactionSeen: false, slashMin: Infinity, slashMax: -Infinity,
      weaponMin: Infinity, weaponMax: -Infinity };
    (scene as any).__swordProbe = probe;
    const observe = () => {
      const { player, trainingDummy: dummy } = scene;
      const step = player.attack.currentAttack;
      if (!player.attack.slash.visible) return;
      probe.activeSeen ||= player.attack.active;
      probe.reactionSeen ||= dummy.reactionActive;
      if (!probe.steps.some((sample) => sample.step === step)) {
        probe.steps.push({ step, hp: dummy.hp, hits: dummy.hitCount });
      }
      if (step === 1) {
        probe.slashMin = Math.min(probe.slashMin, player.attack.slash.rotation);
        probe.slashMax = Math.max(probe.slashMax, player.attack.slash.rotation);
        probe.weaponMin = Math.min(probe.weaponMin, player.equippedSword.rotation);
        probe.weaponMax = Math.max(probe.weaponMax, player.equippedSword.rotation);
      }
    };
    scene.events.on('postupdate', observe);
    scene.events.once('shutdown', () => scene.events.off('postupdate', observe));
  });
  const box = (await page.locator('canvas').boundingBox())!;
  // Enviar cada clic al terminar el golpe, sin gastar la ventana de combo
  // haciendo múltiples viajes de lectura entre el navegador y el runner.
  for (const [step, hp] of [[1, 75], [2, 45], [3, 5]]) {
    await page.mouse.click(box.x + box.width * 820 / 960, box.y + box.height * 383 / 600); // el tajo va al cursor: apuntar al muñeco
    await page.waitForFunction(({ step, hp }) => {
      const scene = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
      const completedStep = step === 3 ? 0 : step; // El remate reinicia el combo al terminar.
      return scene.player.attack.currentAttack === completedStep && !scene.player.attack.active && scene.trainingDummy.hp === hp;
    }, { step, hp }, { timeout: 5000 }).catch(async () => {
      throw new Error(`Combo ${step}: ${JSON.stringify(await swordState())}`);
    });
  }
  const probe = await page.evaluate(() => (window.__game!.scene.getScene('RoomPrototype') as any).__swordProbe);
  expect(probe.steps).toEqual([{ step: 1, hp: 75, hits: 1 }, { step: 2, hp: 45, hits: 2 }, { step: 3, hp: 5, hits: 3 }]);
  expect(probe.activeSeen).toBe(true);
  expect(probe.reactionSeen).toBe(true);
  expect(probe.slashMax - probe.slashMin).toBeGreaterThan(0.01);
  expect(probe.weaponMax - probe.weaponMin).toBeGreaterThan(0.01);
  expect((await swordState()).slashVisible).toBe(false);
  expect((await swordState()).equippedRotation).toBeCloseTo(restingSwordRotation, 2);

  await page.mouse.click(box.x + box.width * 820 / 960, box.y + box.height * 383 / 600); // el tajo va al cursor: apuntar al muñeco
  await expect.poll(async () => (await state(page)).dummyHp).toBe(0);
  expect((await state(page)).dummyDefeated).toBe(true);
  await page.waitForFunction(() => {
    const dummy = (window.__game!.scene.getScene('RoomPrototype') as RoomScene).trainingDummy;
    return dummy.hp === 100 && !dummy.defeated;
  });
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
  await page.mouse.move(box.x + box.width * 820 / 960, box.y + box.height * 383 / 600);
  await page.mouse.down();
  await expect.poll(async () => (await state(page)).charge).toBeGreaterThan(0);
  const charging = await state(page);
  expect(charging.charge).toBeGreaterThan(0);
  expect(charging.chargeEffect).toBe(true);
  expect(charging.dummyHp).toBe(100);
  await page.keyboard.down('ArrowUp');
  await expect.poll(async () => (await state(page)).y, { intervals: [16] }).toBeLessThan(charging.y);
  await page.keyboard.up('ArrowUp');
  const movedWhileCharging = await state(page);
  expect(movedWhileCharging.y).toBeLessThan(charging.y);
  expect(movedWhileCharging.chargeEffectX).toBeCloseTo(movedWhileCharging.x, 0);
  expect(movedWhileCharging.chargeEffectY).toBeCloseTo(movedWhileCharging.y - 18, 0);
  expect(movedWhileCharging.swordRotation).toBeCloseTo(Math.atan2(383 - (movedWhileCharging.y - 17), 820 - movedWhileCharging.x), 1);
  expect(movedWhileCharging.dummyHp).toBe(100);
  await page.keyboard.press('c');
  await expect.poll(async () => (await state(page)).cooldown).toBeGreaterThan(0);
  await expect.poll(async () => (await state(page)).charge).toBe(0);
  await page.mouse.up();
  await page.waitForTimeout(200);
  expect((await state(page)).dummyHp).toBe(100);

  await expect.poll(async () => (await state(page)).cooldown).toBe(0);
  await place(page, 680, 400);
  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
    scene.player.motion.facing = { x: 1, y: 0 };
    scene.player.motion.velocity = { x: 0, y: 0 };
  });
  await page.mouse.down();
  await expect.poll(async () => (await state(page)).charge).toBe(1);
  await page.keyboard.down('ArrowRight');
  await expect.poll(async () => (await state(page)).x, { intervals: [16] }).toBeGreaterThan(710);
  await page.keyboard.up('ArrowRight');
  expect((await state(page)).charge).toBe(1);
  const releasePose = await state(page);
  expect(releasePose.x).toBeGreaterThan(680);
  expect(releasePose.chargeEffectX).toBeCloseTo(releasePose.x, 0);
  expect(releasePose.chargeEffectY).toBeCloseTo(releasePose.y - 18, 0);
  // Observe the overlap in the browser's animation frames. The whole swing can
  // finish between two snapshots sent over the Playwright connection.
  const movingSwing = page.waitForFunction(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
    return scene.player.body.velocity.x < 0 && scene.player.attack.slash.visible
      && scene.trainingDummy.hp === 50;
  });
  await page.keyboard.down('ArrowLeft');
  await page.mouse.up();
  await movingSwing;
  await page.keyboard.up('ArrowLeft');
  await expect.poll(async () => (await state(page)).slashVisible).toBe(false);
  expect(await state(page)).toMatchObject({ dummyHp: 50, dummyHits: 1 });
});

test('clic derecho mantenido apunta la bola con mouse, cae 600 ms, explota con daño doble y entra en cooldown', async ({ page }) => {
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('No se encontró el canvas del prototipo');
  await page.mouse.move(box.x + box.width * 820 / 960, box.y + box.height * 400 / 600);
  await page.mouse.down({ button: 'right' });
  await expect.poll(async () => (await state(page)).fireballAiming).toBe(true);
  const aimed = await state(page);
  expect(aimed.fireballAimX).toBeCloseTo(820, 0);
  expect(aimed.fireballAimY).toBeCloseTo(400, 0);
  expect(aimed.dummyHp).toBe(100);
  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
    const probe = { releasePhase: '', releaseCooldown: 0, proyectiles: 0, visibles: 0, aterrizados: 0, salpicaduras: 0, fallingSeen: false, fallingHpIntact: true,
      explosionSeen: false, maxRadius: 0, burnSeen: false, impactHp: -1, impactHits: 0,
      afterExplosionHp: -1, afterExplosionHits: 0, burnAtEnd: false, fadeComplete: false, fadeCooldown: 0 };
    (scene as any).__fireballProbe = probe;
    // RoomPlayer registró su release antes: leer aquí observa el mismo evento,
    // antes de que avancen el reloj del juego o los comandos del runner.
    scene.input.once('pointerup', () => {
      probe.releasePhase = scene.player.fireball.phase;
      probe.releaseCooldown = scene.player.fireball.cooldownRemainingMs;
    });
    const observe = () => {
      const fireball = scene.player.fireball, dummy = scene.trainingDummy;
      if (fireball.phase === 'falling') {
        probe.fallingSeen = true;
        probe.proyectiles = fireball.activeProjectileCount;
        probe.visibles = Math.max(probe.visibles, fireball.visibleProjectileCount);
        probe.fallingHpIntact &&= dummy.hp === 100;
      }
      if (fireball.phase === 'exploding') {
        probe.aterrizados = Math.max(probe.aterrizados, fireball.landedCount);
        probe.salpicaduras = Math.max(probe.salpicaduras, fireball.visibleSplashCount);
        probe.explosionSeen ||= fireball.explosion.visible;
        probe.maxRadius = Math.max(probe.maxRadius, fireball.explosionRadius);
        probe.burnSeen ||= fireball.burnMark.visible;
        probe.impactHp = dummy.hp;
        probe.impactHits = dummy.hitCount;
      }
      if (probe.explosionSeen && fireball.phase === 'idle' && probe.afterExplosionHp < 0) {
        probe.afterExplosionHp = dummy.hp;
        probe.afterExplosionHits = dummy.hitCount;
        probe.burnAtEnd = fireball.burnMark.visible;
      }
      if (probe.burnSeen && !fireball.burnMark.visible) {
        probe.fadeComplete = true;
        probe.fadeCooldown = fireball.cooldownRemainingMs;
        scene.events.off('postupdate', observe);
      }
    };
    scene.events.on('postupdate', observe);
    scene.events.once('shutdown', () => scene.events.off('postupdate', observe));
  });
  await page.mouse.up({ button: 'right' });
  await page.waitForFunction(() => (window.__game!.scene.getScene('RoomPrototype') as any).__fireballProbe.fadeComplete);
  await page.mouse.down({ button: 'right' });
  expect((await state(page)).fireballAiming).toBe(false);
  await page.mouse.up({ button: 'right' });
  const probe = await page.evaluate(() => (window.__game!.scene.getScene('RoomPrototype') as any).__fireballProbe);
  expect(probe.proyectiles).toBeGreaterThanOrEqual(7);
  expect(probe.proyectiles).toBeLessThanOrEqual(10);
  expect(probe.visibles).toBeGreaterThan(0);
  expect(probe.aterrizados).toBe(probe.proyectiles);
  expect(probe.salpicaduras).toBeGreaterThan(0);
  expect(probe).toMatchObject({ releasePhase: 'falling', releaseCooldown: 7000, fallingSeen: true,
    fallingHpIntact: true, explosionSeen: true, burnSeen: true, impactHp: 50, impactHits: 1,
    afterExplosionHp: 50, afterExplosionHits: 1, burnAtEnd: true, fadeComplete: true });
  expect(probe.maxRadius).toBeGreaterThan(0);
  expect(probe.fadeCooldown).toBeGreaterThan(2500);
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

async function strikeAt(page: Page, x: number, y: number) {
  const box = (await page.locator('canvas').boundingBox())!;
  await page.mouse.click(box.x + box.width * x / 960, box.y + box.height * y / 600);
}

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
  await strikeAt(page, 820, 383);
  await expect.poll(async () => (await state(page)).dummyHits).toBe(2);
  const replayed = await state(page);
  expect(replayed.echoPending).toBe(false);
  expect(replayed.echoUsed).toBe(true);
  expect(replayed.echoSlash).toBe(true);
  expect(replayed.dummyHp).toBe(66); // 25 original + round(25 × 0.35) echo.
  expect(replayed.dummyDebtMarks).toBe(2);
  // Wait for the combo window to close so the next tap always deals base damage.
  await expect.poll(async () => (await state(page)).comboAttack).toBe(0);
  expect((await state(page)).dummyHits).toBe(2);
  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
    scene.player.body.reset(760, 400);
    scene.player.motion.facing = { x: 1, y: 0 };
  });
  await strikeAt(page, 820, 383);
  await expect.poll(async () => (await state(page)).dummyHits).toBe(3);
  await expect.poll(async () => (await state(page)).comboAttack).toBe(0);
  expect(await state(page)).toMatchObject({ dummyHp: 41, dummyHits: 3, dummyDebtMarks: 3 });
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
  await strikeAt(page, 820, 383);
  await expect.poll(async () => (await state(page)).dummyDebtMarks).toBe(1);
  expect((await state(page)).dummyHp).toBe(75);

  const box = await page.locator('canvas').boundingBox();
  if (!box) throw new Error('No se encontró el canvas del prototipo');
  await page.mouse.move(box.x + box.width * 820 / 960, box.y + box.height * 400 / 600);
  await page.mouse.down({ button: 'right' });
  await expect.poll(async () => (await state(page)).fireballAiming).toBe(true);
  await page.mouse.up({ button: 'right' });
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
  await strikeAt(page, 780, 215);
  await expect.poll(async () => bossState()).toMatchObject({ hp: 575, marks: 1, hitEvents: 1 });

  const box = await page.locator('canvas').boundingBox();
  if (!box) throw new Error('No se encontró el canvas del prototipo');
  await page.mouse.move(box.x + box.width * 780 / 960, box.y + box.height * 232 / 600);
  await page.mouse.down({ button: 'right' });
  await page.mouse.up({ button: 'right' });
  await expect.poll(async () => bossState()).toMatchObject({ hp: 515, marks: 0, hitEvents: 2 });

  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
    scene.player.echo.startDash({ x: 700, y: 232, height: 0 });
  });
  await strikeAt(page, 780, 215);
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
  // A lethal hit can start the entire 5.5-second final line before victory.
  await expect.poll(bossState, { timeout: 12_000 }).toMatchObject({ hp: 0, active: false, defeated: true,
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
