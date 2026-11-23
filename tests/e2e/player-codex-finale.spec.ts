import { test, expect, type Page } from '@playwright/test';
import type { RoomScene } from '../../src/player/room-prototype/RoomScene';

const inspect = (page: Page) => page.evaluate(() => {
  const s = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
  return { hp: s.bodoque.hp, state: s.bodoque.state, critical: s.bodoque.finale.criticalCount,
    caption: s.bodoque.finale.caption.text, captionVisible: s.bodoque.finale.caption.visible,
    monitors: s.bodoque.finale.monitors.map((m) => m.text), killed: s.localBossEvents.killed,
    victory: s.bodoque.victoryLabel.visible, targets: s.bodoque.damageTargets.length,
    coreX: s.bodoque.finale.core.x, coreY: s.bodoque.finale.core.y,
    hitX: s.bodoque.heartTarget.x, hitY: s.bodoque.heartTarget.y };
});

test('Corazón Codex conserva HP, muestra ERROR 23 una vez, permite daño durante transmisión y limpia al reiniciar', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/src/player/room-prototype/');
  await page.waitForFunction(() => window.__game?.scene.isActive('RoomPrototype'));
  await page.keyboard.press('b');
  await page.evaluate(() => {
    const s = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
    s.bodoque.takeSwordDamage(9999, { x: 1, y: 0 });
    s.bodoque.takeFireDamage(9999, { x: 1, y: 0 });
    s.bodoque.heartTarget.takeSwordDamage(9999, { x: 1, y: 0 });
  });
  expect(await inspect(page)).toMatchObject({ hp: 100, state: 'opening', killed: false, targets: 0 });
  await expect.poll(() => inspect(page)).toMatchObject({ hp: 100, state: 'heart', targets: 1 });
  const visible = await inspect(page);
  expect(visible.coreX).toBe(visible.hitX);
  expect(visible.coreY).toBe(visible.hitY);
  await page.evaluate(() => {
    const s = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
    s.bodoque.takeSwordDamage(999, { x: 1, y: 0 }); // Body stays immune.
  });
  expect((await inspect(page)).hp).toBe(100);
  await page.evaluate(() => {
    const s = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
    s.bodoque.heartTarget.takeSwordDamage(77, { x: 1, y: 0 });
  });
  expect(await inspect(page)).toMatchObject({ hp: 23, critical: 1, captionVisible: true,
    caption: 'ERROR 23\nBODOQUE: ¡Queda una pura...!', monitors: ['APUESTA', 'APUESTA'], killed: false });
  await page.screenshot({ path: 'test-results/codex-error23.png', fullPage: true });
  await page.evaluate(() => {
    const s = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
    s.bodoque.heartTarget.takeFireDamage(1, { x: 1, y: 0 });
  });
  expect(await inspect(page)).toMatchObject({ hp: 22, critical: 1, captionVisible: true });
  await page.keyboard.press('r');
  await expect.poll(() => inspect(page)).toMatchObject({ hp: 600, state: 'inactive', critical: 0,
    captionVisible: false, killed: false });
  expect(await page.evaluate(() => {
    const s = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
    return s.children.list.filter((o) => o.name === 'room-codex-core').length;
  })).toBe(1);
  await page.keyboard.press('b');
  await page.evaluate(() => {
    const s = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
    s.bodoque.takeFireDamage(9999, { x: 1, y: 0 });
  });
  await expect.poll(() => inspect(page)).toMatchObject({ state: 'heart' });
  await page.evaluate(() => {
    const s = window.__game!.scene.getScene('RoomPrototype') as RoomScene;
    s.bodoque.heartTarget.takeFireDamage(9999, { x: 1, y: 0 });
  });
  expect(await inspect(page)).toMatchObject({ hp: 0, state: 'dying', killed: false, victory: false, targets: 0 });
  await expect.poll(() => inspect(page)).toMatchObject({ state: 'defeated', killed: true, victory: true });
  expect(errors).toEqual([]);
});
