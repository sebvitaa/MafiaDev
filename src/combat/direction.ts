export function normalizedDirection(point: {x:number;y:number}): {x:number;y:number} {
  const length=Math.hypot(point.x,point.y);
  return length>0&&Number.isFinite(length)?{x:point.x/length,y:point.y/length}:{x:0,y:0};
}
