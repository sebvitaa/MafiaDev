import {test,expect} from '@playwright/test';
import type {GameScene} from '../../src/scenes/GameScene';

test('apertura completa, ambos videos, mundo, jefe y cierre sin créditos prematuros',async({page})=>{
  test.setTimeout(150000);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/?map=1&noEnemies=1');
  await page.waitForFunction(()=>window.__game?.scene.isActive('PreloadScene'));
  await page.screenshot({path:'test-results/integration-opening.png'});
  // No skipIntro, keypress, fast-forward or session flag: watch Seba's full opening.
  await page.waitForFunction(()=>window.__game?.scene.isActive('TitleScene'),{},{timeout:45000});
  await page.waitForTimeout(800); // Title installs its start prompt after the logo lands.
  await page.keyboard.press('Enter');
  const play=page.getByRole('menuitem',{name:/JUGAR/});
  await expect(play).toBeVisible();
  await page.screenshot({path:'test-results/integration-title.png'});
  await play.click();
  const video=page.locator('video');
  await expect(video).toHaveAttribute('aria-label','La Nota');
  await expect.poll(()=>video.evaluate(v=>(v as HTMLVideoElement).currentTime)).toBeGreaterThan(0.3);
  await expect(video).toHaveCount(0,{timeout:20000});
  await page.waitForFunction(()=>window.__game?.scene.isActive('GameScene'));
  await page.keyboard.press('d',{delay:100});
  expect(await page.evaluate(()=>{
    const s=window.__game!.scene.getScene('GameScene') as GameScene;
    return s.hero.alive && s.hero.maxHp===125;
  })).toBe(true);
  // Integration fixtures position the hero at El Set; normal room entry must launch the actual film.
  await page.evaluate(()=>{
    const s=window.__game!.scene.getScene('GameScene') as GameScene;
    const map=s.make.tilemap({key:'world'});
    const set=map.findObject('objects',o=>o.type==='boss_arena')!;
    s.hero.body.reset(set.x!+set.width!/2,set.y!+set.height!/2+90);
  });
  await expect(video).toHaveAttribute('aria-label','La Última Apuesta',{timeout:15000});
  await expect.poll(()=>video.evaluate(v=>(v as HTMLVideoElement).currentTime)).toBeGreaterThan(.3);
  await expect(video).toHaveCount(0,{timeout:20000});
  await page.waitForFunction(()=>(window.__game?.scene.getScene('GameScene') as GameScene)?.boss?.entity?.active);
  await page.screenshot({path:'test-results/integration-boss.png'});
  // Pattern orchestration is exercised deterministically; actual combat geometry has separate tests.
  await page.evaluate(()=>{
    const s=window.__game!.scene.getScene('GameScene') as GameScene;
    // Park outside the attack arena: this fixture verifies sequencing, not idle survival.
    const b=s.boss!.entity!;s.hero.body.reset(b.brain.config.bounds!.left-160,b.brain.config.bounds!.top-160);
    b.takeSwordDamage(204,{x:1,y:0});
  });
  await page.waitForFunction(()=> (window.__game!.scene.getScene('GameScene') as GameScene).boss!.entity!.brain.currentAttack?.id==='spectralRace');
  await page.evaluate(()=>{
    const s=window.__game!.scene.getScene('GameScene') as GameScene;
    s.boss!.entity!.takeSwordDamage(198,{x:1,y:0});
  });
  await page.waitForFunction(()=>['timeTheft','monitorShift','cableSweep'].includes((window.__game!.scene.getScene('GameScene') as GameScene).boss!.entity!.brain.currentAttack?.id??''));
  await page.evaluate(()=>{
    const s=window.__game!.scene.getScene('GameScene') as GameScene;
    s.boss!.entity!.takeSwordDamage(999,{x:1,y:0});
  });
  await page.waitForFunction(()=>(window.__game!.scene.getScene('GameScene') as GameScene).boss!.entity!.state==='heart');
  await page.evaluate(()=>{
    const b=(window.__game!.scene.getScene('GameScene') as GameScene).boss!.entity!;
    b.heartTarget.takeSwordDamage(77,{x:1,y:0});
  });
  await page.screenshot({path:'test-results/integration-error23.png'});
  expect(await page.evaluate(()=> (window.__game!.scene.getScene('GameScene') as GameScene).boss!.entity!.hp)).toBe(23);
  await page.evaluate(()=>{
    const b=(window.__game!.scene.getScene('GameScene') as GameScene).boss!.entity!;
    b.heartTarget.takeSwordDamage(23,{x:1,y:0});
  });
  expect(await page.evaluate(()=>window.__game!.scene.isActive('CreditsScene'))).toBe(false);
  await page.waitForFunction(()=>window.__game!.scene.isActive('EndingScene'));
  await expect(page.getByText('LA BANCA NO PERDIÓ. LA CASA NUNCA PIERDE.',{exact:true})).toBeVisible();
  await expect(page.getByText('EL CUENTO DE TULIO',{exact:true})).toBeVisible({timeout:20000});
  await page.screenshot({path:'test-results/integration-tulio.png'});
  await page.waitForFunction(()=>window.__game!.scene.isActive('CreditsScene'),{},{timeout:25000});
  await page.waitForTimeout(350); // Credits installs return controls after its entrance.
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>window.__game!.scene.isActive('TitleScene'));
  expect(errors).toEqual([]);
});
