export interface GroundPoint {x:number;y:number}
/** Find a clear bounded ground position, never restore an invalid saved coordinate. */
export function safeSpawn(point:GroundPoint,width:number,height:number,isClear:(x:number,y:number)=>boolean):GroundPoint {
  const clamp=(v:number,max:number)=>Math.max(16,Math.min(max-16,Number.isFinite(v)?v:16));
  const origin={x:clamp(point.x,width),y:clamp(point.y,height)};
  if(isClear(origin.x,origin.y))return origin;
  for(let r=16;r<Math.max(width,height);r+=16)for(let y=-r;y<=r;y+=16)for(let x=-r;x<=r;x+=16){
    if(Math.abs(x)!==r&&Math.abs(y)!==r)continue;
    const p={x:clamp(origin.x+x,width),y:clamp(origin.y+y,height)};
    if(isClear(p.x,p.y))return p;
  }
  return origin;
}
