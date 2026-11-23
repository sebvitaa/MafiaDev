import { describe, expect, it } from 'vitest';
import { fitCanvasRect } from '../../src/ui/hd/fit';

describe('fitCanvasRect', () => {
  it('positions an overlay against a parent with borders and scrolling', () => {
    expect(fitCanvasRect(
      { left: 130, top: 90, width: 960, height: 540 },
      { left: 100, top: 50, width: 1000, height: 600 },
      { clientLeft: 2, clientTop: 3, scrollLeft: 10, scrollTop: 5, offsetWidth: 500, offsetHeight: 300 },
    )).toEqual({ left: 23, top: 22, width: 480, height: 270, scaleX: 1, scaleY: 1 });
  });

  it('keeps canvas dimensions and scales the 480 by 270 stage to its displayed size', () => {
    expect(fitCanvasRect(
      { left: 140, top: 80, width: 720, height: 405 },
      { left: 100, top: 50, width: 800, height: 500 },
      { clientLeft: 4, clientTop: 2, offsetWidth: 800, offsetHeight: 500 },
    )).toEqual({ left: 36, top: 28, width: 720, height: 405, scaleX: 1.5, scaleY: 1.5 });
  });
});
