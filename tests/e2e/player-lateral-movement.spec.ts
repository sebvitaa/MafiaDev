import { expect, test, type Page } from '@playwright/test';
import type { GameScene } from '../../src/scenes/GameScene';

// Replaces the three obsolete skipped lateral cases with the real integrated top-down player.
const state=(page:Page)=>page.evaluate(()=>{
  const p=(window.__game!.scene.getScene('GameScene') as GameScene).hero;
  return {x:p.anchor.x,y:p.anchor.y,vx:p.body.velocity.x,vy:p.body.velocity.y,
    z:p.motion.height,dash:p.motion.dash.active,cooldown:p.motion.dash.cooldownRemainingMs,
    jumps:p.motion.airJumpsRemaining,hp:p.hp,gravity:p.body.allowGravity};
});
test.beforeEach(async({page})=>{
  await page.goto('/?skipIntro=1&map=1&noEnemies=1');
  await page.getByRole('menuitem',{name:/JUGAR/}).click();
  await page.waitForFunction(()=>window.__game?.scene.isActive('GameScene'));
});
test('Shift corre sin dash y salto/doble salto usan altura independiente',async({page})=>{
  await page.keyboard.down('d');
  await expect.poll(async()=>(await state(page)).vx).toBe(150);
  await page.keyboard.down('Shift');
  await expect.poll(async()=>(await state(page)).vx).toBe(247.5);
  expect((await state(page)).dash).toBe(false);
  await page.keyboard.up('d');await page.keyboard.up('Shift');
  await page.keyboard.down('Space');
  await page.waitForFunction(()=>(window.__game!.scene.getScene('GameScene') as GameScene).hero.motion.height>10);
  await page.keyboard.up('Space');
  await page.keyboard.down('z');
  await page.waitForFunction(()=>(window.__game!.scene.getScene('GameScene') as GameScene).hero.motion.airJumpsRemaining===0);
  await page.keyboard.up('z');
  expect((await state(page)).gravity).toBe(false);
});
test('dash finaliza, evita daño durante su ventana y no se repite al mantener C',async({page})=>{
  const result=await page.evaluate(()=>new Promise<{hp:number;during:boolean;ended:boolean}>(resolve=>{
    const s=window.__game!.scene.getScene('GameScene') as GameScene,p=s.hero;
    const hp=p.hp;let during=false;
    const listener=()=>{
      if(p.motion.dash.active){during=true;p.takeEnemyDamage(25,{x:1,y:0});}
      else if(during){s.events.off('postupdate',listener);resolve({hp:p.hp,during,ended:hp===p.hp});}
    };s.events.on('postupdate',listener);s.input.keyboard!.emit('keydown-C',{repeat:false});
  }));
  expect(result).toEqual({hp:125,during:true,ended:true});
  await page.keyboard.down('c');
  expect((await state(page)).dash).toBe(false);
  await page.waitForTimeout(700);
  expect((await state(page)).dash).toBe(false);
  await page.keyboard.up('c');
});
test('dash aéreo conserva saltos y el tilemap sigue bloqueando el plano del suelo',async({page})=>{
  await page.keyboard.down('Space');
  await page.waitForFunction(()=>(window.__game!.scene.getScene('GameScene') as GameScene).hero.motion.height>5);
  const jumps=(await state(page)).jumps;
  await page.keyboard.press('c');
  expect((await state(page)).jumps).toBe(jumps);
  await page.keyboard.up('Space');
  await page.waitForTimeout(750);
  const wall=await page.evaluate(()=>{
    const s=window.__game!.scene.getScene('GameScene') as GameScene;
    const layer=s.children.list.find((o:any)=>o.layer?.name==='walls') as any;
    const tile=layer.getTilesWithin().find((t:any)=>t.collides && t.x>2 && !layer.getTileAt(t.x-1,t.y)?.collides);
    if(!tile)throw Error('No wall fixture found');
    s.hero.body.reset(tile.pixelX-12,tile.pixelY+8);s.hero.motion.facing={x:1,y:0};
    return tile.pixelX;
  });
  await page.keyboard.down('d');await page.keyboard.press('k');await page.waitForTimeout(220);
  await page.keyboard.up('d');
  expect((await state(page)).x).toBeLessThan(wall);
});
