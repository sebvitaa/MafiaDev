import { expect, test } from '@playwright/test';
import type { GameScene } from '../../src/scenes/GameScene';

test('El Set conecta espada, música, corazón y desenlace antes de los créditos', async ({ page }) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/?stage=3&skipIntro=1&map=2');
  await page.getByRole('menuitem', { name: /3 · FINAL/ }).click();
  const video = page.locator('video');
  await expect(video).toHaveAttribute('aria-label', 'La Última Apuesta');
  await page.getByRole('button', { name: /Saltar/ }).click();
  await page.waitForFunction(() => {
    const scene = window.__game?.scene.getScene('GameScene') as GameScene | undefined;
    return scene?.boss?.targets.length === 1;
  });
  const music = () => page.evaluate(async () => {
    const url = '/src/audio/index.ts';
    return (await import(/* @vite-ignore */ url)).AudioDirector.currentMusic;
  });
  await expect.poll(music).toBe('music-boss');
  // Place Ríos within sword range, then strike through the real pointer binding.
  const canvas = (await page.locator('canvas').boundingBox())!;
  await expect(async () => {
    const point = await page.evaluate(async () => {
      const scene = window.__game!.scene.getScene('GameScene') as GameScene;
      const target = scene.boss!.targets[0];
      (scene.player.body as Phaser.Physics.Arcade.Body).reset(target.x - 24, target.y + 4);
      await new Promise<void>(done => scene.events.once('postupdate', () => done()));
      const cam = scene.cameras.main;
      return { x: (target.x - cam.worldView.x) * cam.zoom, y: (target.y - 13 - cam.worldView.y) * cam.zoom };
    });
    await page.mouse.click(canvas.x + point.x * canvas.width / 480, canvas.y + point.y * canvas.height / 270, { delay: 65 });
    await page.waitForFunction(() => {
      const scene = window.__game!.scene.getScene('GameScene') as GameScene;
      return ((scene.boss!.targets[0] as { hp?: number })?.hp ?? 600) < 600;
    }, undefined, { timeout: 800 });
  }).toPass({ timeout: 9000 });
  await page.screenshot({ path: 'test-results/el-set-combate.png' });
  // Advance thresholds through the normal damage adapters, independent of player DPS.
  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('GameScene') as GameScene;
    scene.boss!.targets[0].takeSwordDamage(9999, { x: 1, y: 0 });
    if (scene.boss!.targets.length) throw new Error('La apertura del corazón debe protegerlo');
  });
  await page.waitForFunction(() => {
    const scene = window.__game!.scene.getScene('GameScene') as GameScene;
    return scene.boss?.targets.length === 1;
  });
  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('GameScene') as GameScene;
    scene.boss!.targets[0].takeFireDamage(77, { x: 1, y: 0 });
  });
  await expect(page.getByText('ERROR 23\nBODOQUE: ¡Queda una pura...!', {exact:true})).toBeVisible();
  await page.screenshot({ path: 'test-results/el-set-corazon.png' });
  await page.evaluate(() => {
    const scene = window.__game!.scene.getScene('GameScene') as GameScene;
    scene.boss!.targets[0].takeSwordDamage(23, { x: 1, y: 0 });
  });
  await expect(video).toHaveAttribute('aria-label', 'Fin de transmisión', { timeout: 12000 });
  await expect(video).toHaveAttribute('src', /cine3\.webm#t=0\.82$/);
  await expect.poll(() => video.evaluate(v => (v as HTMLVideoElement).currentTime)).toBeGreaterThan(.82);
  expect(await music()).toBeNull();
  expect(await page.evaluate(() => window.__game!.scene.isActive('CreditsScene'))).toBe(false);
  await video.evaluate(v => { (v as HTMLVideoElement).currentTime = 30.5; });
  await expect.poll(() => video.evaluate(v => (v as HTMLVideoElement).currentTime)).toBeGreaterThan(30.6);
  await page.screenshot({ path: 'test-results/el-cuento-de-tulio.png' });
  await page.waitForFunction(() => window.__game!.scene.isActive('CreditsScene'), undefined, { timeout: 15000 });
  await expect(video).toHaveCount(0);
  await expect.poll(music).toBe('music-title');
  expect(errors).toEqual([]);
});
