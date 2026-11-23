import {it,expect} from 'vitest';
import first from '../../public/assets/maps/world.json';
import second from '../../public/assets/maps/world-2.json';
import third from '../../public/assets/maps/world-3.json';
for(const [file, data] of Object.entries({'world.json':first,'world-2.json':second,'world-3.json':third})){
  it(file+': spawn, swords, checkpoints and boss arena share a walkable route',()=>{
    const map=data as any;
    const objects=map.layers.find((l:{name:string})=>l.name==='objects').objects;
    const walls=map.layers.find((l:{name:string})=>l.name==='walls').data as number[];
    const spawn=objects.find((o:{type:string})=>o.type==='spawn');
    const index=(x:number,y:number)=>Math.floor(y/map.tileheight)*map.width+Math.floor(x/map.tilewidth);
    const visited=new Set<number>(), queue=[index(spawn.x,spawn.y)];
    for(let head=0;head<queue.length;head++){
      const i=queue[head];if(visited.has(i)||walls[i]>0)continue;
      visited.add(i);
      for(const j of [i-1,i+1,i-map.width,i+map.width]){
        if(j<0||j>=walls.length||Math.abs(j%map.width-i%map.width)>1)continue;
        if(!visited.has(j))queue.push(j);
      }
    }
    for(const object of objects.filter((o:{type:string})=>['sword','checkpoint','boss_arena'].includes(o.type))){
      const i=index(object.x+(object.width??0)/2,object.y+(object.height??0)/2);
      expect(visited.has(i),object.name).toBe(true);
    }
  });
}
