import { expect, test, type Page } from '@playwright/test';

async function snapshot(page: Page) {
  return page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as any;
    return {
      hp: scene.player.hp as number, maxHp: scene.player.maxHp as number, alive: scene.player.alive as boolean,
      x: scene.player.anchor.x as number, y: scene.player.anchor.y as number,
      enemies: scene.enemies.enemies.map((enemy: any) => ({ id: enemy.id as string, kind: enemy.kind as string,
        hp: enemy.hp as number, state: enemy.state as string, x: enemy.x as number, y: enemy.y as number,
        enabled: enemy.body.enable as boolean, markedTarget: enemy.anchor.getData('teleportTarget') as boolean })) as {
          id: string; kind: string; hp: number; state: string; x: number; y: number; enabled: boolean; markedTarget: boolean;
        }[],
      marks: scene.children.list.filter((child: any) => child.name?.startsWith('teleport-mark-'))
        .map((child: any) => ({ x: child.x as number, y: child.y as number, rotation: child.rotation as number })) as { x: number; y: number; rotation: number }[],
    };
  });
}

async function clickWorld(page: Page, x: number, y: number, button: 'left' | 'right' = 'left') {
  const box = (await page.locator('canvas').boundingBox())!;
  await page.mouse.click(box.x + x * box.width / 960, box.y + y * box.height / 600, { button });
}

async function isolate(page: Page, kind: string, player: { x: number; y: number }, enemy: { x: number; y: number }) {
  await page.evaluate(({ kind, player, enemy }) => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as any;
    for (const target of scene.enemies.enemies) {
      if (target.kind !== kind) target.takeSwordDamage(1000, { x: 1, y: 0 });
      else { target.body.reset(enemy.x, enemy.y); target.brain.fsm.set('idle'); }
    }
    scene.player.body.reset(player.x, player.y);
    scene.player.motion.facing = { x: 1, y: 0 };
    scene.player.equipSword();
    scene.player.sync();
  }, { kind, player, enemy });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/src/player/room-prototype/?enemies=1');
  await page.waitForFunction(() => (window.__game?.scene.getScene('RoomPrototype') as any)?.enemies?.enemies.length === 3);
  await page.waitForFunction(() => window.__game!.loop.frame > 5);
});

test('tres enemigos distintos con vida balanceada, cuerpo real y marcas habilitadas', async ({ page }) => {
  const s = await snapshot(page);
  expect(s.hp).toBe(125); expect(s.maxHp).toBe(125);
  expect(s.enemies.map((enemy) => [enemy.kind, enemy.hp])).toEqual([['slime', 50], ['cobrador', 100], ['knight', 150]]);
  expect(new Set(s.enemies.map((enemy) => enemy.id)).size).toBe(3);
  expect(s.enemies.every((enemy) => enemy.enabled && enemy.markedTarget)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('enemigos-basicos.png'), fullPage: true });
});

test('espada daña un slime real, mata sin repetir daño y elimina su marca TP', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await isolate(page, 'slime', { x: 530, y: 400 }, { x: 590, y: 400 });
  await page.keyboard.down('q');
  await clickWorld(page, 620, 400, 'right');
  await expect.poll(async () => (await snapshot(page)).marks.length).toBe(1);
  await page.waitForTimeout(180);
  expect((await snapshot(page)).enemies[0].hp).toBe(50);
  await page.keyboard.up('q');
  await clickWorld(page, 600, 400);
  await expect.poll(async () => (await snapshot(page)).enemies[0].hp).toBe(25);
  await page.waitForFunction(() => !(window.__game!.scene.getScene('RoomPrototype') as any).player.attack.active);
  await clickWorld(page, 600, 400);
  await expect.poll(async () => (await snapshot(page)).enemies[0].hp).toBe(0);
  await expect.poll(async () => (await snapshot(page)).marks.length).toBe(0);
  expect((await snapshot(page)).enemies[0].enabled).toBe(false);
  await page.waitForTimeout(350);
  expect((await snapshot(page)).enemies[0].state).toBe('dead');
  expect(errors).toEqual([]);
});

test('Cobrador anticipa y causa un solo golpe, protección evita daño acumulado por frame', async ({ page }) => {
  await isolate(page, 'cobrador', { x: 500, y: 400 }, { x: 550, y: 400 });
  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as any;
    let sawWindup = false;
    let impact: { hp: number; duplicateAccepted: boolean } | null = null;
    const observe = () => {
      const enemy = scene.enemies.enemies.find((target: any) => target.kind === 'cobrador');
      if (enemy.state === 'windup' && scene.player.hp === 125) sawWindup = true;
      if (!impact && scene.player.hp === 100) impact = {
        hp: scene.player.hp, duplicateAccepted: scene.player.takeEnemyDamage(50, { x: -1, y: 0 }),
      };
      if (impact && enemy.state === 'recovery') {
        scene.__damageProbe = { ...impact, sawWindup, afterWindowHp: scene.player.hp };
        scene.events.off('postupdate', observe);
      }
    };
    scene.events.on('postupdate', observe);
  });
  const result = await page.waitForFunction(() => (window.__game!.scene.getScene('RoomPrototype') as any).__damageProbe);
  expect(await result.jsonValue()).toEqual({ hp: 100, duplicateAccepted: false, sawWindup: true, afterWindowHp: 100 });
});

test('marca sigue al knight y TP numérico llega a su lado sin atacarlo', async ({ page }) => {
  await isolate(page, 'knight', { x: 400, y: 400 }, { x: 600, y: 400 });
  await page.keyboard.down('q');
  await clickWorld(page, 600, 400, 'right');
  await page.keyboard.up('q');
  await expect.poll(async () => {
    const mark = (await snapshot(page)).marks[0];
    return !!mark && mark.x > 520 && mark.rotation === 0;
  }).toBe(true);
  const follow = await page.evaluate(() => new Promise<{ enemyDelta: number; markDelta: number }>((resolve) => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as any;
    const enemy = scene.enemies.enemies.find((target: any) => target.kind === 'knight');
    const mark = scene.children.list.find((child: any) => child.name?.startsWith('teleport-mark-'));
    // Medir ambos desplazamientos en postupdate evita perder una coordenada fugaz
    // mientras la IA sigue persiguiendo al jugador entre consultas del test.
    enemy.brain.fsm.set('recovery', true);
    scene.events.once('postupdate', () => {
      const enemyX = enemy.x, markX = mark.x;
      enemy.body.reset(650, 400);
      scene.events.once('postupdate', () => resolve({ enemyDelta: enemy.x - enemyX, markDelta: mark.x - markX }));
    });
  }));
  expect(follow.enemyDelta).toBeGreaterThan(40);
  expect(follow.markDelta).toBeCloseTo(follow.enemyDelta, 1);
  await page.keyboard.press('1');
  await expect.poll(async () => (await snapshot(page)).x).toBeGreaterThan(590);
  const s = await snapshot(page), knight = s.enemies[2];
  expect(Math.hypot(s.x - knight.x, s.y - knight.y)).toBeGreaterThan(24);
  expect(Math.hypot(s.x - knight.x, s.y - knight.y)).toBeLessThan(45);
  expect(knight.hp).toBe(150);
});

test('pilares bloquean daño, muerte deshabilita acciones y R limpia/reinicia el combate', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await isolate(page, 'slime', { x: 480, y: 196 }, { x: 480, y: 144 });
  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as any;
    scene.player.motion.facing = { x: 0, y: -1 };
  });
  await clickWorld(page, 480, 144);
  expect((await snapshot(page)).enemies[0].hp).toBe(50);
  const dashAfterDeath = await page.evaluate(() => {
    const player = (window.__game!.scene.getScene('RoomPrototype') as any).player;
    player.motion.dash.tryStart(1, 650);
    player.takeEnemyDamage(500, { x: 1, y: 0 });
    return player.motion.dash.active as boolean;
  });
  expect(dashAfterDeath).toBe(false);
  expect((await snapshot(page)).alive).toBe(false);
  const before = await snapshot(page);
  await page.keyboard.press('1');
  await page.keyboard.down('q');
  await clickWorld(page, 200, 400, 'right');
  await page.keyboard.up('q');
  expect((await snapshot(page)).marks).toHaveLength(0);
  expect((await snapshot(page)).x).toBeCloseTo(before.x);
  await page.keyboard.press('r');
  await expect.poll(async () => (await snapshot(page)).hp).toBe(125);
  expect((await snapshot(page)).enemies.every((enemy) => enemy.enabled)).toBe(true);
  await page.keyboard.down('q');
  await clickWorld(page, 200, 400, 'right');
  await page.keyboard.up('q');
  await expect.poll(async () => (await snapshot(page)).marks.length).toBe(1);
  expect(errors).toEqual([]);
});
