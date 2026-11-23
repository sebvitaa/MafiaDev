import { describe,it,expect } from 'vitest';
import { selectEchoDirection } from '../../src/player/room-prototype/echoTarget';
import { BodoqueBrain, type BodoqueConfig } from '../../src/enemies/BodoqueBrain';
import { patternZones, hitsPattern } from '../../src/enemies/BodoquePatterns';
import config from '../../src/data/enemies.json';
import {normalizedDirection} from '../../src/combat/direction';
const target=(id:string,x:number,y:number)=>({id,x,y,radius:10,takeSwordDamage(){}});
describe('integrated combat',()=>{
  it('normalizes boss knockback independent of distance and rejects invalid vectors',()=>{
    expect(normalizedDirection({x:300,y:400})).toEqual({x:0.6,y:0.8});
    expect(normalizedDirection({x:0,y:0})).toEqual({x:0,y:0});
    expect(normalizedDirection({x:Infinity,y:0})).toEqual({x:0,y:0});
  });
  it('aims echo from its dash origin at previous valid enemy, nearest otherwise, excluding walls and range',()=>{
    const from={x:0,y:0}, fallback={x:-1,y:0};
    expect(selectEchoDirection(from,[target('old',50,0),target('near',0,20)],72,'old',fallback,()=>true)).toEqual({x:1,y:0});
    expect(selectEchoDirection(from,[target('old',200,0),target('near',0,20)],72,'old',fallback,()=>true)).toEqual({x:0,y:1});
    expect(selectEchoDirection(from,[target('old',50,0)],72,'old',fallback,()=>false)).toEqual(fallback);
  });
  it('runs distinct second and third phase patterns without inventing a fourth phase',()=>{
    const brain=new BodoqueBrain(config.bodoque as BodoqueConfig);
    brain.activate();brain.takeDamage(204);
    expect(brain.phase).toBe(2);
    brain.update(420,{x:100,y:100},{x:0,y:0});
    expect(brain.currentAttack?.id).toBe('spectralRace');
    const zones=patternZones(brain.currentAttack!);
    expect(hitsPattern({x:100,y:100},8,zones)).toBe(true);
    expect(hitsPattern({x:100,y:42},8,zones)).toBe(false);
    brain.takeDamage(198);
    expect(brain.phase).toBe(3);
    brain.update(10000,{x:100,y:100},{x:0,y:0});
    expect(['timeTheft','monitorShift','cableSweep']).toContain(brain.currentAttack!.id);
    brain.takeDamage(999);
    expect(brain.phase).toBe(3);
    expect(brain.state).toBe('opening');
    expect(brain.hp).toBe(100);
  });
  it('cycles every configured attack of phases two and three through tell, active and recovery',()=>{
    for(const [damage,ids] of [[204,['spectralRace','betTickets','collectors']],[402,['timeTheft','monitorShift','cableSweep']]] as const){
      const brain=new BodoqueBrain(config.bodoque as BodoqueConfig);
      brain.activate();brain.takeDamage(damage);
      brain.update(brain.config.idleMs,{x:80,y:0},{x:0,y:0});
      for(const id of ids){
        expect(brain.currentAttack!.id).toBe(id);
        expect(brain.state).toBe('telegraph');
        const a=brain.currentAttack!.config;
        brain.update(a.windupMs,{x:80,y:0},{x:0,y:0});
        expect(brain.state).toBe('active');
        brain.update(a.activeMs,{x:80,y:0},{x:0,y:0});
        expect(brain.state).toBe('recovery');
        brain.update(a.recoveryMs+brain.config.idleMs,{x:80,y:0},{x:0,y:0});
      }
    }
  });
});
