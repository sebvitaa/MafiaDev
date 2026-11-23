import { describe, expect, it } from 'vitest';
import { roomAt, zoneAt, type ZoneRect } from '../../src/exploration/zones';

const zones: ZoneRect[] = [
  { name: 'Zone 1', zone: 'zone1', x: 0, y: 0, width: 100, height: 100 },
  { name: 'Boss', zone: 'boss', roomId: 'boss-room', x: 20, y: 20, width: 20, height: 20 },
];

describe('zones', () => {
  it('returns the smallest nested zone', () => {
    expect(zoneAt(zones, 25, 25)?.name).toBe('Boss');
  });

  it('uses inclusive lower and exclusive upper bounds', () => {
    expect(zoneAt(zones, 0, 0)?.name).toBe('Zone 1');
    expect(zoneAt(zones, 100, 0)).toBeNull();
  });

  it('returns null outside every zone', () => {
    expect(zoneAt(zones, -1, 50)).toBeNull();
  });

  it('finds only zones with a room id', () => {
    expect(roomAt(zones, 25, 25)?.roomId).toBe('boss-room');
    expect(roomAt(zones, 5, 5)).toBeNull();
  });
});
