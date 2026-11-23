import {it,expect} from 'vitest';
import {safeSpawn} from '../../src/player/room-prototype/safeSpawn';
it('clamps stale/outside positions and searches clear ground',()=>{
 expect(safeSpawn({x:9999,y:-50},480,270,()=>true)).toEqual({x:464,y:16});
 const p=safeSpawn({x:200,y:200},480,270,(x,y)=>x<190&&y<190);
 expect(p.x).toBeLessThan(190);expect(p.y).toBeLessThan(190);
 expect(safeSpawn({x:NaN,y:Infinity},480,270,()=>true)).toEqual({x:16,y:16});
});
