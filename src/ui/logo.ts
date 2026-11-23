// Dominio: seba. Logo de MafiaDev y marca de Codex dibujados por código (0 KB de assets).
// El mismo logo se usa en la apertura y en el título: la apertura termina donde empieza el título.
import Phaser from 'phaser';
import { C, hex, pixelTexture, text } from './theme';

export const LOGO_WORD = 'MAFIADEV';
// SUP-seba-20261123-114613: tagline elegido entre 6 propuestas de GPT-5-mini (2.27 sin respuesta).
export const TAGLINE = 'BAJO LA CIUDAD, LA VERDAD';
/** Posición del logo en el título (la apertura lo lleva hasta aquí). */
export const LOGO_TITLE_Y = 60;

const SIZE = 32;
const SPACING = 2;
const SHADOW = 0x6b1d45; // sombra dura de 1 px, rosa muy oscuro: se ve sobre negro y sobre la ciudad

export interface Logo {
  container: Phaser.GameObjects.Container;
  letters: Phaser.GameObjects.Text[];
  shadows: Phaser.GameObjects.Text[];
  fedora: Phaser.GameObjects.Image;
  tagline: Phaser.GameObjects.Text;
  /** x final (relativa al contenedor) de cada letra, para animarlas. */
  homeX: number[];
}

/** Sombrero fedora (20×9) para el logo y el favicon. */
export function makeFedoraTexture(scene: Phaser.Scene): void {
  pixelTexture(scene, 'ui-fedora', [
    '.......hhhhhh.......',
    '.....hhhhhhhhhh.....',
    '.....hhhhddhhhh.....',
    '.....hhhhhhhhhh.....',
    '.....bbbbbbbbbb.....',
    '..lhhhhhhhhhhhhhhh..',
    'lhhhhhhhhhhhhhhhhhhh',
    '.hhhhhhhhhhhhhhhhhh.',
    '...dddddddddddddd...',
  ], { h: 0x5a4f7a, d: 0x2a2440, b: C.accent, l: 0xb7afd0 });
}

/** Construye el logo (letras sueltas + sombra + fedora + tagline) centrado en (x, y). */
export function buildLogo(scene: Phaser.Scene, x: number, y: number): Logo {
  makeFedoraTexture(scene);
  const container = scene.add.container(x, y);
  const letters: Phaser.GameObjects.Text[] = [];
  const shadows: Phaser.GameObjects.Text[] = [];
  const widths = [...LOGO_WORD].map((ch) => {
    const m = text(scene, 0, 0, ch, { size: SIZE });
    const w = m.width;
    m.destroy();
    return w;
  });
  const total = widths.reduce((a, b) => a + b, 0) + SPACING * (widths.length - 1);
  const homeX: number[] = [];
  let cx = -total / 2;
  [...LOGO_WORD].forEach((ch, i) => {
    homeX.push(cx);
    const sh = text(scene, cx + 1, 1, ch, { size: SIZE, color: SHADOW }).setOrigin(0, 0.5);
    const t = text(scene, cx, 0, ch, { size: SIZE, color: C.accent }).setOrigin(0, 0.5);
    shadows.push(sh);
    letters.push(t);
    cx += widths[i] + SPACING;
  });
  container.add(shadows);
  container.add(letters);
  // el fedora descansa ladeado sobre la «M»
  const fedora = scene.add.image(homeX[0] + widths[0] / 2 + 1, -15, 'ui-fedora').setOrigin(0.5, 1).setAngle(-12);
  container.add(fedora);
  const tagline = text(scene, 0, 22, TAGLINE, { color: C.dim, align: 'center' }).setOrigin(0.5, 0);
  container.add(tagline);
  return { container, letters, shadows, fedora, tagline, homeX };
}

/** Brillo que recorre las letras (tinte de relleno claro, letra a letra). */
export function shineLogo(scene: Phaser.Scene, logo: Logo, stepMs = 45): void {
  logo.letters.forEach((l, i) => {
    scene.time.delayedCall(i * stepMs, () => {
      if (!l.active) return;
      l.setTint(0xffd6ea).setTintMode(Phaser.TintModes.FILL);
      scene.time.delayedCall(stepMs * 1.6, () => { if (l.active) l.clearTint(); });
    });
  });
}

/** Repite el brillo cada `everyMs` mientras la escena viva. */
export function idleShine(scene: Phaser.Scene, logo: Logo, everyMs = 2600): Phaser.Time.TimerEvent {
  return scene.time.addEvent({ delay: everyMs, loop: true, callback: () => shineLogo(scene, logo) });
}

/** Squash & stretch del logo al «aterrizar». */
export function squashLogo(scene: Phaser.Scene, logo: Logo, onImpact?: () => void): void {
  const c = logo.container;
  scene.tweens.chain({
    targets: c,
    tweens: [
      { scaleY: 0.82, scaleX: 1.12, duration: 70, onStart: () => onImpact?.() },
      { scaleY: 1.06, scaleX: 0.96, duration: 110, ease: 'Quad.Out' },
      { scaleY: 1, scaleX: 1, duration: 160, ease: 'Back.Out' },
    ],
  });
}

// ───────────── marca de Codex / OpenAI ─────────────

/**
 * Nudo hexagonal tipo «blossom» de OpenAI en pixel art: seis eslabones redondeados girados 60°,
 * dibujados a alta resolución y reducidos a `size` px con umbral de alfa (bordes nítidos, sin antialias).
 */
export function makeCodexMark(scene: Phaser.Scene, key = 'ui-codex-mark', size = 44): void {
  if (scene.textures.exists(key)) return;
  const S = 8; // sobremuestreo
  const big = document.createElement('canvas');
  big.width = big.height = size * S;
  const g = big.getContext('2d');
  if (!g) return;
  const R = (size * S) / 2;
  g.translate(R, R);
  g.strokeStyle = '#fff';
  g.lineWidth = R * 0.12;
  g.lineJoin = 'round';
  for (let k = 0; k < 6; k++) {
    g.save();
    g.rotate((k * Math.PI) / 3);
    // eslabón: rectángulo redondeado alargado cuyo lado interior roza el centro
    const w = R * 0.46, h = R * 1.05, x = R * 0.07, y = -R * 0.9, r = R * 0.22;
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
    g.stroke();
    g.restore();
  }
  const tex = scene.textures.createCanvas(key, size, size);
  if (!tex) return;
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(big, 0, 0, size, size);
  const img = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const on = img.data[i + 3] > 110;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
    img.data[i + 3] = on ? 255 : 0;
  }
  ctx.putImageData(img, 0, 0);
  tex.refresh();
}

/** Favicon = fedora del logo sobre el color del juego (generado en runtime). */
export function setFavicon(): void {
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 32;
    const g = c.getContext('2d');
    if (!g) return;
    g.fillStyle = hex(C.bg);
    g.fillRect(0, 0, 32, 32);
    const rows = [
      '.......hhhhhh.......', '.....hhhhhhhhhh.....', '.....hhhhddhhhh.....', '.....hhhhhhhhhh.....',
      '.....bbbbbbbbbb.....', '..lhhhhhhhhhhhhhhh..', 'lhhhhhhhhhhhhhhhhhhh', '.hhhhhhhhhhhhhhhhhh.',
    ];
    const pal: Record<string, string> = { h: '#8a7fb0', d: '#3a3352', b: hex(C.accent), l: '#d8d0ee' };
    const px = 1.5;
    rows.forEach((row, y) => [...row].forEach((ch, x) => {
      if (!pal[ch]) return;
      g.fillStyle = pal[ch];
      g.fillRect(1 + x * px, 10 + y * px, px, px);
    }));
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.href = c.toDataURL('image/png');
  } catch {
    /* sin DOM (tests) */
  }
}
