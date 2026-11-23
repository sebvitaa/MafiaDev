import {test,expect} from '@playwright/test';
import type {GameScene} from '../../src/scenes/GameScene';

test('selector de Mago, I lanza almas al cursor y mantiene una sola red TP',async({page})=>{
  await page.goto('/?skipIntro=1&map=1&noEnemies=1');
  await page.getByRole('menuitem',{name:/CLASE:/}).click();
  await expect(page.getByRole('menuitem',{name:/CLASE: MAGO/})).toBeVisible();
  await page.getByRole('menuitem',{name:/JUGAR/}).click();
  await page.waitForFunction(()=>window.__game?.scene.isActive('GameScene'));
  const info=await page.evaluate(()=>{
    const s=window.__game!.scene.getScene('GameScene') as GameScene & {spellDamage?:number};
    s.spellDamage=0;
    const point={x:s.hero.anchor.x+60,y:s.hero.anchor.y};
    s.combatTargets=()=>[{id:'spell-target',...point,radius:16,
      takeSwordDamage:(damage:number)=>{s.spellDamage!+=damage;},takeFireDamage(){} }];
    return {hp:s.hero.maxHp,point};
  });
  expect(info.hp).toBe(100);
  await page.waitForTimeout(500);
  const screen=await page.evaluate(point=>{
    const cam=window.__game!.scene.getScene('GameScene').cameras.main;
    return {x:(point.x-cam.worldView.x)*cam.zoom,y:(point.y-cam.worldView.y)*cam.zoom};
  },info.point);
  const box=(await page.locator('canvas').boundingBox())!;
  await page.mouse.move(box.x+screen.x*box.width/480,box.y+screen.y*box.height/270);
  await page.keyboard.press('i');
  await expect.poll(()=>page.evaluate(()=>(window.__game!.scene.getScene('GameScene') as GameScene & {spellDamage:number}).spellDamage)).toBeGreaterThan(0);
  expect(await page.evaluate(()=>window.__game!.scene.getScene('GameScene').children.list.filter(o=>o.name==='teleport-status').length)).toBe(1);
});

test('Luchador congela enemigos con I, cooldown impide reactivar y muerte limpia el efecto',async({page})=>{
  await page.goto('/?skipIntro=1&map=1&noEnemies=1');
  await page.getByRole('menuitem',{name:/JUGAR/}).click();
  await page.waitForFunction(()=>window.__game?.scene.isActive('GameScene'));
  await page.keyboard.press('i');
  await expect.poll(()=>page.evaluate(()=>Number(window.__game!.registry.get('timeStopRemaining')))).toBeGreaterThan(2000);
  await page.waitForTimeout(500);
  const before=await page.evaluate(()=>Number(window.__game!.registry.get('timeStopRemaining')));
  await page.keyboard.press('i');
  expect(await page.evaluate(()=>Number(window.__game!.registry.get('timeStopRemaining')))).toBeLessThan(before);
  await page.evaluate(()=>{
    const s=window.__game!.scene.getScene('GameScene') as GameScene;
    s.hero.takeEnemyDamage(999,{x:0,y:1});
  });
  await expect.poll(()=>page.evaluate(()=>Number(window.__game!.registry.get('timeStopRemaining')))).toBe(0);
});
