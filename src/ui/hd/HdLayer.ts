import Phaser from 'phaser';
import { fitCanvasRect } from './fit';

export interface HdElementOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  depth?: number;
  className?: string;
  text?: string;
  parent?: HTMLElement;
  interactive?: boolean;
  style?: Partial<CSSStyleDeclaration>;
}

export interface HdTextOptions {
  width?: number;
  depth?: number;
  className?: string;
  color?: string;
  fontSize?: number;
  weight?: 500 | 600;
  align?: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: string;
  interactive?: boolean;
}

export interface HdLayerHandle {
  el<K extends keyof HTMLElementTagNameMap>(tag: K, options?: HdElementOptions): HTMLElementTagNameMap[K];
  panel(x: number, y: number, width: number, height: number, options?: { depth?: number; alpha?: number; className?: string; interactive?: boolean }): HTMLDivElement;
  text(x: number, y: number, content: string, options?: HdTextOptions): HTMLDivElement;
  remove(): void;
}

interface LayerRecord {
  scene: Phaser.Scene;
  element: HTMLDivElement;
  activation: number;
  listeners: Array<[string, (...args: never[]) => void]>;
  handle: HdLayerHandle;
}

interface OverlayService {
  game: Phaser.Game;
  parent: HTMLElement;
  root: HTMLDivElement;
  stage: HTMLDivElement;
  records: Map<Phaser.Scene, LayerRecord>;
  resizeObserver?: ResizeObserver;
  sync: () => void;
  dispose: () => void;
  activation: number;
  previousPosition: string;
  changedPosition: boolean;
  disposed: boolean;
}

const STAGE_WIDTH = 480;
const STAGE_HEIGHT = 270;
const services = new WeakMap<Phaser.Game, OverlayService>();

const STYLE_ID = 'mafiadev-hd-layer-styles';
const CSS = `
.mafiadev-hd-overlay{position:absolute;overflow:hidden;pointer-events:none;transform-origin:top left;z-index:20}
.mafiadev-hd-stage{position:absolute;left:0;top:0;width:480px;height:270px;transform-origin:top left;overflow:hidden}
.mafiadev-hd-scene{position:absolute;inset:0;width:480px;height:270px;pointer-events:none;transition:opacity 120ms ease-out}
.hd-menu-root{position:absolute;inset:0;pointer-events:none}
.hd-panel{box-sizing:border-box;border:1px solid rgba(255,95,162,.55);border-radius:2px;box-shadow:0 6px 24px rgba(0,0,0,.45);backdrop-filter:blur(2px);}
.hd-panel::before{content:"";position:absolute;left:2px;right:2px;top:0;height:1px;background:rgba(255,255,255,.18);pointer-events:none}
.hd-text,.hd-menu-row,.hd-menu-value,.hd-menu-caption{font-family:"Barlow Condensed",sans-serif;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:#ebe7f4}
.hd-text{position:absolute;line-height:1.15;white-space:pre-wrap}
.hd-menu-row{position:absolute;box-sizing:border-box;display:flex;align-items:center;height:100%;pointer-events:none;transition:transform 90ms cubic-bezier(.2,.8,.2,1),color 90ms ease-out,text-shadow 90ms ease-out;white-space:nowrap;font-size:13px;line-height:1;color:#ebe7f4;}
.hd-menu-row.is-interactive{pointer-events:auto;cursor:pointer}
.hd-menu-row.is-selected{color:#ff5fa2;text-shadow:0 0 8px rgba(255,95,162,.28)}
.hd-menu-row.is-disabled{color:#5a5370;text-shadow:none}
.hd-menu-caption{display:block;position:relative;line-height:1.1;color:inherit;white-space:nowrap}
.hd-menu-value{position:absolute;top:0;height:100%;box-sizing:border-box;display:flex;justify-content:flex-end;align-items:center;text-align:right;line-height:1;color:inherit;white-space:nowrap}
.hd-menu-cursor{position:absolute;width:12px;height:7.5px;object-fit:fill;image-rendering:pixelated;pointer-events:none}
@keyframes hd-fedora-bob{from{transform:translateY(-1px)}to{transform:translateY(1px)}}
.hd-pixel-bar{position:absolute;top:50%;display:flex;gap:1px;height:6px;transform:translateY(-50%);pointer-events:none}
.hd-pixel-bar i{display:block;width:3px;height:6px;background:#3a3352}
.hd-pixel-bar i.is-filled{background:#ff5fa2}
.hd-choice{position:absolute;box-sizing:border-box;display:flex;align-items:center;justify-content:center;border:1px solid #5a5370;background:rgba(34,29,51,.92);color:#ebe7f4;font:600 13px/1 "Barlow Condensed",sans-serif;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;pointer-events:auto;transition:background-color 90ms,color 90ms,border-color 90ms}
.hd-choice.is-selected{border-color:rgba(255,95,162,.7);background:rgba(255,95,162,.12);color:#ff5fa2;text-shadow:0 0 8px rgba(255,95,162,.25)}
.hd-keycap{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;height:14px;padding:0 4px;border:1px solid #8a83a3;background:#221d33;color:#ebe7f4;font:600 10px/1 "Barlow Condensed",sans-serif;letter-spacing:.04em}
.hd-reduced-motion .hd-menu-row,.hd-reduced-motion .hd-choice{transition:none!important}
@media(prefers-reduced-motion:reduce){.mafiadev-hd-scene,.hd-menu-row,.hd-choice,.hd-panel,.hd-dialog-message{transition:none!important}.hd-menu-cursor{animation:none!important}}
`;

function ensureStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}

function makeService(game: Phaser.Game): OverlayService {
  const canvas = game.canvas;
  const parent = canvas.parentElement ?? (canvas.parentNode as HTMLElement | null);
  if (!parent) throw new Error('HD layer requires the Phaser canvas to have a parent element');
  ensureStyles();

  const previousPosition = parent.style.position;
  const changedPosition = getComputedStyle(parent).position === 'static';
  if (changedPosition) parent.style.position = 'relative';

  const root = document.createElement('div');
  root.className = 'mafiadev-hd-overlay';
  root.setAttribute('aria-hidden', 'false');
  const stage = document.createElement('div');
  stage.className = 'mafiadev-hd-stage';
  root.appendChild(stage);
  parent.appendChild(root);

  const service: OverlayService = {
    game, parent, root, stage, records: new Map(), activation: 0, disposed: false,
    previousPosition, changedPosition,
    sync: () => {
      const canvasRect = canvas.getBoundingClientRect();
      const parentRect = parent.getBoundingClientRect();
      const fit = fitCanvasRect(canvasRect, parentRect, {
        clientLeft: parent.clientLeft,
        clientTop: parent.clientTop,
        scrollLeft: parent.scrollLeft,
        scrollTop: parent.scrollTop,
        offsetWidth: parent.offsetWidth,
        offsetHeight: parent.offsetHeight,
      }, STAGE_WIDTH, STAGE_HEIGHT);
      root.style.left = `${fit.left}px`;
      root.style.top = `${fit.top}px`;
      root.style.width = `${fit.width}px`;
      root.style.height = `${fit.height}px`;
      stage.style.transform = `scale(${fit.scaleX}, ${fit.scaleY})`;
      service.records.forEach((record) => {
        record.element.style.zIndex = String(record.activation * 10000);
      });
    },
    dispose: () => {
      if (service.disposed) return;
      service.disposed = true;
      game.scale.off(Phaser.Scale.Events.RESIZE, service.sync);
      game.scale.off(Phaser.Scale.Events.ENTER_FULLSCREEN, service.sync);
      game.scale.off(Phaser.Scale.Events.LEAVE_FULLSCREEN, service.sync);
      window.removeEventListener('resize', service.sync);
      service.resizeObserver?.disconnect();
      service.records.forEach((record) => removeRecord(service, record));
      root.remove();
      if (service.changedPosition) parent.style.position = service.previousPosition;
      services.delete(game);
    },
  };

  game.scale.on(Phaser.Scale.Events.RESIZE, service.sync);
  game.scale.on(Phaser.Scale.Events.ENTER_FULLSCREEN, service.sync);
  game.scale.on(Phaser.Scale.Events.LEAVE_FULLSCREEN, service.sync);
  window.addEventListener('resize', service.sync);
  if (typeof ResizeObserver !== 'undefined') {
    service.resizeObserver = new ResizeObserver(service.sync);
    service.resizeObserver.observe(canvas);
    service.resizeObserver.observe(parent);
  }
  game.events.once(Phaser.Core.Events.DESTROY, service.dispose);
  services.set(game, service);
  service.sync();
  return service;
}

function createRecord(service: OverlayService, scene: Phaser.Scene): LayerRecord {
  const element = document.createElement('div');
  element.className = 'mafiadev-hd-scene';
  service.stage.appendChild(element);

  const record = {} as LayerRecord;
  const bump = () => { record.activation = ++service.activation; service.sync(); };
  const onPause = () => { record.element.style.opacity = '0.55'; };
  const onResume = () => { record.element.style.opacity = '1'; record.element.style.display = ''; bump(); };
  const onSleep = () => { record.element.style.display = 'none'; };
  const onWake = () => { record.element.style.display = ''; bump(); };
  const onShutdown = () => removeRecord(service, record);

  const handle: HdLayerHandle = {
    el: (tag, options = {}) => {
      const el = document.createElement(tag);
      el.className = options.className ?? '';
      el.textContent = options.text ?? '';
      el.style.position = 'absolute';
      el.style.left = `${options.x ?? 0}px`;
      el.style.top = `${options.y ?? 0}px`;
      if (options.width !== undefined) el.style.width = `${options.width}px`;
      if (options.height !== undefined) el.style.height = `${options.height}px`;
      el.style.zIndex = String(options.depth ?? 0);
      el.style.pointerEvents = options.interactive ? 'auto' : 'none';
      if (options.style) Object.assign(el.style, options.style);
      (options.parent ?? element).appendChild(el);
      return el;
    },
    panel: (x, y, width, height, options = {}) => {
      const panel = handle.el('div', {
        x, y, width, height, depth: options.depth, className: `hd-panel${options.className ? ` ${options.className}` : ''}`,
        interactive: options.interactive,
      });
      const alpha = Math.max(0, Math.min(1, options.alpha ?? 0.82));
      panel.style.background = `linear-gradient(180deg,rgba(31,26,43,${alpha}),rgba(19,17,28,${alpha}))`;
      return panel;
    },
    text: (x, y, content, options = {}) => handle.el('div', {
      x: options.align === 'center' && options.width ? x - options.width / 2 : x,
      y, width: options.width, depth: options.depth, text: content, className: `hd-text${options.className ? ` ${options.className}` : ''}`,
      interactive: options.interactive,
      style: {
        color: options.color ?? '#ebe7f4',
        fontSize: `${options.fontSize ?? 14}px`,
        fontWeight: String(options.weight ?? 500),
        textAlign: options.align ?? 'left',
        lineHeight: options.lineHeight ? `${options.lineHeight}px` : '1.15',
        letterSpacing: options.letterSpacing ?? '.08em',
      },
    }),
    remove: () => removeRecord(service, record),
  };

  Object.assign(record, { scene, element, activation: ++service.activation, listeners: [], handle });
  const bindings: Array<[string, (...args: never[]) => void]> = [
    [Phaser.Scenes.Events.PAUSE, onPause as (...args: never[]) => void],
    [Phaser.Scenes.Events.RESUME, onResume as (...args: never[]) => void],
    [Phaser.Scenes.Events.SLEEP, onSleep as (...args: never[]) => void],
    [Phaser.Scenes.Events.WAKE, onWake as (...args: never[]) => void],
    [Phaser.Scenes.Events.SHUTDOWN, onShutdown as (...args: never[]) => void],
  ];
  bindings.forEach(([event, listener]) => scene.events.on(event, listener));
  record.listeners = bindings;
  service.records.set(scene, record);
  service.sync();
  return record;
}

function removeRecord(service: OverlayService, record: LayerRecord): void {
  if (!service.records.has(record.scene)) return;
  record.listeners.forEach(([event, listener]) => record.scene.events.off(event, listener));
  record.element.remove();
  service.records.delete(record.scene);
  if (service.records.size === 0 && !service.disposed) service.dispose();
}

/** Returns the scene's crisp DOM layer, backed by one overlay root per Phaser game. */
export function hdLayer(scene: Phaser.Scene): HdLayerHandle {
  let service = services.get(scene.game);
  if (!service) service = makeService(scene.game);
  return service.records.get(scene)?.handle ?? createRecord(service, scene).handle;
}
