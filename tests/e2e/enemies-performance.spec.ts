import { test, expect } from '@playwright/test';

test('enemy colliders stay bounded and distant enemies sleep, wake and retain health', async ({ page }) => {
  await page.goto('/src/player/room-prototype/?enemies=1');
  await page.waitForFunction(() => (window.__game?.scene.getScene('RoomPrototype') as any)?.enemies?.enemies.length === 3);
  const result = await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('RoomPrototype') as any;
    const system = scene.enemies;
    const before = scene.physics.world.colliders.getActive().length;
    scene.cameras.main.setSize(100, 100);
    scene.cameras.main.preRender();
    scene.player.body.reset(100, 400);
    for (let i = 0; i < 68; i++) system.spawn('slime', 750 + i % 5 * 20, 200 + Math.floor(i / 5) * 20);
    system.update(16);
    const target = system.enemies.at(-1);
    target.takeSwordDamage(25, { x: 1, y: 0 });
    const sleeping = !target.simulating && !target.body.enable && !target.visual.visible;
    const hp = target.hp;
    scene.player.body.reset(target.x - 150, target.y);
    system.update(16);
    return { before, after: scene.physics.world.colliders.getActive().length, sleeping,
      awake: target.simulating && target.body.enable && target.visual.visible,
      hp, afterHp: target.hp, count: system.enemies.length };
  });
  expect(result.after).toBe(result.before);
  expect(result.count).toBe(71);
  expect(result.sleeping).toBe(true);
  expect(result.awake).toBe(true);
  expect(result.afterHp).toBe(result.hp);
});

test('map cameras draw only the overview, fog and markers, hiding newly added world objects', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/?skipIntro=1&map=1');
  await page.getByRole('menuitem', { name: /JUGAR/ }).click();
  await page.waitForFunction(() => window.__game?.scene.isActive('GameScene'));
  await page.waitForFunction(() => window.__game!.scene.getScene('GameScene').children.getByName('map-overview'));
  const mini = await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('GameScene') as any;
    const camera = scene.cameras.cameras[2];
    const extra = scene.add.rectangle(scene.player.x, scene.player.y, 40, 40, 0xff0000);
    const result = { count: scene.cameras.getVisibleChildren(scene.children.list, camera).length, hidesNewObjects: !extra.willRender(camera),
      overview: !!scene.children.getByName('map-overview'), mainHidesOverview: !scene.children.getByName('map-overview')!.willRender(scene.cameras.main) };
    extra.destroy();
    return result;
  });
  expect(mini.count).toBeLessThanOrEqual(6);
  expect(mini.hidesNewObjects).toBe(true);
  expect(mini.overview).toBe(true);
  expect(mini.mainHidesOverview).toBe(true);
  await page.waitForFunction(() => window.__game?.scene.isActive('HudScene'));
  await page.keyboard.press('KeyM');
  await expect.poll(() => page.evaluate(() => window.__game!.scene.getScene('GameScene').cameras.cameras[1].visible)).toBe(true);
  expect(await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('GameScene');
    return scene.cameras.getVisibleChildren(scene.children.list, scene.cameras.cameras[1]).length;
  })).toBeLessThanOrEqual(6);
  expect(errors).toEqual([]);
});
