import type { CharacterStats } from '../types/character';
import type { ItemDef } from '../types/items';

/** Bonuses mutate the existing shared stats object; expired buffs remove only their own contribution. */
export class Inventory {
  readonly collected: string[] = [];
  private buffs: { stats: NonNullable<ItemDef['stats']>; remaining: number }[] = [];
  private equipment?: ItemDef;
  constructor(private readonly stats: CharacterStats) {}
  collect(item: ItemDef): void {
    this.collected.push(item.id);
    if(item.type==='equipment') {
      if(this.equipment?.stats)this.adjust(this.equipment.stats,-1);
      this.equipment=item;
      if(item.stats)this.adjust(item.stats,1);
    } else if(item.type==='buff'&&item.stats) {
      this.adjust(item.stats,1);this.buffs.push({stats:item.stats,remaining:item.durationMs??0});
    }
  }
  update(dt: number): void {
    for(let i=this.buffs.length-1;i>=0;i--){
      this.buffs[i].remaining-=Math.max(0,dt);
      if(this.buffs[i].remaining<=0){this.adjust(this.buffs[i].stats,-1);this.buffs.splice(i,1);}
    }
  }
  private adjust(values: NonNullable<ItemDef['stats']>, sign: number): void {
    for(const key of ['atk','def','speed'] as const)this.stats[key]+=(values[key]??0)*sign;
  }
}
