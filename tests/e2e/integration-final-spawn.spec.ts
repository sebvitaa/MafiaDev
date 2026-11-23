import {test,expect} from '@playwright/test';
import type {GameScene} from '../../src/scenes/GameScene';
for(const map of [1,2,3])test('FINAL aparece en suelo y cámara válida, mapa '+map,async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?skipIntro=1&stage=3&map='+map+'&noEnemies=1');
 await page.getByRole('menuitem',{name:/3 · FINAL/}).click();
 await expect(page.locator('video')).toHaveAttribute('aria-label','La Última Apuesta');
 await page.keyboard.press('Escape');
 await page.waitForFunction(()=>window.__game?.scene.isActive('GameScene')&&(window.__game.scene.getScene('GameScene') as GameScene).boss?.entity?.active);
 await page.getByRole('button',{name:/Saltar/}).click();
 await page.waitForFunction(()=> (window.__game?.scene.getScene('GameScene') as GameScene)?.boss?.entity?.active);
 const state=await page.evaluate(()=>{
  const s=window.__game!.scene.getScene('GameScene') as GameScene,h=s.hero,c=s.cameras.main;
  const tilemap=s.make.tilemap({key:'world'}),walls=tilemap.getLayer('walls')!.tilemapLayer;
  return {x:h.anchor.x,y:h.anchor.y,width:tilemap.widthInPixels,height:tilemap.heightInPixels,
   blocked:(s.children.list.find(o=>(o as Phaser.Tilemaps.TilemapLayer).layer?.name==='walls') as Phaser.Tilemaps.TilemapLayer).getTilesWithinWorldXY(h.anchor.x-6,h.anchor.y-5,12,10).some(t=>t.collides),
   visible:c.worldView.contains(h.anchor.x,h.anchor.y),sword:h.hasSword};
 });
 expect(state.x).toBeGreaterThan(0);expect(state.x).toBeLessThan(state.width);
 expect(state.y).toBeGreaterThan(0);expect(state.y).toBeLessThan(state.height);
 expect(state).toMatchObject({blocked:false,visible:true,sword:true});expect(errors).toEqual([]);
});
