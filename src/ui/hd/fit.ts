export interface ClientRectLike {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ParentMetrics {
  clientLeft?: number;
  clientTop?: number;
  scrollLeft?: number;
  scrollTop?: number;
  offsetWidth?: number;
  offsetHeight?: number;
}

export interface CanvasFit {
  left: number;
  top: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
}

/** Maps the canvas client rectangle into its positioned parent's CSS coordinate space. */
export function fitCanvasRect(
  canvas: ClientRectLike,
  parent: ClientRectLike,
  metrics: ParentMetrics = {},
  stageWidth = 480,
  stageHeight = 270,
): CanvasFit {
  const parentScaleX = metrics.offsetWidth && parent.width ? parent.width / metrics.offsetWidth : 1;
  const parentScaleY = metrics.offsetHeight && parent.height ? parent.height / metrics.offsetHeight : 1;
  const scaleX = parentScaleX || 1;
  const scaleY = parentScaleY || 1;
  const width = canvas.width / scaleX;
  const height = canvas.height / scaleY;

  return {
    left: (canvas.left - parent.left) / scaleX - (metrics.clientLeft ?? 0) + (metrics.scrollLeft ?? 0),
    top: (canvas.top - parent.top) / scaleY - (metrics.clientTop ?? 0) + (metrics.scrollTop ?? 0),
    width,
    height,
    scaleX: width / stageWidth,
    scaleY: height / stageHeight,
  };
}
