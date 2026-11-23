import {it,expect} from 'vitest';
import {Inventory} from '../../src/character/Inventory';
import classes from '../../src/data/classes.json';
import tuning from '../../src/data/tuning.json';
import items from '../../src/data/items.json';
import type {ItemDef} from '../../src/types/items';
import {FireballBlast,FireballTimeline} from '../../src/player/room-prototype/FireballCombat';

it('preserves equipment while an independent fury buff expires',()=>{
  const stats={...classes.luchador.stats};
  const bag=new Inventory(stats);
  bag.collect(items.find(i=>i.id==='elixir_furia') as ItemDef);
  bag.collect(items.find(i=>i.id==='hoja_eclipse') as ItemDef);
  expect(stats.atk).toBe(8);expect(stats.speed).toBe(130);
  bag.update(10000);
  expect(stats.atk).toBe(6);expect(stats.speed).toBe(130);
  bag.collect(items.find(i=>i.id==='hoja_eclipse') as ItemDef);
  expect(stats.atk).toBe(6);
});
it('Italian Rain uses 100 base damage per enemy once, adds consumed debt once and retains 20 seconds cooldown',()=>{
  expect(tuning.roomPrototype.fireballCooldownMs).toBe(20000);
  expect(tuning.roomPrototype.fireballBaseDamage).toBe(100);
  let a=0,b=0,marks=3;
  const targets=[
    {id:'a',x:10,y:0,radius:8,takeFireDamage:(damage:number)=>{a+=damage;},
      consumeDebtMarks:()=>{const n=marks;marks=0;return n;}},
    {id:'b',x:20,y:0,radius:8,takeFireDamage:(damage:number)=>{b+=damage;}},
  ];
  const blast=new FireballBlast();
  blast.apply({x:0,y:0},targets,55,tuning.roomPrototype.fireballBaseDamage,10);
  blast.apply({x:0,y:0},targets,55,tuning.roomPrototype.fireballBaseDamage,10);
  expect(a).toBe(130);expect(b).toBe(100);expect(marks).toBe(0);
});
it('cancels an in-flight cast on death without resetting its cooldown or producing a delayed impact',()=>{
  const timeline=new FireballTimeline({fallMs:600,explosionMs:300,cooldownMs:20000});
  timeline.beginAim();timeline.releaseAim();timeline.update(100);
  timeline.cancelCast();
  expect(timeline.phase).toBe('idle');
  expect(timeline.cooldownRemainingMs).toBe(19900);
  expect(timeline.update(700)).toBe(false);
  expect(timeline.cooldownRemainingMs).toBe(19200);
});
