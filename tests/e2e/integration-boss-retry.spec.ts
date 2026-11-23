import {test,expect} from '@playwright/test';
import type {GameScene} from '../../src/scenes/GameScene';

test('morir en El Set restaura al jugador y crea un único jefe nuevo en la hoguera',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/?skipIntro=1&map=1&noEnemies=1');
  await page.getByRole('menuitem',{name:/JUGAR/}).click();
  await page.waitForFunction(()=>window.__game?.scene.isActive('GameScene'));
  await page.evaluate(()=>{
    const s=window.__game!.scene.getScene('GameScene') as GameScene;
    const map=s.make.tilemap({key:'world'});
    const cp=map.findObject('objects',o=>o.type==='checkpoint'&&o.name==='cp4')!;
    s.hero.body.reset(cp.x!,cp.y!);
  });
  await expect(page.locator('video')).toHaveAttribute('aria-label','La Última Apuesta');
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=> (window.__game!.scene.getScene('GameScene') as GameScene).boss?.entity?.active);
  await page.keyboard.press('e');
  await page.waitForTimeout(100);
  await page.evaluate(()=>{
    const s=window.__game!.scene.getScene('GameScene') as GameScene;
    s.hero.takeEnemyDamage(999,{x:0,y:1});
  });
  await page.waitForFunction(()=>!(window.__game!.scene.getScene('GameScene') as GameScene).hero.alive);
  await page.waitForFunction(()=>{
    const s=window.__game!.scene.getScene('GameScene') as GameScene;
    return s.hero.alive&&s.boss?.entity?.active;
  });
  expect(await page.evaluate(()=>{
    const s=window.__game!.scene.getScene('GameScene') as GameScene;
    return {hp:s.hero.hp,boss:s.boss!.entity!.hp,count:s.children.list.filter(o=>o.name==='room-bodoque-visual').length};
  })).toEqual({hp:125,boss:600,count:1});
  expect(errors).toEqual([]);
});
